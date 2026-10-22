
import { useEffect, useMemo, useState } from "react";
import "./App.css";

import VehiclesPage from "./VehiclesPage";
import DriversPage from "./DriversPage";
import TripsPage from "./TripsPage";
import LiveFleetPage from "./LiveFleetPage";
import MaintenancePage from "./MaintenancePage";
import FleetHealthPage from "./FleetHealthPage";
import AIFleetAssistantPage from "./AIFleetAssistantPage";

import {
  LayoutDashboard,
  Truck,
  Users,
  Map,
  Route,
  Wrench,
  BarChart3,
  Settings,
  Bell,
  Search,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Fuel,
  Gauge,
  CircleCheck,
  CircleAlert,
  MoreHorizontal,
  Plus,
  Sparkles,
  Navigation,
  Activity,
  X,
  ShieldCheck,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

/* =====================================================
   API
===================================================== */

const VEHICLES_API = "http://localhost:8080/api/vehicles";
const TRIPS_API = "http://localhost:8080/api/trips";
const MAINTENANCE_API = "http://localhost:8080/api/maintenance";

/* =====================================================
   MAIN APP
===================================================== */

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const [showInsight, setShowInsight] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState(null);

  /* =====================================================
     REAL BACKEND DATA
  ===================================================== */

  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenance, setMaintenance] = useState([]);

  const [loadingDashboard, setLoadingDashboard] = useState(true);

  /* =====================================================
     LOAD ALL DASHBOARD DATA
  ===================================================== */

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoadingDashboard(true);

        const [vehiclesResponse, tripsResponse, maintenanceResponse] =
          await Promise.all([
            fetch(VEHICLES_API),
            fetch(TRIPS_API),
            fetch(MAINTENANCE_API),
          ]);

        if (!vehiclesResponse.ok) {
          throw new Error("Failed to load vehicles");
        }

        if (!tripsResponse.ok) {
          throw new Error("Failed to load trips");
        }

        if (!maintenanceResponse.ok) {
          throw new Error("Failed to load maintenance");
        }

        const [vehiclesData, tripsData, maintenanceData] =
          await Promise.all([
            vehiclesResponse.json(),
            tripsResponse.json(),
            maintenanceResponse.json(),
          ]);

        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
        setTrips(Array.isArray(tripsData) ? tripsData : []);
        setMaintenance(
          Array.isArray(maintenanceData)
            ? maintenanceData
            : []
        );
      } catch (error) {
        console.error(
          "Error loading dashboard data:",
          error
        );

        setVehicles([]);
        setTrips([]);
        setMaintenance([]);
      } finally {
        setLoadingDashboard(false);
      }
    };

    loadDashboardData();
  }, [activePage]);

  /* =====================================================
     AI INSIGHT ANIMATION
  ===================================================== */

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInsight(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  /* =====================================================
     TOTAL VEHICLES
  ===================================================== */

  const totalVehicles = vehicles.length;

  /* =====================================================
     ACTIVE VEHICLES
  ===================================================== */

  const activeVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.status &&
      vehicle.status.toUpperCase() === "ACTIVE"
  );

  const activeVehicleCount = activeVehicles.length;

  /* =====================================================
     MAINTENANCE COUNT
  ===================================================== */

  const maintenanceCount = maintenance.filter(
    (item) => {
      const status = item.status
        ? item.status.toUpperCase()
        : "";

      return (
        status === "SCHEDULED" ||
        status === "IN_PROGRESS" ||
        status === "OVERDUE"
      );
    }
  ).length;

  /* =====================================================
     IN-PROGRESS TRIPS
  ===================================================== */

  const inProgressTrips = trips.filter(
    (trip) =>
      trip.status &&
      trip.status.toUpperCase() === "IN_PROGRESS"
  );

  /* =====================================================
     VEHICLES CURRENTLY ON TRIPS
  ===================================================== */

  const vehiclesOnTrip = useMemo(() => {
    const vehicleNames = new Set();

    inProgressTrips.forEach((trip) => {
      if (trip.vehicle) {
        vehicleNames.add(
          trip.vehicle.toString().toLowerCase()
        );
      }
    });

    return vehicles.filter((vehicle) => {
      const registration =
        vehicle.registrationNumber
          ?.toString()
          .toLowerCase();

      const model =
        vehicle.model
          ?.toString()
          .toLowerCase();

      return (
        vehicleNames.has(registration) ||
        vehicleNames.has(model)
      );
    });
  }, [vehicles, inProgressTrips]);

  /* =====================================================
     FLEET UTILIZATION
     
     Formula:
     Vehicles currently assigned to IN_PROGRESS trips
     -----------------------------------------------------
     Total vehicles
  ===================================================== */

  const fleetUtilization =
    totalVehicles > 0
      ? Number(
          (
            (vehiclesOnTrip.length / totalVehicles) *
            100
          ).toFixed(1)
        )
      : 0;

  /* =====================================================
     LIVE FLEET DATA
     
     Backend currently doesn't contain GPS/speed/fuel.
     We therefore derive live status from IN_PROGRESS
     trips and use real vehicle records.
  ===================================================== */

  const liveVehicles = useMemo(() => {
    return vehicles.map((vehicle, index) => {
      const registration =
        vehicle.registrationNumber || "Unknown";

      const model =
        vehicle.model || "Unknown Vehicle";

      const driver =
        vehicle.driver || "Unassigned";

      const matchingTrip = inProgressTrips.find(
        (trip) => {
          const tripVehicle = trip.vehicle
            ?.toString()
            .toLowerCase();

          return (
            tripVehicle ===
              registration.toString().toLowerCase() ||
            tripVehicle ===
              model.toString().toLowerCase()
          );
        }
      );

      const isMoving = Boolean(matchingTrip);

      const positions = [
        {
          top: "28%",
          left: "10%",
        },
        {
          top: "58%",
          left: "5%",
        },
        {
          top: "18%",
          left: "48%",
        },
        {
          top: "72%",
          left: "35%",
        },
        {
          top: "43%",
          left: "62%",
        },
      ];

      const position =
        positions[index % positions.length];

return {
  id: registration,
  model,
  driver,
  speed: isMoving ? "—" : "0",
  fuel: "—",
  status: isMoving ? "Moving" : "Idle",
  top: position.top,
  left: position.left,
  duration: String(13 + (index % 7)) + "s",
        trip: matchingTrip || null,
    };
  });
}, [vehicles, trips]);

  const movingVehicles = liveVehicles.filter(
    (vehicle) => vehicle.status === "Moving"
  );

  /* =====================================================
     WEEKLY MILEAGE DATA
     
     Uses real trip distance values.
  ===================================================== */

  const mileageData = useMemo(() => {
    const days = [];

    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);

      date.setHours(0, 0, 0, 0);
      date.setDate(today.getDate() - i);

      const dayName = date.toLocaleDateString(
        "en-US",
        {
          weekday: "short",
        }
      );

      const dateString =
        `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-${String(
          date.getDate()
        ).padStart(2, "0")}`;

      days.push({
        day: dayName,
        date: dateString,
        mileage: 0,
      });
    }

    trips.forEach((trip) => {
      if (!trip.tripDate) {
        return;
      }

      const matchingDay = days.find(
        (day) => day.date === trip.tripDate
      );

      if (matchingDay) {
        matchingDay.mileage +=
          Number(trip.distance) || 0;
      }
    });

    return days;
  }, [trips]);

  /* =====================================================
     TOTAL WEEKLY MILEAGE
  ===================================================== */

  const weeklyMileage = mileageData.reduce(
    (total, item) =>
      total + (Number(item.mileage) || 0),
    0
  );

  /* =====================================================
     UTILIZATION CHART
     
     Shows daily trip activity for the last 7 days.
  ===================================================== */

  const utilizationData = useMemo(() => {
    return mileageData.map((day) => {
      const dayTrips = trips.filter(
        (trip) =>
          trip.tripDate === day.date
      );

      const activeDayTrips =
        dayTrips.filter((trip) => {
          const status = trip.status
            ? trip.status.toUpperCase()
            : "";

          return (
            status === "IN_PROGRESS" ||
            status === "COMPLETED"
          );
        });

      const utilization =
        totalVehicles > 0
          ? Math.min(
              Math.round(
                (activeDayTrips.length /
                  totalVehicles) *
                  100
              ),
              100
            )
          : 0;

      return {
        name: day.day,
        value: utilization,
      };
    });
  }, [mileageData, trips, totalVehicles]);

  /* =====================================================
     AI FLEET ANALYSIS
     
     Uses the real vehicle with the highest mileage.
  ===================================================== */

  const aiVehicle = useMemo(() => {
    if (vehicles.length === 0) {
      return null;
    }

    return [...vehicles].sort(
      (a, b) =>
        (Number(b.currentMileage) || 0) -
        (Number(a.currentMileage) || 0)
    )[0];
  }, [vehicles]);

  const aiMileage = aiVehicle
    ? Number(aiVehicle.currentMileage) || 0
    : 0;

  const aiUsage =
    aiMileage > 0
      ? Math.min(
          Math.round(
            (aiMileage / 60000) * 100
          ),
          100
        )
      : 0;

  const aiPriority =
    aiUsage >= 85
      ? "HIGH PRIORITY"
      : aiUsage >= 70
        ? "MEDIUM PRIORITY"
        : "MONITOR";

  /* =====================================================
     RECENT ACTIVITY
  ===================================================== */

  const recentActivities = useMemo(() => {
    const activities = [];

    /* Trips */

    [...trips]
      .sort((a, b) => {
        const dateA = a.tripDate
          ? new Date(a.tripDate).getTime()
          : 0;

        const dateB = b.tripDate
          ? new Date(b.tripDate).getTime()
          : 0;

        return dateB - dateA;
      })
      .slice(0, 3)
      .forEach((trip) => {
        const status = trip.status
          ? trip.status.toUpperCase()
          : "";

        activities.push({
          icon:
            status === "COMPLETED" ? (
              <CircleCheck size={16} />
            ) : (
              <Route size={16} />
            ),
          title:
            status === "COMPLETED"
              ? `Trip ${trip.tripNumber || ""} completed`
              : `Trip ${trip.tripNumber || ""} updated`,
          time:
            trip.tripDate ||
            "Recently",
        });
      });

    /* Maintenance */

    [...maintenance]
      .sort((a, b) => {
        const dateA = a.serviceDate
          ? new Date(a.serviceDate).getTime()
          : 0;

        const dateB = b.serviceDate
          ? new Date(b.serviceDate).getTime()
          : 0;

        return dateB - dateA;
      })
      .slice(0, 2)
      .forEach((item) => {
        activities.push({
          icon: <Wrench size={16} />,
          title:
            `Maintenance ${item.status || "updated"}`
              .replace("_", " ")
              .toLowerCase(),
          time:
            item.serviceDate ||
            "Recently",
        });
      });

    return activities.slice(0, 5);
  }, [trips, maintenance]);

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const navigation = [
    {
      section: "MAIN",
      items: [
        {
          name: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "Vehicles",
          icon: Truck,
        },
        {
          name: "Drivers",
          icon: Users,
        },
        {
          name: "Live Fleet",
          icon: Map,
        },
      ],
    },
    {
      section: "OPERATIONS",
      items: [
        {
          name: "Trips",
          icon: Route,
        },
        {
          name: "Maintenance",
          icon: Wrench,
        },
        {
          name: "Fleet Health",
          icon: ShieldCheck,
        },
        {
          name: "AI Assistant",
          icon: Sparkles,
        },
        {
          name: "Analytics",
          icon: BarChart3,
        },
      ],
    },
  ];

  return (
    <div className="app-shell">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            <Truck size={22} />
          </div>

          <div>
            <h1>FleetIQ</h1>

            <span>
              Fleet Intelligence
            </span>
          </div>

        </div>

        <div className="sidebar-menu">

          {navigation.map((group) => (

            <div
              className="nav-group"
              key={group.section}
            >

              <p className="nav-section">
                {group.section}
              </p>

              {group.items.map((item) => {

                const Icon = item.icon;

                const navClass =
                  activePage === item.name
                    ? "nav-item active"
                    : "nav-item";

                return (
                  <button
                    key={item.name}
                    className={navClass}
                    onClick={() =>
                      setActivePage(item.name)
                    }
                  >

                    <Icon size={19} />

                    <span>
                      {item.name}
                    </span>

                  </button>
                );
              })}

            </div>
          ))}

        </div>

        <div className="sidebar-bottom">

          <button className="nav-item">

            <Settings size={19} />

            <span>
              Settings
            </span>

          </button>

          <div className="upgrade-card">

            <div className="upgrade-icon">
              <Sparkles size={18} />
            </div>

            <div>

              <strong>
                Fleet Intelligence
              </strong>

              <p>
                AI-powered insights
              </p>

            </div>

            <ArrowUpRight size={16} />

          </div>

          <div className="profile">
            <div className="avatar">GK</div>
            <div className="profile-info">
              <strong>Fleet Admin</strong>
              <span><i className="profile-online-dot" /> Operations</span>
            </div>
            <button className="profile-menu-button" aria-label="Open profile menu">
              <ChevronDown size={15} />
            </button>
          </div>

        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="main-content">

        {/* =====================================================
            TOPBAR
        ===================================================== */}

        <header className="topbar">

          <div>

            <div className="breadcrumb">

              Fleet Management

              <span>
                /
              </span>

              Overview

            </div>

            <h2>
              {activePage}
            </h2>

          </div>

          <div className="topbar-actions">

            <div className="live-status">

              <i></i>

              <span>
                {movingVehicles.length} {movingVehicles.length === 1 ? "vehicle" : "vehicles"} online
              </span>

            </div>

            <div className="search-box">

              <Search size={17} />

              <input
                placeholder="Search fleet..."
              />

              <span>
                ⌘ K
              </span>

            </div>

            <button className="icon-button notification">

              <Bell size={19} />

              <i></i>

            </button>

            <button className="date-button">

              {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}

              <ChevronDown size={16} />

            </button>

          </div>

        </header>

        {/* =====================================================
            DASHBOARD
        ===================================================== */}

        {activePage === "Dashboard" && (

          <div className="dashboard-content">

            {/* =================================================
                WELCOME
            ================================================= */}

            <section className="welcome-row">

              <div>

                <p className="eyebrow">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  }).toUpperCase()}
                </p>

                <h3>
                  Good morning, Fleet Admin 👋
                </h3>

                <p className="welcome-text">
                  Here's what's happening across your fleet today.
                </p>

              </div>

              <button
                className="primary-button"
                onClick={() =>
                  setActivePage("Vehicles")
                }
              >

                <Plus size={18} />

                Add Vehicle

              </button>

            </section>

            {/* =================================================
                KPI CARDS
            ================================================= */}

            <section className="stats-grid">

              <StatCard
                title="Total Vehicles"
                target={totalVehicles}
                change="LIVE"
                positive={true}
                icon={<Truck size={20} />}
                description={
                  loadingDashboard
                    ? "loading..."
                    : "real fleet count"
                }
              />

              <StatCard
                title="Active Vehicles"
                target={activeVehicleCount}
                change="LIVE"
                positive={true}
                icon={
                  <CircleCheck size={20} />
                }
                description="currently active"
              />

              <StatCard
                title="In Maintenance"
                target={maintenanceCount}
                change="LIVE"
                positive={true}
                icon={<Wrench size={20} />}
                description="active maintenance"
              />

              <StatCard
                title="Fleet Utilization"
                target={fleetUtilization}
                suffix="%"
                decimals={1}
                change="LIVE"
                positive={true}
                icon={<Gauge size={20} />}
                description="vehicles on active trips"
              />

            </section>

            {/* =================================================
                AI INTELLIGENCE
            ================================================= */}

            {showInsight && aiVehicle && (

              <section className="ai-command-panel">

                <div className="ai-command-header">

                  <div className="ai-command-brand">

                    <div className="ai-command-icon">
                      <Sparkles size={19} />
                    </div>

                    <div className="ai-command-brand-text">

                      <small>
                        FLEETIQ INTELLIGENCE
                      </small>

                      <strong>
                        AI Fleet Analysis
                      </strong>

                    </div>

                  </div>

                  <div className="ai-analyzing">

                    <span className="ai-analyzing-dot"></span>

                    ANALYZING

                  </div>

                </div>

                <div className="ai-command-body">

                  <div className="ai-risk-section">

                    <div className="ai-risk-icon">
                      <CircleAlert size={22} />
                    </div>

                    <div>

                      <div className="ai-risk-label">
                        MAINTENANCE RISK DETECTED
                      </div>

                      <div className="ai-risk-title">
                        Maintenance recommended
                      </div>

                      <div className="ai-risk-description">

                        Vehicle{" "}

                        <strong>
                          {aiVehicle.registrationNumber}
                        </strong>{" "}

                        has reached{" "}

                        <strong>
                          {aiUsage}%
                        </strong>{" "}

                        of its recommended mileage threshold.
                        FleetIQ recommends reviewing this
                        vehicle's maintenance schedule.

                      </div>

                      <div className="ai-risk-badge">
                        {aiPriority}
                      </div>

                    </div>

                  </div>

                  <div className="ai-vehicle-focus">

                    <div className="ai-vehicle-focus-label">
                      VEHICLE MONITORING
                    </div>

                    <div className="ai-vehicle-number">
                      {aiVehicle.registrationNumber}
                    </div>

                    <div className="ai-vehicle-line">

                      <span
                        style={{
                          width: `${aiUsage}%`,
                        }}
                      ></span>

                    </div>

                    <div className="ai-threshold">

                      <span>
                        Mileage usage
                      </span>

                      <span>
                        {aiUsage}%
                      </span>

                    </div>

                  </div>

                </div>

                <div className="ai-command-footer">

                  <div className="ai-action-info">

                    <Activity size={13} />

                    AI detected{" "}
                    {maintenanceCount} vehicle
                    {maintenanceCount !== 1
                      ? "s"
                      : ""} requiring attention

                  </div>

                  <button
                    className="ai-review-button"
                    onClick={() =>
                      setActivePage("Maintenance")
                    }
                  >

                    Review vehicle

                    <ArrowUpRight size={13} />

                  </button>

                </div>

              </section>

            )}

            {/* =================================================
                NO VEHICLE AI STATE
            ================================================= */}

            {showInsight && !aiVehicle && (

              <section className="ai-command-panel">

                <div className="ai-command-header">

                  <div className="ai-command-brand">

                    <div className="ai-command-icon">
                      <Sparkles size={19} />
                    </div>

                    <div className="ai-command-brand-text">

                      <small>
                        FLEETIQ INTELLIGENCE
                      </small>

                      <strong>
                        AI Fleet Analysis
                      </strong>

                    </div>

                  </div>

                </div>

                <div className="ai-command-body">

                  <div className="ai-risk-section">

                    <div className="ai-risk-icon">
                      <CircleAlert size={22} />
                    </div>

                    <div>

                      <div className="ai-risk-label">
                        FLEET DATA REQUIRED
                      </div>

                      <div className="ai-risk-title">
                        Add vehicles to activate intelligence
                      </div>

                      <div className="ai-risk-description">
                        FleetIQ will automatically analyze
                        vehicle mileage and maintenance risk
                        once fleet data is available.
                      </div>

                    </div>

                  </div>

                </div>

              </section>

            )}

            {/* =================================================
                LIVE FLEET
            ================================================= */}

            <section className="live-fleet-panel">

              <div className="live-fleet-header">

                <div>

                  <div className="panel-label">
                    REAL-TIME OPERATIONS
                  </div>

                  <h4>
                    Live Fleet
                  </h4>

                  <p>
                    Monitor vehicles moving across your network
                  </p>

                </div>

                <div className="fleet-live-counter">

                  <span className="live-dot"></span>

                  <strong>
                    {movingVehicles.length} vehicles moving
                  </strong>

                  <span>
                    Backend status
                  </span>

                </div>

              </div>

              <div className="fleet-map">

                <div className="road road-one"></div>
                <div className="road road-two"></div>
                <div className="road road-three"></div>
                <div className="road road-four"></div>

                <div className="route route-one"></div>
                <div className="route route-two"></div>
                <div className="route route-three"></div>

                <span className="map-location location-one">
                  KHANNA
                </span>

                <span className="map-location location-two">
                  LUDHIANA
                </span>

                <span className="map-location location-three">
                  CHANDIGARH
                </span>

                <span className="map-location location-four">
                  MOHALI
                </span>

                {liveVehicles.map(
                  (vehicle, index) => (

                    <button
                      key={vehicle.id}
                      className={
                        selectedVehicle?.id ===
                        vehicle.id
                          ? `moving-vehicle vehicle-${index + 1} selected`
                          : `moving-vehicle vehicle-${index + 1}`
                      }
                      style={{
                        top: vehicle.top,
                        left: vehicle.left,
                        animationDuration:
                          vehicle.duration,
                        animationDelay:
                          `${index * 0.7}s`,
                      }}
                      onClick={() =>
                        setSelectedVehicle(
                          vehicle
                        )
                      }
                    >

                      <span className="vehicle-pulse"></span>

                      <span className="vehicle-marker">

                        <Truck size={19} />

                      </span>

                      <span className="vehicle-label">

                        {vehicle.id}

                      </span>

                    </button>

                  )
                )}

                {liveVehicles.length === 0 && (

                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      pointerEvents: "none",
                    }}
                  >

                    <span>
                      No vehicle data available
                    </span>

                  </div>

                )}

                <div className="radar-center">

                  <div className="radar-ring ring-one"></div>

                  <div className="radar-ring ring-two"></div>

                  <div className="radar-core">

                    <Navigation size={18} />

                  </div>

                </div>

                {selectedVehicle && (

                  <div className="vehicle-live-card">

                    <button
                      className="close-live-card"
                      onClick={() =>
                        setSelectedVehicle(
                          null
                        )
                      }
                      aria-label="Close vehicle details"
                    >

                      <X size={15} />

                    </button>

                    <div className="vehicle-card-visual">

                      <div className="vehicle-card-grid"></div>

                      <div className="vehicle-card-glow"></div>

                      <div className="vehicle-card-icon">

                        <Truck
                          size={42}
                          strokeWidth={1.5}
                        />

                      </div>

                    </div>

                    <div className="vehicle-card-content">

                      <div className="vehicle-card-heading">

                        <div>

                          <strong>
                            {selectedVehicle.model}
                          </strong>

                          <span>
                            {selectedVehicle.id}
                          </span>

                        </div>

                        <div className="vehicle-live-badge">

                          <i></i>

                          {selectedVehicle.status ===
                          "Moving"
                            ? "LIVE"
                            : "IDLE"}

                        </div>

                      </div>

                      <div className="vehicle-card-stats">

                        <div className="vehicle-card-stat">

                          <div className="vehicle-card-stat-top">

                            <Gauge size={13} />

                            <span>
                              SPEED
                            </span>

                          </div>

                          <strong>
                            {selectedVehicle.speed ===
                            "—"
                              ? "N/A"
                              : `${selectedVehicle.speed} km/h`}
                          </strong>

                        </div>

                        <div className="vehicle-card-stat">

                          <div className="vehicle-card-stat-top">

                            <Fuel size={13} />

                            <span>
                              FUEL
                            </span>

                          </div>

                          <strong>
                            {selectedVehicle.fuel ===
                            "—"
                              ? "N/A"
                              : `${selectedVehicle.fuel}%`}
                          </strong>

                        </div>

                      </div>

                      <div className="vehicle-driver">

                        <div className="vehicle-driver-info">

                          <div className="vehicle-driver-avatar">

                            {selectedVehicle.driver
                              .split(" ")
                              .map(
                                (name) =>
                                  name[0]
                              )
                              .join("")
                              .slice(0, 2)}

                          </div>

                          <div className="vehicle-driver-text">

                            <span>
                              Driver
                            </span>

                            <strong>
                              {selectedVehicle.driver}
                            </strong>

                          </div>

                        </div>

                        <Navigation
                          size={16}
                          opacity={0.45}
                        />

                      </div>

                      <div className="vehicle-registration">

                        <span>
                          REGISTRATION
                        </span>

                        <strong>
                          {selectedVehicle.id}
                        </strong>

                      </div>

                      {selectedVehicle.trip && (

                        <div className="vehicle-registration">

                          <span>
                            CURRENT ROUTE
                          </span>

                          <strong>
                            {selectedVehicle.trip.origin}
                            {" → "}
                            {selectedVehicle.trip.destination}
                          </strong>

                        </div>

                      )}

                    </div>

                  </div>

                )}

              </div>

            </section>

            {/* =================================================
                CHARTS
            ================================================= */}

            <section className="charts-grid">

              <div className="panel mileage-panel">

                <div className="panel-header">

                  <div>

                    <p className="panel-label">
                      FLEET PERFORMANCE
                    </p>

                    <h4>
                      Weekly Mileage
                    </h4>

                  </div>

                  <button className="period-button">

                    Last 7 days

                    <ChevronDown size={15} />

                  </button>

                </div>

                <div className="chart-value">

                  <strong>
                    {weeklyMileage.toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 1,
                      }
                    )}{" "}
                    km
                  </strong>

                  <span className="positive">

                    <Activity size={14} />

                    Live data

                  </span>

                </div>

                <div className="chart-container">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <AreaChart
                      data={mileageData}
                    >

                      <defs>

                        <linearGradient
                          id="mileageGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >

                          <stop
                            offset="0%"
                            stopOpacity={0.25}
                          />

                          <stop
                            offset="100%"
                            stopOpacity={0}
                          />

                        </linearGradient>

                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        opacity={0.08}
                      />

                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 12,
                        }}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 12,
                        }}
                      />

                      <Tooltip />

                      <Area
                        type="monotone"
                        dataKey="mileage"
                        strokeWidth={2}
                        fill="url(#mileageGradient)"
                      />

                    </AreaChart>

                  </ResponsiveContainer>

                </div>

              </div>

              <div className="panel utilization-panel">

                <div className="panel-header">

                  <div>

                    <p className="panel-label">
                      UTILIZATION
                    </p>

                    <h4>
                      Fleet Usage
                    </h4>

                  </div>

                  <button className="more-button">

                    <MoreHorizontal size={20} />

                  </button>

                </div>

                <div className="utilization-main">

                  <div className="utilization-number">

                    <strong>
                      {fleetUtilization}%
                    </strong>

                    <span>
                      Current
                    </span>

                  </div>

                  <div className="utilization-status">

                    <CircleCheck size={17} />

                    {fleetUtilization >= 70
                      ? "Healthy fleet"
                      : fleetUtilization > 0
                        ? "Low utilization"
                        : "No active trips"}

                  </div>

                </div>

                <div className="bar-chart">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <BarChart
                      data={utilizationData}
                    >

                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 11,
                        }}
                      />

                      <YAxis hide />

                      <Tooltip />

                      <Bar
                        dataKey="value"
                        radius={[
                          5,
                          5,
                          0,
                          0,
                        ]}
                        barSize={18}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              </div>

            </section>

            {/* =================================================
                BOTTOM SECTION
            ================================================= */}


            <section className="bottom-grid">

              <div className="panel vehicle-panel">

                <div className="panel-header">

                  <div>

                    <p className="panel-label">
                      FLEET
                    </p>

                    <h4>
                      Vehicle Overview
                    </h4>

                  </div>

                  <button
                    className="text-button"
                    onClick={() =>
                      setActivePage("Vehicles")
                    }
                  >

                    View all

                    <ArrowUpRight size={15} />

                  </button>

                </div>

                <div className="vehicle-table">

                  <div className="table-head">

                    <span>
                      VEHICLE
                    </span>

                    <span>
                      DRIVER
                    </span>

                    <span>
                      STATUS
                    </span>

                    <span>
                      MILEAGE
                    </span>

                  </div>

                  {vehicles.length > 0 ? (

                    vehicles
                      .slice(0, 5)
                      .map(
                        (vehicle) => (

                          <div
                            className="table-row"
                            key={vehicle.id}
                          >

                            <div className="vehicle-name">

                              <div className="vehicle-icon">

                                <Truck size={17} />

                              </div>

                              <div>

                                <strong>
                                  {vehicle.registrationNumber}
                                </strong>

                                <span>
                                  {vehicle.model} ·{" "}
                                  {vehicle.vehicleType}
                                </span>

                              </div>

                            </div>

                            <span className="driver-name">

                              {vehicle.driver ||
                                "Unassigned"}

                            </span>

                            <StatusBadge
                              status={
                                vehicle.status ||
                                "UNKNOWN"
                              }
                            />

                            <span className="mileage">

                              {(
                                Number(
                                  vehicle.currentMileage
                                ) || 0
                              ).toLocaleString(
                                "en-IN"
                              )}{" "}
                              km

                            </span>

                          </div>

                        )
                      )

                  ) : (

                    <div className="empty-state">

                      <Truck size={24} />

                      <p>
                        No vehicles found
                      </p>

                    </div>

                  )}

                </div>

              </div>

              <div className="panel activity-panel">

                <div className="panel-header">

                  <div>

                    <p className="panel-label">
                      ACTIVITY
                    </p>

                    <h4>
                      Recent Updates
                    </h4>

                  </div>

                  <Activity size={19} />

                </div>

                <div className="activity-list">

                  {recentActivities.length > 0 ? (

                    recentActivities.map(
                      (item, index) => (

                        <ActivityItem
                          key={index}
                          icon={item.icon}
                          title={item.title}
                          time={item.time}
                        />

                      )
                    )

                  ) : (

                    <div className="empty-state">

                      <Activity size={24} />

                      <p>
                        No recent activity
                      </p>

                    </div>

                  )}

                </div>

              </div>

            </section>

          </div>
        )}

        {/* =====================================================
            VEHICLES PAGE
        ===================================================== */}

        {activePage === "Vehicles" && (
          <VehiclesPage />
        )}

        {/* =====================================================
            DRIVERS PAGE
        ===================================================== */}

        {activePage === "Drivers" && (
          <DriversPage />
        )}

        {/* =====================================================
            TRIPS PAGE
        ===================================================== */}

        {activePage === "Trips" && (
          <TripsPage />
        )}

        {/* =====================================================
            LIVE FLEET PAGE
        ===================================================== */}

        {activePage === "Live Fleet" && (
          <LiveFleetPage />
        )}

        {/* =====================================================
            MAINTENANCE PAGE
        ===================================================== */}

        {activePage === "Maintenance" && (
          <MaintenancePage />
        )}

        {/* =====================================================
            FLEET HEALTH PAGE
        ===================================================== */}

        {activePage === "Fleet Health" && (
          <FleetHealthPage
            vehicles={vehicles}
            maintenance={maintenance}
            trips={trips}
            loading={loadingDashboard}
          />
        )}

        {/* =====================================================
            ANALYTICS PAGE
        ===================================================== */}

        {activePage === "AI Assistant" && (
          <AIFleetAssistantPage vehicles={vehicles} trips={trips} maintenance={maintenance} />
        )}

        {activePage === "Analytics" && (
          <AnalyticsPage
            vehicles={vehicles}
            trips={trips}
            maintenance={maintenance}
            loading={loadingDashboard}
            onBack={() => setActivePage("Dashboard")}
          />
        )}

        {/* =====================================================
            OTHER PAGES
        ===================================================== */}

        {activePage !== "Dashboard" &&
          activePage !== "Vehicles" &&
          activePage !== "Drivers" &&
          activePage !== "Trips" &&
          activePage !== "Live Fleet" &&
          activePage !== "Maintenance" &&
          activePage !== "Fleet Health" &&
          activePage !== "AI Assistant" &&
          activePage !== "Analytics" && (

            <div className="page-placeholder">

              <div className="placeholder-icon">

        {activePage === "Analytics" && (
                  <BarChart3 size={30} />
                )}

              </div>

              <h3>
                {activePage}
              </h3>

              <p>
                This module is ready to be built.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  setActivePage("Dashboard")
                }
              >

                Back to Dashboard

              </button>

            </div>
          )}

      </main>

    </div>
  );
}


