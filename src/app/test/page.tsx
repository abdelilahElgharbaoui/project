export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Tailwind CSS Test
        </h1>
        <p className="text-gray-600 mb-4">
          If you can see this styled content, Tailwind is working!
        </p>
        <div className="space-y-2">
          <div className="bg-red-500 text-white p-2 rounded">Red Box</div>
          <div className="bg-green-500 text-white p-2 rounded">Green Box</div>
          <div className="bg-blue-500 text-white p-2 rounded">Blue Box</div>
        </div>
      </div>
    </div>
  );
} 