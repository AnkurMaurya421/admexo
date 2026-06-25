import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic"; // always fetch fresh stats

export default async function DashboardPage() {
  const { data: leads, error } = await supabaseAdmin
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div style={{ padding: 40 }}>Failed to load dashboard: {error.message}</div>;
  }

  const totalLeads = leads?.length || 0;
  const emailsSent = leads?.filter((l) => l.email_sent).length || 0;
  const emailsOpened = leads?.filter((l) => l.opened).length || 0;
  const linksClicked = leads?.filter((l) => l.clicked).length || 0;

  const openRate = emailsSent > 0 ? Math.round((emailsOpened / emailsSent) * 100) : 0;
  const clickRate = emailsSent > 0 ? Math.round((linksClicked / emailsSent) * 100) : 0;

  const cards = [
    { label: "Total Leads", value: totalLeads },
    { label: "Emails Sent", value: emailsSent },
    { label: "Emails Opened", value: emailsOpened },
    { label: "Open Rate", value: `${openRate}%` },
    { label: "Links Clicked", value: linksClicked },
    { label: "Click Rate", value: `${clickRate}%` },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>Analytics Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: "#fff", borderRadius: 12, padding: 20, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{c.value}</div>
            <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 16, marginBottom: 12 }}>Leads</h2>
      <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#fafafa", textAlign: "left" }}>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Category</Th>
              <Th>Priority</Th>
              <Th>Sent</Th>
              <Th>Opened</Th>
              <Th>Clicked</Th>
            </tr>
          </thead>
          <tbody>
            {leads?.map((l) => (
              <tr key={l.id} style={{ borderTop: "1px solid #eee" }}>
                <Td>{l.name}</Td>
                <Td>{l.email}</Td>
                <Td>{l.category}</Td>
                <Td>{l.priority}</Td>
                <Td>{l.email_sent ? "✅" : "—"}</Td>
                <Td>{l.opened ? `✅ (${l.open_count})` : "—"}</Td>
                <Td>{l.clicked ? `✅ (${l.click_count})` : "—"}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ padding: "10px 14px" }}>{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: "10px 14px" }}>{children}</td>;
}
