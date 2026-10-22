import { useEffect, useMemo, useState } from "react";
import {
  Truck,
  Gauge,
  Fuel,
  Navigation,
  CircleCheck,
  CircleAlert,
  Activity,
  MapPin,
  Search,
  RefreshCw,
  Radio,
  Route,
  Clock3,
  ChevronRight,
  Zap,
  ShieldCheck,
} from "lucide-react";

const VEHICLES_API_URL = "http://localhost:8080/api/vehicles";
const TRIPS_API_URL = "http://localhost:8080/api/trips";

const mapPositions = [
  { top: "25%", left: "12%" },
  { top: "60%", left: "18%" },
  { top: "20%", left: "52%" },
  { top: "70%", left: "42%" },
  { top: "45%", left: "68%" },
  { top: "35%", left: "82%" },
  { top: "78%", left: "75%" },
  { top: "12%", left: "75%" },
];

function getLiveStatus(status) {
  const normalized = String(status || "").toLowerCase();
  if (["active", "moving"].includes(normalized)) return "Moving";
  return "Idle";
}

function LiveFleetPage() {
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const fetchFleetData = async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      const [vehiclesResponse, tripsResponse] = await Promise.all([
        fetch(VEHICLES_API_URL),
        fetch(TRIPS_API_URL),
      ]);

      if (!vehiclesResponse.ok) throw new Error("Unable to fetch vehicles");
      if (!tripsResponse.ok) throw new Error("Unable to fetch trips");

      const vehicleData = await vehiclesResponse.json();
      const tripData = await tripsResponse.json();

      setTrips(tripData);

      const formatted = vehicleData.map((vehicle, index) => {
        const activeTrip = tripData.find(
          (trip) =>
            trip.vehicle === vehicle.registrationNumber &&
            trip.status === "IN_PROGRESS"
        );

        return {
          id: vehicle.registrationNumber || `VEH-${vehicle.id}`,
          databaseId: vehicle.id,
          model: vehicle.model || "Unknown Vehicle",
          driver: vehicle.driver || activeTrip?.driver || "Unassigned",
          status: activeTrip ? "On Trip" : getLiveStatus(vehicle.status),
          mileage: vehicle.currentMileage || 0,
          fuelType: vehicle.fuelType || "N/A",
          vehicleType: vehicle.vehicleType || "N/A",
          trip: activeTrip || null,
          position: mapPositions[index % mapPositions.length],
          telemetryAvailable: false,
        };
      });

      setVehicles(formatted);
      setSelectedVehicle((current) => {
        if (!formatted.length) return null;
        return (
          formatted.find((v) => v.databaseId === current?.databaseId) ||
          formatted[0]
        );
      });
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the FleetIQ vehicle and trip services.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFleetData();
    const interval = setInterval(() => fetchFleetData(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const movingCount = vehicles.filter(
    (vehicle) => vehicle.status === "Moving" || vehicle.status === "On Trip"
  ).length;

  const idleCount = vehicles.filter((vehicle) => vehicle.status === "Idle").length;

  const activeTripCount = trips.filter(
    (trip) => trip.status === "IN_PROGRESS"
  ).length;

  const filteredVehicles = useMemo(() => {
    const term = search.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const matchesSearch =
        !term ||
        vehicle.id.toLowerCase().includes(term) ||
        vehicle.model.toLowerCase().includes(term) ||
        vehicle.driver.toLowerCase().includes(term);

      const matchesFilter =
        filter === "ALL" ||
        (filter === "MOVING" &&
          (vehicle.status === "Moving" || vehicle.status === "On Trip")) ||
        (filter === "IDLE" && vehicle.status === "Idle");

      return matchesSearch && matchesFilter;
    });
  }, [vehicles, search, filter]);

  const fleetUtilization = vehicles.length
    ? Math.round((movingCount / vehicles.length) * 100)
    : 0;

  const selected = selectedVehicle;

  return (
    <div className="dashboard-content live-page fleet-command-page">
      <section className="fleet-hero">
        <div>
          <div className="fleet-hero-eyebrow">
            <span className="live-dot" />
            REAL-TIME OPERATIONS
          </div>
          <h3>Live Fleet Command Center</h3>
          <p>
            Monitor your operational fleet, active routes and vehicle status
            from one control surface.
          </p>
        </div>

        <div className="fleet-hero-actions">
          <div className="fleet-sync">
            <Radio size={15} />
            <span>DATABASE SYNC</span>
            <strong>{lastUpdated.toLocaleTimeString()}</strong>
          </div>
          <button
            className="fleet-refresh-btn"
            onClick={() => fetchFleetData(true)}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? "spin" : ""} />
            Refresh
          </button>
        </div>
      </section>

      {error && (
        <section className="live-alert fleet-error-alert">
          <CircleAlert size={19} />
          <div>
            <strong>Connection Error</strong>
            <span>{error}</span>
          </div>
        </section>
      )}

      <section className="fleet-command-kpis">
        <FleetKpi icon={<Truck size={19} />} value={vehicles.length} label="Tracked Vehicles" meta="Fleet database" />
        <FleetKpi icon={<Navigation size={19} />} value={movingCount} label="On The Move" meta={`${fleetUtilization}% utilization`} />
        <FleetKpi icon={<Route size={19} />} value={activeTripCount} label="Active Trips" meta="In progress" />
        <FleetKpi icon={<ShieldCheck size={19} />} value={idleCount} label="Available / Idle" meta="Ready for assignment" />
      </section>

      <section className="fleet-command-grid">
        <div className="panel fleet-network-panel">
          <div className="fleet-panel-heading">
            <div>
              <p className="panel-label">FLEET NETWORK</p>
              <h4>Operational Map</h4>
            </div>
            <div className="fleet-map-legend">
              <span><i className="legend-moving" /> Moving</span>
              <span><i className="legend-idle" /> Idle</span>
            </div>
          </div>

          <div className="fleet-map-stage">
            <div className="map-grid-lines" />
            <div className="map-glow map-glow-a" />
            <div className="map-glow map-glow-b" />

            <div className="map-road map-road-1" />
            <div className="map-road map-road-2" />
            <div className="map-road map-road-3" />
            <div className="map-road map-road-4" />
            <div className="map-route map-route-1" />
            <div className="map-route map-route-2" />

            <span className="map-city city-khanna">KHANNA</span>
            <span className="map-city city-ludhiana">LUDHIANA</span>
            <span className="map-city city-chandigarh">CHANDIGARH</span>
            <span className="map-city city-mohali">MOHALI</span>

            {vehicles.map((vehicle) => (
              <button
                key={vehicle.databaseId}
                className={`fleet-marker ${
                  selected?.databaseId === vehicle.databaseId ? "selected" : ""
                } ${vehicle.status === "Idle" ? "idle-marker" : ""}`}
                style={{ top: vehicle.position.top, left: vehicle.position.left }}
                onClick={() => setSelectedVehicle(vehicle)}
                title={`${vehicle.id} • ${vehicle.status}`}
              >
                <span className="marker-pulse" />
                <span className="marker-icon"><Truck size={17} /></span>
                <span className="marker-label">{vehicle.id}</span>
              </button>
            ))}

            <div className="fleet-map-center-badge">
              <Activity size={15} />
              <span>{movingCount} ACTIVE</span>
            </div>

            {vehicles.length === 0 && !loading && (
              <div className="fleet-map-empty">
                <Truck size={28} />
                <strong>No fleet vehicles</strong>
                <span>Add a vehicle to begin monitoring.</span>
              </div>
            )}
          </div>
        </div>

        <div className="panel fleet-inspector-panel">
          <div className="fleet-panel-heading">
            <div>
              <p className="panel-label">LIVE INSPECTOR</p>
              <h4>Vehicle Details</h4>
            </div>
            {selected && (
              <span className={`fleet-status-pill ${selected.status === "Idle" ? "idle" : "moving"}`}>
                <i />
                {selected.status}
              </span>
            )}
          </div>

          {selected ? (
            <div className="fleet-inspector">
              <div className="fleet-vehicle-identity">
                <div className="fleet-big-truck">
                  <Truck size={35} strokeWidth={1.7} />
                </div>
                <div>
                  <strong>{selected.id}</strong>
                  <span>{selected.model} · {selected.vehicleType}</span>
                </div>
              </div>

              <div className="fleet-data-warning">
                <Zap size={15} />
                <span>GPS speed & fuel telemetry are not connected to the backend yet.</span>
              </div>

              <div className="fleet-inspector-grid">
                <FleetDetail icon={<Gauge size={16} />} label="SPEED" value="N/A" />
                <FleetDetail icon={<Fuel size={16} />} label="FUEL" value="N/A" />
                <FleetDetail icon={<Gauge size={16} />} label="MILEAGE" value={`${selected.mileage.toLocaleString()} km`} />
                <FleetDetail icon={<Clock3 size={16} />} label="SYNC" value={lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} />
              </div>

              <div className="fleet-inspector-info">
                <div className="fleet-info-row">
                  <div className="fleet-info-icon"><Activity size={16} /></div>
                  <div><span>DRIVER</span><strong>{selected.driver}</strong></div>
                </div>
                <div className="fleet-info-row">
                  <div className="fleet-info-icon"><MapPin size={16} /></div>
                  <div>
                    <span>CURRENT ROUTE</span>
                    <strong>
                      {selected.trip
                        ? `${selected.trip.origin} → ${selected.trip.destination}`
                        : "No active trip"}
                    </strong>
                  </div>
                </div>
                <div className="fleet-info-row">
                  <div className="fleet-info-icon"><Navigation size={16} /></div>
                  <div><span>TRIP</span><strong>{selected.trip?.tripNumber || "—"}</strong></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="fleet-inspector-empty">
              <Truck size={30} />
              <strong>Select a vehicle</strong>
              <span>Choose a marker or vehicle from the feed.</span>
            </div>
          )}
        </div>
      </section>

      <section className="panel fleet-feed-panel">
        <div className="fleet-feed-heading">
          <div>
            <p className="panel-label">FLEET MONITORING</p>
            <h4>Vehicle Operations Feed</h4>
          </div>

          <div className="fleet-feed-controls">
            <div className="fleet-search">
              <Search size={15} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vehicle, model or driver"
              />
            </div>
            <div className="fleet-filter-tabs">
              {[
                ["ALL", "All"],
                ["MOVING", "Moving"],
                ["IDLE", "Idle"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={filter === value ? "active" : ""}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="fleet-feed-table">
          <div className="fleet-feed-table-head">
            <span>VEHICLE</span>
            <span>DRIVER</span>
            <span>ROUTE</span>
            <span>MILEAGE</span>
            <span>STATUS</span>
          </div>

          {filteredVehicles.map((vehicle) => (
            <button
              key={vehicle.databaseId}
              className={`fleet-feed-table-row ${
                selected?.databaseId === vehicle.databaseId ? "selected" : ""
              }`}
              onClick={() => setSelectedVehicle(vehicle)}
            >
              <div className="feed-vehicle-cell">
                <div className="feed-truck-icon"><Truck size={17} /></div>
                <div>
                  <strong>{vehicle.id}</strong>
                  <span>{vehicle.model}</span>
                </div>
              </div>

              <div className="feed-text-cell">
                <span>{vehicle.driver}</span>
              </div>

              <div className="feed-route-cell">
                <Route size={14} />
                <span>
                  {vehicle.trip
                    ? `${vehicle.trip.origin} → ${vehicle.trip.destination}`
                    : "No active route"}
                </span>
              </div>

              <div className="feed-mileage-cell">
                {vehicle.mileage.toLocaleString()} km
              </div>

              <div className={`feed-status ${vehicle.status === "Idle" ? "idle" : "moving"}`}>
                <i />
                {vehicle.status}
                <ChevronRight size={15} />
              </div>
            </button>
          ))}

          {!filteredVehicles.length && (
            <div className="fleet-feed-empty">
              <Search size={24} />
              <strong>No matching vehicles</strong>
              <span>Try another search or filter.</span>
            </div>
          )}
        </div>
      </section>

      <section className="fleet-truth-banner">
        <div className="fleet-truth-icon"><CircleCheck size={17} /></div>
        <div>
          <strong>FleetIQ data integrity</strong>
          <span>
            Vehicle, driver, trip and mileage information is read from your FleetIQ
            database. GPS speed and fuel telemetry are intentionally shown as N/A
            until real telemetry fields are connected.
          </span>
        </div>
      </section>
    </div>
  );
}

function FleetKpi({ icon, value, label, meta }) {
  return (
    <div className="fleet-kpi">
      <div className="fleet-kpi-icon">{icon}</div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
        <small>{meta}</small>
      </div>
    </div>
  );
}

function FleetDetail({ icon, label, value }) {
  return (
    <div className="fleet-detail-card">
      <div>{icon}<span>{label}</span></div>
      <strong>{value}</strong>
    </div>
  );
}

export default LiveFleetPage;
