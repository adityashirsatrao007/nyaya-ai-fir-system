import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronDown, Sparkles, BookOpen, Scale, Shield, ExternalLink, Gavel, AlertTriangle } from "lucide-react";
import NavBar from "../components/NavBar";

const API = import.meta.env.VITE_API_URL || '/api/v1';

const CATEGORY_COLORS = {
  "Offences Against Women": "bg-rose-900/40 text-rose-300 border-rose-700/50",
  "Offences Against Human Body": "bg-red-900/40 text-red-300 border-red-700/50",
  "Offences Against Property": "bg-orange-900/40 text-orange-300 border-orange-700/50",
  "Organized Crime & Conspiracy": "bg-purple-900/40 text-purple-300 border-purple-700/50",
  "Against the State": "bg-blue-900/40 text-blue-300 border-blue-700/50",
  "Offences Relating to Documents": "bg-yellow-900/40 text-yellow-300 border-yellow-700/50",
  "Offences Against Public Tranquility": "bg-cyan-900/40 text-cyan-300 border-cyan-700/50",
  "Offences Against Public Authority": "bg-indigo-900/40 text-indigo-300 border-indigo-700/50",
  "Offences Affecting Reputation": "bg-pink-900/40 text-pink-300 border-pink-700/50",
  default: "bg-stone-800/60 text-stone-300 border-stone-700/50",
};

function categoryColor(cat) {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;
}

const SUGGESTIONS = [
  "murder", "theft", "rape", "domestic violence", "fraud", "stalking",
  "rash driving", "kidnapping", "forgery", "extortion", "rioting", "defamation",
];

export default function LegalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/legal/categories`)
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  const runSearch = useCallback(
    async (q, cat) => {
      if (!q.trim()) {
        setResults([]);
        setSearched(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API}/legal/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q, limit: 10, category: cat }),
        });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setResults(data.results || []);
        setSearched(true);
      } catch (e) {
        setError("Could not connect to the search service. Make sure the backend is running.");
        setResults([]);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(val, activeCategory);
    }, 380);
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    if (query.trim()) runSearch(query, cat);
  };

  const handleSuggestion = (s) => {
    setQuery(s);
    runSearch(s, activeCategory);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      clearTimeout(debounceRef.current);
      runSearch(query, activeCategory);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-nyaya-500/30 selection:text-white">
      <NavBar />

      <section className="relative overflow-hidden pt-28 pb-12 px-6">
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <div className="w-[700px] h-[320px] rounded-full bg-nyaya-500/5 blur-[120px] mt-10" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-6">
              <Sparkles size={14} className="text-nyaya-500" />
              <span className="text-xs text-stone-400 font-semibold uppercase tracking-widest">Semantic Legal Intelligence</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold font-heading leading-tight text-white">
              Search IPC &amp;{" "}
              <span className="text-nyaya-500">Legal Sections</span>
            </h1>
            <p className="mt-3 text-stone-500 text-base sm:text-lg max-w-xl mx-auto">
              Describe a situation, crime, or section number — our vector search
              surfaces the most relevant IPC sections instantly.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="relative mt-6"
          >
            <div className="relative flex items-center glass rounded-2xl shadow-glow focus-within:border-nyaya-500/50 focus-within:ring-2 focus-within:ring-nyaya-500/10 transition-all duration-300 border border-white/5">
              <Search size={18} className="ml-5 text-stone-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="e.g. 'murder', 'dowry harassment', 'IPC 420', 'forgery'…"
                className="flex-1 bg-transparent px-4 py-4 text-base text-white placeholder-stone-600 outline-none"
                autoComplete="off"
                spellCheck={false}
              />
              {loading ? (
                <div className="pr-5">
                  <div className="w-5 h-5 border-2 border-nyaya-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : query ? (
                <button
                  onClick={() => { setQuery(""); setResults([]); setSearched(false); }}
                  className="pr-5 text-stone-500 hover:text-stone-300 transition-colors"
                  aria-label="Clear"
                >
                  <X size={18} />
                </button>
              ) : null}
            </div>
          </motion.div>

          {!searched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-2 pt-2"
            >
              <span className="text-stone-500 text-sm self-center">Try:</span>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-stone-500 hover:bg-nyaya-500/10 hover:text-nyaya-400 hover:border-nyaya-500/30 transition-all duration-200"
                >
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-20">
        {searched && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 mb-6"
          >
            <CategoryChip
              label="All"
              active={activeCategory === "all"}
              onClick={() => handleCategoryChange("all")}
            />
            {categories.map((cat) => (
              <CategoryChip
                key={cat}
                label={cat}
                active={activeCategory === cat}
                onClick={() => handleCategoryChange(cat)}
              />
            ))}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-950/30 border border-red-800/40 rounded-xl p-4 text-red-400 text-sm mb-6 flex items-center gap-3"
          >
            <AlertTriangle size={16} className="text-red-500 shrink-0" />
            {error}
          </motion.div>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 bg-surface border border-white/5 rounded-2xl animate-pulse"
                style={{ opacity: 1 - i * 0.2 }}
              />
            ))}
          </div>
        )}

        {!loading && (
          <AnimatePresence mode="popLayout">
            {results.map((r, idx) => (
              <ResultCard
                key={r.section}
                result={r}
                idx={idx}
                expanded={expanded === r.section}
                onToggle={() =>
                  setExpanded(expanded === r.section ? null : r.section)
                }
              />
            ))}
          </AnimatePresence>
        )}

        {searched && !loading && results.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 space-y-4"
          >
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
              <Search size={28} className="text-stone-500" />
            </div>
            <p className="text-stone-400 text-lg font-heading">No sections matched your query.</p>
            <p className="text-stone-600 text-sm">
              Try different keywords — e.g. "theft", "assault", "IPC 302".
            </p>
          </motion.div>
        )}

        {!searched && (
          <FreeResourcesPanel />
        )}
      </section>
    </div>
  );
}

function CategoryChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-200 ${
        active
          ? "bg-nyaya-500 text-white border-nyaya-500 shadow-md shadow-nyaya-500/20"
          : "bg-white/5 text-stone-500 border-white/10 hover:border-nyaya-500/30 hover:text-nyaya-400"
      }`}
    >
      {label}
    </button>
  );
}

