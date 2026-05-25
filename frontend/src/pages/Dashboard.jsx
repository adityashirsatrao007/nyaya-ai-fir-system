import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Button,
  Tabs,
  Tab,
  Chip,
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@nextui-org/react";
import { motion, AnimatePresence } from "framer-motion";
import { logout, getCurrentUser } from "../services/auth";
import {
  Scale,
  FolderArchive,
  Plus,
  AlertTriangle,
  Inbox,
  CheckCircle,
  Download,
  FileText,
  Search,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Rocket,
  Film,
  Mic,
  Image,
  Landmark,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Activity,
  Gavel,
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [cases, setCases] = useState([]);
  const [isLoadingCases, setIsLoadingCases] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedCase, setSelectedCase] = useState(null);

  const [step, setStep] = useState(1);
  const [firFile, setFirFile] = useState(null);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [firResult, setFirResult] = useState(null);
  const [evidenceResult, setEvidenceResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchCases();
    }
  }, [activeTab]);

  const fetchCases = async () => {
    setIsLoadingCases(true);
    setErrorMsg("");
    try {
      const userEmail = user?.email || "demo@nyaya.ai";
      const res = await fetch(`http://127.0.0.1:8001/cases?email=${encodeURIComponent(userEmail)}`);
      if (!res.ok) throw new Error(`HTTP status ${res.status}`);
      const data = await res.json();
      if (data && data.cases) {
        setCases(data.cases);
      } else {
        throw new Error("Invalid format: 'cases' array not found in response");
      }
    } catch (err) {
      console.error("Failed to fetch cases", err);
      setErrorMsg(`Failed to load cases: ${err.message}`);
      setCases([]);
    } finally {
      setIsLoadingCases(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDropFir = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFirFile(e.dataTransfer.files[0]);
    }
  };

  const handleDropEvidence = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setEvidenceFile(e.dataTransfer.files[0]);
    }
  };

  const processFiles = async () => {
    if (!firFile) return;

    setIsProcessing(true);
    setStep(3);
    setProgressValue(0);

    const progressInterval = setInterval(() => {
      setProgressValue((v) => (v >= 90 ? 90 : v + 5));
    }, 1500);

    try {
      const firData = new FormData();
      firData.append("file", firFile);
      firData.append("context", "fir");

      const firRes = await fetch("http://127.0.0.1:8001/analyze", {
        method: "POST",
        body: firData,
      });
      const firDataJson = await firRes.json();

      if (firDataJson.status === "error") {
        throw new Error(firDataJson.explanation || "Invalid Document Uploaded.");
      }

      setFirResult(firDataJson);
      setProgressValue(50);

      let evDataJson = null;
      if (evidenceFile) {
        const evData = new FormData();
        evData.append("file", evidenceFile);
        evData.append("context", "evidence");

        const evRes = await fetch("http://127.0.0.1:8001/analyze", {
          method: "POST",
          body: evData,
        });
        evDataJson = await evRes.json();
        setEvidenceResult(evDataJson);
      } else {
        setEvidenceResult(null);
      }

      const userEmail = user?.email || "demo@nyaya.ai";
      const newCase = {
        police_station: "Pending Review",
        date_filed: new Date().toISOString().split('T')[0],
        status: "Analyzed",
        analysis_progress: 100,
        tags: firDataJson.detected_ipcs || [],
        matches: firDataJson.detected_ipcs || [],
        fir_summary: firDataJson,
        evidence_analysis: evDataJson || null
      };

      try {
        await fetch(`http://127.0.0.1:8001/cases?email=${encodeURIComponent(userEmail)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCase)
        });
        fetchCases();
      } catch (err) {
        console.error("Failed to persist case to DB", err);
      }

      clearInterval(progressInterval);
      setProgressValue(100);

      setTimeout(() => {
        setStep(4);
      }, 500);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert(error.message || "Failed to connect to the analysis server.");
      setStep(1);
      clearInterval(progressInterval);
    } finally {
      setIsProcessing(false);
    }
  };

  const generatePDF = async () => {
    const pdf = new jsPDF();
    const fileToDataUrl = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });

    try {
      const addBranding = (pageTitle) => {
        pdf.setFillColor(10, 132, 255);
        pdf.rect(0, 0, 210, 15, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(255, 255, 255);
        pdf.text("Nyaya AI - Official Legal Analysis Report", 10, 10);

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text(new Date().toLocaleDateString(), 180, 10);

        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.text(pageTitle, 20, 30);

        const pageCount = pdf.internal.getNumberOfPages();
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Nyaya AI | Multimodal Evidence Analysis System | Page ${pageCount}`, 105, 290, null, null, "center");
        pdf.setTextColor(0, 0, 0);
      };

      addBranding("Page 1: First Information Report (FIR)");

      pdf.setFont("helvetica", "normal");
      if (firFile && firFile.type.startsWith("image/")) {
        const firUrl = await fileToDataUrl(firFile);
        pdf.addImage(firUrl, "JPEG", 20, 40, 170, 200, undefined, "FAST");
      } else {
        pdf.setFontSize(12);
        pdf.text(
          `File attached: ${firFile?.name} (Preview not available)`,
          20,
          50,
        );
      }

      pdf.addPage();
      addBranding("Page 2: Multimodal Evidence");

      pdf.setFont("helvetica", "normal");
      if (evidenceFile && evidenceFile.type.startsWith("image/")) {
        const evUrl = await fileToDataUrl(evidenceFile);
        pdf.addImage(evUrl, "JPEG", 20, 40, 170, 150, undefined, "FAST");
      } else if (evidenceFile) {
        pdf.setFontSize(12);
        pdf.text(`Evidence File: ${evidenceFile.name}`, 20, 45);
      } else {
        pdf.setFontSize(14);
        pdf.setTextColor(150, 150, 150);
        pdf.text("(Evidence Upload Skipped / Not Provided)", 105, 140, null, null, "center");
        pdf.setTextColor(0, 0, 0);
      }

      pdf.addPage();
      addBranding("Page 3: AI Legal Analysis & Insights");

      pdf.setFillColor(250, 250, 249);
      pdf.setDrawColor(214, 211, 209);
      pdf.roundedRect(15, 40, 180, 140, 3, 3, "FD");

      let y = 50;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(10, 132, 255);
      pdf.text("1. FIR Legal Extraction & Context:", 20, y);

      pdf.setTextColor(0, 0, 0);
      y += 10;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);

      const ipcText = firResult.detected_ipcs?.length > 0 ? firResult.detected_ipcs.join(", ") : "None Detected";
      pdf.setFont("helvetica", "bold");
      pdf.text("Detected Statutes:", 20, y);
      pdf.setFont("helvetica", "normal");
      pdf.text(` ${ipcText}`, 65, y);

      y += 10;
      pdf.setFont("helvetica", "bold");
      pdf.text("Punishment Mapping / Summary:", 20, y);
      y += 7;
      pdf.setFont("helvetica", "normal");
      const firExplLines = pdf.splitTextToSize(firResult.explanation, 165);
      pdf.text(firExplLines, 20, y);
      y += firExplLines.length * 6 + 10;

      if (firResult.key_factors && firResult.key_factors.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.text("Detailed Findings & Extracted Insights:", 20, y);
        y += 8;
        pdf.setFont("helvetica", "normal");

        firResult.key_factors.forEach((factor) => {
          const factorLines = pdf.splitTextToSize(`- ${factor}`, 165);

          if (y + factorLines.length * 6 > 270) {
            pdf.addPage();
            addBranding("AI Legal Analysis (Continued)");
            y = 40;
          }

          pdf.text(factorLines, 20, y);
          y += factorLines.length * 6 + 3;
        });
        y += 10;
      }

      if (y > 240) {
        pdf.addPage();
        addBranding("AI Multimodal Analysis (Continued)");
        y = 40;
      }

      pdf.setFillColor(250, 250, 249);
      pdf.roundedRect(15, y - 5, 180, 60, 3, 3, "FD");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(10, 132, 255);
      pdf.text("2. Evidence Integrity Analysis:", 20, y + 5);
      y += 15;
      pdf.setTextColor(0, 0, 0);

      if (evidenceResult) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);

        pdf.setFont("helvetica", "bold");
        pdf.text("Integrity Status:", 20, y);
        pdf.setFont("helvetica", "normal");

        const isTampered = evidenceResult.is_manipulated;
        if (isTampered) {
          pdf.setTextColor(220, 38, 38);
        } else {
          pdf.setTextColor(22, 163, 74);
        }

        const tamperingStatus = isTampered ? "[!] TAMPERING DETECTED" : "[OK] VERIFIED AUTHENTIC";
        pdf.text(`${tamperingStatus}  (Confidence: ${evidenceResult.confidence_score.toFixed(2)}%)`, 55, y);

        pdf.setTextColor(0, 0, 0);
        y += 10;
        const evExplLines = pdf.splitTextToSize(`Analysis: ${evidenceResult.explanation}`, 165);
        pdf.text(evExplLines, 20, y);

      } else {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        pdf.setTextColor(150, 150, 150);
        pdf.text("(Skipped / Not Provided)", 20, y);
        pdf.setTextColor(0, 0, 0);
      }

      pdf.save(`NyayaAI_Report_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF");
    }
  };

  const resetFlow = () => {
    setStep(1);
    setFirFile(null);
    setEvidenceFile(null);
    setFirResult(null);
    setEvidenceResult(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-nyaya-500/30 selection:text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-3">
              <Scale size={22} className="text-nyaya-500" /> Nyaya AI
            </h1>
            <p className="text-sm text-stone-500 mt-1 font-medium tracking-wide">
              Multimodal Evidence Analysis & Verification System
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Tabs
              key="navigation"
              color="primary"
              variant="bordered"
              selectedKey={activeTab}
              onSelectionChange={(k) => setActiveTab(k)}
              classNames={{
                tabList: "border-white/10",
                cursor: "bg-nyaya-500/20",
                tabContent: "text-stone-400 group-data-[selected=true]:text-nyaya-500",
              }}
            >
              <Tab
                key="dashboard"
                title={
                  <div className="flex items-center space-x-2">
                    <FolderArchive size={16} />
                    <span>Active Cases</span>
                  </div>
                }
              />
              <Tab
                key="new"
                title={
                  <div className="flex items-center space-x-2">
                    <Plus size={16} />
                    <span>New Analysis</span>
                  </div>
                }
              />
            </Tabs>

            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  as="button"
                  className="transition-transform"
                  color="primary"
                  name={user?.name?.charAt(0) || "U"}
                  size="sm"
                  showFallback
                  fallback={<User size={16} className="text-stone-400" />}
                />
              </DropdownTrigger>
              <DropdownMenu
                aria-label="User Actions"
                variant="flat"
                classNames={{ base: "bg-surface border border-white/5" }}
              >
                <DropdownItem key="profile" className="h-14 gap-2" textValue="Profile">
                  <p className="font-semibold text-white">Signed in as</p>
                  <p className="font-semibold text-nyaya-500 text-sm">{user?.email || "user@nyaya.ai"}</p>
                </DropdownItem>
                <DropdownItem key="settings" startContent={<Settings size={14} />} textValue="Settings">Settings</DropdownItem>
                <DropdownItem key="help" startContent={<HelpCircle size={14} />} textValue="Help">Help & Support</DropdownItem>
                <DropdownItem key="logout" color="danger" startContent={<LogOut size={14} />} onPress={handleLogout} textValue="Logout">
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </header>

        <main>
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-2xl font-bold font-heading text-white">
                      Crime & Criminal Network Database
                    </h2>
                    <p className="text-stone-500 text-sm">
                      Viewing correlated FIRs and verified multimodal evidence.
                    </p>
                  </div>
                  <Chip
                    color="success"
                    variant="flat"
                    size="sm"
                    className="font-semibold tracking-widest pl-2"
                    startContent={<span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />}
                  >
                    LIVE SYNC
                  </Chip>
                </div>

                {isLoadingCases ? (
                  <div className="flex flex-col items-center justify-center p-20 gap-4">
                    <Progress
                      size="sm"
                      isIndeterminate
                      color="primary"
                      className="max-w-md"
                    />
                    <p className="text-stone-500">
                      Fetching cases from secure server...
                    </p>
                  </div>
                ) : errorMsg ? (
                  <div className="flex flex-col items-center justify-center p-20 gap-4 bg-red-950/30 border border-red-800/40 rounded-xl mt-8">
                    <AlertTriangle size={32} className="text-red-500" />
                    <h3 className="text-xl font-bold text-red-400">
                      Connection Error
                    </h3>
                    <p className="text-red-400/80 text-center max-w-lg text-sm">
                      {errorMsg}
                    </p>
                    <p className="text-xs text-stone-500 mt-2">
                      Please ensure the FastAPI backend is running on
                      http://127.0.0.1:8001
                    </p>
                    <Button
                      color="primary"
                      variant="flat"
                      onPress={fetchCases}
                      className="mt-4"
                    >
                      Retry Connection
                    </Button>
                  </div>
                ) : cases.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-20 gap-4 bg-surface border border-white/5 rounded-xl mt-8">
                    <Inbox size={32} className="text-stone-500" />
                    <p className="text-stone-500">
                      No cases found in the database.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(cases || []).map((c, idx) => (
                      <Card
                        key={idx}
                        isPressable
                        onPress={() => {
                          setSelectedCase(c);
                          onOpen();
                        }}
                        className="bg-surface border border-white/5 hover:border-nyaya-500/30 hover:-translate-y-1 transition-all rounded-2xl text-left w-full"
                        shadow="none"
                      >
                        <CardHeader className="flex justify-between items-center px-6 pt-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-lg font-bold font-heading text-white">
                              {c.case_id}
                            </span>
                            <span className="text-xs text-stone-500 font-mono">
                              {c.date_filed}
                            </span>
                          </div>
                          <Chip
                            color={
                              c.status.includes("Closed")
                                ? "success"
                                : "warning"
                            }
                            variant="flat"
                            size="sm"
                          >
                            {c.status}
                          </Chip>
                        </CardHeader>
                        <Divider className="bg-white/5" />
                        <CardBody className="px-6 py-4 flex flex-col gap-4">
                          <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5 flex gap-4">
                            {c.fir_summary.image_url && (
                              <div className="w-1/3 flex-shrink-0">
                                <img
                                  src={c.fir_summary.image_url}
                                  alt="FIR Document"
                                  className="w-full h-32 object-cover rounded-lg border border-white/5 opacity-80 hover:opacity-100 transition-opacity"
                                />
                              </div>
                            )}
                            <div className="flex-1 flex flex-col">
                              <div className="flex justify-between mb-2">
                                <span className="text-sm font-semibold text-nyaya-500">
                                  FIR OCR Extraction
                                </span>
                                <Chip
                                  size="sm"
                                  variant="faded"
                                  className="bg-nyaya-500/10 text-nyaya-500 border-nyaya-500/20"
                                >
                                  {Number(c.fir_summary.ocr_confidence || c.fir_summary.confidence_score || 0).toFixed(1)}% Conf
                                </Chip>
                              </div>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {(c.fir_summary.detected_ipcs || []).map((ipc) => (
                                  <Chip
                                    key={ipc}
                                    size="sm"
                                    className="bg-white/5 text-stone-400"
                                  >
                                    {ipc}
                                  </Chip>
                                ))}
                              </div>
                              <p className="text-xs text-stone-500 leading-relaxed line-clamp-3">
                                {c.fir_summary.charges_summary || c.fir_summary.explanation}
                              </p>
                              {c.fir_summary.key_factors && c.fir_summary.key_factors.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                  {c.fir_summary.key_factors.filter(f => f.startsWith("IPC")).slice(0, 2).map((factor, i) => (
                                    <li key={i} className="text-xs text-stone-500 truncate flex items-center gap-1">
                                      <Gavel size={10} className="text-nyaya-500" /> {factor}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>

                          {c.evidence_analysis ? (
                            <div
                              className={`p-4 rounded-xl border ${c.evidence_analysis.is_manipulated
                                ? "bg-red-950/20 border-red-800/30"
                                : "bg-green-950/20 border-green-800/30"
                                }`}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className={`text-sm font-semibold ${c.evidence_analysis.is_manipulated ? "text-red-400" : "text-green-400"}`}>
                                  {c.evidence_analysis.is_manipulated ? "WARNING: Potential Tampering" : "Authentic Evidence"}
                                </span>
                                <span className={`text-xs font-bold font-mono ${c.evidence_analysis.is_manipulated ? "text-red-500" : "text-green-500"}`}>
                                  {Number(c.evidence_analysis.confidence_score || 0).toFixed(1)}% Score
                                </span>
                              </div>
                              <p className={`text-xs line-clamp-2 ${c.evidence_analysis.is_manipulated ? "text-red-300/80" : "text-green-300/80"}`}>
                                {c.evidence_analysis.explanation}
                              </p>
                            </div>
                          ) : (
                            <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 text-center">
                              <span className="text-sm font-semibold text-stone-500">
                                Evidence Upload Skipped
                              </span>
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                )}

                <Modal
                  isOpen={isOpen}
                  onOpenChange={onOpenChange}
                  size="3xl"
                  backdrop="blur"
                  scrollBehavior="inside"
                  classNames={{
                    backdrop: "bg-black/60",
                    base: "border border-white/5",
                  }}
                >
                  <ModalContent className="bg-surface">
                    {(onClose) => (
                      <>
                        <ModalHeader className="flex flex-col gap-1 border-b border-white/5 pb-4">
                          <h2 className="text-2xl font-bold font-heading text-white flex items-center gap-3">
                            <FolderArchive size={24} className="text-nyaya-500" /> Case Profile:{" "}
                            {selectedCase?.case_id}
                          </h2>
                          <p className="text-sm text-stone-500">
                            Registered on {selectedCase?.date_filed} at{" "}
                            {selectedCase?.police_station || "Unknown PS"}
                          </p>
                        </ModalHeader>
                        <ModalBody className="py-6">
                          {selectedCase && (
                            <div className="flex flex-col gap-6 tracking-wide">
                              <div className="flex flex-col md:flex-row gap-6">
                                {selectedCase.fir_summary.image_url && (
                                  <a
                                    href={selectedCase.fir_summary.image_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Click to view full FIR document"
                                    className="w-full md:w-1/2 rounded-xl overflow-hidden border border-white/5 relative group cursor-pointer block"
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10"></div>
                                    <span className="absolute bottom-3 left-3 z-20 text-[10px] font-bold bg-black/60 px-2 py-1 rounded backdrop-blur-md text-stone-400 uppercase tracking-widest">
                                      FIR DOCUMENT SCAN
                                    </span>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center z-20">
                                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-3 py-1.5 rounded-full font-mono tracking-wider flex items-center gap-1.5">
                                        <Search size={10} /> CLICK TO VIEW FULL DOCUMENT
                                      </span>
                                    </div>
                                    <img
                                      src={selectedCase.fir_summary.image_url}
                                      alt="Original FIR"
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                  </a>
                                )}

                                <div className="w-full md:w-1/2 flex flex-col gap-4">
                                  <div className="bg-nyaya-500/5 p-5 rounded-xl border border-nyaya-500/20">
                                    <h3 className="text-nyaya-500 font-bold mb-3 uppercase tracking-wider text-xs">
                                      AI Extraction Data
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                      {(selectedCase.fir_summary.detected_ipcs || []).map(
                                        (ipc) => (
                                          <Chip
                                            key={ipc}
                                            color="primary"
                                            variant="flat"
                                            size="sm"
                                            className="font-mono text-nyaya-400"
                                          >
                                            {ipc}
                                          </Chip>
                                        ),
                                      )}
                                    </div>
                                    <p className="text-sm text-stone-400 leading-relaxed font-sans mb-4">
                                      {selectedCase.fir_summary.charges_summary || selectedCase.fir_summary.explanation}
                                    </p>

                                    {selectedCase.fir_summary.key_factors && selectedCase.fir_summary.key_factors.length > 0 && (
                                      <div className="bg-black/20 p-3 rounded-lg border border-nyaya-500/10 mb-4">
                                        <h4 className="text-xs font-bold text-nyaya-500 mb-2">Detailed Findings</h4>
                                        <ul className="space-y-1.5">
                                          {selectedCase.fir_summary.key_factors.map((factor, i) => (
                                            <li key={i} className="text-xs text-stone-400 flex items-start gap-2">
                                              <span className="text-nyaya-500 mt-0.5">•</span>
                                              <span>{factor}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    <div className="mt-4 flex justify-between items-center text-xs text-stone-500 border-t border-white/5 pt-3">
                                      <span>OCR Confidence</span>
                                      <span className="text-nyaya-500 font-mono">
                                        {Number(selectedCase.fir_summary.ocr_confidence || selectedCase.fir_summary.confidence_score || 0).toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {selectedCase.evidence_analysis ? (
                                <div
                                  className={`mt-2 p-5 rounded-xl border ${selectedCase.evidence_analysis.is_manipulated ? "bg-red-950/20 border-red-800/30" : "bg-green-950/20 border-green-800/30"}`}
                                >
                                  <h3
                                    className={`font-bold mb-4 uppercase tracking-wider text-xs ${selectedCase.evidence_analysis.is_manipulated ? "text-red-400" : "text-green-400"}`}
                                  >
                                    Forensic Authenticity Analysis:{" "}
                                    {selectedCase.evidence_analysis.evidence_type}
                                  </h3>
                                  <div className="flex flex-col md:flex-row items-center gap-6">
                                    <a
                                      href={
                                        selectedCase.evidence_analysis.image_url
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Click to view full evidence image"
                                      className="w-full md:w-1/3 h-48 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center relative overflow-hidden group cursor-pointer flex-shrink-0"
                                    >
                                      <img
                                        src={
                                          selectedCase.evidence_analysis.image_url
                                        }
                                        alt="Forensic Evidence"
                                        className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105"
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center z-10">
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-3 py-1.5 rounded-full font-mono tracking-wider flex items-center gap-1">
                                          <Search size={10} /> CLICK TO OPEN FULL SIZE
                                        </span>
                                      </div>
                                      <div className="absolute top-2 right-2 bg-black/80 text-white p-1.5 rounded-md backdrop-blur-md z-10">
                                        {selectedCase.evidence_analysis.evidence_type.includes("Video") && <Film size={16} />}
                                        {selectedCase.evidence_analysis.evidence_type.includes("Audio") && <Mic size={16} />}
                                        {selectedCase.evidence_analysis.evidence_type.includes("Image") && <Image size={16} />}
                                      </div>
                                      {selectedCase.evidence_analysis.is_manipulated && (
                                        <div className="absolute inset-0 border-2 border-red-500/60 rounded-xl pointer-events-none z-10"></div>
                                      )}
                                    </a>

                                    <div className="flex-1 flex items-center gap-6">
                                      <div className="text-center w-32">
                                        <Chip
                                          color={
                                            selectedCase.evidence_analysis
                                              .is_manipulated
                                              ? "danger"
                                              : "success"
                                          }
                                          variant="shadow"
                                          size="lg"
                                          className="px-4 font-black tracking-widest"
                                        >
                                          {selectedCase.evidence_analysis.is_manipulated ? "TAMPERED" : "VERIFIED"}
                                        </Chip>
                                        <p className="text-xs text-stone-500 mt-2 font-mono">
                                          {selectedCase.evidence_analysis.confidence_score}% Conf
                                        </p>
                                      </div>
                                      <Divider
                                        orientation="vertical"
                                        className="h-16 bg-white/5 hidden md:block"
                                      />
                                      <p
                                        className={`text-sm leading-relaxed flex-1 ${selectedCase.evidence_analysis.is_manipulated ? "text-red-400" : "text-green-400"}`}
                                      >
                                        {selectedCase.evidence_analysis.explanation}
                                      </p>
                                    </div>

                                    {selectedCase.evidence_analysis.ncrb_context
                                      ?.stat_value && (
                                        <div className="mt-4 p-3 rounded-lg bg-black/20 border border-nyaya-500/20 flex items-start gap-3">
                                          <Landmark size={20} className="text-nyaya-500 mt-0.5 shrink-0" />
                                          <div>
                                            <p className="text-[10px] uppercase tracking-widest text-nyaya-500 font-bold mb-1">
                                              NCRB Official Data — National Context
                                            </p>
                                            <p className="text-sm text-stone-400">
                                              <span className="font-mono text-nyaya-500 text-base font-bold">
                                                {selectedCase.evidence_analysis.ncrb_context.stat_value}
                                              </span>{" "}
                                              cases of this type registered in West
                                              Bengal alone.{" "}
                                              <span className="text-stone-500">
                                                (National total:{" "}
                                                <span className="font-mono">
                                                  {selectedCase.evidence_analysis.ncrb_context.national_total}
                                                </span>
                                                )
                                              </span>
                                            </p>
                                            <p className="text-[10px] text-stone-600 mt-1 italic">
                                              Source:{" "}
                                              {selectedCase.evidence_analysis.ncrb_context.source}
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </ModalBody>
                        <ModalFooter className="border-t border-white/5 pt-4">
                          <Button
                            color="default"
                            variant="light"
                            onPress={onClose}
                          >
                            Close Profile
                          </Button>
                          <Button
                            color="primary"
                            variant="shadow"
                            onPress={() => {
                              alert("Printing full dossier is not implemented yet in the hybrid build.");
                            }}
                          >
                            Print Full Dossier
                          </Button>
                        </ModalFooter>
                      </>
                    )}
                  </ModalContent>
                </Modal>
              </motion.div>
            )}

            {activeTab === "new" && (
              <motion.div
                key="new"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto"
              >
                <div className="flex justify-between mb-8 px-4 relative">
                  <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -z-10 -translate-y-1/2" />
                  {[
                    "FIR Upload",
                    "Evidence Upload",
                    "AI Processing",
                    "Final Report",
                  ].map((label, idx) => {
                    const isActive = step >= idx + 1;
                    const isCurrent = step === idx + 1;
                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center gap-2 bg-background px-2"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${isActive
                            ? "bg-nyaya-500 text-white shadow-[0_0_15px_rgba(10,132,255,0.3)]"
                            : "bg-white/5 text-stone-500 border border-white/10"
                            } ${isCurrent ? "scale-110" : "scale-100"}`}
                        >
                          {isActive && !isCurrent ? <CheckCircle size={16} /> : idx + 1}
                        </div>
                        <span
                          className={`text-xs font-semibold ${isActive ? "text-nyaya-500" : "text-stone-500"}`}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Card
                        className="bg-surface border border-white/5 rounded-2xl"
                        shadow="none"
                      >
                        <CardHeader className="flex flex-col items-start px-8 pt-8">
                          <h2 className="text-2xl font-bold font-heading text-white">
                            Step 1: First Information Report (FIR)
                          </h2>
                          <p className="text-stone-500 mt-2 text-sm">
                            Upload the scanned FIR document to extract relevant
                            IPC codes using OCR and YOLOv8.
                          </p>
                        </CardHeader>
                        <CardBody className="px-8 py-6">
                          <div
                            onDragOver={handleDragOver}
                            onDrop={handleDropFir}
                            className="border-2 border-dashed border-nyaya-500/30 hover:border-nyaya-500/60 transition-colors bg-nyaya-500/5 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer"
                            onClick={() =>
                              document.getElementById("fir-upload").click()
                            }
                          >
                            <FileText size={48} className="text-nyaya-500/50" />
                            <div className="text-center">
                              <h3 className="text-xl font-semibold text-white">
                                Drag & Drop FIR Document
                              </h3>
                              <p className="text-sm text-stone-500 mt-1">
                                Images or PDFs Supported
                              </p>
                            </div>
                            <Button
                              color="primary"
                              variant="flat"
                              className="mt-2 font-semibold"
                              onClick={(e) => {
                                e.stopPropagation();
                                document.getElementById("fir-upload").click();
                              }}
                            >
                              Browse Files
                            </Button>
                            <input
                              type="file"
                              id="fir-upload"
                              className="hidden"
                              onChange={(e) => setFirFile(e.target.files[0])}
                            />
                          </div>
                        </CardBody>
                        <CardFooter className="px-8 pb-8 justify-between">
                          <div className="flex-1">
                            {firFile && (
                              <Chip color="success" variant="flat" size="lg">
                                Selected: {firFile.name}
                              </Chip>
                            )}
                          </div>
                          <Button
                            color="primary"
                            variant="shadow"
                            isDisabled={!firFile}
                            onClick={() => setStep(2)}
                            endContent={<ArrowRight size={16} />}
                          >
                            Next Step
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Card
                        className="bg-surface border border-white/5 rounded-2xl"
                        shadow="none"
                      >
                        <CardHeader className="flex flex-col items-start px-8 pt-8">
                          <h2 className="text-2xl font-bold font-heading text-white">
                            Step 2: Digital Evidence
                          </h2>
                          <p className="text-stone-500 mt-2 text-sm">
                            Upload corresponding video, audio, or image evidence
                            for forensic authenticity checking.
                          </p>
                        </CardHeader>
                        <CardBody className="px-8 py-6">
                          <div
                            onDragOver={handleDragOver}
                            onDrop={handleDropEvidence}
                            className="border-2 border-dashed border-nyaya-500/30 hover:border-nyaya-500/60 transition-colors bg-nyaya-500/5 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer"
                            onClick={() =>
                              document.getElementById("evidence-upload").click()
                            }
                          >
                            <Search size={48} className="text-nyaya-500/50" />
                            <div className="text-center">
                              <h3 className="text-xl font-semibold text-white">
                                Drag & Drop Evidence File
                              </h3>
                              <p className="text-sm text-stone-500 mt-1">
                                Video (Deepfake), Audio (Spoof), Image (Manipulation)
                              </p>
                            </div>
                            <Button
                              color="primary"
                              variant="flat"
                              className="mt-2 font-semibold"
                              onClick={(e) => {
                                e.stopPropagation();
                                document.getElementById("evidence-upload").click();
                              }}
                            >
                              Browse Evidence
                            </Button>
                            <input
                              type="file"
                              id="evidence-upload"
                              className="hidden"
                              onChange={(e) =>
                                setEvidenceFile(e.target.files[0])
                              }
                            />
                          </div>
                        </CardBody>
                        <CardFooter className="px-8 pb-8 flex justify-between">
                          <Button
                            variant="light"
                            onClick={() => setStep(1)}
                            startContent={<ArrowLeft size={16} />}
                          >
                            Back to FIR
                          </Button>
                          <div className="flex gap-4 items-center">
                            {evidenceFile && (
                              <Chip color="success" variant="flat">
                                {evidenceFile.name}
                              </Chip>
                            )}
                            <Button
                              color="primary"
                              variant="shadow"
                              onClick={processFiles}
                              isLoading={isProcessing}
                              endContent={!isProcessing && <Rocket size={16} />}
                            >
                              {evidenceFile ? "Run Analysis" : "Skip & Run Analysis"}
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="flex justify-center"
                    >
                      <Card
                        className="max-w-md w-full p-8 items-center text-center bg-surface border border-white/5 rounded-2xl"
                        shadow="none"
                      >
                        <CardBody className="overflow-visible items-center py-4">
                          <Progress
                            size="md"
                            isIndeterminate={progressValue === 0}
                            value={progressValue}
                            color="primary"
                            className="max-w-xs mb-8"
                          />
                          <h3 className="text-2xl font-bold font-heading text-white mb-2">
                            Executing Neural Networks
                          </h3>
                          <div className="flex flex-col gap-3 mt-4 text-sm text-stone-500 font-mono text-left w-full bg-white/[0.03] p-4 rounded-lg border border-white/5">
                            <p
                              className={
                                progressValue > 10 ? "text-green-400" : "opacity-30"
                              }
                            >
                              &gt; Initializing OCR Engine...
                            </p>
                            <p
                              className={
                                progressValue > 30
                                  ? "text-green-400"
                                  : "opacity-30"
                              }
                            >
                              &gt; Extracting FIR IPC codes...
                            </p>
                            <p
                              className={
                                progressValue > 50
                                  ? "text-green-400"
                                  : "opacity-30"
                              }
                            >
                              &gt; Running Forensic Deepfake Scan...
                            </p>
                            <p
                              className={
                                progressValue > 80
                                  ? "text-green-400"
                                  : "opacity-30"
                              }
                            >
                              &gt; Mapping Multimodal Vectors...
                            </p>
                          </div>
                        </CardBody>
                      </Card>
                    </motion.div>
                  )}

                  {step === 4 && firResult && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold font-heading text-white flex items-center gap-3">
                          <CheckCircle size={28} className="text-green-500" /> Analysis Complete
                        </h2>
                        <div className="flex gap-3">
                          <Button
                            color="success"
                            variant="shadow"
                            onClick={generatePDF}
                            className="font-bold"
                            startContent={<Download size={16} />}
                          >
                            Download PDF Report
                          </Button>
                          <Button
                            color="default"
                            variant="flat"
                            onClick={resetFlow}
                          >
                            Start New Case
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-nyaya-500/5 border border-nyaya-500/20 rounded-2xl" shadow="none">
                          <CardHeader className="px-6 pt-6 flex gap-3">
                            <FileText size={24} className="text-nyaya-500" />
                            <div className="flex flex-col">
                              <p className="text-md font-bold font-heading text-white">
                                FIR Legal Context
                              </p>
                              <p className="text-xs text-stone-500">
                                Extracted via OCR/YOLOv8
                              </p>
                            </div>
                          </CardHeader>
                          <Divider className="bg-nyaya-500/10" />
                          <CardBody className="px-6 py-6 flex flex-col gap-4">
                            <div>
                              <p className="text-sm font-semibold text-stone-400 mb-2">
                                Detected Statutes:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {firResult.detected_ipcs?.length > 0 ? (
                                  firResult.detected_ipcs.map((ipc) => (
                                    <Chip
                                      key={ipc}
                                      color="primary"
                                      variant="flat"
                                    >
                                      {ipc}
                                    </Chip>
                                  ))
                                ) : (
                                  <Chip variant="flat">None Detected</Chip>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 p-4 bg-white/[0.03] rounded-lg border border-white/5">
                              <p className="text-sm font-semibold text-stone-400 mb-1">
                                Punishment Mapping
                              </p>
                              <p className="text-sm leading-relaxed text-stone-400 mb-4">
                                {firResult.explanation}
                              </p>

                              {firResult.key_factors && firResult.key_factors.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-stone-500 uppercase mb-2">
                                    Detailed Findings & Statutes
                                  </p>
                                  <ul className="flex flex-col gap-2">
                                    {firResult.key_factors.map((factor, idx) => (
                                      <li key={idx} className="text-xs flex items-start gap-2 text-stone-400">
                                        <ChevronRight size={10} className="text-nyaya-500 mt-0.5 shrink-0" />
                                        <span className="leading-relaxed">{factor}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </CardBody>
                        </Card>

                        {evidenceResult && (
                          <Card
                            className={`rounded-2xl border ${evidenceResult.is_manipulated
                              ? "bg-red-950/10 border-red-800/30"
                              : "bg-green-950/10 border-green-800/30"
                              }`}
                            shadow="none"
                          >
                            <CardHeader className="px-6 pt-6 flex gap-3">
                              <Search size={24} className={evidenceResult.is_manipulated ? "text-red-400" : "text-green-400"} />
                              <div className="flex flex-col">
                                <p
                                  className={`text-md font-bold font-heading ${evidenceResult.is_manipulated
                                    ? "text-red-400"
                                    : "text-green-400"
                                    }`}
                                >
                                  Evidence Authenticity
                                </p>
                                <p className="text-xs text-stone-500">
                                  Forensic Pixel/Audio Analytics
                                </p>
                              </div>
                            </CardHeader>
                            <Divider
                              className={
                                evidenceResult.is_manipulated
                                  ? "bg-red-500/10"
                                  : "bg-green-500/10"
                              }
                            />
                            <CardBody className="px-6 py-6 flex flex-col gap-4">
                              <div
                                className={`p-4 rounded-xl flex items-center justify-between ${evidenceResult.is_manipulated
                                  ? "bg-red-500/10 border border-red-500/30"
                                  : "bg-green-500/10 border border-green-500/30"
                                  }`}
                              >
                                <h4
                                  className={`text-lg font-bold tracking-wider flex items-center gap-2 ${evidenceResult.is_manipulated
                                    ? "text-red-400"
                                    : "text-green-400"
                                    }`}
                                >
                                  {evidenceResult.is_manipulated ? (
                                    <><AlertTriangle size={18} /> TAMPERED</>
                                  ) : (
                                    <><CheckCircle size={18} /> AUTHENTIC</>
                                  )}
                                </h4>
                                <div className="text-right">
                                  <p className="text-xs text-stone-500 uppercase font-bold">
                                    Confidence
                                  </p>
                                  <p className="text-xl font-mono text-white">
                                    {evidenceResult.confidence_score.toFixed(1)}%
                                  </p>
                                </div>
                              </div>

                              <p className="text-sm leading-relaxed text-stone-400">
                                {evidenceResult.explanation}
                              </p>

                              <div className="mt-2">
                                <p className="text-xs font-semibold text-stone-500 uppercase mb-2">
                                  Key Highlights
                                </p>
                                <ul className="flex flex-col gap-2">
                                  {evidenceResult.key_factors.map(
                                    (factor, idx) => (
                                      <li
                                        key={idx}
                                        className="text-xs flex items-center gap-2 text-stone-400"
                                      >
                                        <ChevronRight size={10} className="text-nyaya-500 shrink-0" /> {factor}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            </CardBody>
                          </Card>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
