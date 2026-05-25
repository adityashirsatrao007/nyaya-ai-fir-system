import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardBody } from "@nextui-org/react";
import { motion } from "framer-motion";
import { Scale, Search, FileText, Shield, Lock, PenLine, Gavel, ArrowRight, Sparkles, TrendingUp, Cpu, Activity, ChevronDown } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import NavBar from "../components/NavBar";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

const features = [
  { icon: FileText, color: "#0A84FF", title: "FIR Semantic Extraction", desc: "Extract active entities and legal premises automatically from scanned FIR documents using proprietary OCR architectures." },
  { icon: Search, color: "#BF5AF2", title: "Multimedia Verification", desc: "Perform forensic-grade validation to detect deepfakes, spatial splicing, and audio manipulation in submitted evidence." },
  { icon: Scale, color: "#D4AF37", title: "Statutory Mapping", desc: "Algorithmically synthesize events mapping directly to the Indian Penal Code (IPC) and Bharatiya Nyaya Sanhita (BNS)." },
  { icon: TrendingUp, color: "#30D158", title: "NCRB Integration", desc: "Directly contextualize incident reports against official National Crime Records Bureau statistics." },
  { icon: Lock, color: "#FF9F0A", title: "Cryptographic Privacy", desc: "Strict isolation of sensitive files with end-to-end cryptographic hashing to ensure chain of custody." },
  { icon: PenLine, color: "#FF375F", title: "Dossier Synthesis", desc: "Instantly produce court-ready summary reports designed for seamless admission by legal counsels." },
];

const audience = [
  { icon: Scale, title: "Judiciary", desc: "Accelerate case backlogs with instantly summarized dossiers, verified evidence flagging, and synthesized legal precedents ready for the bench." },
  { icon: Shield, title: "Law Enforcement", desc: "Upload raw FIR inputs to instantly map statements to complex IPC/BNS statutes, filtering out manipulated multimedia evidence." },
  { icon: Gavel, title: "Legal Counsels", desc: "Strengthen defense or prosecution strategy using our AI-driven forensic analysis summaries and objective statutory context references." },
];

const stats = [
  { value: "99.5%", label: "OCR Accuracy" },
  { value: "IPC/BNS", label: "Statutory Coverage" },
  { value: "< 2s", label: "Pipeline Latency" },
  { value: "Secure", label: "Encrypted Custody" },
];

function MagneticButton({ children, className, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: x * 0.15, y: y * 0.15, duration: 0.4, ease: "power2.out" });
    };
    const onLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <Button ref={ref} className={className} {...props}>{children}</Button>;
}

function HeroOrbs() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      t += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxR = Math.min(canvas.width, canvas.height) * 0.35;

      const gradients = [
        { r: maxR * 0.6, dx: Math.sin(t * 0.7) * maxR * 0.3, dy: Math.cos(t * 0.5) * maxR * 0.2, color: "rgba(10, 132, 255, 0.08)" },
        { r: maxR * 0.5, dx: Math.cos(t * 0.4) * maxR * 0.25, dy: Math.sin(t * 0.6) * maxR * 0.25, color: "rgba(212, 175, 55, 0.06)" },
        { r: maxR * 0.4, dx: Math.sin(t * 0.9 + 1) * maxR * 0.2, dy: Math.cos(t * 0.3 + 2) * maxR * 0.2, color: "rgba(191, 90, 242, 0.05)" },
      ];

      gradients.forEach((g) => {
        const grad = ctx.createRadialGradient(cx + g.dx, cy + g.dy, 0, cx + g.dx, cy + g.dy, g.r);
        grad.addColorStop(0, g.color);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx + g.dx, cy + g.dy, g.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ filter: "blur(60px)" }}
    />
  );
}

