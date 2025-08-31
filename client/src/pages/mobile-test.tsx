export default function MobileTest() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            📱 Mobile Test Page
          </h1>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-green-800 dark:text-green-200 font-semibold">
                ✅ Mobile Chrome Access Working!
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                If you can see this page, the mobile compatibility issues have been resolved.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
              <div>Screen Width: <span className="font-mono">{typeof window !== 'undefined' ? window.innerWidth : 'unknown'}</span></div>
              <div>Screen Height: <span className="font-mono">{typeof window !== 'undefined' ? window.innerHeight : 'unknown'}</span></div>
              <div>User Agent: <span className="font-mono break-all">{typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 20) + '...' : 'unknown'}</span></div>
              <div>Touch Support: <span className="font-mono">{typeof window !== 'undefined' && 'ontouchstart' in window ? 'Yes' : 'No'}</span></div>
            </div>
            
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Return to Main Platform
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}