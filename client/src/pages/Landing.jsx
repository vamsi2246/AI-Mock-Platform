import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mic,
  Brain,
  BarChart3,
  Shield,
  ArrowRight,
  ChevronDown,
  Sun,
  Moon,
  MessageSquare,
  Target,
  Zap,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-sm font-medium mb-6 border border-brand-500/20">
            <Zap className="w-4 h-4" />
            AI-Powered Interview Practice
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6"
        >
          Practice with an AI that{" "}
          <span className="gradient-text">feels like a real interviewer</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="text-lg sm:text-xl text-surface-500 dark:text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          No scripts. No fixed questions. Our AI listens to your answers,
          challenges weak spots, probes deeper on interesting points, and adapts
          difficulty in real-time — just like a senior interviewer would.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/signup"
            className="gradient-btn px-8 py-4 text-lg inline-flex items-center justify-center gap-2"
          >
            Start Practicing Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#how-it-works"
            className="px-8 py-4 text-lg font-semibold rounded-xl border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-all inline-flex items-center justify-center gap-2"
          >
            See How It Works
            <ChevronDown className="w-5 h-5" />
          </a>
        </motion.div>

        {/* Voice wave animation */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="mt-16 flex items-center justify-center gap-1"
        >
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="wave-bar w-1.5"
              style={{ animationDelay: `${i * 0.1}s`, height: "8px" }}
            />
          ))}
          <span className="ml-4 text-sm text-surface-400">
            AI is listening...
          </span>
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: Mic,
      title: "Natural Voice Conversations",
      description:
        "Speak naturally — the AI listens, understands, and responds like a real person. No chat boxes.",
    },
    {
      icon: Brain,
      title: "Adaptive Intelligence",
      description:
        "The AI adjusts difficulty based on your answers. Strong responses get harder follow-ups.",
    },
    {
      icon: MessageSquare,
      title: "Dynamic Follow-ups",
      description:
        "Every question comes from your conversation context. No predefined question lists.",
    },
    {
      icon: Target,
      title: "Targeted Feedback",
      description:
        "Get detailed scores across communication, technical depth, confidence, and more.",
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description:
        "Track improvement over time with analytics, score progression, and skill insights.",
    },
    {
      icon: Shield,
      title: "Multiple Interview Types",
      description:
        "Practice behavioral, technical, system design, and HR interviews with specialized AI personas.",
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Why candidates love InterviewAI
          </h2>
          <p className="text-surface-500 dark:text-surface-400 text-lg max-w-2xl mx-auto">
            Every feature is designed to make your interview practice feel
            authentic and actionable.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i + 1}
              className="glass-card p-6 card-hover"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-brand-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-surface-500 dark:text-surface-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Choose Interview Type",
      description:
        "Select behavioral, technical, system design, or HR. Pick your difficulty level.",
    },
    {
      step: "02",
      title: "Talk to Your AI Interviewer",
      description:
        "Have a natural voice conversation. The AI asks one question at a time, listens, and follows up intelligently.",
    },
    {
      step: "03",
      title: "Get Detailed Feedback",
      description:
        "Receive comprehensive scores, strengths, weaknesses, and a hiring recommendation instantly.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 px-6 bg-surface-50/50 dark:bg-surface-900/50"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How it works</h2>
          <p className="text-surface-500 dark:text-surface-400 text-lg">
            Three simple steps to better interviews
          </p>
        </motion.div>

        <div className="space-y-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i + 1}
              className="flex items-start gap-6 glass-card p-6"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {step.step}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-surface-500 dark:text-surface-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InterviewTypes() {
  const types = [
    {
      type: "Behavioral",
      emoji: "🎯",
      description:
        "STAR method, leadership, conflict resolution, teamwork stories",
      color: "from-blue-500 to-cyan-500",
    },
    {
      type: "Technical",
      emoji: "💻",
      description:
        "JavaScript, React, Node.js, databases, APIs, system design basics",
      color: "from-purple-500 to-pink-500",
    },
    {
      type: "System Design",
      emoji: "🏗️",
      description:
        "Architecture, scalability, caching, load balancing, tradeoffs",
      color: "from-orange-500 to-red-500",
    },
    {
      type: "HR / Culture Fit",
      emoji: "🤝",
      description:
        "Motivation, career goals, strengths, teamwork, communication",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Interview Types
          </h2>
          <p className="text-surface-500 dark:text-surface-400 text-lg">
            Each type uses a different AI persona with specialized interviewing
            strategy
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {types.map((type, i) => (
            <motion.div
              key={type.type}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i + 1}
              className="glass-card p-6 card-hover"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center text-2xl mb-4`}
              >
                {type.emoji}
              </div>
              <h3 className="text-xl font-semibold mb-2">{type.type}</h3>
              <p className="text-surface-500 dark:text-surface-400 text-sm">
                {type.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "How realistic is the AI interviewer?",
      a: "Our AI generates every question dynamically based on your conversation. It challenges weak answers, digs deeper into interesting points, and adapts difficulty — just like a senior interviewer at a top tech company.",
    },
    {
      q: "Is this just a chatbot with preset questions?",
      a: "Absolutely not. There are zero predefined questions. Every response from the AI is generated from the full conversation context. You'll be surprised by how relevant and unexpected the follow-up questions are.",
    },
    {
      q: "What interview types are supported?",
      a: "We support Behavioral, Technical (full-stack focused), System Design, and HR/Culture Fit interviews. Each uses a different AI persona with specialized strategies.",
    },
    {
      q: "How does the feedback work?",
      a: "After each interview, our AI analyzes the full transcript and generates detailed scores across communication, technical knowledge, confidence, problem-solving, and leadership — plus strengths, weaknesses, and a hiring recommendation.",
    },
    {
      q: "Do I need any special hardware?",
      a: "Just a microphone and a modern web browser. The interview is entirely voice-based — no typing required.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-24 px-6 bg-surface-50/50 dark:bg-surface-900/50">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Frequently asked questions
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i + 1}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                />
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: openIndex === i ? "auto" : 0,
                  opacity: openIndex === i ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="px-5 pb-5 text-surface-500 dark:text-surface-400 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-surface-200 dark:border-surface-800 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-bold text-xl gradient-text">InterviewAI</span>
        <p className="text-sm text-surface-400">
          © {new Date().getFullYear()} InterviewAI. Built for candidates who
          want to be ready.
        </p>
      </div>
    </footer>
  );
}

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-surface-200/50 dark:border-surface-800/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <span className="font-bold text-xl gradient-text">InterviewAI</span>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
            >
              Log in
            </Link>
            <Link to="/signup" className="gradient-btn px-5 py-2 text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <Hero />
      <Features />
      <HowItWorks />
      <InterviewTypes />
      <FAQ />
      <Footer />
    </div>
  );
}
