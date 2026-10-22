import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Truck,
  Fuel,
  Gauge,
  User,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://localhost:8080/api/vehicles";
const emptyForm = {
  id: "",
  model: "",
  type: "Truck",
  status: "Active",
  driver: "",
  mileage: "",
  fuel: "Diesel",
};

// Convert backend status to UI status
function statusToUI(status) {
  if (!status) return "Active";

  const normalized = status.toUpperCase();

  if (normalized === "ACTIVE") return "Active";
  if (normalized === "IN_SERVICE") return "In Service";
  if (normalized === "MAINTENANCE") return "Maintenance";

  return status;
}

// Convert UI status to backend status
function statusToAPI(status) {
  if (status === "Active") return "ACTIVE";
  if (status === "In Service") return "IN_SERVICE";
  if (status === "Maintenance") return "MAINTENANCE";

  return status?.toUpperCase() || "ACTIVE";
}

// Convert backend vehicle to UI vehicle
function apiVehicleToUI(vehicle) {
  return {
    dbId: vehicle.id,
    id: vehicle.registrationNumber || "",
    model: vehicle.model || "",
    type: vehicle.vehicleType || "Truck",
    status: statusToUI(vehicle.status),
    driver: vehicle.driver || "Unassigned",
    mileage:
      vehicle.currentMileage !== null &&
      vehicle.currentMileage !== undefined
        ? `${Number(vehicle.currentMileage).toLocaleString()} km`
        : "0 km",
    fuel: vehicle.fuelType || "Diesel",
  };
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [form, setForm] = useState(emptyForm);

  // --------------------------------
  // LOAD VEHICLES
  // --------------------------------

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load vehicles");
      }

      const data = await response.json();

      setVehicles(data.map(apiVehicleToUI));
    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to the fleet server. Make sure Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  // --------------------------------
  // OPEN ADD MODAL
  // --------------------------------

  const openAddModal = () => {
    setEditingVehicle(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  // --------------------------------
  // OPEN EDIT MODAL
  // --------------------------------

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle.dbId);

    setForm({
      id: vehicle.id,
      model: vehicle.model,
      type: vehicle.type,
      status: vehicle.status,
      driver: vehicle.driver === "Unassigned" ? "" : vehicle.driver,
      mileage: vehicle.mileage.replace(/,/g, "").replace(" km", ""),
      fuel: vehicle.fuel,
    });

    setError("");
    setShowModal(true);
  };

  // --------------------------------
  // CLOSE MODAL
  // --------------------------------

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingVehicle(null);
    setForm(emptyForm);
  };

  // --------------------------------
  // FORM CHANGE
  // --------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------
  // SAVE VEHICLE
  // --------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id.trim()) {
      alert("Please enter registration number.");
      return;
    }

    if (!form.model.trim()) {
      alert("Please enter vehicle model.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const mileageNumber = Number(form.mileage) || 0;

      const payload = {
        registrationNumber: form.id.trim(),
        model: form.model.trim(),
        vehicleType: form.type,
        capacity: 0,
        fuelType: form.fuel,
        purchaseDate: null,
        currentMileage: mileageNumber,
        status: statusToAPI(form.status),
        driver: form.driver.trim(),
      };

      let response;

      if (editingVehicle) {
        response = await fetch(`${API_URL}/${editingVehicle}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
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
        const message = await response.text();
        throw new Error(message || "Failed to save vehicle");
      }

      await loadVehicles();

      setShowModal(false);
      setEditingVehicle(null);
      setForm(emptyForm);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save vehicle.");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------
  // DELETE VEHICLE
  // --------------------------------

  const handleDelete = async (vehicle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${vehicle.id}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(`${API_URL}/${vehicle.dbId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete vehicle");
      }

      await loadVehicles();
    } catch (err) {
      console.error(err);
      setError("Unable to delete vehicle.");
    }
  };

  // --------------------------------
  // FILTER VEHICLES
  // --------------------------------

  const filteredVehicles = vehicles.filter((vehicle) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      vehicle.id.toLowerCase().includes(search) ||
      vehicle.model.toLowerCase().includes(search) ||
      vehicle.driver.toLowerCase().includes(search);

    let matchesFilter = true;

    if (activeFilter === "Active") {
      matchesFilter = vehicle.status === "Active";
    }

    if (activeFilter === "In Service") {
      matchesFilter = vehicle.status === "In Service";
    }

    if (activeFilter === "Maintenance") {
      matchesFilter = vehicle.status === "Maintenance";
    }

    return matchesSearch && matchesFilter;
  });

  // --------------------------------
  // STATISTICS
  // --------------------------------

  const totalVehicles = vehicles.length;

  const activeVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "Active"
  ).length;

  const inServiceVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "In Service"
  ).length;

  const maintenanceVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "Maintenance"
  ).length;

  // --------------------------------
  // STATUS CLASS
  // --------------------------------

  const getStatusClass = (status) => {
    if (status === "Active") return "active";
    if (status === "In Service") return "in-service";
    if (status === "Maintenance") return "maintenance";

    return "";
  };

  // --------------------------------
  // LOADING SCREEN
  // --------------------------------

  if (loading) {
    return (
      <div className="vehicles-page">
        <div
          style={{
            minHeight: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <RefreshCw
            size={32}
            style={{
              animation: "vehicleSpin 1s linear infinite",
            }}
          />

          <p>Loading fleet vehicles...</p>
        </div>

        <style>
          {`
            @keyframes vehicleSpin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );
  }

  // --------------------------------
  // PAGE
  // --------------------------------

  return (
    <div className="vehicles-page">

      {/* HEADER */}

      <div className="vehicles-header">
        <div>
          <div className="page-eyebrow">FLEET MANAGEMENT</div>

          <h1>Vehicles</h1>

          <p>
            Monitor and manage your entire fleet from one place.
          </p>
        </div>

        <button
          className="add-vehicle-button"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Vehicle
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 16px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#fff1f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>

          <button
            onClick={loadVehicles}
            style={{
              marginLeft: "auto",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}

      <div className="vehicle-summary-grid">

        <div className="vehicle-summary-card">
          <div className="summary-icon">
            <Truck size={20} />
          </div>

          <div>
            <span>Total Vehicles</span>
            <strong>{totalVehicles}</strong>
          </div>
        </div>

        <div className="vehicle-summary-card">
          <div className="summary-icon green">
            <Gauge size={20} />
          </div>

          <div>
            <span>Active</span>
            <strong>{activeVehicles}</strong>
          </div>
        </div>

        <div className="vehicle-summary-card">
          <div className="summary-icon orange">
            <Truck size={20} />
          </div>

          <div>
            <span>In Service</span>
            <strong>{inServiceVehicles}</strong>
          </div>
        </div>

        <div className="vehicle-summary-card">
          <div className="summary-icon red">
            <AlertCircle size={20} />
          </div>

          <div>
            <span>Maintenance</span>
            <strong>{maintenanceVehicles}</strong>
          </div>
        </div>

      </div>

      {/* TOOLBAR */}

      <div className="vehicles-toolbar">

        <div className="vehicle-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search registration, model or driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="vehicle-filters">

          {["All", "Active", "In Service", "Maintenance"].map(
            (filter) => (
              <button
                key={filter}
                className={`vehicle-filter ${
                  activeFilter === filter ? "active" : ""
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            )
          )}

        </div>
      </div>

      {/* VEHICLE GRID */}

      {filteredVehicles.length === 0 ? (
        <div className="vehicle-empty-state">
          <Truck size={42} />

          <h3>No vehicles found</h3>

          <p>
            {vehicles.length === 0
              ? "Add your first vehicle to start managing your fleet."
              : "Try changing your search or filter."}
          </p>

          {vehicles.length === 0 && (
            <button
              className="add-vehicle-button"
              onClick={openAddModal}
            >
              <Plus size={18} />
              Add Vehicle
            </button>
          )}
        </div>
      ) : (
        <div className="vehicle-grid">

          {filteredVehicles.map((vehicle) => (
            <div
              className="vehicle-management-card"
              key={vehicle.dbId}
            >

              {/* CARD TOP */}

              <div className="vehicle-card-top">

                <div className="vehicle-main-icon">
                  <Truck size={26} />
                </div>

                <div className="vehicle-actions">

                  <button
                    title="Edit vehicle"
                    onClick={() => openEditModal(vehicle)}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    title="Delete vehicle"
                    onClick={() => handleDelete(vehicle)}
                  >
                    <Trash2 size={16} />
                  </button>

                </div>

              </div>

              {/* TITLE */}

              <div className="vehicle-card-title">
                <h3>{vehicle.model}</h3>

                <span
                  className={`vehicle-status ${getStatusClass(
                    vehicle.status
                  )}`}
                >
                  {vehicle.status}
                </span>
              </div>

              <div className="vehicle-registration">
                {vehicle.id}
              </div>

              {/* DETAILS */}

              <div className="vehicle-info-grid">

                <div>
                  <span>Driver</span>

                  <strong>
                    <User size={14} />
                    {vehicle.driver}
                  </strong>
                </div>

                <div>
                  <span>Fuel</span>

                  <strong>
                    <Fuel size={14} />
                    {vehicle.fuel}
                  </strong>
                </div>

                <div>
                  <span>Mileage</span>

                  <strong>
                    <Gauge size={14} />
                    {vehicle.mileage}
                  </strong>
                </div>

                <div>
                  <span>Type</span>

                  <strong>
                    <Truck size={14} />
                    {vehicle.type}
                  </strong>
                </div>

              </div>

              <button
                className="vehicle-details-button"
                onClick={() => openEditModal(vehicle)}
              >
                Manage Vehicle
              </button>

            </div>
          ))}

        </div>
      )}

      {/* ADD / EDIT MODAL */}

      {showModal && (
        <div className="vehicle-modal-overlay">

          <div className="vehicle-modal">

            {/* MODAL HEADER */}

            <div className="vehicle-modal-header">

              <div>
                <h2>
                  {editingVehicle
                    ? "Edit Vehicle"
                    : "Add New Vehicle"}
                </h2>

                <p>
                  {editingVehicle
                    ? "Update vehicle information"
                    : "Enter the vehicle details below"}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="modal-close-button"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>

              <div className="vehicle-form-grid">

                {/* REGISTRATION */}

                <div className="vehicle-form-group">
                  <label>
                    Registration Number
                  </label>

                  <input
                    name="id"
                    value={form.id}
                    onChange={handleChange}
                    placeholder="e.g. PB10AB1234"
                    disabled={Boolean(editingVehicle)}
                    required
                  />
                </div>

                {/* MODEL */}

                <div className="vehicle-form-group">
                  <label>
                    Vehicle Model
                  </label>

                  <input
                    name="model"
                    value={form.model}
                    onChange={handleChange}
                    placeholder="e.g. Tata 407"
                    required
                  />
                </div>

                {/* TYPE */}

                <div className="vehicle-form-group">
                  <label>
                    Vehicle Type
                  </label>

                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                  >
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Bus">Bus</option>
                    <option value="Car">Car</option>
                    <option value="Pickup">Pickup</option>
                    <option value="SUV">SUV</option>
                  </select>
                </div>

                {/* STATUS */}

                <div className="vehicle-form-group">
                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="In Service">
                      In Service
                    </option>

                    <option value="Maintenance">
                      Maintenance
                    </option>
                  </select>
                </div>

                {/* DRIVER */}

                <div className="vehicle-form-group">
                  <label>
                    Driver
                  </label>

                  <input
                    name="driver"
                    value={form.driver}
                    onChange={handleChange}
                    placeholder="e.g. ARSH"
                  />
                </div>

                {/* MILEAGE */}

                <div className="vehicle-form-group">
                  <label>
                    Current Mileage
                  </label>

                  <input
                    name="mileage"
                    type="number"
                    min="0"
                    value={form.mileage}
                    onChange={handleChange}
                    placeholder="e.g. 30240"
                  />
                </div>

                {/* FUEL */}

                <div className="vehicle-form-group">
                  <label>
                    Fuel Type
                  </label>

                  <select
                    name="fuel"
                    value={form.fuel}
                    onChange={handleChange}
                  >
                    <option value="Diesel">
                      Diesel
                    </option>

                    <option value="Petrol">
                      Petrol
                    </option>

                    <option value="CNG">
                      CNG
                    </option>

                    <option value="Electric">
                      Electric
                    </option>

                    <option value="Hybrid">
                      Hybrid
                    </option>
                  </select>
                </div>

              </div>

              {/* FORM ACTIONS */}

              <div className="vehicle-form-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-vehicle-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={16}
                        style={{
                          animation:
                            "vehicleSpin 1s linear infinite",
                        }}
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      {editingVehicle
                        ? "Update Vehicle"
                        : "Add Vehicle"}
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      <style>
        {`
          @keyframes vehicleSpin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

    </div>
  );
}