function TelemetryFeed() {
  const messages = [
    "→ Neural pipeline initialized",
    "→ OCR engine ready",
    "→ Statute database loaded",
    "→ Analysis ready",
  ];

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(48,209,88,0.5)] animate-pulse" />
        <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">System Status</span>
      </div>
      <div className="space-y-2 font-mono text-xs">
        {messages.map((msg, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-green-500/50">{msg}</span>
            {i === messages.length - 1 && <span className="w-1.5 h-4 bg-green-500 animate-pulse" style={{ animationDuration: "0.8s" }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const headingRef = useRef(null);
  const audienceRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.lagSmoothing(0);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const sections = [audienceRef.current, featuresRef.current, ctaRef.current, statsRef.current].filter(Boolean);

        sections.forEach((section) => {
          const cards = section.querySelectorAll(".reveal-card");
          ScrollTrigger.batch(cards, {
            start: "top 85%",
            onEnter: (batch) =>
              gsap.fromTo(
                batch,
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: "power3.out", overwrite: true }
              ),
          });
        });
      });

      if (headingRef.current) {
        const split = new SplitType(headingRef.current, { types: "words" });
        gsap.fromTo(
          split.words,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.04, ease: "power3.out", delay: 0.2 }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-nyaya-500/30 selection:text-white overflow-x-hidden">
      <NavBar />

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        <HeroOrbs />

        <div className="max-w-7xl mx-auto text-center flex flex-col items-center relative z-10 pt-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-nyaya-500/0 via-nyaya-500/10 to-nyaya-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <Sparkles size={14} className="text-nyaya-500 relative" />
              <span className="text-xs text-stone-400 font-semibold uppercase tracking-widest relative">AI Intelligence for the Justice System</span>
            </div>

            <div ref={headingRef}>
              <h1 className="text-7xl md:text-9xl font-black font-display text-white mb-4 leading-[0.9] tracking-tighter">
                Nyaya
                <span className="text-nyaya-500 block md:inline">AI</span>
              </h1>
            </div>

            <p className="text-xl md:text-2xl text-stone-500 max-w-2xl mx-auto mb-4 font-dramatic italic leading-relaxed">
              "Veritas et Aequitas" — Truth and Equity through Computation.
            </p>

            <p className="text-base md:text-lg text-stone-500 max-w-2xl mx-auto mb-12 leading-relaxed">
              Transform the processing of judicial evidence. Proprietary deep learning models for instant FIR analysis, deepfake detection, and automated statutory extraction for Indian Jurisprudence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton
                size="lg"
                className="bg-nyaya-500 text-white font-semibold text-lg px-10 py-7 rounded-full hover:bg-nyaya-600 shadow-glow transition-all"
                onPress={() => navigate("/signup")}
                endContent={<ArrowRight size={18} className="text-white/70" />}
              >
                Access Platform
              </MagneticButton>
              <Button
                size="lg"
                variant="bordered"
                className="font-semibold text-lg px-10 py-7 rounded-full border-white/10 text-stone-300 hover:bg-white/5 hover:border-white/20 transition-all"
                onPress={() => navigate("/login")}
              >
                Judicial Login
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <ChevronDown size={24} className="text-stone-600" />
        </motion.div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden">
          {stats.map((stat, idx) => (
            <div key={idx} className="reveal-card opacity-0 bg-surface p-8 text-center">
              <p className="text-4xl md:text-5xl font-black font-display text-nyaya-500 mb-2 tracking-tighter">{stat.value}</p>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Audience */}
      <section ref={audienceRef} className="py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-20">
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-6">
              <Cpu size={14} className="text-nyaya-500" />
              <span className="text-xs text-stone-400 font-semibold uppercase tracking-widest">For Every Pillar of Justice</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-white mb-6">Empowering Every Pillar of Justice</h2>
            <p className="text-lg text-stone-500 max-w-2xl mx-auto">Our architecture is distinctly partitioned to serve the unique operational requirements of India's legal machinery.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {audience.map((item, idx) => (
              <div key={idx} className={`reveal-card opacity-0 ${idx === 1 ? "md:-translate-y-4" : ""}`}>
                <Card className="bg-surface border border-white/5 hover:border-nyaya-500/30 transition-all rounded-2xl h-full group">
                  <CardBody className="p-8 text-center">
                    <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-nyaya-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <item.icon size={24} className="text-nyaya-500" />
                    </div>
                    <h3 className="text-xl font-bold font-heading text-white mb-3">{item.title}</h3>
                    <p className="text-stone-400 leading-relaxed text-sm">{item.desc}</p>
                  </CardBody>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-nyaya-500/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-24">
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-6">
              <Activity size={14} className="text-nyaya-500" />
              <span className="text-xs text-stone-400 font-semibold uppercase tracking-widest">Capabilities</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">Comprehensive Platform Capabilities</h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-nyaya-500 to-transparent mx-auto mt-6" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, idx) => (
              <div key={idx} className="reveal-card opacity-0 group h-full p-7 rounded-2xl bg-surface border border-white/5 hover:border-nyaya-500/30 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-nyaya-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r" />
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 group-hover:bg-nyaya-500/10 transition-colors duration-300">
                  <feature.icon size={22} color={feature.color} />
                </div>
                <h3 className="text-lg font-bold font-heading text-white mb-3 tracking-wide">{feature.title}</h3>
                <p className="text-stone-400 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-nyaya-500/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
            <div className="max-w-xs mx-auto mb-8">
              <TelemetryFeed />
            </div>
            <h2 className="text-4xl md:text-7xl font-black font-display mb-8 text-white tracking-tighter leading-[0.9]">
              Instituting Trust in<br />
              <span className="text-nyaya-500">Evidence.</span>
            </h2>
            <p className="text-lg text-stone-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Equip your precinct or chambers with state-of-the-art computational forensics today. Registration is secured and verified.
            </p>
            <MagneticButton
              size="lg"
              className="bg-nyaya-500 text-white font-semibold text-lg px-12 py-8 rounded-full hover:bg-nyaya-600 shadow-glow transition-all"
              onPress={() => navigate("/signup")}
            >
              Request Authorization
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Scale size={20} className="text-nyaya-500" />
            <span className="font-bold font-heading text-lg tracking-wide text-white">Nyaya AI</span>
          </div>
          <p className="text-sm font-medium text-stone-500">&copy; 2026 Developed for the Republic of India. All rights reserved.</p>
          <div className="flex gap-8 text-stone-500 text-xs font-semibold uppercase tracking-wider">
            <a href="#" className="hover:text-nyaya-500 transition-colors">Integrity</a>
            <a href="#" className="hover:text-nyaya-500 transition-colors">Jurisdiction</a>
            <a href="#" className="hover:text-nyaya-500 transition-colors">Press</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
