import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "../services/profile.service";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, User, Briefcase, Code, Linkedin, Github } from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: profileService.get,
  });

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    currentRole: "",
    targetRole: "",
    yearsExperience: 0,
    skills: [],
    linkedinUrl: "",
    githubUrl: "",
    preferredDifficulty: "INTERMEDIATE",
  });
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        currentRole: profile.currentRole || "",
        targetRole: profile.targetRole || "",
        yearsExperience: profile.yearsExperience || 0,
        skills: profile.skills || [],
        linkedinUrl: profile.linkedinUrl || "",
        githubUrl: profile.githubUrl || "",
        preferredDifficulty: profile.preferredDifficulty || "INTERMEDIATE",
      });
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: (data) => profileService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !form.skills.includes(skill)) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-2xl bg-surface-100 dark:bg-surface-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">
          Your information helps the AI tailor interview questions to your
          experience
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(form);
        }}
        className="space-y-6"
      >
        {/* Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-4"
        >
          <h2 className="font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-brand-500" /> Personal Info
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                First Name
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, firstName: e.target.value }))
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, lastName: e.target.value }))
                }
                className="input-field"
              />
            </div>
          </div>
        </motion.div>

        {/* Role & Experience */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 space-y-4"
        >
          <h2 className="font-semibold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand-500" /> Career
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Current Role
              </label>
              <input
                type="text"
                value={form.currentRole}
                onChange={(e) =>
                  setForm((p) => ({ ...p, currentRole: e.target.value }))
                }
                placeholder="e.g. Frontend Developer"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Target Role
              </label>
              <input
                type="text"
                value={form.targetRole}
                onChange={(e) =>
                  setForm((p) => ({ ...p, targetRole: e.target.value }))
                }
                placeholder="e.g. Senior Software Engineer"
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Years of Experience
            </label>
            <input
              type="number"
              min={0}
              max={50}
              value={form.yearsExperience}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  yearsExperience: parseInt(e.target.value) || 0,
                }))
              }
              className="input-field w-32"
            />
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 space-y-4"
        >
          <h2 className="font-semibold flex items-center gap-2">
            <Code className="w-5 h-5 text-brand-500" /> Skills
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addSkill())
              }
              placeholder="Add a skill..."
              className="input-field flex-1"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-all"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="hover:text-red-500 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </motion.div>

        {/* Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 space-y-4"
        >
          <h2 className="font-semibold">Links</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Linkedin className="w-4 h-4" /> LinkedIn
              </label>
              <input
                type="url"
                value={form.linkedinUrl}
                onChange={(e) =>
                  setForm((p) => ({ ...p, linkedinUrl: e.target.value }))
                }
                placeholder="https://linkedin.com/in/..."
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Github className="w-4 h-4" /> GitHub
              </label>
              <input
                type="url"
                value={form.githubUrl}
                onChange={(e) =>
                  setForm((p) => ({ ...p, githubUrl: e.target.value }))
                }
                placeholder="https://github.com/..."
                className="input-field"
              />
            </div>
          </div>
        </motion.div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="gradient-btn px-6 py-3 flex items-center gap-2 disabled:opacity-50"
        >
          {mutation.isPending ? (
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Profile
        </button>
      </form>
    </div>
  );
}
