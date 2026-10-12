"use client";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { UserCheck } from "lucide-react";

export const TeacherProfileForm = ({ initialData }) => {
  const [data, setData] = useState({
    displayName: initialData.displayName || "",
    headline: initialData.headline || "",
    bio: initialData.bio || "",
    expertise: initialData.expertise || "",
    website: initialData.website || "",
  });
  const [saving, setSaving] = useState(false);

  const onSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await axios.put("/api/teacher/profile", data);
      toast.success("Instructor credentials saved");
    } catch (error) {
      toast.error(error?.response?.data || "Unable to save profile");
    } finally {
      setSaving(false);
    }
  };

  const update = (key) => (event) =>
    setData((current) => ({ ...current, [key]: event.target.value }));

  return (
    <form
      onSubmit={onSave}
      className="space-y-6 border border-ink-200/90 rounded-xl p-8 bg-white shadow-subtle"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-600 mb-1.5 font-medium">
            Academic / Display Name
          </label>
          <input
            className="w-full border border-ink-200 rounded-md px-3 py-2 text-sm bg-white text-ink-900 focus:outline-none focus:border-ink-800"
            value={data.displayName}
            onChange={update("displayName")}
            placeholder="e.g. Dr. Arthur Vance or Prof. Elena Rostova"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-600 mb-1.5 font-medium">
            Headline / Academic Chair
          </label>
          <input
            className="w-full border border-ink-200 rounded-md px-3 py-2 text-sm bg-white text-ink-900 focus:outline-none focus:border-ink-800"
            value={data.headline}
            onChange={update("headline")}
            placeholder="e.g. Principal Systems Architect & Cryptographer"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-ink-600 mb-1.5 font-medium">
          Domains of Expertise (Comma-separated)
        </label>
        <input
          className="w-full border border-ink-200 rounded-md px-3 py-2 text-sm bg-white text-ink-900 focus:outline-none focus:border-ink-800 font-mono text-xs"
          value={data.expertise}
          onChange={update("expertise")}
          placeholder="e.g. Distributed Consensus, Rust, Memory Safety, Formal Verification"
        />
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-ink-600 mb-1.5 font-medium">
          Biographical Treatise & Research Background
        </label>
        <textarea
          className="w-full border border-ink-200 rounded-md px-3 py-2 text-sm bg-white text-ink-900 min-h-[140px] focus:outline-none focus:border-ink-800 font-sans leading-relaxed"
          value={data.bio}
          onChange={update("bio")}
          placeholder="Detail your professional experience, teaching philosophy, publications, and background..."
        />
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-ink-600 mb-1.5 font-medium">
          Personal Laboratory / Website URL
        </label>
        <input
          className="w-full border border-ink-200 rounded-md px-3 py-2 text-sm bg-white text-ink-900 focus:outline-none focus:border-ink-800 font-mono text-xs"
          value={data.website}
          onChange={update("website")}
          placeholder="https://scholar.example.edu/~lab"
        />
      </div>

      <div className="pt-2 border-t border-ink-100 flex items-center justify-between">
        <span className="text-[11px] font-mono text-ink-400">
          Changes will reflect across all public course landing pages immediately.
        </span>
        <Button
          size="sm"
          disabled={saving}
          className="bg-ink-900 text-parchment-50 hover:bg-ink-800"
        >
          <UserCheck className="h-3.5 w-3.5 mr-1.5" />
          {saving ? "Archiving..." : "Save Faculty Credentials"}
        </Button>
      </div>
    </form>
  );
};
