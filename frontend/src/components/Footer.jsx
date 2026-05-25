import { Scale, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const yr = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-white/5 py-16">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <Scale size={20} className="text-nyaya-500" />
            <span className="text-xl font-bold font-heading text-white tracking-tight">Nyaya AI</span>
          </div>
          <p className="text-sm text-stone-500 leading-relaxed max-w-xs">
            Empowering the Indian judicial system with advanced AI for multimodal evidence analysis and FIR processing.
          </p>
        </div>

        <div>
          <h4 className="text-stone-400 font-semibold mb-6 tracking-wider uppercase text-xs border-b border-white/5 pb-2 inline-block">Platform</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><a href="/app" className="text-stone-500 hover:text-nyaya-500 transition-colors inline-flex items-center gap-1">Dashboard <ArrowUpRight size={10} /></a></li>
            <li><a href="#features" className="text-stone-500 hover:text-nyaya-500 transition-colors">Key Features</a></li>
            <li><a href="#roles" className="text-stone-500 hover:text-nyaya-500 transition-colors">User Roles</a></li>
            <li><a href="#" className="text-stone-500 hover:text-nyaya-500 transition-colors">Security Overview</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-stone-400 font-semibold mb-6 tracking-wider uppercase text-xs border-b border-white/5 pb-2 inline-block">Resources</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><a href="#" className="text-stone-500 hover:text-nyaya-500 transition-colors">Documentation</a></li>
            <li><a href="#" className="text-stone-500 hover:text-nyaya-500 transition-colors">API Integration</a></li>
            <li><a href="#" className="text-stone-500 hover:text-nyaya-500 transition-colors">Legal Frameworks</a></li>
            <li><a href="#" className="text-stone-500 hover:text-nyaya-500 transition-colors">Research Papers</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-stone-400 font-semibold mb-6 tracking-wider uppercase text-xs border-b border-white/5 pb-2 inline-block">Legal</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><a href="#" className="text-stone-500 hover:text-nyaya-500 transition-colors">Terms of Service</a></li>
            <li><a href="#" className="text-stone-500 hover:text-nyaya-500 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="text-stone-500 hover:text-nyaya-500 transition-colors">Data Processing Addendum</a></li>
            <li><a href="#" className="text-stone-500 hover:text-nyaya-500 transition-colors">Compliance</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-stone-600">
        <p>&copy; {yr} Nyaya AI Network. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0 font-medium">
          <span className="text-stone-600">In service of Indian Justice</span>
          <span className="text-stone-700">|</span>
          <span className="text-stone-600">Made in India</span>
        </div>
      </div>
    </footer>
  );
}
