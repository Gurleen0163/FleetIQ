import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CircleGauge,
  ShieldCheck,
  Truck,
  Wrench,
  ArrowUpRight,
  Clock3,
  IndianRupee,
} from "lucide-react";

function FleetHealthPage({ vehicles = [], maintenance = [], trips = [], loading }) {
  const healthRows = useMemo(() => {
    return vehicles.map((vehicle) => {
      const vehicleId = vehicle.id;
      const related = maintenance.filter((m) => {
        const mv = m.vehicle;
        return mv === vehicleId || mv === vehicle.registrationNumber;
      });

      const overdue = related.filter((m) => m.status === "OVERDUE").length;
      const scheduled = related.filter((m) => m.status === "SCHEDULED").length;
      const inProgress = related.filter((m) => m.status === "IN_PROGRESS").length;
      const completed = related.filter((m) => m.status === "COMPLETED").length;

      let score = 100;
      score -= overdue * 25;
      score -= inProgress * 8;
      score -= scheduled * 5;
      if ((vehicle.currentMileage || 0) >= 50000) score -= 12;
      else if ((vehicle.currentMileage || 0) >= 40000) score -= 6;
      if (vehicle.status && String(vehicle.status).toUpperCase() !== "ACTIVE") score -= 8;
      score = Math.max(0, Math.min(100, score));

      const priority =
        score < 50 ? "CRITICAL" : score < 75 ? "ATTENTION" : "HEALTHY";

      return {
        ...vehicle,
        score,
        priority,
        overdue,
        scheduled,
        inProgress,
        completed,
        relatedCount: related.length,
      };
    });
  }, [vehicles, maintenance]);

  const overallScore = healthRows.length
    ? Math.round(healthRows.reduce((sum, v) => sum + v.score, 0) / healthRows.length)
    : 0;

  const healthy = healthRows.filter((v) => v.priority === "HEALTHY").length;
  const attention = healthRows.filter((v) => v.priority === "ATTENTION").length;
  const critical = healthRows.filter((v) => v.priority === "CRITICAL").length;
  const overdueCount = maintenance.filter((m) => m.status === "OVERDUE").length;
  const scheduledCount = maintenance.filter((m) => m.status === "SCHEDULED").length;

  const maintenanceSpend = maintenance.reduce(
    (sum, item) => sum + Number(item.cost || 0),
    0
  );

  const recommendations = useMemo(() => {
    const list = [];

    healthRows
      .filter((v) => v.priority !== "HEALTHY")
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .forEach((v) => {
        list.push({
          type: v.priority === "CRITICAL" ? "critical" : "attention",
          title: `${v.id} needs attention`,
          text:
            v.overdue > 0
              ? `${v.overdue} overdue maintenance record${v.overdue > 1 ? "s" : ""} found.`
              : v.scheduled > 0
              ? "Scheduled maintenance should be reviewed before long trips."
              : `Mileage is ${Number(v.currentMileage || 0).toLocaleString()} km.`,
        });
      });

    if (!list.length && vehicles.length) {
      list.push({
        type: "good",
        title: "Fleet condition is stable",
        text: "No high-priority maintenance risks were detected from current records.",
      });
    }

    if (!vehicles.length) {
      list.push({
        type: "attention",
        title: "No vehicles available",
        text: "Add vehicles to start calculating fleet health.",
      });
    }

    return list;
  }, [healthRows, vehicles.length]);

  return (
    <div className="dashboard-content fleet-health-page">
      <section className="health-hero">
        <div>
          <div className="health-eyebrow">
            <ShieldCheck size={15} />
            FLEET INTELLIGENCE
          </div>
          <h3>Fleet Health Center</h3>
          <p>
            A rule-based health view combining vehicle status, mileage and
            maintenance history from your FleetIQ database.
          </p>
        </div>
        <div className="health-hero-badge">
          <CircleGauge size={17} />
          <span>OVERALL HEALTH</span>
          <strong>{loading ? "—" : `${overallScore}/100`}</strong>
        </div>
      </section>

      <section className="health-kpis">
        <HealthKpi icon={<ShieldCheck size={19} />} value={healthy} label="Healthy Vehicles" />
        <HealthKpi icon={<AlertTriangle size={19} />} value={attention} label="Need Attention" />
        <HealthKpi icon={<AlertTriangle size={19} />} value={critical} label="Critical" />
        <HealthKpi icon={<CalendarClock size={19} />} value={overdueCount + scheduledCount} label="Service Actions" />
      </section>

      <section className="health-main-grid">
        <div className="panel health-score-panel">
          <div className="health-panel-head">
            <div>
              <p className="panel-label">FLEET CONDITION</p>
              <h4>Health Overview</h4>
            </div>
            <span className={`health-grade ${overallScore >= 75 ? "good" : overallScore >= 50 ? "warn" : "bad"}`}>
              {overallScore >= 75 ? "STABLE" : overallScore >= 50 ? "WATCH" : "CRITICAL"}
            </span>
          </div>

          <div className="health-score-layout">
            <div
              className="health-ring"
              style={{ "--health-progress": `${overallScore * 3.6}deg` }}
            >
              <div>
                <strong>{overallScore}</strong>
                <span>/ 100</span>
              </div>
            </div>

            <div className="health-score-copy">
              <strong>Operational health</strong>
              <p>
                Score is calculated from maintenance status, current mileage
                and vehicle availability. It is an operational rule engine,
                not an ML prediction.
              </p>
              <div className="health-mini-stats">
                <span><b>{vehicles.length}</b> vehicles</span>
                <span><b>{maintenance.length}</b> service records</span>
                <span><b>{trips.length}</b> trips</span>
              </div>
            </div>
          </div>
        </div>

        <div className="panel health-action-panel">
          <div className="health-panel-head">
            <div>
              <p className="panel-label">SMART RECOMMENDATIONS</p>
              <h4>What needs attention?</h4>
            </div>
            <Activity size={18} />
          </div>

          <div className="health-recommendations">
            {recommendations.map((item, index) => (
              <div className={`health-recommendation ${item.type}`} key={index}>
                <div className="health-rec-icon">
                  {item.type === "good" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                </div>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>
                <ArrowUpRight size={15} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel health-vehicles-panel">
        <div className="health-panel-head">
          <div>
            <p className="panel-label">VEHICLE HEALTH</p>
            <h4>Health by Vehicle</h4>
          </div>
          <span className="health-table-note">Based on current database records</span>
        </div>

        <div className="health-table-head">
          <span>VEHICLE</span>
          <span>HEALTH</span>
          <span>MILEAGE</span>
          <span>SERVICE</span>
          <span>PRIORITY</span>
        </div>

        {healthRows
          .sort((a, b) => a.score - b.score)
          .map((vehicle) => (
            <div className="health-table-row" key={vehicle.id}>
              <div className="health-vehicle">
                <div className="health-truck"><Truck size={17} /></div>
                <div>
                  <strong>{vehicle.id}</strong>
                  <span>{vehicle.model}</span>
                </div>
              </div>

              <div className="health-progress-cell">
                <div className="health-progress-track">
                  <span
                    className={vehicle.priority.toLowerCase()}
                    style={{ width: `${vehicle.score}%` }}
                  />
                </div>
                <strong>{vehicle.score}</strong>
              </div>

              <div className="health-mileage">
                <CircleGauge size={14} />
                {Number(vehicle.currentMileage || 0).toLocaleString()} km
              </div>

              <div className="health-service">
                <Wrench size={14} />
                <span>
                  {vehicle.overdue ? `${vehicle.overdue} overdue` :
                   vehicle.scheduled ? `${vehicle.scheduled} scheduled` :
                   vehicle.inProgress ? "In service" : "No action"}
                </span>
              </div>

              <div className={`health-priority ${vehicle.priority.toLowerCase()}`}>
                <i />
                {vehicle.priority}
              </div>
            </div>
          ))}

        {!healthRows.length && (
          <div className="health-empty">
            <Truck size={28} />
            <strong>No vehicles to evaluate</strong>
            <span>Add vehicles from the Vehicles page.</span>
          </div>
        )}
      </section>

      <section className="health-bottom-grid">
        <div className="panel health-maintenance-summary">
          <div className="health-panel-head">
            <div>
              <p className="panel-label">MAINTENANCE SIGNALS</p>
              <h4>Service Snapshot</h4>
            </div>
            <Wrench size={18} />
          </div>

          <div className="health-summary-grid">
            <HealthSummary icon={<AlertTriangle size={16} />} value={overdueCount} label="Overdue" />
            <HealthSummary icon={<Clock3 size={16} />} value={scheduledCount} label="Scheduled" />
            <HealthSummary icon={<IndianRupee size={16} />} value={`₹${maintenanceSpend.toLocaleString("en-IN")}`} label="Total Spend" />
            <HealthSummary icon={<CheckCircle2 size={16} />} value={maintenance.filter((m) => m.status === "COMPLETED").length} label="Completed" />
          </div>
        </div>

        <div className="panel health-method-panel">
          <div className="health-method-icon"><ShieldCheck size={20} /></div>
          <div>
            <p className="panel-label">HOW IT WORKS</p>
            <h4>Transparent intelligence</h4>
            <p>
              FleetIQ assigns health scores using explainable rules. Overdue
              service has the strongest impact, followed by in-progress or
              scheduled maintenance, mileage thresholds and vehicle status.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function HealthKpi({ icon, value, label }) {
  return (
    <div className="health-kpi">
      <div className="health-kpi-icon">{icon}</div>
      <div><strong>{value}</strong><span>{label}</span></div>
    </div>
  );
}

function HealthSummary({ icon, value, label }) {
  return (
    <div className="health-summary">
      <div>{icon}</div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export default FleetHealthPage;
