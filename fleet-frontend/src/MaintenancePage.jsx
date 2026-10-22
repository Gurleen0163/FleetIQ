import { MAINTENANCE_API, VEHICLES_API } from "./api";
import React, { useEffect, useState } from "react";



function MaintenancePage() {
  const [maintenance, setMaintenance] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [form, setForm] = useState({
    vehicle: "",
    maintenanceType: "Routine Service",
    description: "",
    serviceDate: "",
    nextServiceDate: "",
    cost: "",
    status: "SCHEDULED",
    serviceProvider: ""
  });

  // Load maintenance records
  const loadMaintenance = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setMaintenance(data);
    } catch (error) {
      console.error("Error loading maintenance:", error);
    }
  };

  // Load vehicles
  const loadVehicles = async () => {
    try {
      const response = await fetch(VEHICLES_API);
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error("Error loading vehicles:", error);
    }
  };

  useEffect(() => {
    loadMaintenance();
    loadVehicles();
  }, []);

  // Form input handler
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Open add modal
  const openAddModal = () => {
    setEditingId(null);

    setForm({
      vehicle: "",
      maintenanceType: "Routine Service",
      description: "",
      serviceDate: "",
      nextServiceDate: "",
      cost: "",
      status: "SCHEDULED",
      serviceProvider: ""
    });

    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (record) => {
    setEditingId(record.id);

    setForm({
      vehicle: record.vehicle || "",
      maintenanceType: record.maintenanceType || "Routine Service",
      description: record.description || "",
      serviceDate: record.serviceDate || "",
      nextServiceDate: record.nextServiceDate || "",
      cost: record.cost ?? "",
      status: record.status || "SCHEDULED",
      serviceProvider: record.serviceProvider || ""
    });

    setShowModal(true);
  };

  // Save maintenance
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      vehicle: form.vehicle,
      maintenanceType: form.maintenanceType,
      description: form.description,
      serviceDate: form.serviceDate || null,
      nextServiceDate: form.nextServiceDate || null,
      cost: form.cost === "" ? 0 : Number(form.cost),
      status: form.status,
      serviceProvider: form.serviceProvider
    };

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to save maintenance record");
      }

      setShowModal(false);
      setEditingId(null);

      await loadMaintenance();

    } catch (error) {
      console.error("Error saving maintenance:", error);
      alert("Unable to save maintenance record.");
    }
  };

  // Delete maintenance
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this maintenance record?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      await loadMaintenance();

    } catch (error) {
      console.error("Error deleting maintenance:", error);
      alert("Unable to delete maintenance record.");
    }
  };

  // Filter records
  const filteredMaintenance = maintenance.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      (item.vehicle || "").toLowerCase().includes(searchText) ||
      (item.maintenanceType || "").toLowerCase().includes(searchText) ||
      (item.serviceProvider || "").toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "ALL" ||
      item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Dashboard statistics
  const totalRecords = maintenance.length;

  const scheduledCount = maintenance.filter(
    (item) => item.status === "SCHEDULED"
  ).length;

  const completedCount = maintenance.filter(
    (item) => item.status === "COMPLETED"
  ).length;

  const overdueCount = maintenance.filter(
    (item) => item.status === "OVERDUE"
  ).length;

  const totalCost = maintenance.reduce(
    (sum, item) => sum + Number(item.cost || 0),
    0
  );

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Maintenance</h1>
          <p>Track vehicle servicing, costs and upcoming maintenance</p>
        </div>

        <button
          className="primary-btn"
          onClick={openAddModal}
        >
          + Add Maintenance
        </button>
      </div>

      {/* Statistics */}
      <div className="stats-grid">

        <div className="stat-card">
          <span>Total Records</span>
          <strong>{totalRecords}</strong>
        </div>

        <div className="stat-card">
          <span>Scheduled</span>
          <strong>{scheduledCount}</strong>
        </div>

        <div className="stat-card">
          <span>Completed</span>
          <strong>{completedCount}</strong>
        </div>

        <div className="stat-card">
          <span>Overdue</span>
          <strong>{overdueCount}</strong>
        </div>

        <div className="stat-card">
          <span>Total Cost</span>
          <strong>₹{totalCost.toLocaleString("en-IN")}</strong>
        </div>

      </div>

      {/* Filters */}
      <div className="filter-bar">

        <input
          type="text"
          placeholder="Search vehicle, maintenance type or provider..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="OVERDUE">Overdue</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

      </div>

      {/* Maintenance Table */}
      <div className="table-container">

        <table>

          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Maintenance Type</th>
              <th>Service Date</th>
              <th>Next Service</th>
              <th>Cost</th>
              <th>Provider</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {filteredMaintenance.length === 0 ? (

              <tr>
                <td colSpan="8" className="empty-state">
                  No maintenance records found.
                </td>
              </tr>

            ) : (

              filteredMaintenance.map((item) => (

                <tr key={item.id}>

                  <td>
                    <strong>{item.vehicle || "—"}</strong>
                  </td>

                  <td>{item.maintenanceType || "—"}</td>

                  <td>{item.serviceDate || "—"}</td>

                  <td>{item.nextServiceDate || "—"}</td>

                  <td>
                    ₹{Number(item.cost || 0).toLocaleString("en-IN")}
                  </td>

                  <td>{item.serviceProvider || "—"}</td>

                  <td>
                    <span className={`status-badge ${(
                      item.status || ""
                    ).toLowerCase()}`}>
                      {item.status || "—"}
                    </span>
                  </td>

                  <td>

                    <button
                      className="action-btn"
                      onClick={() => openEditModal(item)}
                    >
                      Edit
                    </button>

                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* Add/Edit Modal */}
      {showModal && (

        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editingId
                    ? "Edit Maintenance"
                    : "Add Maintenance"}
                </h2>

                <p>
                  Enter vehicle servicing details
                </p>
              </div>

              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              {/* Vehicle */}
              <div className="form-group">

                <label>Vehicle *</label>

                <select
                  name="vehicle"
                  value={form.vehicle}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Vehicle
                  </option>

                  {vehicles.map((vehicle) => (
                    <option
                      key={vehicle.id}
                      value={vehicle.registrationNumber}
                    >
                      {vehicle.registrationNumber} — {vehicle.model}
                    </option>
                  ))}

                </select>

              </div>

              {/* Maintenance Type */}
              <div className="form-group">

                <label>Maintenance Type *</label>

                <select
                  name="maintenanceType"
                  value={form.maintenanceType}
                  onChange={handleChange}
                  required
                >
                  <option value="Routine Service">
                    Routine Service
                  </option>

                  <option value="Oil Change">
                    Oil Change
                  </option>

                  <option value="Brake Service">
                    Brake Service
                  </option>

                  <option value="Tyre Replacement">
                    Tyre Replacement
                  </option>

                  <option value="Engine Repair">
                    Engine Repair
                  </option>

                  <option value="Battery">
                    Battery
                  </option>

                  <option value="Inspection">
                    Inspection
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

              {/* Description */}
              <div className="form-group">

                <label>Description</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the maintenance work..."
                  rows="3"
                />

              </div>

              {/* Dates */}
              <div className="form-row">

                <div className="form-group">

                  <label>Service Date</label>

                  <input
                    type="date"
                    name="serviceDate"
                    value={form.serviceDate}
                    onChange={handleChange}
                  />

                </div>

                <div className="form-group">

                  <label>Next Service Date</label>

                  <input
                    type="date"
                    name="nextServiceDate"
                    value={form.nextServiceDate}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* Cost + Provider */}
              <div className="form-row">

                <div className="form-group">

                  <label>Cost (₹)</label>

                  <input
                    type="number"
                    name="cost"
                    value={form.cost}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                  />

                </div>

                <div className="form-group">

                  <label>Service Provider</label>

                  <input
                    type="text"
                    name="serviceProvider"
                    value={form.serviceProvider}
                    onChange={handleChange}
                    placeholder="Garage / Service Center"
                  />

                </div>

              </div>

              {/* Status */}
              <div className="form-group">

                <label>Status *</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                >
                  <option value="SCHEDULED">
                    Scheduled
                  </option>

                  <option value="IN_PROGRESS">
                    In Progress
                  </option>

                  <option value="COMPLETED">
                    Completed
                  </option>

                  <option value="OVERDUE">
                    Overdue
                  </option>

                  <option value="CANCELLED">
                    Cancelled
                  </option>

                </select>

              </div>

              {/* Buttons */}
              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                >
                  {editingId
                    ? "Update Maintenance"
                    : "Add Maintenance"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default MaintenancePage;