export default function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Revolutionary UI - Home</h1>
      <p className="mb-4">Welcome to Revolutionary UI Factory System</p>
      
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Test Pages:</h2>
        <ul className="list-disc pl-6">
          <li><a href="/test" className="text-blue-600 hover:underline">Environment Test</a></li>
          <li><a href="/test-simple" className="text-blue-600 hover:underline">Simple Test</a></li>
          <li><a href="/test/billing" className="text-blue-600 hover:underline">Billing API Test</a></li>
          <li><a href="/dashboard/billing" className="text-blue-600 hover:underline">Dashboard Billing</a></li>
          <li><a href="/pricing" className="text-blue-600 hover:underline">Pricing</a></li>
        </ul>
      </div>
    </div>
  )
}