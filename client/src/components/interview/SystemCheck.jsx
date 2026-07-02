import { useState, useEffect } from "react";
import { Mic, Volume2, Wifi, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function SystemCheck({ onPassed, persona }) {
  const [checks, setChecks] = useState({
    mic: { status: "idle", label: "Microphone Access" },
    speaker: { status: "idle", label: "Audio Output" },
    network: { status: "idle", label: "Network Connection" },
  });
  
  const [allPassed, setAllPassed] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const runChecks = async () => {
      // 1. Check Mic
      setChecks(c => ({ ...c, mic: { ...c.mic, status: "loading" } }));
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        if (!mounted) return;
        setChecks(c => ({ ...c, mic: { ...c.mic, status: "success" } }));
      } catch (err) {
        if (!mounted) return;
        setChecks(c => ({ ...c, mic: { ...c.mic, status: "error" } }));
        return;
      }

      await new Promise(r => setTimeout(r, 600));

      // 2. Check Speaker (Simulated, as browser doesn't have a direct API without playing sound)
      setChecks(c => ({ ...c, speaker: { ...c.speaker, status: "loading" } }));
      await new Promise(r => setTimeout(r, 600));
      if (!mounted) return;
      setChecks(c => ({ ...c, speaker: { ...c.speaker, status: "success" } }));

      // 3. Check Network (Simulated ping check)
      setChecks(c => ({ ...c, network: { ...c.network, status: "loading" } }));
      await new Promise(r => setTimeout(r, 800));
      if (!mounted) return;
      setChecks(c => ({ ...c, network: { ...c.network, status: "success" } }));
      
      setAllPassed(true);
    };

    runChecks();
    return () => { mounted = false; };
  }, []);

  const StatusIcon = ({ status }) => {
    if (status === "loading") return <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />;
    if (status === "success") return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (status === "error") return <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500" />;
    return <div className="w-5 h-5 rounded-full border-2 border-surface-700" />;
  };

  return (
    <div className="fixed inset-0 bg-surface-950 flex flex-col items-center justify-center p-6 z-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface-900 border border-surface-800 p-8 rounded-2xl shadow-xl"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-500/20">
            <Mic className="w-8 h-8 text-brand-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">System Check</h2>
          <p className="text-surface-400">Let's make sure everything is working before you meet your interviewer.</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between p-4 bg-surface-950 rounded-xl border border-surface-800">
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-surface-400" />
              <span className="text-surface-200">Microphone</span>
            </div>
            <StatusIcon status={checks.mic.status} />
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-950 rounded-xl border border-surface-800">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-surface-400" />
              <span className="text-surface-200">Speakers</span>
            </div>
            <StatusIcon status={checks.speaker.status} />
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-950 rounded-xl border border-surface-800">
            <div className="flex items-center gap-3">
              <Wifi className="w-5 h-5 text-surface-400" />
              <span className="text-surface-200">Connection</span>
            </div>
            <StatusIcon status={checks.network.status} />
          </div>
        </div>

        {persona && (
          <div className="mb-8 p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl text-center">
            <p className="text-sm text-surface-300 mb-1">Your Interviewer</p>
            <p className="font-medium text-brand-300">{persona}</p>
          </div>
        )}

        <button
          onClick={onPassed}
          disabled={!allPassed}
          className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-600"
        >
          {allPassed ? "Join Interview" : "Checking Systems..."}
          {allPassed && <ArrowRight className="w-4 h-4" />}
        </button>
      </motion.div>
    </div>
  );
}
