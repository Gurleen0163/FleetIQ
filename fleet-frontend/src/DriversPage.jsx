
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

      const response = await fetch(DRIVERS_API);

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
