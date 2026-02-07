export default function WhoIsExamlytics() {
  const users = [
    {
      icon: "👨‍🎓",
      title: "Students",
      description: "Exam prep, coding practice, and interview readiness with personalized learning paths.",
      highlights: ["Prepare for board exams", "Master coding fundamentals", "Build interview confidence"],
      color: "from-blue-500 to-cyan-400"
    },
    {
      icon: "💼",
      title: "Job Seekers",
      description: "Company-specific interview preparation with curated datasets and realistic practice.",
      highlights: ["Technical interview prep", "Company-specific questions", "Real-world scenarios"],
       color: "from-purple-500 to-pink-500"
    },
    {
      icon: "🏫",
      title: "Educators & Institutes",
      description: "Create tests, track performance, and align AI models with real examinations.",
      highlights: ["Bulk test creation", "Student performance tracking", "AI model training"],
       color: "from-orange-500 to-amber-400"
    },
  ]

  return (
    <section id="who-is-examlytics" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-wider">User Base</p>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-foreground font-heading">
            Who Is <span className="text-gradient">Examlytics For?</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-body">
            Designed for everyone who wants to excel through intelligent, data-driven learning.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {users.map((user, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl bg-surface border border-border/60 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${user.color} opacity-10 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700`}></div>

              <div className="relative z-10">
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300 origin-left inline-block drop-shadow-md">{user.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors font-heading">
                  {user.title}
                </h3>
                <p className="text-text-secondary mb-8 leading-relaxed font-body text-base/7">{user.description}</p>
                <div className="space-y-3 pt-6 border-t border-border/50">
                  {user.highlights.map((highlight, j) => (
                    <div key={j} className="flex gap-3 text-foreground text-sm font-body items-center group/item hover:translate-x-1 transition-transform">
                      <div className={`w-1.5 h-1.5 rounded-full bg-linear-to-r ${user.color}`}></div>
                      <span className="font-medium text-text-secondary group-hover/item:text-foreground transition-colors">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
