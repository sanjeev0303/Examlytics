export default function FeaturesSection() {
  const features = [
    {
      icon: "🤖",
      title: "Smart Test Generation",
      description:
        "AI dynamically generates questions based on course content, exam type, and difficulty level. Ensures balanced coverage of syllabus topics and avoids repetition.",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: "📊",
      title: "Advanced Analytics Dashboard",
      description:
        "View performance trends, topic-wise mastery levels, accuracy vs speed analysis, and exam readiness scores. Data-backed insights instead of just scores.",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      icon: "⚡",
      title: "Adaptive Learning Engine",
      description:
        "Difficulty adjusts based on your performance. Weak topics appear more frequently with personalized test recommendations tailored to your needs.",
      gradient: "from-pink-500 to-pink-600",
    },
  ]

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent relative overflow-hidden">
      {/* Background Mesh */}
       <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-500/10 blur-[120px] pointer-events-none -z-10 opacity-30"></div>
       <div className="absolute bottom-0 left-0 w-1/2 h-full bg-purple-500/10 blur-[120px] pointer-events-none -z-10 opacity-30"></div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-wider">Key Features</p>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-foreground font-heading">
            Intelligent <span className="text-gradient">Assessment & Learning</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-body">
            Examlytics combines cutting-edge AI with comprehensive analytics to create a truly personalized learning
            experience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="glass-panel p-8 rounded-2xl glass-panel-hover group border-white/5"
            >
              <div
                className={`w-14 h-14 bg-linear-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 shadow-md`}
              >
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors font-heading">
                {feature.title}
              </h3>
              <p className="text-text-secondary leading-relaxed font-body text-base/7">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
