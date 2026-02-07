export default function CodepadSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-wider">Coding Assessments</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground font-heading">
               Coding Assessment <span className="text-gradient">Engine</span>
            </h2>
            <h3 className="text-2xl font-semibold text-text-secondary mb-8 font-heading">Master Programming Challenges</h3>
            <p className="text-text-secondary mb-8 leading-relaxed text-lg font-body">
              Solve real-world coding problems with our in-browser IDE. Get instant feedback on code quality,
              optimization, and logical correctness.
            </p>
            <ul className="space-y-6">
               {[
                { title: "Multi-Language Support", desc: "Write code in Python, JavaScript, Java, C++, and more with syntax highlighting." },
                { title: "Automated Test Cases", desc: "Code is evaluated against multiple test cases with time and memory constraints automatically applied." }
              ].map((item, i) => (
                <li key={i} className="flex gap-4 group p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-border/30">
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
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black shadow-primary/10 group relative">
             <div className="absolute inset-0 bg-blue-500/10 pointer-events-none group-hover:bg-transparent transition-colors duration-500"></div>
            <img
              src="/code-editor-interface-with-syntax-highlighting-and.jpg"
              alt="Coding Assessment Engine Interface"
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
