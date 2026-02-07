import Link from 'next/link'
import React from 'react'

const Footer = () => {
  return (
    <footer>
        <div className="relative w-full overflow-hidden rounded-t-3xl border-t border-white/5 bg-[#03030c]/50 backdrop-blur-md min-h-[400px] flex flex-col justify-end mt-12">
           {/* Engraved Watermark */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
              <span className="text-[15vw] font-bold font-heading bg-[url('/landing_background.png')] bg-cover bg-center bg-clip-text text-transparent tracking-tighter leading-none opacity-50 blur-[1px]">
                Examlytics
              </span>
           </div>

           {/* Surface Noise/Texture (Optional subtle grain) */}
           <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] mix-blend-overlay pointer-events-none z-0" />

           {/* Footer Content */}
           <div className="relative z-10 px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs md:text-sm font-medium tracking-wide text-white/30 uppercase w-full border-t border-white/5">

              <div className="flex items-center gap-2">
                 <span>&copy; 2026 Examlytics. All rights reserved.</span>
              </div>

              <div className="flex items-center gap-6 md:gap-8">
                 <Link href="#" className="hover:text-white/80 transition-colors">Features</Link>
                 <Link href="#" className="hover:text-white/80 transition-colors">Exams</Link>
                 <Link href="#" className="hover:text-white/80 transition-colors">Careers</Link>
                 <Link href="#" className="hover:text-white/80 transition-colors">Admin</Link>
                 <Link href="#" className="hover:text-white/80 transition-colors">Docs</Link>
              </div>
           </div>
        </div>
    </footer>
  )
}

export default Footer
