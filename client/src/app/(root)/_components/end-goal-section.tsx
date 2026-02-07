export default function EndGoalSection() {
  const goals = [
    {
      icon: "🔍",
      title: "Diagnoses Learning Gaps",
      description: "Identifies exactly what students know, don't know, and where they struggle most.",
    },
    {
      icon: "🗺️",
      title: "Guides Improvement",
      description: "Provides actionable insights and personalized recommendations for targeted learning.",
    },
    {
      icon: "♻️",
      title: "Evolves With Exams",
      description: "Continuously updates with real exam patterns and industry trends.",
    },
    {
      icon: "🚀",
      title: "Prepares for Real-World",
      description: "Bridges the gap between practice and actual interview/exam success.",
    },
  ]

  return (
    <section
      id="end-goal"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-blue-900/20 radial-gradient-center pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <p className="text-blue-400 font-semibold text-sm mb-2 uppercase tracking-wider">Our Vision</p>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 font-heading">
            Examlytics: A Learning <span className="text-blue-400">Intelligence System</span>
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto font-body leading-relaxed">
            More than just a test platform—we're transforming how students learn by combining intelligent assessment
            with deep analytics.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {goals.map((goal, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300 inline-block">{goal.icon}</div>
              <h3 className="text-2xl font-bold mb-3 font-heading text-white">{goal.title}</h3>
              <p className="text-slate-300 leading-relaxed font-body">{goal.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 p-12 rounded-3xl bg-linear-to-br from-blue-900/40 to-slate-900/40 backdrop-blur-md border border-white/10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-10 transition-opacity duration-500 pointer-events-none"></div>

          <h3 className="text-2xl font-bold mb-8 font-heading">The Examlytics Advantage</h3>
          <div className="grid md:grid-cols-3 gap-12 relative z-10">
            {[
                { title: "Reduce", sub: "Guesswork in exam preparation" },
                { title: "Master", sub: "Concepts, not just memorization" },
                { title: "Achieve", sub: "Real-world success with data" },
            ].map((item, i) => (
                <div key={i} className="group">
                    <p className="text-5xl font-bold text-transparent bg-clip-text bg-linear-to-br from-white to-slate-400 mb-3 font-heading group-hover:from-blue-400 group-hover:to-blue-200 transition-all duration-300">{item.title}</p>
                    <p className="text-blue-200 font-body text-lg font-medium">{item.sub}</p>
                </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
