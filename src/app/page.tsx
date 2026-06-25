"use client";

import { useState } from "react";

export default function LeadForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    requirement: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [result, setResult] = useState<any>(null);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setResult(data);
      setStatus("done");
      setForm({ name: "", email: "", phone: "", company: "", requirement: "" });
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "60px auto", padding: 24, background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Get in touch</h1>
      <p style={{ color: "#666", marginTop: 0, marginBottom: 20 }}>
        Tell us what you need — we'll follow up by email.
      </p>

      {status === "done" ? (
        <div style={{ padding: 16, background: "#e8f7ee", borderRadius: 8, color: "#1a7d3d" }}>
          Thanks! Your message was received and a confirmation email is on its way.
          {result?.category && (
            <div style={{ marginTop: 8, fontSize: 13, color: "#444" }}>
              (Internally classified as <b>{result.category}</b>, priority <b>{result.priority}</b>)
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Field label="Full Name">
            <input required value={form.name} onChange={(e) => update("name", e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Email Address">
            <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Phone Number">
            <input required value={form.phone} onChange={(e) => update("phone", e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Company Name (optional)">
            <input value={form.company} onChange={(e) => update("company", e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Requirement / Message">
            <textarea required rows={4} value={form.requirement} onChange={(e) => update("requirement", e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
          </Field>

          <button
            type="submit"
            disabled={status === "submitting"}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 8,
              border: "none",
              background: "#3b3bff",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              marginTop: 8,
            }}
          >
            {status === "submitting" ? "Sending..." : "Submit"}
          </button>

          {status === "error" && (
            <p style={{ color: "#c0392b", marginTop: 10 }}>Something went wrong. Please try again.</p>
          )}
        </form>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, color: "#444", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid #ddd",
  fontSize: 14,
  boxSizing: "border-box",
};
