import { supabaseAdmin } from "@/lib/supabase";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/* ── Types ── */
// Stored priority values from classifyLead() are capitalized ("High" | "Medium" | "Low").
type Priority = "high" | "medium" | "low";
type CardVariant = "neutral" | "trace" | "signal";

/* ── Dashboard page ── */
export default async function DashboardPage() {
  const { data: leads, error } = await supabaseAdmin
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className={styles.errorPage}>Failed to load dashboard: {error.message}</div>;
  }

  const totalLeads  = leads?.length || 0;
  const emailsSent  = leads?.filter((l) => l.email_sent).length || 0;
  const emailsOpened = leads?.filter((l) => l.opened).length || 0;
  const linksClicked = leads?.filter((l) => l.clicked).length || 0;

  const openRate  = emailsSent > 0 ? Math.round((emailsOpened  / emailsSent) * 100) : 0;
  const clickRate = emailsSent > 0 ? Math.round((linksClicked / emailsSent) * 100) : 0;

  const cards: { label: string; value: number | string; variant: CardVariant }[] = [
    { label: "Total Leads",   value: totalLeads,        variant: "neutral" },
    { label: "Emails Sent",   value: emailsSent,        variant: "trace"   },
    { label: "Emails Opened", value: emailsOpened,      variant: "signal"  },
    { label: "Open Rate",     value: `${openRate}%`,    variant: "signal"  },
    { label: "Links Clicked", value: linksClicked,      variant: "signal"  },
    { label: "Click Rate",    value: `${clickRate}%`,   variant: "signal"  },
  ];

  const variantClass: Record<CardVariant, string> = {
    neutral: styles.statCardNeutral,
    trace:   styles.statCardTrace,
    signal:  styles.statCardSignal,
  };

  const badgeClass: Record<string, string> = {
    high:   styles.badgeHigh,
    medium: styles.badgeMedium,
    low:    styles.badgeLow,
  };

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Lead Overview</h1>
        <p className={styles.pageSubtitle}>
          Track who's opened, clicked, and ready to close.
        </p>
      </div>

      {/* ── Stats ── */}
      <div className={styles.statsGrid}>
        {cards.map((c) => (
          <div key={c.label} className={`${styles.statCard} ${variantClass[c.variant]}`}>
            <div className={styles.statValue}>{c.value}</div>
            <div className={styles.statLabel}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* ── Leads table ── */}
      <div className={styles.tableSection}>
        <div className={styles.tableSectionHeader}>
          <h2 className={styles.tableSectionTitle}>Leads</h2>
          <span className={styles.tableCount}>{totalLeads} total</span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Name</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Category</th>
                <th className={styles.th}>Priority</th>
                <th className={styles.th}>Journey</th>
              </tr>
            </thead>
            <tbody>
              {leads?.map((l) => (
                <tr key={l.id} className={styles.tr}>

                  {/* Name + date */}
                  <td className={styles.td}>
                    <div className={styles.leadName}>{l.name}</div>
                    <div className={styles.leadDate}>
                      {l.created_at
                        ? new Date(l.created_at).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                          })
                        : "—"}
                    </div>
                  </td>

                  {/* Email */}
                  <td className={styles.td}>
                    <span className={styles.leadEmail}>{l.email}</span>
                  </td>

                  {/* Category */}
                  <td className={styles.td}>
                    <span className={styles.category}>{l.category || "—"}</span>
                  </td>

                  {/* Priority badge */}
                  <td className={styles.td}>
                    {l.priority ? (
                      <span className={`${styles.badge} ${badgeClass[(l.priority as string).toLowerCase() as Priority] ?? styles.badgeLow}`}>
                        {l.priority}
                      </span>
                    ) : (
                      <span className={styles.dash}>—</span>
                    )}
                  </td>

                  {/* Journey line */}
                  <td className={styles.td}>
                    <JourneyLine
                      sent={l.email_sent}
                      opened={l.opened}
                      openCount={l.open_count ?? 0}
                      clicked={l.clicked}
                      clickCount={l.click_count ?? 0}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Journey line component ── */
function JourneyLine({
  sent,
  opened,
  openCount,
  clicked,
  clickCount,
}: {
  sent: boolean;
  opened: boolean;
  openCount: number;
  clicked: boolean;
  clickCount: number;
}) {
  const n1 = sent
    ? { bg: "var(--trace)",  glow: "0 0 8px rgba(76,135,200,0.65)",  label: "✓",              lc: "var(--trace)"  }
    : { bg: "rgba(255,255,255,0.1)", glow: "none", label: "—", lc: "var(--ash)" };

  const n2 = opened
    ? { bg: "var(--signal)", glow: "0 0 8px rgba(217,140,82,0.65)", label: String(openCount),  lc: "var(--signal)" }
    : { bg: "rgba(255,255,255,0.1)", glow: "none", label: "—", lc: "var(--ash)" };

  const n3 = clicked
    ? { bg: "var(--signal)", glow: "0 0 6px rgba(217,140,82,0.5)",  label: String(clickCount), lc: "var(--signal)" }
    : { bg: "rgba(255,255,255,0.1)", glow: "none", label: "—", lc: "var(--ash)" };

  const c1bg = sent   ? "rgba(76,135,200,0.35)"  : "rgba(255,255,255,0.07)";
  const c2bg = opened ? "rgba(217,140,82,0.35)"  : "rgba(255,255,255,0.07)";

  return (
    <div className={styles.journeyLine}>
      {/* Node row */}
      <div className={styles.jNodesRow}>
        <div className={styles.jCell}>
          <div className={styles.jNode} style={{ background: n1.bg, boxShadow: n1.glow }}></div>
        </div>
        <div className={styles.jConn} style={{ background: c1bg }}></div>
        <div className={styles.jCell}>
          <div className={styles.jNode} style={{ background: n2.bg, boxShadow: n2.glow }}></div>
        </div>
        <div className={styles.jConn} style={{ background: c2bg }}></div>
        <div className={styles.jCell}>
          <div className={styles.jNode} style={{ background: n3.bg, boxShadow: n3.glow }}></div>
        </div>
      </div>

      {/* Count row */}
      <div className={styles.jCountRow}>
        <span className={styles.jCount} style={{ color: n1.lc }}>{n1.label}</span>
        <span className={styles.jSpacer}></span>
        <span className={styles.jCount} style={{ color: n2.lc }}>{n2.label}</span>
        <span className={styles.jSpacer}></span>
        <span className={styles.jCount} style={{ color: n3.lc }}>{n3.label}</span>
      </div>

      {/* Axis labels */}
      <div className={styles.jAxisRow}>
        <span className={styles.jAxis}>snt</span>
        <span className={styles.jSpacer}></span>
        <span className={styles.jAxis}>opn</span>
        <span className={styles.jSpacer}></span>
        <span className={styles.jAxis}>clk</span>
      </div>
    </div>
  );
}