/* =====================================================
   ANALYTICS PAGE
===================================================== */

function AnalyticsPage({
  vehicles,
  trips,
  maintenance,
  loading,
  onBack,
}) {
  const totalDistance = trips.reduce(
    (sum, trip) => sum + (Number(trip.distance) || 0),
    0
  );

  const completedTrips = trips.filter(
    (trip) => trip.status?.toUpperCase() === "COMPLETED"
  ).length;
  const cancelledTrips = trips.filter(
    (trip) => trip.status?.toUpperCase() === "CANCELLED"
  ).length;
  const activeTrips = trips.filter(
    (trip) => trip.status?.toUpperCase() === "IN_PROGRESS"
  ).length;
  const plannedTrips = trips.filter(
    (trip) => trip.status?.toUpperCase() === "PLANNED"
  ).length;

  const maintenanceCost = maintenance.reduce(
    (sum, item) => sum + (Number(item.cost) || 0),
    0
  );

  const activeVehicles = vehicles.filter(
    (vehicle) => vehicle.status?.toUpperCase() === "ACTIVE"
  ).length;

  const utilization =
    vehicles.length > 0
      ? Math.round((activeTrips / vehicles.length) * 100)
      : 0;

  const completionRate =
    trips.length > 0 ? Math.round((completedTrips / trips.length) * 100) : 0;

  const statusData = [
    { name: "Completed", value: completedTrips, tone: "success" },
    { name: "In Progress", value: activeTrips, tone: "accent" },
    { name: "Planned", value: plannedTrips, tone: "warning" },
    { name: "Cancelled", value: cancelledTrips, tone: "danger" },
  ];

  const vehicleUsage = vehicles
    .map((vehicle) => {
      const registration = vehicle.registrationNumber?.toString().toLowerCase();
      const model = vehicle.model?.toString().toLowerCase();
      const count = trips.filter((trip) => {
        const tripVehicle = trip.vehicle?.toString().toLowerCase();
        return tripVehicle === registration || tripVehicle === model;
      }).length;

      return {
        name: vehicle.registrationNumber || vehicle.model || "Vehicle",
        trips: count,
      };
    })
    .sort((a, b) => b.trips - a.trips)
    .slice(0, 6);

  const mostUsed = vehicleUsage[0];
  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;

  return (
    <div className="analytics-page">
      <div className="analytics-hero">
        <div className="analytics-hero-copy">
          <div className="analytics-live-pill">
            <span className="analytics-live-dot" /> LIVE FLEET DATA
          </div>
          <p className="eyebrow">FLEET INTELLIGENCE / PERFORMANCE</p>
          <h3>Analytics that tell the fleet story.</h3>
          <p className="welcome-text">
            A clear operational view of trips, vehicles and maintenance — calculated directly from your database.
          </p>
        </div>

        <button className="analytics-back-button" onClick={onBack}>
          <ArrowUpRight size={17} />
          Back to Dashboard
        </button>
      </div>

      {loading ? (
        <div className="panel analytics-loading">
          <Activity size={22} />
          <strong>Loading fleet analytics...</strong>
        </div>
      ) : (
        <>
          <div className="analytics-section-heading">
            <div>
              <span>COMMAND CENTER</span>
              <h4>Performance snapshot</h4>
            </div>
            <small>{trips.length} trips · {vehicles.length} vehicles · {maintenance.length} service records</small>
          </div>

          <section className="analytics-stats-grid">
            <div className="analytics-stat-card analytics-stat-purple">
              <div className="analytics-stat-top">
                <span>Total Distance</span>
                <div className="analytics-stat-icon"><Navigation size={18} /></div>
              </div>
              <strong>{totalDistance.toLocaleString("en-IN")}<em> km</em></strong>
              <small>Across all recorded trips</small>
            </div>

            <div className="analytics-stat-card analytics-stat-green">
              <div className="analytics-stat-top">
                <span>Completed Trips</span>
                <div className="analytics-stat-icon"><CircleCheck size={18} /></div>
              </div>
              <strong>{completedTrips}<em> / {trips.length}</em></strong>
              <small>{completionRate}% completion rate</small>
            </div>

            <div className="analytics-stat-card analytics-stat-orange">
              <div className="analytics-stat-top">
                <span>Maintenance Spend</span>
                <div className="analytics-stat-icon"><Wrench size={18} /></div>
              </div>
              <strong>{formatCurrency(maintenanceCost)}</strong>
              <small>{maintenance.length} recorded service entries</small>
            </div>

            <div className="analytics-stat-card analytics-stat-blue">
              <div className="analytics-stat-top">
                <span>Fleet Utilization</span>
                <div className="analytics-stat-icon"><Gauge size={18} /></div>
              </div>
              <strong>{utilization}<em>%</em></strong>
              <small>{activeTrips} active trip{activeTrips === 1 ? "" : "s"} right now</small>
            </div>
          </section>

          <section className="analytics-main-grid">
            <div className="panel analytics-panel analytics-status-panel">
              <div className="panel-header analytics-panel-header">
                <div>
                  <p className="panel-label">TRIP PERFORMANCE</p>
                  <h4>Where your trips stand</h4>
                </div>
                <div className="analytics-header-icon"><Route size={18} /></div>
              </div>

              <div className="analytics-status-list">
                {statusData.map((item) => {
                  const percentage = trips.length > 0
                    ? Math.round((item.value / trips.length) * 100)
                    : 0;

                  return (
                    <div className="analytics-status-row" key={item.name}>
                      <div className="analytics-status-name">
                        <span className={`analytics-status-dot ${item.tone}`} />
                        <strong>{item.name}</strong>
                      </div>
                      <div className="analytics-progress">
                        <span className={item.tone} style={{ width: `${percentage}%` }} />
                      </div>
                      <div className="analytics-status-value">
                        <strong>{item.value}</strong>
                        <small>{percentage}%</small>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="analytics-completion-strip">
                <div>
                  <span>Completion rate</span>
                  <strong>{completionRate}%</strong>
                </div>
                <div className="analytics-mini-ring" style={{ "--ring": `${completionRate * 3.6}deg` }}>
                  <span>{completionRate}</span>
                </div>
              </div>
            </div>

            <div className="panel analytics-panel analytics-vehicle-panel">
              <div className="panel-header analytics-panel-header">
                <div>
                  <p className="panel-label">VEHICLE ACTIVITY</p>
                  <h4>Most used vehicles</h4>
                </div>
                <div className="analytics-header-icon"><Truck size={18} /></div>
              </div>

              <div className="analytics-vehicle-chart">
                {vehicleUsage.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vehicleUsage} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="trips" radius={[7, 7, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="analytics-empty-chart">
                    <Truck size={28} />
                    <strong>No vehicle activity yet</strong>
                    <span>Create a trip to start building the activity view.</span>
                  </div>
                )}
              </div>

              <div className="analytics-chart-footer">
                <span>Top vehicle</span>
                <strong>{mostUsed ? mostUsed.name : "—"}</strong>
                <small>{mostUsed ? `${mostUsed.trips} trip${mostUsed.trips === 1 ? "" : "s"}` : "No activity"}</small>
              </div>
            </div>
          </section>

          <section className="analytics-bottom-grid">
            <div className="panel analytics-panel">
              <div className="panel-header analytics-panel-header">
                <div>
                  <p className="panel-label">OPERATIONS</p>
                  <h4>Fleet command summary</h4>
                </div>
                <div className="analytics-header-icon"><Activity size={18} /></div>
              </div>

              <div className="analytics-summary-grid">
                <div><span>Total vehicles</span><strong>{vehicles.length}</strong></div>
                <div><span>Active vehicles</span><strong>{activeVehicles}</strong></div>
                <div><span>Active trips</span><strong>{activeTrips}</strong></div>
                <div><span>Service records</span><strong>{maintenance.length}</strong></div>
              </div>
            </div>

            <div className="panel analytics-panel analytics-cost-panel">
              <div className="panel-header analytics-panel-header">
                <div>
                  <p className="panel-label">MAINTENANCE</p>
                  <h4>Cost overview</h4>
                </div>
                <div className="analytics-header-icon"><Wrench size={18} /></div>
              </div>

              <div className="analytics-cost">
                <strong>{formatCurrency(maintenanceCost)}</strong>
                <span>Total recorded maintenance cost</span>
                <div className="analytics-cost-line">
                  <span style={{ width: maintenance.length > 0 ? `${Math.min(100, maintenance.length * 15)}%` : "0%" }} />
                </div>
                <small>{maintenance.length} maintenance record{maintenance.length === 1 ? "" : "s"}</small>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  title,
  target,
  suffix = "",
  decimals = 0,
  change,
  positive,
  icon,
  description,
}) {

  const [value, setValue] = useState(0);

  useEffect(() => {

    const duration = 1000;

    const startTime =
      performance.now();

    let animationFrame;

    const animate = (currentTime) => {

      const progress = Math.min(
        (currentTime - startTime) /
          duration,
        1
      );

      const eased =
        1 -
        Math.pow(
          1 - progress,
          3
        );

      setValue(
        target * eased
      );

      if (progress < 1) {

        animationFrame =
          requestAnimationFrame(
            animate
          );

      }

    };

    animationFrame =
      requestAnimationFrame(
        animate
      );

    return () => {
      cancelAnimationFrame(
        animationFrame
      );
    };

  }, [target]);

  return (
    <div className="stat-card">

      <div className="stat-top">

        <div className="stat-icon">
          {icon}
        </div>

        <span
          className={
            positive
              ? "change positive"
              : "change negative"
          }
        >

          {positive ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}

          {change}

        </span>

      </div>

      <div className="stat-value">

        {value.toFixed(decimals)}

        {suffix}

      </div>

      <div className="stat-bottom">

        <span>
          {title}
        </span>

        <small>
          {description}
        </small>

      </div>

    </div>
  );
}

/* =====================================================
   STATUS BADGE
===================================================== */

function StatusBadge({ status }) {

  const normalizedStatus =
    status
      ? status.toString().toUpperCase()
      : "UNKNOWN";

  let className =
    "status-badge";

  let displayStatus =
    normalizedStatus;

  if (normalizedStatus === "ACTIVE") {

    className =
      "status-badge status-active";

    displayStatus = "Active";

  }

  if (
    normalizedStatus === "IN SERVICE" ||
    normalizedStatus === "IN_SERVICE"
  ) {

    className =
      "status-badge status-service";

    displayStatus = "In Service";

  }

  if (
    normalizedStatus === "MAINTENANCE" ||
    normalizedStatus === "IN_MAINTENANCE"
  ) {

    className =
      "status-badge status-maintenance";

    displayStatus = "Maintenance";

  }

  if (normalizedStatus === "INACTIVE") {

    displayStatus = "Inactive";

  }

  return (
    <span className={className}>

      <i></i>

      {displayStatus}

    </span>
  );
}

/* =====================================================
   ACTIVITY ITEM
===================================================== */

function ActivityItem({
  icon,
  title,
  time,
}) {

  return (
    <div className="activity-item">

      <div className="activity-icon">
        {icon}
      </div>

      <div className="activity-content">

        <strong>
          {title}
        </strong>

        <span>
          {time}
        </span>

      </div>

    </div>
  );
}

export default App;

