import { Star } from "lucide-react"

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Ravi Patel",
      role: "Medical Student",
      text: "Examlytics transformed my exam prep! The adaptive difficulty kept me challenged, and the analytics showed exactly where I needed to improve. Scored 95%!",
      initials: "RP",
    },
    {
      name: "Sarah Chen",
      role: "CS Student",
      text: "The coding assessment engine is phenomenal. The instant feedback on my code quality helped me write cleaner, more optimized solutions.",
      initials: "SC",
    },
    {
      name: "Arjun Desai",
      role: "Engineering Student",
      text: "Examlytics' smart test generation ensures I'm not just memorizing answers. Each test feels different, which prepared me so well for the actual exam.",
      initials: "AD",
    },
    {
      name: "Emma Wilson",
      role: "MBA Candidate",
      text: "The analytics dashboard is a game-changer. I could track my progress weekly and adjust my study strategy accordingly. Highly recommend!",
      initials: "EW",
    },
    {
      name: "Priya Verma",
      role: "Competitive Exam Aspirant",
      text: "Finally, a platform that understands how I learn! The adaptive learning engine adjusted perfectly to my pace and learning style.",
      initials: "PV",
    },
    {
      name: "Aditya Kumar",
      role: "Software Engineer",
      text: "Using Examlytics for technical interview prep was invaluable. The coding challenges and detailed feedback helped me land my dream job.",
      initials: "AK",
    },
  ]

  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent relative overflow-hidden mesh-bg">
      <div className="absolute inset-0 bg-transparent -z-10"></div>

      <div className="max-w-6xl mx-auto z-10 relative">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-wider">Success Stories</p>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground font-heading">
            What Students & <span className="text-gradient">Learners Say</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-body">
            Join thousands of successful learners who achieved their goals with Examlytics.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="glass-panel p-8 rounded-2xl glass-panel-hover group flex flex-col"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-sm" />
                ))}
              </div>
              <p className="text-text-secondary mb-8 leading-relaxed italic font-body text-lg grow">"{testimonial.text}"</p>
              <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                <div className="w-12 h-12 bg-linear-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-110 transition-transform duration-300">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="font-bold text-foreground font-heading group-hover:text-primary transition-colors">{testimonial.name}</p>
                  <p className="text-xs text-text-secondary font-body uppercase tracking-wide font-medium">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
