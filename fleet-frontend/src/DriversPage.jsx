import { DRIVERS_API } from "./api";
import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Truck,
  Star,
  X,
  UserRound,
} from "lucide-react";


const emptyForm = {
  id: "",
  name: "",
  phone: "",
  email: "",
  licenseNumber: "",
  status: "ACTIVE",
  assignedVehicle: "",
  trips: "",
  rating: "",
};

function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const [form, setForm] = useState(emptyForm);

  /* =========================
     LOAD DRIVERS
  ========================= */

  const loadDrivers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load drivers");
      }

      const data = await response.json();

      setDrivers(data);
    } catch (err) {
      console.error("Drivers API Error:", err);
      setError("Unable to connect to the driver server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  /* =========================
     FORM HANDLING
  ========================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setEditingDriver(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (driver) => {
    setEditingDriver(driver);

    setForm({
      id: driver.id || "",
      name: driver.name || "",
      phone: driver.phone || "",
      email: driver.email || "",
      licenseNumber: driver.licenseNumber || "",
      status: driver.status || "ACTIVE",
      assignedVehicle: driver.assignedVehicle || "",
      trips: driver.trips ?? "",
      rating: driver.rating ?? "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDriver(null);
    setForm(emptyForm);
  };

  /* =========================
     SAVE DRIVER
  ========================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      licenseNumber: form.licenseNumber,
      status: form.status,
      assignedVehicle:
        form.assignedVehicle || "",
      trips:
        form.trips === ""
          ? 0
          : Number(form.trips),
      rating:
        form.rating === ""
          ? 0
          : Number(form.rating),
    };

    try {
      let response;

      if (editingDriver) {
        response = await fetch(
          `${API_URL}/${editingDriver.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        throw new Error(
          "Failed to save driver"
        );
      }

      closeModal();
      await loadDrivers();
    } catch (err) {
      console.error(
        "Save Driver Error:",
        err
      );

      alert(
        "Unable to save driver. Please check the backend."
      );
    }
  };

  /* =========================
     DELETE DRIVER
  ========================= */

  const deleteDriver = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this driver?"
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
        throw new Error(
          "Failed to delete driver"
        );
      }

      await loadDrivers();
    } catch (err) {
      console.error(
        "Delete Driver Error:",
        err
      );

      alert(
        "Unable to delete driver."
      );
    }
  };

  /* =========================
     SEARCH
  ========================= */

  const filteredDrivers =
    drivers.filter((driver) => {
      const search =
        searchTerm
          .toLowerCase()
          .trim();

      if (!search) {
        return true;
      }

      return (
        (driver.name || "")
          .toLowerCase()
          .includes(search) ||
        (driver.phone || "")
          .toLowerCase()
          .includes(search) ||
        (driver.email || "")
          .toLowerCase()
          .includes(search) ||
        (driver.licenseNumber || "")
          .toLowerCase()
          .includes(search) ||
        (driver.assignedVehicle || "")
          .toLowerCase()
          .includes(search)
      );
    });

  /* =========================
     STATS
  ========================= */

  const totalDrivers = drivers.length;

  const activeDrivers =
    drivers.filter(
      (driver) =>
        driver.status === "ACTIVE"
    ).length;

  const onTripDrivers =
    drivers.filter(
      (driver) =>
        driver.status === "ON_TRIP"
    ).length;

  const averageRating =
    drivers.length > 0
      ? (
          drivers.reduce(
            (sum, driver) =>
              sum +
              Number(
                driver.rating || 0
              ),
            0
          ) / drivers.length
        ).toFixed(1)
      : "0.0";

  /* =========================
     STATUS
  ========================= */

  const formatStatus = (status) => {
    if (status === "ON_TRIP") {
      return "On Trip";
    }

    if (status === "ACTIVE") {
      return "Active";
    }

    if (status === "OFFLINE") {
      return "Offline";
    }

    return status || "Unknown";
  };

  const getStatusClass = (status) => {
    if (status === "ACTIVE") {
      return "status-active";
    }

    if (status === "ON_TRIP") {
      return "status-service";
    }

    return "status-maintenance";
  };

  return (
    <div className="dashboard-content">

      {/* =========================
          HEADER
      ========================= */}

      <section className="welcome-row">

        <div>
          <p className="eyebrow">
            DRIVER OPERATIONS
          </p>

          <h3>
            Driver Management
          </h3>

          <p className="welcome-text">
            Monitor your drivers,
            assignments and performance
            across the fleet.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Driver
        </button>

      </section>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div
          style={{
            marginBottom: "18px",
            padding: "13px 16px",
            borderRadius: "10px",
            background: "#fef2f2",
            border:
              "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          {error}
        </div>
      )}

      {/* =========================
          STATS
      ========================= */}

      <section className="stats-grid">

        <DriverStatCard
          title="Total Drivers"
          value={totalDrivers}
          icon={<Users size={20} />}
        />

        <DriverStatCard
          title="Active Drivers"
          value={activeDrivers}
          icon={
            <UserRound size={20} />
          }
        />

        <DriverStatCard
          title="On Trip"
          value={onTripDrivers}
          icon={<Truck size={20} />}
        />

        <DriverStatCard
          title="Average Rating"
          value={averageRating}
          suffix="/ 5"
          icon={<Star size={20} />}
        />

      </section>

      {/* =========================
          DRIVER PANEL
      ========================= */}

      <section className="panel vehicle-panel">

        <div className="panel-header">

          <div>
            <p className="panel-label">
              DRIVER DIRECTORY
            </p>

            <h4>
              Fleet Drivers
            </h4>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div className="search-box">
              <Search size={17} />

              <input
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search drivers..."
              />
            </div>
          </div>

        </div>

        {/* =========================
            TABLE
        ========================= */}

        <div className="vehicle-table">

          <div className="table-head">

            <span>
              DRIVER
            </span>

            <span>
              CONTACT
            </span>

            <span>
              VEHICLE
            </span>

            <span>
              STATUS
            </span>

            <span>
              PERFORMANCE
            </span>

            <span>
              ACTIONS
            </span>

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
              Loading driver data...
            </div>

          ) : filteredDrivers.length ===
            0 ? (

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
                  justifyContent:
                    "center",
                  background:
                    "rgba(99, 102, 241, 0.08)",
                  color: "#6366f1",
                }}
              >
                <Users size={26} />
              </div>

              <strong
                style={{
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                No drivers found
              </strong>

              <span
                style={{
                  color: "#7b8494",
                  fontSize: "13px",
                }}
              >
                Add your first driver
                to start managing driver
                operations.
              </span>

            </div>

          ) : (

            filteredDrivers.map(
              (driver) => (

                <div
                  className="table-row"
                  key={driver.id}
                >

                  {/* DRIVER */}

                  <div className="vehicle-name">

                    <div
                      className="vehicle-icon"
                    >
                      <UserRound
                        size={17}
                      />
                    </div>

                    <div>

                      <strong>
                        {driver.name}
                      </strong>

                      <span>
                        {driver.licenseNumber ||
                          "No license added"}
                      </span>

                    </div>

                  </div>

                  {/* CONTACT */}

                  <div
                    style={{
                      display: "flex",
                      flexDirection:
                        "column",
                      gap: "4px",
                    }}
                  >

                    <span className="driver-name">
                      <Phone
                        size={13}
                        style={{
                          marginRight:
                            "5px",
                          verticalAlign:
                            "middle",
                        }}
                      />

                      {driver.phone ||
                        "No phone"}
                    </span>

                    <span
                      style={{
                        fontSize:
                          "11px",
                        color:
                          "#8b93a1",
                      }}
                    >
                      <Mail
                        size={12}
                        style={{
                          marginRight:
                            "5px",
                          verticalAlign:
                            "middle",
                        }}
                      />

                      {driver.email ||
                        "No email"}
                    </span>

                  </div>

                  {/* VEHICLE */}

                  <span className="driver-name">

                    <Truck
                      size={14}
                      style={{
                        marginRight:
                          "6px",
                        verticalAlign:
                          "middle",
                      }}
                    />

                    {driver.assignedVehicle ||
                      "Unassigned"}

                  </span>

                  {/* STATUS */}

                  <span
                    className={`status-badge ${getStatusClass(
                      driver.status
                    )}`}
                  >
                    <i></i>
                    {formatStatus(
                      driver.status
                    )}
                  </span>

                  {/* PERFORMANCE */}

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
                        fontWeight: "700",
                        fontSize:
                          "13px",
                      }}
                    >
                      <Star
                        size={13}
                        fill="currentColor"
                        style={{
                          marginRight:
                            "4px",
                          verticalAlign:
                            "middle",
                        }}
                      />

                      {Number(
                        driver.rating || 0
                      ).toFixed(1)}
                    </span>

                    <span
                      style={{
                        fontSize:
                          "11px",
                        color:
                          "#8b93a1",
                      }}
                    >
                      {driver.trips ||
                        0}{" "}
                      trips
                    </span>

                  </div>

                  {/* ACTIONS */}

                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                    }}
                  >

                    <button
                      className="more-button"
                      title="Edit driver"
                      onClick={() =>
                        openEditModal(
                          driver
                        )
                      }
                    >
                      <Pencil
                        size={16}
                      />
                    </button>

                    <button
                      className="more-button"
                      title="Delete driver"
                      onClick={() =>
                        deleteDriver(
                          driver.id
                        )
                      }
                    >
                      <Trash2
                        size={16}
                      />
                    </button>

                  </div>

                </div>

              )
            )

          )}

        </div>

      </section>

      {/* =========================
          ADD / EDIT MODAL
      ========================= */}

      {showModal && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.45)",
            backdropFilter:
              "blur(5px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            padding: "20px",
          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "650px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "20px",
              boxShadow:
                "0 25px 80px rgba(0,0,0,0.18)",
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                padding:
                  "22px 24px",
                borderBottom:
                  "1px solid #edf0f4",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
              }}
            >

              <div>

                <p
                  className="panel-label"
                  style={{
                    marginBottom:
                      "4px",
                  }}
                >
                  DRIVER MANAGEMENT
                </p>

                <h4
                  style={{
                    margin: 0,
                  }}
                >
                  {editingDriver
                    ? "Edit Driver"
                    : "Add Driver"}
                </h4>

              </div>

              <button
                className="more-button"
                onClick={closeModal}
              >
                <X size={19} />
              </button>

            </div>

            {/* FORM */}

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
                  label="Driver Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Arjun Singh"
                  required
                />

                <FormField
                  label="Phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                />

                <FormField
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="driver@example.com"
                  type="email"
                />

                <FormField
                  label="License Number"
                  name="licenseNumber"
                  value={
                    form.licenseNumber
                  }
                  onChange={handleChange}
                  placeholder="e.g. PB123456789"
                />

                <div>

                  <label
                    style={{
                      display: "block",
                      marginBottom:
                        "7px",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#394150",
                    }}
                  >
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleChange
                    }
                    style={{
                      width: "100%",
                      padding:
                        "11px 12px",
                      border:
                        "1px solid #dfe3e8",
                      borderRadius:
                        "9px",
                      outline: "none",
                      fontSize:
                        "13px",
                      background:
                        "#ffffff",
                    }}
                  >
                    <option value="ACTIVE">
                      Active
                    </option>

                    <option value="ON_TRIP">
                      On Trip
                    </option>

                    <option value="OFFLINE">
                      Offline
                    </option>
                  </select>

                </div>

                <FormField
                  label="Assigned Vehicle"
                  name="assignedVehicle"
                  value={
                    form.assignedVehicle
                  }
                  onChange={handleChange}
                  placeholder="e.g. PB10AB1234"
                />

                <FormField
                  label="Total Trips"
                  name="trips"
                  value={form.trips}
                  onChange={handleChange}
                  placeholder="0"
                  type="number"
                  min="0"
                />

                <FormField
                  label="Rating"
                  name="rating"
                  value={form.rating}
                  onChange={handleChange}
                  placeholder="4.8"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                />

              </div>

              {/* BUTTONS */}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: "10px",
                  marginTop: "24px",
                  paddingTop:
                    "18px",
                  borderTop:
                    "1px solid #edf0f4",
                }}
              >

                <button
                  type="button"
                  className="more-button"
                  onClick={closeModal}
                  style={{
                    padding:
                      "10px 18px",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  <Plus size={17} />

                  {editingDriver
                    ? "Save Changes"
                    : "Add Driver"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

/* =========================
   DRIVER STAT CARD
========================= */

function DriverStatCard({
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

/* =========================
   FORM FIELD
========================= */

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
  max,
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
        max={max}
        step={step}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "11px 12px",
          border:
            "1px solid #dfe3e8",
          borderRadius: "9px",
          outline: "none",
          fontSize: "13px",
        }}
      />

    </div>
  );
}

export default DriversPage;