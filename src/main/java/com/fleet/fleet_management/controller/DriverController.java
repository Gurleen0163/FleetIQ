package com.fleet.fleet_management.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fleet.fleet_management.entity.Driver;
import com.fleet.fleet_management.service.DriverService;
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    @GetMapping
    public List<Driver> getAllDrivers() {
        return driverService.getAllDrivers();
    }

    @PostMapping
    public Driver createDriver(@RequestBody Driver driver) {
        return driverService.createDriver(driver);
    }

    @GetMapping("/{id}")
    public Driver getDriverById(@PathVariable Long id) {
        return driverService.getDriverById(id);
    }

    @PutMapping("/{id}")
    public Driver updateDriver(
            @PathVariable Long id,
            @RequestBody Driver driver) {
        return driverService.updateDriver(id, driver);
    }

    @DeleteMapping("/{id}")
    public String deleteDriver(@PathVariable Long id) {
        driverService.deleteDriver(id);
        return "Driver deleted successfully";
    }
}