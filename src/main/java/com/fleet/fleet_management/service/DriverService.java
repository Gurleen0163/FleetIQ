package com.fleet.fleet_management.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fleet.fleet_management.entity.Driver;
import com.fleet.fleet_management.repository.DriverRepository;

@Service
public class DriverService {

    private final DriverRepository driverRepository;

    public DriverService(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public Driver createDriver(Driver driver) {
        return driverRepository.save(driver);
    }

    public Driver getDriverById(Long id) {
        return driverRepository.findById(id).orElse(null);
    }

    public Driver updateDriver(Long id, Driver driver) {

        Driver existingDriver = driverRepository.findById(id).orElse(null);

        if (existingDriver == null) {
            return null;
        }

        existingDriver.setName(driver.getName());
        existingDriver.setPhone(driver.getPhone());
        existingDriver.setEmail(driver.getEmail());
        existingDriver.setLicenseNumber(driver.getLicenseNumber());
        existingDriver.setStatus(driver.getStatus());
        existingDriver.setAssignedVehicle(driver.getAssignedVehicle());
        existingDriver.setTrips(driver.getTrips());
        existingDriver.setRating(driver.getRating());

        return driverRepository.save(existingDriver);
    }

    public void deleteDriver(Long id) {
        driverRepository.deleteById(id);
    }
}