export default function ExtendedFeatures() {
  const features = [
    {
      icon: "📝",
      title: "Smart Test Generation",
      features: [
        "AI dynamically generates questions based on course, exam type, and difficulty level",
        "Ensures balanced coverage of syllabus topics",
        "Avoids repetition and poor-quality questions",
        "Learns from curated datasets and historical exam papers",
      ],
      image: "/test-generation-dashboard.jpg",
    },
    {
      icon: "💻",
      title: "Coding Assessment Engine",
      features: [
        "In-browser IDE with multi-language support",
        "Automated test-case execution",
        "Time and memory constraints tracking",
        "AI feedback on code quality, optimization, and logical correctness",
      ],
      image: "/coding-ide-interface.jpg",
    },
    {
      icon: "🎓",
      title: "Adaptive Learning Engine",
      features: [
        "Difficulty adjusts based on student performance in real-time",
        "Weak topics appear more frequently in recommended tests",
        "Personalized learning paths tailored to individual needs",
        "Continuous evolution using real student interactions",
      ],
      image: "/adaptive-learning-dashboard.jpg",
    },
  ]

  return (
    <section id="extended-features" className="py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-background to-muted">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-wider">Detailed Features</p>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-foreground font-heading">What Makes Examlytics Different</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-body">
            Unlike traditional test platforms, Examlytics continuously learns and evolves with real exam patterns.
          </p>
        </div>

        <div className="space-y-16">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-12 items-center`}
            >
              <div className="flex-1">
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="text-3xl font-bold mb-6 text-foreground font-heading">{feature.title}</h3>
                <ul className="space-y-4">
                  {feature.features.map((item, j) => (
                    <li key={j} className="flex gap-3 text-foreground font-body">
                      <span className="text-primary font-bold shrink-0 mt-1">✓</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1">
                <img
                  src={feature.image || "/placeholder.svg"}
                  alt={feature.title}
                  className="w-full rounded-2xl shadow-xl hover:shadow-2xl transition-shadow"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
