import React from "react";

export default function Notify({ notice, onClose }) {
  if (!notice) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        maxWidth: 420,
        padding: 12,
        borderRadius: 10,
        border: "1px solid #ddd",
        background: "white",
        boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
        zIndex: 9999,
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            {notice.type === "error" ? "Error" : "Success"}
          </div>
          <div style={{ fontSize: 14 }}>{notice.message}</div>
        </div>

        <button onClick={onClose} style={{ border: "1px solid #ddd", borderRadius: 8, padding: "4px 8px" }}>
          ✕
        </button>
      </div>
    </div>
  );
}
