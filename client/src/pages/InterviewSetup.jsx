import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, ArrowRight, Clock } from "lucide-react";
import { interviewService } from "../services/interview.service";
import toast from "react-hot-toast";

const INTERVIEW_TYPES = [
  {
    type: "BEHAVIORAL",
    label: "Behavioral",
    emoji: "🎯",
    description: "Leadership, teamwork, conflict resolution, STAR stories",
    color: "from-blue-500 to-cyan-500",
  },
  {
    type: "TECHNICAL",
    label: "Technical",
    emoji: "💻",
    description: "JavaScript, React, Node.js, databases, APIs, performance",
    color: "from-purple-500 to-pink-500",
  },
  {
    type: "SYSTEM_DESIGN",
    label: "System Design",
    emoji: "🏗️",
    description: "Architecture, scalability, caching, load balancing",
    color: "from-orange-500 to-red-500",
  },
  {
    type: "HR",
    label: "HR / Culture Fit",
    emoji: "🤝",
    description: "Motivation, career goals, strengths, communication",
    color: "from-green-500 to-emerald-500",
  },
];

const DIFFICULTIES = [
  {
    value: "BEGINNER",
    label: "Beginner",
    description: "Foundational questions, supportive tone",
  },
  {
    value: "INTERMEDIATE",
    label: "Intermediate",
    description: "Standard interview difficulty",
  },
  {
    value: "ADVANCED",
    label: "Advanced",
    description: "Challenging follow-ups, deep dives",
  },
  {
    value: "EXPERT",
    label: "Expert",
    description: "Senior-level, edge cases, pressure",
  },
];

const DURATIONS = [
  { value: 900, label: "15 min", description: "Quick practice" },
  { value: 1800, label: "30 min", description: "Standard" },
  { value: 2700, label: "45 min", description: "Deep session" },
  { value: 3600, label: "60 min", description: "Full interview" },
];

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);
  const [difficulty, setDifficulty] = useState("INTERMEDIATE");
  const [duration, setDuration] = useState(1800);
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    if (!selectedType) {
      toast.error("Please select an interview type");
      return;
    }

    setIsStarting(true);
    try {
      const result = await interviewService.start({
        type: selectedType,
        difficulty,
        duration,
      });
      // Store assistant config in sessionStorage for the interview room
      sessionStorage.setItem(
        `interview_${result.sessionId}`,
        JSON.stringify(result),
      );
      navigate(`/interview/${result.sessionId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start interview");
      setIsStarting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">New Interview</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">
          Configure your AI interview session
        </p>
      </div>

      {/* Interview Type */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Interview Type</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {INTERVIEW_TYPES.map((item) => (
            <motion.button
              key={item.type}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedType(item.type)}
              className={`glass-card p-5 text-left transition-all ${selectedType === item.type ? "ring-2 ring-brand-500 shadow-lg shadow-brand-500/10" : "card-hover"}`}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl mb-3`}
              >
                {item.emoji}
              </div>
              <h3 className="font-semibold mb-1">{item.label}</h3>
              <p className="text-sm text-surface-400">{item.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Difficulty</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              onClick={() => setDifficulty(d.value)}
              className={`p-4 rounded-xl border text-center transition-all ${difficulty === d.value ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400" : "border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600"}`}
            >
              <p className="font-medium text-sm">{d.label}</p>
              <p className="text-xs text-surface-400 mt-1">{d.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" /> Duration
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => setDuration(d.value)}
              className={`p-4 rounded-xl border text-center transition-all ${duration === d.value ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400" : "border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600"}`}
            >
              <p className="font-medium">{d.label}</p>
              <p className="text-xs text-surface-400 mt-1">{d.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleStart}
        disabled={isStarting || !selectedType}
        className="w-full gradient-btn py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isStarting ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />{" "}
            Preparing your interviewer...
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" /> Start Interview{" "}
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </motion.button>
    </div>
  );
}
