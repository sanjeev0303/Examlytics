export default function AnalyticsSection() {
  return (
    <section id="analytics" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black order-2 md:order-1 relative group transform transition-transform duration-500 hover:rotate-1">
             <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay"></div>
            <img
              src="/advanced-analytics-dashboard-with-performance-metr.jpg"
              alt="Advanced Analytics Dashboard showing learning metrics"
              className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
            />
          </div>

          <div className="order-1 md:order-2">
            <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-wider">Learning Intelligence</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground font-heading">
              Deep Learning <span className="text-gradient">Analytics</span>
            </h2>
            <h3 className="text-2xl font-semibold text-text-secondary mb-8 font-heading">Diagnose & Guide Improvement</h3>
            <p className="text-text-secondary mb-8 leading-relaxed text-lg font-body">
              Examlytics doesn't just score your responses—it diagnoses learning gaps, guides improvement, and evolves
              with real exams. Understand what you know, what you don't, and how to improve.
            </p>
            <ul className="space-y-6">
              {[
                { title: "Performance Trends Over Time", desc: "Visualize your improvement trajectory across multiple assessments and topics." },
                { title: "Topic-Wise Mastery Levels", desc: "Identify weak areas and focus your study efforts where they matter most." }
              ].map((item, i) => (
                <li key={i} className="flex gap-4 group p-4 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-border/30">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                     <span className="text-primary font-bold text-lg">✓</span>
                  </div>
                  <div>
                    <strong className="text-foreground text-lg block mb-1 font-heading group-hover:text-primary transition-colors">{item.title}</strong>
                    <p className="text-text-secondary font-body text-sm">
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
