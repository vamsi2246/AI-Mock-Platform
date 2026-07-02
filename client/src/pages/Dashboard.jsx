import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";
import { interviewService } from "../services/interview.service";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  Flame,
  Target,
  Trophy,
  Mic,
  Trash2,
  FileText,
  Search,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const TYPE_COLORS = {
  BEHAVIORAL: "#6c63ff",
  TECHNICAL: "#a855f7",
  SYSTEM_DESIGN: "#f97316",
  HR: "#10b981",
};

const TYPE_LABELS = {
  BEHAVIORAL: "Behavioral",
  TECHNICAL: "Technical",
  SYSTEM_DESIGN: "System Design",
  HR: "HR",
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardService.get,
  });

  const { data: history } = useQuery({
    queryKey: ["history", search],
    queryFn: () => interviewService.getHistory(1, 20, search || undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: interviewService.deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
      toast.success("Session deleted");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-surface-100 dark:bg-surface-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const stats = dashboard?.stats;
  const statCards = [
    {
      label: "Total Interviews",
      value: stats?.totalInterviews ?? 0,
      icon: BarChart3,
      color: "text-brand-500",
    },
    {
      label: "Completed",
      value: stats?.completedInterviews ?? 0,
      icon: Trophy,
      color: "text-green-500",
    },
    {
      label: "Average Score",
      value: stats?.averageScore ?? 0,
      icon: Target,
      color: "text-purple-500",
      suffix: "/100",
    },
    {
      label: "Streak",
      value: stats?.streak ?? 0,
      icon: Flame,
      color: "text-orange-500",
      suffix: " days",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.firstName || "there"} 👋
        </h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">
          Here's your interview practice overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold">
              {stat.value}
              {stat.suffix || ""}
            </p>
            <p className="text-sm text-surface-400 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Link
          to="/interview/setup"
          className="gradient-btn px-6 py-3 inline-flex items-center gap-2 text-sm"
        >
          <Mic className="w-4 h-4" />
          Start New Interview
        </Link>
      </motion.div>

      {/* Charts */}
      {dashboard?.scoreProgression && dashboard.scoreProgression.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 glass-card p-6">
            <h3 className="font-semibold mb-4">Score Progression</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dashboard.scoreProgression}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  className="text-surface-400"
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="overall"
                  stroke="#6c63ff"
                  strokeWidth={2}
                  dot={{ fill: "#6c63ff", r: 4 }}
                  name="Overall"
                />
                <Line
                  type="monotone"
                  dataKey="communication"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="Communication"
                />
                <Line
                  type="monotone"
                  dataKey="technical"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                  name="Technical"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {dashboard.typeDistribution.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Interview Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={dashboard.typeDistribution}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={4}
                  >
                    {dashboard.typeDistribution.map((entry) => (
                      <Cell
                        key={entry.type}
                        fill={TYPE_COLORS[entry.type] || "#6c63ff"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {dashboard.typeDistribution.map((entry) => (
                  <div
                    key={entry.type}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: TYPE_COLORS[entry.type] }}
                    />
                    {TYPE_LABELS[entry.type] || entry.type}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Recent sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg">Interview History</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by type..."
              className="input-field !py-2 !pl-9 !text-sm w-48"
            />
          </div>
        </div>

        {history?.sessions && history.sessions.length > 0 ? (
          <div className="space-y-3">
            {history.sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: `${TYPE_COLORS[session.type]}20` }}
                  >
                    {session.type === "BEHAVIORAL"
                      ? "🎯"
                      : session.type === "TECHNICAL"
                        ? "💻"
                        : session.type === "SYSTEM_DESIGN"
                          ? "🏗️"
                          : "🤝"}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {TYPE_LABELS[session.type]} Interview
                    </p>
                    <p className="text-xs text-surface-400">
                      {new Date(session.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      · {session.difficulty.toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {session.score !== null && session.score !== undefined && (
                    <span
                      className={`text-sm font-semibold ${session.score >= 70 ? "text-green-500" : session.score >= 50 ? "text-yellow-500" : "text-red-500"}`}
                    >
                      {session.score}/100
                    </span>
                  )}
                  {session.status === "COMPLETED" && (
                    <button
                      onClick={() =>
                        navigate(`/interview/${session.id}/report`)
                      }
                      className="p-2 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 text-brand-500"
                      title="View Report"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteMutation.mutate(session.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Mic className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
            <p className="text-surface-500 font-medium">No interviews yet</p>
            <p className="text-surface-400 text-sm mt-1">
              Start your first practice session
            </p>
            <Link
              to="/interview/setup"
              className="gradient-btn px-5 py-2.5 text-sm inline-flex items-center gap-2 mt-4"
            >
              <Mic className="w-4 h-4" />
              Start Interview
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
