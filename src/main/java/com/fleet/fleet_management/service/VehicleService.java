package com.fleet.fleet_management.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fleet.fleet_management.entity.Vehicle;
import com.fleet.fleet_management.repository.VehicleRepository;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle createVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id).orElse(null);
    }

    public Vehicle updateVehicle(Long id, Vehicle vehicle) {
        Vehicle existingVehicle = vehicleRepository.findById(id).orElse(null);

        if (existingVehicle == null) {
            return null;
        }

        existingVehicle.setRegistrationNumber(vehicle.getRegistrationNumber());
        existingVehicle.setModel(vehicle.getModel());
        existingVehicle.setVehicleType(vehicle.getVehicleType());
        existingVehicle.setCapacity(vehicle.getCapacity());
        existingVehicle.setFuelType(vehicle.getFuelType());
        existingVehicle.setPurchaseDate(vehicle.getPurchaseDate());

        existingVehicle.setCurrentMileage(vehicle.getCurrentMileage());
existingVehicle.setStatus(vehicle.getStatus());
existingVehicle.setDriver(vehicle.getDriver());

        return vehicleRepository.save(existingVehicle);
    }

    public void deleteVehicle(Long id) {
        vehicleRepository.deleteById(id);
    }
}