"use client";

import { useState } from "react";

export default function DeleteAccountModal({ userId, onClose }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    console.log("🔥 CLICKED");
    console.log("USER ID:", userId);

    setLoading(true);

    try {
      const res = await fetch("/api/delete-account", {
        method: "POST", // 👈 IMPORTANT (matches API route)
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }), // 👈 must exist
      });

      const data = await res.json();
      console.log("API RESPONSE:", data);

      // logout + redirect
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Delete Account</h2>

      <button onClick={onClose}>Cancel</button>

      <button onClick={handleDelete} disabled={loading}>
        {loading ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}