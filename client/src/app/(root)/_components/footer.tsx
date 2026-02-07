export default function Footer() {
  return (
    <footer className="bg-background border-t border-white/5 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Mesh at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-64 bg-linear-to-t from-blue-900/10 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600"></div>
                <h3 className="text-2xl font-bold text-white font-heading tracking-tight">Examlytics</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed font-body mb-6">
              AI-driven assessment and analytics platform transforming how students prepare for exams, interviews, and
              coding tests.
            </p>
            <div className="flex gap-4">
                {['twitter', 'github', 'linkedin'].map((social) => (
                    <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all duration-200">
                        <span className="sr-only">{social}</span>
                        <span className="w-5 h-5 bg-current opacity-70"></span>
                    </a>
                ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 font-heading">Product</h4>
            <ul className="space-y-4">
              {['Features', 'Pricing', 'Testimonials', 'Integration'].map((item) => (
                <li key={item}>
                <a href={`#${item.toLowerCase()}`} className="text-slate-400 hover:text-blue-400 transition-colors text-sm font-body block hover:translate-x-1 duration-200">
                  {item}
                </a>
              </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 font-heading">Resources</h4>
            <ul className="space-y-4">
              {['Documentation', 'API Reference', 'Blog', 'Community'].map((item) => (
                <li key={item}>
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm font-body block hover:translate-x-1 duration-200">
                  {item}
                </a>
              </li>
              ))}
            </ul>
          </div>

          <div>
             <h4 className="font-bold text-white mb-6 font-heading">Legal</h4>
            <ul className="space-y-4">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map((item) => (
                <li key={item}>
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm font-body block hover:translate-x-1 duration-200">
                  {item}
                </a>
              </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm font-body">© 2025 Examlytics. All rights reserved.</p>
           <p className="text-slate-600 text-sm font-body flex gap-6">
                <span>Made with ❤️ for learners</span>
           </p>
        </div>
      </div>
    </footer>
  )
}
