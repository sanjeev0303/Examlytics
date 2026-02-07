export default function DashboardPreview() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black group">
        <div className="absolute inset-0 bg-linear-to-tr from-blue-500/10 to-purple-500/10 pointer-events-none"></div>
        <img
          src="/modern-interview-prep-dashboard-with-analytics-cha.jpg"
          alt="iPrep Dashboard with analytics and interview tracking"
          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-purple-600 blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
      </div>
    </section>
  )
}
