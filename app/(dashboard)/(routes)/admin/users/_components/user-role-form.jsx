"use client";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export const UserRoleForm = ({ userId, initialRole }) => {
  const [role, setRole] = useState(initialRole);
  const [isSaving, setIsSaving] = useState(false);

  const saveRole = async (nextRole) => {
    const previousRole = role;
    setRole(nextRole);
    setIsSaving(true);
    try {
      await axios.patch(`/api/admin/users/${encodeURIComponent(userId)}/role`, {
        role: nextRole,
      });
      toast.success("Scholar authority updated");
    } catch (error) {
      setRole(previousRole);
      toast.error(error?.response?.data || "Unable to update role");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <select
      value={role}
      disabled={isSaving}
      onChange={(event) => saveRole(event.target.value)}
      className="border border-ink-200 rounded-md px-3 py-1.5 text-xs font-mono bg-white text-ink-900 focus:outline-none focus:border-ink-800 cursor-pointer disabled:opacity-50"
    >
      <option value="STUDENT">STUDENT (Standard Scholar)</option>
      <option value="TEACHER">TEACHER (Faculty Author)</option>
      <option value="ADMIN">ADMIN (Institutional Governor)</option>
    </select>
  );
};
