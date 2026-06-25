"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function LeadForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    requirement: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [result, setResult] = useState<{ category?: string; priority?: string } | null>(null);

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
    <div className={styles.page}>

      {/* ── Brand strip ── */}
      <aside className={styles.brandStrip}>
        <span className={styles.brandStamp}>Lead Intelligence</span>

        <div className={styles.brandContent}>
          <h1 className={styles.tagline}>
            Tell us what<br />
            you need —<br />
            <em className={styles.taglineAccent}>we follow up.</em>
          </h1>
          <p className={styles.taglineSub}>
            Every submission is tracked from the moment we reply.
            You'll know when we act on it.
          </p>
        </div>

        {/* Journey preview */}
        <div className={styles.journeyWrap}>
          <div className={styles.journeyPreviewLabel}>how it works</div>
          <div className={styles.journeyNodes}>
            <div className={styles.jStep}>
              <div className={`${styles.jNode} ${styles.jNodeBone}`}></div>
              <span className={styles.jStepLabel}>Submit</span>
            </div>
            <div className={styles.jConn}></div>
            <div className={styles.jStep}>
              <div className={`${styles.jNode} ${styles.jNodeTrace}`}></div>
              <span className={styles.jStepLabel}>Sent</span>
            </div>
            <div className={styles.jConn}></div>
            <div className={styles.jStep}>
              <div className={`${styles.jNode} ${styles.jNodeSignal}`}></div>
              <span className={`${styles.jStepLabel} ${styles.jStepLabelActive}`}>Opened</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Form panel ── */}
      <main className={styles.formPanel}>
        <div className={styles.formInner}>

          {status === "done" ? (
            <div className={styles.successBanner}>
              <div className={styles.successIcon}>✓</div>
              <div className={styles.successBody}>
                <p className={styles.successTitle}>Message received.</p>
                <p className={styles.successDesc}>
                  A confirmation is on its way to your inbox — we'll follow up shortly.
                </p>
                {result?.category && (
                  <p className={styles.successMeta}>
                    Classified as <strong>{result.category}</strong> · Priority{" "}
                    <strong>{result.priority}</strong>
                  </p>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Get in touch</h2>
                <p className={styles.formDesc}>
                  Fill in what you're working on and we'll take it from there.
                </p>
              </div>

              <div className={styles.fields}>
                <Field label="Full Name">
                  <input
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className={styles.input}
                    placeholder="Jane Smith"
                  />
                </Field>

                <Field label="Email Address">
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className={styles.input}
                    placeholder="jane@company.com"
                  />
                </Field>

                <div className={styles.fieldRow}>
                  <Field label="Phone Number">
                    <input
                      required
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className={styles.input}
                      placeholder="+91 98765 43210"
                    />
                  </Field>
                  <Field label="Company" optional>
                    <input
                      value={form.company}
                      onChange={(e) => update("company", e.target.value)}
                      className={styles.input}
                      placeholder="Acme Inc."
                    />
                  </Field>
                </div>

                <Field label="What do you need?">
                  <textarea
                    required
                    rows={4}
                    value={form.requirement}
                    onChange={(e) => update("requirement", e.target.value)}
                    className={`${styles.input} ${styles.textarea}`}
                    placeholder="Describe what you're looking for..."
                  />
                </Field>

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className={styles.submitBtn}
                >
                  {status === "submitting" ? (
                    <span className={styles.spinner} aria-label="Sending…" />
                  ) : (
                    "Send →"
                  )}
                </button>
              </div>

              {status === "error" && (
                <p className={styles.errorMsg}>
                  Something went wrong — please try again.
                </p>
              )}
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Helpers ── */

function Field({
  label,
  children,
  optional,
}: {
  label: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>
        {label}
        {optional && <span className={styles.optionalTag}>(optional)</span>}
      </label>
      {children}
    </div>
  );
}
