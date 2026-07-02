import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  PhoneOff,
  Clock,
  Wifi,
  WifiOff,
  MessageSquare,
  X,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { useVapi } from "../hooks/useVapi";
import { useTimer } from "../hooks/useTimer";
import { interviewService } from "../services/interview.service";
import { SystemCheck } from "../components/interview/SystemCheck";
import toast from "react-hot-toast";

const VAPI_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY || "";

const TYPE_LABELS = {
  BEHAVIORAL: "Behavioral Interview",
  TECHNICAL: "Technical Interview",
  SYSTEM_DESIGN: "System Design Interview",
  HR: "HR Interview",
};

const TYPE_PERSONAS = {
  BEHAVIORAL: "Sarah Chen (Senior Engineering Manager)",
  TECHNICAL: "Alex Rivera (Staff Software Engineer)",
  SYSTEM_DESIGN: "Priya Sharma (Principal Engineer)",
  HR: "Michael Torres (VP of People & Culture)",
};

export default function InterviewRoom() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const [interviewData, setInterviewData] = useState(null);
  const [isEnding, setIsEnding] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [systemCheckPassed, setSystemCheckPassed] = useState(false);
  const transcriptEndRef = useRef(null);

  // Vapi hook
  const {
    status,
    isMuted,
    transcript,
    volumeLevel,
    isThinking,
    startCall,
    endCall,
    toggleMute,
  } = useVapi({
    publicKey: VAPI_KEY,
    onStatusChange: (newStatus) => {
      if (newStatus === "connected") setHasStarted(true);
    },
    onCallEnd: () => {
      handleEndInterview();
    },
    onError: (error) => {
      toast.error("Voice connection error. Please check your microphone.");
      console.error("Vapi error:", error);
    },
  });

  // Timer
  const duration = interviewData?.duration || 1800;
  const timer = useTimer({
    duration,
    onWarning: (remaining) => {
      if (remaining === 300) toast("5 minutes remaining", { icon: "⏰" });
      if (remaining === 120) toast("2 minutes remaining", { icon: "⚠️" });
      if (remaining === 30) toast("30 seconds remaining!", { icon: "🔴" });
    },
    onEnd: () => {
      toast("Time is up! Ending interview...", { icon: "⏱️" });
      handleEndInterview();
    },
  });

  // Load interview data from session storage
  useEffect(() => {
    if (!sessionId) return;
    const stored = sessionStorage.getItem(`interview_${sessionId}`);
    if (stored) {
      const data = JSON.parse(stored);
      setInterviewData(data);
    } else {
      toast.error("Interview session not found");
      navigate("/interview/setup");
    }
  }, [sessionId, navigate]);

  // Start the Vapi call when data is ready AND system check passed
  useEffect(() => {
    if (interviewData?.assistantConfig && !hasStarted && status === "idle" && systemCheckPassed) {
      startCall(interviewData.assistantConfig);
      timer.start();
    }
  }, [interviewData, hasStarted, status, systemCheckPassed]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const handleEndInterview = useCallback(async () => {
    if (isEnding) return;
    setIsEnding(true);
    timer.stop();

    try {
      await endCall();
    } catch {
      /* call may already be ended */
    }

    try {
      await interviewService.end({
        sessionId: sessionId,
        transcript: transcript.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      // Generate report
      toast.loading("Generating your feedback report...", { id: "report" });
      await interviewService.generateReport(sessionId);
      toast.success("Report ready!", { id: "report" });

      sessionStorage.removeItem(`interview_${sessionId}`);
      navigate(`/interview/${sessionId}/report`);
    } catch (error) {
      toast.error(
        "Failed to save interview. Your data has been saved locally.",
      );
      navigate("/dashboard");
    }
  }, [sessionId, transcript, isEnding, timer, endCall, navigate]);

  // Canvas waveform
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const barCount = 40;
      const barWidth = width / barCount - 2;
      const isSpeaking = status === "speaking";

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 2);
        const amplitude = isSpeaking
          ? (Math.sin(Date.now() / 200 + i * 0.5) + 1) *
            0.5 *
            volumeLevel *
            height *
            0.8
          : Math.random() * 4 + 2;
        const barHeight = Math.max(amplitude, 3);
        const y = (height - barHeight) / 2;

        ctx.fillStyle = isSpeaking ? "#6c63ff" : "#94a3b8";
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    };

    const frameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId);
  }, [status, volumeLevel]);

  const statusText = {
    idle: "Initializing...",
    connecting: "Connecting to interviewer...",
    connected: "Connected",
    speaking: "AI is speaking...",
    listening: "Listening to you...",
    error: "Connection error",
    ended: "Interview ended",
  }[status];

  const displayStatus = isThinking ? "Analyzing your answer..." : statusText;

  const statusColor =
    status === "error"
      ? "text-red-500"
      : isThinking
        ? "text-purple-400 animate-pulse"
        : status === "speaking"
          ? "text-brand-500"
          : status === "listening"
            ? "text-green-500"
            : "text-surface-400";

  return (
    <>
      {!systemCheckPassed && (
        <SystemCheck 
          onPassed={() => setSystemCheckPassed(true)} 
          persona={TYPE_PERSONAS[interviewData?.type]} 
        />
      )}
      
      <div className="fixed inset-0 bg-surface-950 text-white flex flex-col">
        {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-surface-800">
        <div className="flex items-center gap-3">
          <div
            className={`w-2.5 h-2.5 rounded-full ${status === "connected" || status === "speaking" || status === "listening" ? "bg-green-500" : status === "error" ? "bg-red-500" : "bg-yellow-500"} animate-pulse`}
          />
          <span className="text-sm text-surface-400">
            {TYPE_LABELS[interviewData?.type] || "Interview"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-surface-400" />
          <span
            className={`font-mono text-lg font-semibold ${timer.isCritical ? "text-red-500 animate-pulse" : timer.isWarning ? "text-yellow-500" : "text-white"}`}
          >
            {timer.formatted}
          </span>
          {/* Difficulty Badge (Admin/Dev feature) */}
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-xs font-mono bg-surface-800 text-surface-400 border border-surface-700 uppercase">
            LVL: {interviewData?.difficulty || "INTERMEDIATE"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {status === "connected" ||
          status === "speaking" ||
          status === "listening" || 
          isThinking ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm ${statusColor}`}>{displayStatus}</span>
        </div>
      </header>

      {/* Main area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative">
        {/* AI speaking/thinking orb */}
        <motion.div
          animate={{
            scale: status === "speaking" ? [1, 1.1, 1] : isThinking ? [1, 1.05, 1] : 1,
            boxShadow:
              status === "speaking"
                ? [
                    "0 0 20px rgba(108,99,255,0.3)",
                    "0 0 60px rgba(108,99,255,0.5)",
                    "0 0 20px rgba(108,99,255,0.3)",
                  ]
                : isThinking
                ? [
                    "0 0 10px rgba(168,85,247,0.2)",
                    "0 0 30px rgba(168,85,247,0.4)",
                    "0 0 10px rgba(168,85,247,0.2)",
                  ]
                : "0 0 20px rgba(108,99,255,0.1)",
          }}
          transition={{
            duration: status === "speaking" ? 1.5 : 2,
            repeat: (status === "speaking" || isThinking) ? Infinity : 0,
          }}
          className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center mb-8 ${isThinking ? 'bg-gradient-to-br from-purple-500 to-indigo-600 opacity-80' : 'bg-gradient-to-br from-brand-500 to-purple-600'}`}
        >
          {isThinking ? (
            <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-white animate-spin" />
          ) : (
            <Mic className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
          )}
        </motion.div>

        {/* Status label */}
        <p className={`text-lg font-medium mb-4 ${statusColor}`}>
          {displayStatus}
        </p>

        {/* Waveform */}
        <canvas
          ref={canvasRef}
          width={400}
          height={60}
          className="w-full max-w-md h-[60px] mb-8 opacity-80"
        />

        {/* Live transcript indicator */}
        {transcript.length > 0 && (
          <div className="max-w-lg w-full text-center">
            <p className="text-sm text-surface-400 italic truncate">
              {transcript[transcript.length - 1]?.content?.substring(0, 100)}...
            </p>
          </div>
        )}
      </main>

      {/* Transcript drawer */}
      <AnimatePresence>
        {showTranscript && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="absolute bottom-24 left-0 right-0 bg-surface-900 border-t border-surface-700 rounded-t-2xl max-h-[50vh] overflow-y-auto custom-scrollbar p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Live Transcript</h3>
              <button
                onClick={() => setShowTranscript(false)}
                className="p-1 rounded-lg hover:bg-surface-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {transcript.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === "assistant" ? "bg-surface-800 text-surface-200" : "bg-brand-600 text-white"}`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls */}
      <footer className="flex items-center justify-center gap-4 px-6 py-6 border-t border-surface-800">
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="p-4 rounded-full bg-surface-800 hover:bg-surface-700 transition-all"
          title="Toggle transcript"
        >
          {showTranscript ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <MessageSquare className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition-all ${isMuted ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-surface-800 hover:bg-surface-700"}`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={handleEndInterview}
          disabled={isEnding}
          className="px-8 py-4 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
          title="End Interview"
        >
          <PhoneOff className="w-5 h-5" />
          {isEnding ? "Ending..." : "End Interview"}
        </button>
      </footer>
      </div>
    </>
  );
}
