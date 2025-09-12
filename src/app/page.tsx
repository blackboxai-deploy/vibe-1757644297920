export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Advanced Key Generator System
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Professional License Management Platform
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Keys</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
            </div>
            <div className="text-2xl">🔑</div>
          </div>
          <p className="text-xs text-slate-500 mt-2">All generated keys</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Keys</p>
              <p className="text-2xl font-bold text-green-600">0</p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Currently active</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Available Credits</p>
              <p className="text-2xl font-bold text-purple-600">10.0</p>
            </div>
            <div className="text-2xl">💰</div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Ready to use</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Credits Used</p>
              <p className="text-2xl font-bold text-orange-600">0.0</p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Total consumed</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border p-6">
        <h3 className="text-xl font-semibold mb-2">Welcome to Advanced Key Generator</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Generate secure license keys with credit management
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">🎯 Generate Keys</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Create random or custom license keys with HG prefix
            </p>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              7 Days = 1 Credit
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">💳 Manage Credits</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Top up credits and track your usage
            </p>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              14 Days = 2 Credits
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">🔧 Key Management</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Pause, resume, and delete your generated keys
            </p>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              30 Days = 3.5 Credits
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-blue-900 dark:text-blue-100">System Status: Online</span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            All systems operational. API endpoints ready for key generation.
          </p>
        </div>
      </div>
    </div>
  )
}