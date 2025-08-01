# Deployment script for Hospital Management System (PowerShell)
param(
    [switch]$SkipValidation
)

Write-Host "🚀 Starting deployment process..." -ForegroundColor Green

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Warning ".env file not found. Creating from template..."
    Copy-Item "backend/env.example" ".env"
    Write-Warning "Please update .env file with your production values before continuing."
    exit 1
}

# Check if Docker is installed
try {
    docker --version | Out-Null
} catch {
    Write-Error "Docker is not installed. Please install Docker first."
    exit 1
}

# Check if Docker Compose is installed
try {
    docker-compose --version | Out-Null
} catch {
    Write-Error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
}

Write-Status "Docker and Docker Compose are available."

# Load environment variables
Write-Status "Loading environment variables..."
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

# Validate required environment variables
$requiredVars = @("DATABASE_URL", "JWT_SECRET")
foreach ($var in $requiredVars) {
    if (-not $env:$var) {
        Write-Error "Required environment variable $var is not set."
        exit 1
    }
}

Write-Status "Environment variables validated."

# Stop existing containers
Write-Status "Stopping existing containers..."
docker-compose down --remove-orphans

# Build and start services
Write-Status "Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
Write-Status "Waiting for services to be ready..."
Start-Sleep -Seconds 30

# Check if services are running
Write-Status "Checking service health..."

# Check backend health
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Status "✅ Backend is healthy"
    } else {
        throw "Backend returned status code $($response.StatusCode)"
    }
} catch {
    Write-Error "❌ Backend health check failed"
    docker-compose logs backend
    exit 1
}

# Check frontend health
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Status "✅ Frontend is healthy"
    } else {
        throw "Frontend returned status code $($response.StatusCode)"
    }
} catch {
    Write-Error "❌ Frontend health check failed"
    docker-compose logs frontend
    exit 1
}

Write-Status "🎉 Deployment completed successfully!"
Write-Status "Frontend: http://localhost:3000"
Write-Status "Backend API: http://localhost:5000"
Write-Status "Health Check: http://localhost:5000/health"

# Show running containers
Write-Status "Running containers:"
docker-compose ps 