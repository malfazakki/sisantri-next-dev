export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
      <p className="mt-2 text-slate-600">Welcome to your dashboard overview.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-slate-700">Stat Card {i}</h3>
            <p className="text-2xl font-bold mt-2 text-indigo-600">1,234</p>
            <p className="text-sm text-green-500 mt-1">↑ 12% from last month</p>
          </div>
        ))}
      </div>
    </div>
  );
}
