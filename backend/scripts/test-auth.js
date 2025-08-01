const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAuth() {
  console.log('🧪 Test d\'authentification...\n');

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  // Test admin login
  console.log('1. Test connexion admin...');
  try {
    const adminResult = await makeRequest(options, {
      email: 'admin@hospital.com',
      password: 'admin123'
    });

    if (adminResult.status === 200) {
      console.log('✅ Connexion admin réussie !');
      console.log(`   Token: ${adminResult.data.token.substring(0, 20)}...`);
      console.log(`   Utilisateur: ${adminResult.data.user.first_name} ${adminResult.data.user.last_name} (${adminResult.data.user.role})`);
    } else {
      console.log('❌ Échec connexion admin:', adminResult.data.message);
    }
  } catch (error) {
    console.log('❌ Erreur connexion admin:', error.message);
  }

  console.log('\n2. Test connexion utilisateur...');
  try {
    const userResult = await makeRequest(options, {
      email: 'user@hospital.com',
      password: 'user123'
    });

    if (userResult.status === 200) {
      console.log('✅ Connexion utilisateur réussie !');
      console.log(`   Token: ${userResult.data.token.substring(0, 20)}...`);
      console.log(`   Utilisateur: ${userResult.data.user.first_name} ${userResult.data.user.last_name} (${userResult.data.user.role})`);
    } else {
      console.log('❌ Échec connexion utilisateur:', userResult.data.message);
    }
  } catch (error) {
    console.log('❌ Erreur connexion utilisateur:', error.message);
  }

  console.log('\n3. Test connexion avec mauvais mot de passe...');
  try {
    const wrongResult = await makeRequest(options, {
      email: 'admin@hospital.com',
      password: 'wrongpassword'
    });

    if (wrongResult.status !== 200) {
      console.log('✅ Test de sécurité réussi - mauvais mot de passe rejeté');
      console.log(`   Message: ${wrongResult.data.message}`);
    } else {
      console.log('❌ Problème de sécurité - mauvais mot de passe accepté !');
    }
  } catch (error) {
    console.log('❌ Erreur test sécurité:', error.message);
  }

  console.log('\n🎉 Tests d\'authentification terminés !');
}

// Run the test
testAuth(); 