import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { interviewService } from "../services/interview.service";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

const TYPE_LABELS = {
  BEHAVIORAL: "Behavioral",
  TECHNICAL: "Technical",
  SYSTEM_DESIGN: "System Design",
  HR: "HR",
};

const RECOMMENDATION_COLORS = {
  "Strong Hire": "bg-green-500",
  Hire: "bg-green-400",
  "Lean Hire": "bg-yellow-500",
  "Lean No Hire": "bg-orange-500",
  "No Hire": "bg-red-500",
};

function ScoreRing({ score, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color =
    score >= 80
      ? "#10b981"
      : score >= 60
        ? "#f59e0b"
        : score >= 40
          ? "#f97316"
          : "#ef4444";

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-surface-200 dark:text-surface-700"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{score}</span>
        <span className="text-xs text-surface-400">/100</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, score }) {
  const color =
    score >= 80
      ? "bg-green-500"
      : score >= 60
        ? "bg-yellow-500"
        : score >= 40
          ? "bg-orange-500"
          : "bg-red-500";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-surface-600 dark:text-surface-300">{label}</span>
        <span className="font-semibold">{score}</span>
      </div>
      <div className="h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
}

export default function Report() {
  const { id } = useParams();
  const [showTranscript, setShowTranscript] = useState(false);

  const {
    data: report,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["report", id],
    queryFn: () => interviewService.getReport(id),
    retry: false,
  });

  // If report doesn't exist yet, try generating it
  const { data: generated, isLoading: isGenerating } = useQuery({
    queryKey: ["generate-report", id],
    queryFn: () => interviewService.generateReport(id),
    enabled: !!error,
    retry: false,
  });

  const reportData = report || generated;

  if (isLoading || isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
        <p className="text-surface-500">Generating your feedback report...</p>
        <p className="text-sm text-surface-400">
          Our AI is analyzing your interview transcript
        </p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-surface-500">Report not available yet.</p>
        <Link
          to="/dashboard"
          className="gradient-btn px-5 py-2.5 text-sm inline-block mt-4"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const radarData = [
    { subject: "Communication", value: reportData.communicationScore },
    { subject: "Technical", value: reportData.technicalScore },
    { subject: "Confidence", value: reportData.confidenceScore },
    { subject: "Problem Solving", value: reportData.problemSolvingScore },
    { subject: "Leadership", value: reportData.leadershipScore },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/dashboard"
            className="text-sm text-surface-400 hover:text-surface-600 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Interview Report</h1>
          <p className="text-surface-400 mt-1">
            {TYPE_LABELS[reportData.session?.type || ""] || ""} ·{" "}
            {reportData.session?.difficulty?.toLowerCase()} ·{" "}
            {reportData.session?.startedAt
              ? new Date(reportData.session.startedAt).toLocaleDateString()
              : ""}
          </p>
        </div>
        {reportData.hiringRecommendation && (
          <span
            className={`px-4 py-2 rounded-xl text-white text-sm font-semibold ${RECOMMENDATION_COLORS[reportData.hiringRecommendation] || "bg-surface-500"}`}
          >
            {reportData.hiringRecommendation}
          </span>
        )}
      </div>

      {/* Overall score + Radar */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 flex flex-col items-center justify-center"
        >
          <Award className="w-8 h-8 text-brand-500 mb-4" />
          <h3 className="text-sm text-surface-400 mb-4 uppercase tracking-wider">
            Overall Score
          </h3>
          <ScoreRing
            score={reportData.overallScore}
            size={160}
            strokeWidth={10}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h3 className="font-semibold mb-4">Skill Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={80}>
              <PolarGrid strokeDasharray="3 3" className="opacity-30" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 11 }}
                className="text-surface-500"
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                dataKey="value"
                stroke="#6c63ff"
                fill="#6c63ff"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      {/* Executive Summary */}
      {reportData.executiveSummary && reportData.executiveSummary !== "N/A" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-8 bg-brand-500/5 border border-brand-500/20"
        >
          <h3 className="font-semibold mb-3 text-lg">Executive Summary</h3>
          <p className="text-surface-700 dark:text-surface-300 leading-relaxed text-base">
            {reportData.executiveSummary}
          </p>
        </motion.div>
      )}

      {/* Individual scores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6 space-y-4"
      >
        <h3 className="font-semibold">Category Scores</h3>
        <ScoreBar label="Communication" score={reportData.communicationScore} />
        <ScoreBar
          label="Technical Knowledge"
          score={reportData.technicalScore}
        />
        <ScoreBar label="Confidence" score={reportData.confidenceScore} />
        <ScoreBar
          label="Problem Solving"
          score={reportData.problemSolvingScore}
        />
        <ScoreBar label="Leadership" score={reportData.leadershipScore} />
      </motion.div>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-green-600 dark:text-green-400">
            <TrendingUp className="w-5 h-5" /> Strengths
          </h3>
          <ul className="space-y-3">
            {reportData.strengths?.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center text-xs">
                  ✓
                </span>
                <span className="text-surface-600 dark:text-surface-300">
                  {s}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <TrendingDown className="w-5 h-5" /> Areas for Improvement
          </h3>
          <ul className="space-y-3">
            {reportData.weaknesses?.map((w, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-xs">
                  !
                </span>
                <span className="text-surface-600 dark:text-surface-300">
                  {w}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
        
        {reportData.blindSpots && JSON.parse(reportData.blindSpots).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="glass-card p-6 md:col-span-2 bg-red-500/5 border border-red-500/10"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-red-600 dark:text-red-400">
              Blind Spots
            </h3>
            <ul className="space-y-3">
              {JSON.parse(reportData.blindSpots).map((b, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center text-xs">
                    ?
                  </span>
                  <span className="text-surface-600 dark:text-surface-300">{b}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6"
      >
        <h3 className="font-semibold mb-3">Summary</h3>
        <p className="text-surface-600 dark:text-surface-300 leading-relaxed">
          {reportData.summary}
        </p>
      </motion.div>

      {/* Improvements */}
      {reportData.improvements?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h3 className="font-semibold mb-4">Actionable Improvements</h3>
          <div className="space-y-3">
            {reportData.improvements.map((imp, i) => (
              <div
                key={i}
                className="flex gap-3 p-3 rounded-xl bg-brand-50 dark:bg-brand-900/10 text-sm"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-surface-700 dark:text-surface-300">
                  {imp}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Preparation Roadmap */}
      {reportData.preparationRoadmap && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="glass-card p-6 border border-brand-500/20"
        >
          <h3 className="font-semibold mb-3 text-brand-600 dark:text-brand-400">Preparation Roadmap</h3>
          <p className="text-surface-700 dark:text-surface-300 leading-relaxed text-sm whitespace-pre-wrap">
            {reportData.preparationRoadmap}
          </p>
        </motion.div>
      )}

      {/* Interview Timeline */}
      {reportData.session?.messages &&
        reportData.session.messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card overflow-hidden"
          >
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full flex items-center justify-between p-6"
            >
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Interview Timeline & Reasoning
              </h3>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${showTranscript ? "rotate-180" : ""}`}
              />
            </button>
            {showTranscript && (
              <div className="px-6 pb-6 space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                {reportData.session.messages.map((msg, i) => {
                  if (msg.role === "METADATA") {
                    return (
                      <div key={i} className="pl-12">
                        <div className="bg-surface-100 dark:bg-surface-800/50 rounded-lg p-3 border-l-2 border-brand-500 text-xs">
                          <span className="text-brand-600 dark:text-brand-400 font-semibold mb-1 block">AI Reasoning</span>
                          <span className="text-surface-600 dark:text-surface-300 italic">{msg.content}</span>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div
                      key={i}
                      className={`flex gap-3 ${msg.role === "USER" ? "justify-end" : ""}`}
                    >
                      <div
                        className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                          msg.role === "ASSISTANT"
                            ? "bg-surface-100 dark:bg-surface-800"
                            : "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                        }`}
                      >
                        <p className="text-xs font-medium mb-1 opacity-60">
                          {msg.role === "ASSISTANT" ? "🎤 Interviewer" : "👤 You"}
                        </p>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

      {/* Actions */}
      <div className="flex gap-4 justify-center pb-8">
        <Link
          to="/dashboard"
          className="px-6 py-3 rounded-xl border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 font-medium text-sm transition-all"
        >
          Back to Dashboard
        </Link>
        <Link to="/interview/setup" className="gradient-btn px-6 py-3 text-sm">
          Practice Again
        </Link>
      </div>
    </div>
  );
}