function ResultCard({ result, idx, expanded, onToggle }) {
  const catClass = categoryColor(result.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.28, delay: idx * 0.05 }}
      className="mb-4"
    >
      <div
        className={`bg-surface/80 border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
          expanded
            ? "border-nyaya-500/40 shadow-glow"
            : "border-white/5 hover:border-white/20"
        }`}
        onClick={onToggle}
      >
        <div className="flex items-start gap-4 p-5">
          <div className="shrink-0 w-16 h-16 rounded-xl bg-nyaya-500/10 border border-nyaya-500/20 flex flex-col items-center justify-center">
            <span className="text-xs text-nyaya-500/70 font-mono uppercase tracking-wide">
              {result.section.includes("IPC") ? "IPC" : "Sec"}
            </span>
            <span className="text-nyaya-500 font-bold text-lg leading-tight font-mono">
              {result.section.replace("IPC ", "")}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-white font-semibold text-base leading-snug">
                {result.title}
              </h3>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${catClass}`}
              >
                {result.category}
              </span>
            </div>

            <p className="text-stone-400 text-sm line-clamp-2 leading-relaxed">
              {result.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              <Badge
                label={result.bailable ? "Bailable" : "Non-Bailable"}
                variant={result.bailable ? "green" : "red"}
              />
              <Badge
                label={result.cognizable ? "Cognizable" : "Non-Cognizable"}
                variant={result.cognizable ? "blue" : "stone"}
              />
              {result.bhns_equivalent && (
                <Badge
                  label={result.bhns_equivalent}
                  variant="amber"
                />
              )}
            </div>
          </div>

          <ChevronDown
            size={18}
            className={`text-stone-500 shrink-0 mt-1 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          />
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div
                className="border-t border-white/5 px-5 py-5 space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <Label>Full Description</Label>
                  <p className="text-stone-300 text-sm leading-relaxed mt-1">
                    {result.description}
                  </p>
                </div>

                <div className="bg-red-950/20 border border-red-900/30 rounded-xl px-4 py-3">
                  <Label color="text-red-400"><Gavel size={12} className="inline mr-1 -mt-0.5" />Punishment</Label>
                  <p className="text-red-200 text-sm mt-1 leading-relaxed">
                    {result.punishment}
                  </p>
                </div>

                <div>
                  <Label><BookOpen size={12} className="inline mr-1 -mt-0.5" />Related Keywords</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {result.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-stone-500"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {result.resources && result.resources.length > 0 && (
                  <div>
                    <Label><ExternalLink size={12} className="inline mr-1 -mt-0.5" />Free Legal Resources</Label>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {result.resources.map((res) => (
                        <a
                          key={res.name}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-nyaya-400 hover:bg-nyaya-500/10 hover:border-nyaya-500/30 transition-all duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={10} /> {res.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const BADGE_VARIANTS = {
  green: "bg-green-900/40 text-green-300 border-green-700/50",
  red: "bg-red-900/40 text-red-300 border-red-700/50",
  blue: "bg-blue-900/40 text-blue-300 border-blue-700/50",
  stone: "bg-white/5 text-stone-400 border-white/10",
  amber: "bg-amber-900/40 text-amber-300 border-amber-700/50",
};

function Badge({ label, variant = "stone" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${BADGE_VARIANTS[variant]}`}
    >
      {label}
    </span>
  );
}

function Label({ children, color = "text-stone-500" }) {
  return (
    <p className={`text-xs font-bold uppercase tracking-wider ${color}`}>
      {children}
    </p>
  );
}

function FreeResourcesPanel() {
  const resources = [
    {
      name: "Indian Kanoon",
      desc: "Free, searchable database of Indian court judgments and bare acts. The most comprehensive free legal resource for India.",
      url: "https://indiankanoon.org",
      tag: "Case Law & Acts",
    },
    {
      name: "India Code",
      desc: "Official digital repository of all Central Acts by the Ministry of Law and Justice, Government of India.",
      url: "https://www.indiacode.nic.in",
      tag: "Official Government",
    },
    {
      name: "Legislative.gov.in",
      desc: "The official site of India's Legislative Department offering IPC, CrPC, and all major Acts in full text.",
      url: "https://legislative.gov.in",
      tag: "Legislation",
    },
    {
      name: "NALSA",
      desc: "National Legal Services Authority — provides free legal aid. Apply online for legal help.",
      url: "https://nalsa.gov.in",
      tag: "Free Legal Aid",
    },
    {
      name: "eCourts India",
      desc: "Track your case status, view causelists and judgments from District Courts across India.",
      url: "https://ecourts.gov.in",
      tag: "Court Services",
    },
    {
      name: "National Cyber Crime Portal",
      desc: "Report cyber crimes online. Dedicated platform for cybercrime complaints under MHA.",
      url: "https://cybercrime.gov.in",
      tag: "Cyber Crime",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-8 space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/5" />
        <p className="text-stone-500 text-sm font-medium uppercase tracking-widest flex items-center gap-2">
          <Scale size={14} /> Free Legal Resources
        </p>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((r, i) => (
          <motion.a
            key={r.name}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="group bg-surface/60 border border-white/5 rounded-2xl p-5 hover:border-nyaya-500/40 hover:bg-surface transition-all duration-300 no-underline"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-nyaya-500/10 flex items-center justify-center">
                <Shield size={20} className="text-nyaya-500" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-nyaya-500/70 bg-nyaya-500/10 border border-nyaya-500/20 px-2 py-0.5 rounded-full">
                {r.tag}
              </span>
            </div>
            <h4 className="text-white font-semibold text-sm group-hover:text-nyaya-500 transition-colors">
              {r.name}
            </h4>
            <p className="text-stone-500 text-xs mt-1.5 leading-relaxed line-clamp-3">
              {r.desc}
            </p>
            <p className="mt-3 text-nyaya-600 text-xs font-medium group-hover:text-nyaya-400 transition-colors">
              Open resource <ExternalLink size={10} className="inline ml-0.5" />
            </p>
          </motion.a>
        ))}
      </div>

      <div className="bg-surface/30 border border-white/5 rounded-xl p-4 text-stone-500 text-xs leading-relaxed flex items-start gap-3">
        <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
        <div>
          <strong className="text-stone-400">Disclaimer:</strong> The information provided here is
          for educational and informational purposes only. IPC sections may have been amended. For legal
          advice or action, please consult a qualified advocate. Note: The Bharatiya Nyaya Sanhita (BNS)
          2023 has replaced the IPC effective July 1, 2024 — BNS equivalents are shown where applicable.
        </div>
      </div>
    </motion.div>
  );
}
