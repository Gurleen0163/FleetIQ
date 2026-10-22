import { useMemo, useState } from "react";
import { Bot, Send, Sparkles, AlertTriangle, Truck, Wrench, Route, CheckCircle2 } from "lucide-react";

export default function AIFleetAssistantPage({ vehicles = [], trips = [], maintenance = [] }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I’m FleetIQ Assistant. Ask me about fleet health, trips, vehicles, or maintenance." },
  ]);

  const stats = useMemo(() => ({
    vehicles: vehicles.length,
    active: vehicles.filter(v => String(v.status).toUpperCase() === "ACTIVE").length,
    trips: trips.length,
    openMaintenance: maintenance.filter(m => ["OVERDUE", "SCHEDULED", "IN_PROGRESS"].includes(String(m.status).toUpperCase())).length,
    overdue: maintenance.filter(m => String(m.status).toUpperCase() === "OVERDUE").length,
  }), [vehicles, trips, maintenance]);

  function answer(input) {
    const q = input.toLowerCase();
    if (q.includes("vehicle") && (q.includes("total") || q.includes("how many"))) return `Your fleet currently contains ${stats.vehicles} vehicles, and ${stats.active} are marked ACTIVE.`;
    if (q.includes("maintenance") || q.includes("service")) return `There are ${stats.openMaintenance} open maintenance actions, including ${stats.overdue} overdue record(s). Review the Maintenance and Fleet Health pages for details.`;
    if (q.includes("trip")) return `Your database currently contains ${stats.trips} trip record(s). Use the Trips page to review trip status and routes.`;
    if (q.includes("risk") || q.includes("attention") || q.includes("health")) return stats.overdue ? `I detected ${stats.overdue} overdue maintenance record(s). These should be reviewed first because overdue service receives the highest health-score penalty.` : "No overdue maintenance records were detected in the current data. Continue monitoring scheduled service and mileage.";
    if (q.includes("hello") || q.includes("hi")) return "Hello! Try asking: ‘How many vehicles do we have?’, ‘Any maintenance risks?’, or ‘Summarize trips’.";
    return "I can currently answer questions using your live vehicle, trip, and maintenance records. Try asking about vehicles, trips, maintenance, risk, or health.";
  }

  function submit(text = question) {
    const clean = text.trim();
    if (!clean) return;
    setMessages(prev => [...prev, { role: "user", text: clean }, { role: "assistant", text: answer(clean) }]);
    setQuestion("");
  }

  return <div className="dashboard-content ai-assistant-page">
    <section className="ai-hero">
      <div><div className="ai-eyebrow"><Sparkles size={15}/> FLEETIQ INTELLIGENCE</div><h3>AI Fleet Assistant</h3><p>Ask questions about your fleet using live records from the FleetIQ dashboard. Responses are generated with transparent rule-based logic.</p></div>
      <div className="ai-status"><span/> DATA CONNECTED</div>
    </section>

    <section className="ai-layout">
      <div className="panel ai-chat-panel">
        <div className="ai-chat-head"><div className="ai-bot-icon"><Bot size={20}/></div><div><strong>FleetIQ Assistant</strong><span>Operational data assistant</span></div><CheckCircle2 size={17}/></div>
        <div className="ai-messages">{messages.map((m, i) => <div className={`ai-message ${m.role}`} key={i}><div>{m.text}</div></div>)}</div>
        <div className="ai-input-row"><input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="Ask about your fleet..."/><button onClick={() => submit()}><Send size={17}/></button></div>
      </div>
      <div className="panel ai-suggestions"><p className="panel-label">QUICK QUESTIONS</p><h4>Explore your fleet</h4>{["How many vehicles do we have?", "Any maintenance risks?", "Summarize our trips", "What is the fleet health status?"].map(q => <button key={q} onClick={() => submit(q)}><Sparkles size={14}/>{q}</button>)}<div className="ai-disclaimer"><AlertTriangle size={15}/><span>This assistant uses current database records and rule-based responses. It is not a trained machine-learning model.</span></div></div>
    </section>

    <section className="ai-data-cards"><div><Truck size={17}/><strong>{stats.vehicles}</strong><span>Vehicles</span></div><div><Route size={17}/><strong>{stats.trips}</strong><span>Trips</span></div><div><Wrench size={17}/><strong>{stats.openMaintenance}</strong><span>Open Service</span></div></section>
  </div>;
}
