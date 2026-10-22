
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const VEHICLES_API = `${API_BASE_URL}/api/vehicles`;
export const TRIPS_API = `${API_BASE_URL}/api/trips`;
export const MAINTENANCE_API = `${API_BASE_URL}/api/maintenance`;
export const DRIVERS_API = `${API_BASE_URL}/api/drivers`;
