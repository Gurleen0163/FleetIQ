import { TRIPS_API } from "./api";
import { useEffect, useState } from "react";
import {
  Route,
  Plus,
  Search,
  Pencil,
  Trash2,
  MapPin,
  Truck,
  UserRound,
  CalendarDays,
  Gauge,
  X,
} from "lucide-react";


const emptyForm = {
  tripNumber: "",
  vehicle: "",
  driver: "",
  origin: "",
  destination: "",
  tripDate: "",
  distance: "",
  status: "PLANNED",
};

function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load trips");
      }

      const data = await response.json();

      setTrips(data);
    } catch (err) {
      console.error("Trips API Error:", err);
      setError("Unable to connect to the trip server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setEditingTrip(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (trip) => {
    setEditingTrip(trip);

    setForm({
      tripNumber: trip.tripNumber || "",
      vehicle: trip.vehicle || "",
      driver: trip.driver || "",
      origin: trip.origin || "",
      destination: trip.destination || "",
      tripDate: trip.tripDate || "",
      distance: trip.distance ?? "",
      status: trip.status || "PLANNED",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTrip(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      tripNumber: form.tripNumber,
      vehicle: form.vehicle,
      driver: form.driver,
      origin: form.origin,
      destination: form.destination,
      tripDate: form.tripDate || null,
      distance:
        form.distance === ""
          ? 0
          : Number(form.distance),
      status: form.status,
    };

    try {
      let response;

      if (editingTrip) {
        response = await fetch(
          `${API_URL}/${editingTrip.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        throw new Error("Failed to save trip");
      }

      closeModal();
      await loadTrips();
    } catch (err) {
      console.error("Save Trip Error:", err);

      alert(
        "Unable to save trip. Please check the backend."
      );
    }
  };

  const deleteTrip = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this trip?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete trip");
      }

      await loadTrips();
    } catch (err) {
      console.error("Delete Trip Error:", err);

      alert("Unable to delete trip.");
    }
  };

  const filteredTrips = trips.filter((trip) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      return true;
    }

    return (
      (trip.tripNumber || "")
        .toLowerCase()
        .includes(search) ||
      (trip.vehicle || "")
        .toLowerCase()
        .includes(search) ||
      (trip.driver || "")
        .toLowerCase()
        .includes(search) ||
      (trip.origin || "")
        .toLowerCase()
        .includes(search) ||
      (trip.destination || "")
        .toLowerCase()
        .includes(search)
    );
  });

  const totalTrips = trips.length;

  const activeTrips = trips.filter(
    (trip) =>
      trip.status === "IN_PROGRESS"
  ).length;

  const completedTrips = trips.filter(
    (trip) =>
      trip.status === "COMPLETED"
  ).length;

  const totalDistance = trips.reduce(
    (sum, trip) =>
      sum + Number(trip.distance || 0),
    0
  );

  const formatStatus = (status) => {
    if (status === "IN_PROGRESS") {
      return "In Progress";
    }

    if (status === "COMPLETED") {
      return "Completed";
    }

    if (status === "CANCELLED") {
      return "Cancelled";
    }

    if (status === "PLANNED") {
      return "Planned";
    }

    return status || "Unknown";
  };

  const getStatusClass = (status) => {
    if (status === "IN_PROGRESS") {
      return "status-active";
    }

    if (status === "COMPLETED") {
      return "status-service";
    }

    if (status === "CANCELLED") {
      return "status-maintenance";
    }

    return "status-service";
  };

  return (
    <div className="dashboard-content">

      {/* HEADER */}

      <section className="welcome-row">
        <div>
          <p className="eyebrow">
            TRIP OPERATIONS
          </p>

          <h3>
            Trip Management
          </h3>

          <p className="welcome-text">
            Plan, monitor and manage
            journeys across your fleet.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Trip
        </button>
      </section>

      {error && (
        <div
          style={{
            marginBottom: "18px",
            padding: "13px 16px",
            borderRadius: "10px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          {error}
        </div>
      )}

      {/* STATS */}

      <section className="stats-grid">

        <TripStatCard
          title="Total Trips"
          value={totalTrips}
          icon={<Route size={20} />}
        />

        <TripStatCard
          title="In Progress"
          value={activeTrips}
          icon={<Gauge size={20} />}
        />

        <TripStatCard
          title="Completed"
          value={completedTrips}
          icon={<MapPin size={20} />}
        />

        <TripStatCard
          title="Total Distance"
          value={totalDistance.toFixed(0)}
          suffix=" km"
          icon={<Truck size={20} />}
        />

      </section>

      {/* TABLE */}

      <section className="panel vehicle-panel">

        <div className="panel-header">

          <div>
            <p className="panel-label">
              TRIP DIRECTORY
            </p>

            <h4>
              Fleet Trips
            </h4>
          </div>

          <div className="search-box">

            <Search size={17} />

            <input
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search trips..."
            />

          </div>

        </div>

        <div
          className="vehicle-table"
          style={{
            overflowX: "auto",
          }}
        >

          <div
            className="table-head"
            style={{
              minWidth: "900px",
              gridTemplateColumns:
                "1.1fr 1fr 1fr 1.2fr 1.2fr 1fr 0.8fr",
            }}
          >
            <span>TRIP</span>
            <span>VEHICLE</span>
            <span>DRIVER</span>
            <span>ROUTE</span>
            <span>DATE</span>
            <span>STATUS</span>
            <span>ACTIONS</span>
          </div>

          {loading ? (
            <div
              style={{
                padding: "45px",
                textAlign: "center",
                color: "#7b8494",
                fontSize: "13px",
              }}
            >
              Loading trip data...
            </div>
          ) : filteredTrips.length === 0 ? (
            <div
              style={{
                padding: "55px 30px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "58px",
                  height: "58px",
                  borderRadius: "16px",
                  margin: "0 auto 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "rgba(99, 102, 241, 0.08)",
                  color: "#6366f1",
                }}
              >
                <Route size={26} />
              </div>

              <strong
                style={{
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                No trips found
              </strong>

              <span
                style={{
                  color: "#7b8494",
                  fontSize: "13px",
                }}
              >
                Add your first trip
                to start tracking fleet
                journeys.
              </span>
            </div>
          ) : (
            filteredTrips.map((trip) => (
              <div
                className="table-row"
                key={trip.id}
                style={{
                  minWidth: "900px",
                  gridTemplateColumns:
                    "1.1fr 1fr 1fr 1.2fr 1.2fr 1fr 0.8fr",
                }}
              >

                {/* TRIP */}

                <div className="vehicle-name">

                  <div className="vehicle-icon">
                    <Route size={17} />
                  </div>

                  <div>
                    <strong>
                      {trip.tripNumber}
                    </strong>

                    <span>
                      {Number(
                        trip.distance || 0
                      ).toFixed(0)}{" "}
                      km
                    </span>
                  </div>

                </div>

                {/* VEHICLE */}

                <span className="driver-name">
                  <Truck
                    size={14}
                    style={{
                      marginRight: "6px",
                      verticalAlign:
                        "middle",
                    }}
                  />

                  {trip.vehicle ||
                    "Unassigned"}
                </span>

                {/* DRIVER */}

                <span className="driver-name">
                  <UserRound
                    size={14}
                    style={{
                      marginRight: "6px",
                      verticalAlign:
                        "middle",
                    }}
                  />

                  {trip.driver ||
                    "Unassigned"}
                </span>

                {/* ROUTE */}

                <div
                  style={{
                    display: "flex",
                    flexDirection:
                      "column",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    {trip.origin ||
                      "Unknown"}
                  </span>

                  <span
                    style={{
                      fontSize: "11px",
                      color: "#8b93a1",
                    }}
                  >
                    →{" "}
                    {trip.destination ||
                      "Unknown"}
                  </span>
                </div>

                {/* DATE */}

                <span className="driver-name">
                  <CalendarDays
                    size={14}
                    style={{
                      marginRight: "6px",
                      verticalAlign:
                        "middle",
                    }}
                  />

                  {trip.tripDate ||
                    "Not scheduled"}
                </span>

                {/* STATUS */}

                <span
                  className={`status-badge ${getStatusClass(
                    trip.status
                  )}`}
                >
                  <i></i>

                  {formatStatus(
                    trip.status
                  )}
                </span>

                {/* ACTIONS */}

                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                  }}
                >
                  <button
                    className="more-button"
                    title="Edit trip"
                    onClick={() =>
                      openEditModal(trip)
                    }
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    className="more-button"
                    title="Delete trip"
                    onClick={() =>
                      deleteTrip(trip.id)
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            ))
          )}

        </div>
      </section>

      {/* MODAL */}

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(5px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "700px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "20px",
              boxShadow:
                "0 25px 80px rgba(0,0,0,0.18)",
            }}
          >

            <div
              style={{
                padding: "22px 24px",
                borderBottom:
                  "1px solid #edf0f4",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
              }}
            >

              <div>
                <p
                  className="panel-label"
                  style={{
                    marginBottom: "4px",
                  }}
                >
                  TRIP MANAGEMENT
                </p>

                <h4 style={{ margin: 0 }}>
                  {editingTrip
                    ? "Edit Trip"
                    : "Add Trip"}
                </h4>
              </div>

              <button
                className="more-button"
                onClick={closeModal}
              >
                <X size={19} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              style={{
                padding: "24px",
              }}
            >

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "16px",
                }}
              >

                <FormField
                  label="Trip Number"
                  name="tripNumber"
                  value={form.tripNumber}
                  onChange={handleChange}
                  placeholder="e.g. TRP-001"
                  required
                />

                <FormField
                  label="Vehicle"
                  name="vehicle"
                  value={form.vehicle}
                  onChange={handleChange}
                  placeholder="e.g. PB10AB1234"
                  required
                />

                <FormField
                  label="Driver"
                  name="driver"
                  value={form.driver}
                  onChange={handleChange}
                  placeholder="e.g. Gurleen Kaur"
                  required
                />

                <FormField
                  label="Trip Date"
                  name="tripDate"
                  value={form.tripDate}
                  onChange={handleChange}
                  type="date"
                  required
                />

                <FormField
                  label="Origin"
                  name="origin"
                  value={form.origin}
                  onChange={handleChange}
                  placeholder="e.g. Ludhiana"
                  required
                />

                <FormField
                  label="Destination"
                  name="destination"
                  value={form.destination}
                  onChange={handleChange}
                  placeholder="e.g. Chandigarh"
                  required
                />

                <FormField
                  label="Distance (km)"
                  name="distance"
                  value={form.distance}
                  onChange={handleChange}
                  placeholder="e.g. 105"
                  type="number"
                  min="0"
                  step="0.1"
                />

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#394150",
                    }}
                  >
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "11px 12px",
                      border:
                        "1px solid #dfe3e8",
                      borderRadius: "9px",
                      outline: "none",
                      fontSize: "13px",
                      background: "#ffffff",
                    }}
                  >
                    <option value="PLANNED">
                      Planned
                    </option>

                    <option value="IN_PROGRESS">
                      In Progress
                    </option>

                    <option value="COMPLETED">
                      Completed
                    </option>

                    <option value="CANCELLED">
                      Cancelled
                    </option>
                  </select>
                </div>

              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "24px",
                  paddingTop: "18px",
                  borderTop:
                    "1px solid #edf0f4",
                }}
              >

                <button
                  type="button"
                  className="more-button"
                  onClick={closeModal}
                  style={{
                    padding: "10px 18px",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  <Plus size={17} />

                  {editingTrip
                    ? "Save Changes"
                    : "Add Trip"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

function TripStatCard({
  title,
  value,
  suffix = "",
  icon,
}) {
  return (
    <div className="stat-card">

      <div className="stat-top">

        <div className="stat-icon">
          {icon}
        </div>

        <span className="change positive">
          LIVE
        </span>

      </div>

      <div className="stat-value">
        {value}
        {suffix}
      </div>

      <div className="stat-bottom">

        <span>
          {title}
        </span>

        <small>
          from database
        </small>

      </div>

    </div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
  step,
}) {
  return (
    <div>

      <label
        style={{
          display: "block",
          marginBottom: "7px",
          fontSize: "12px",
          fontWeight: "700",
          color: "#394150",
        }}
      >
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "11px 12px",
          border: "1px solid #dfe3e8",
          borderRadius: "9px",
          outline: "none",
          fontSize: "13px",
        }}
      />

    </div>
  );
}

export default TripsPage;