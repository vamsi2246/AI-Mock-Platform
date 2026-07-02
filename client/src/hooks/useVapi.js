import { useState, useCallback, useRef, useEffect } from "react";

export function useVapi({
  publicKey,
  onMessage,
  onStatusChange,
  onCallEnd,
  onError,
}) {
  const [status, setStatus] = useState("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const vapiRef = useRef(null);
  const callIdRef = useRef(null);

  const updateStatus = useCallback(
    (newStatus) => {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    },
    [onStatusChange],
  );

  const initVapi = useCallback(async () => {
    if (vapiRef.current) return vapiRef.current;

    try {
      const VapiModule = await import("@vapi-ai/web");
      const VapiClass = VapiModule.default || VapiModule;
      const vapi = new VapiClass(publicKey);
      vapiRef.current = vapi;

      vapi.on("call-start", () => {
        updateStatus("connected");
      });

      vapi.on("call-end", () => {
        updateStatus("ended");
        onCallEnd?.();
      });

      vapi.on("speech-start", () => {
        updateStatus("speaking");
        setIsThinking(false);
      });

      vapi.on("speech-end", () => {
        updateStatus("listening");
      });

      vapi.on("message", (message) => {
        if (
          message.type === "transcript" &&
          message.transcriptType === "final"
        ) {
          const msg = {
            role: message.role === "assistant" ? "assistant" : "user",
            content: message.transcript,
            timestamp: new Date().toISOString(),
          };
          setTranscript((prev) => [...prev, msg]);
          onMessage?.(msg);
          
          if (msg.role === "user") {
            setIsThinking(true);
          }
        }
      });

      vapi.on("volume-level", (level) => {
        setVolumeLevel(level);
      });

      vapi.on("error", (error) => {
        console.error("Vapi error:", error);
        updateStatus("error");
        onError?.(error);
      });

      return vapi;
    } catch (error) {
      console.error("Failed to initialize Vapi:", error);
      updateStatus("error");
      onError?.(error);
      return null;
    }
  }, [publicKey, updateStatus, onMessage, onCallEnd, onError]);

  const startCall = useCallback(
    async (assistantConfig) => {
      updateStatus("connecting");
      setTranscript([]);

      const vapi = await initVapi();
      if (!vapi) return;

      try {
        const call = await vapi.start(assistantConfig);
        callIdRef.current = call?.id || null;
      } catch (error) {
        console.error("Failed to start Vapi call:", error);
        updateStatus("error");
        onError?.(error);
      }
    },
    [initVapi, updateStatus, onError],
  );

  const endCall = useCallback(async () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
      updateStatus("ended");
    }
  }, [updateStatus]);

  const toggleMute = useCallback(() => {
    if (vapiRef.current) {
      const newMuted = !isMuted;
      vapiRef.current.setMuted(newMuted);
      setIsMuted(newMuted);
    }
  }, [isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
        vapiRef.current = null;
      }
    };
  }, []);

  return {
    status,
    isMuted,
    transcript,
    volumeLevel,
    callId: callIdRef.current,
    isThinking,
    startCall,
    endCall,
    toggleMute,
  };
}
