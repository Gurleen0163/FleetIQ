package com.fleet.fleet_management.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fleet.fleet_management.entity.Maintenance;
import com.fleet.fleet_management.service.MaintenanceService;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174"
})
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    // GET all maintenance records
    @GetMapping
    public List<Maintenance> getAllMaintenance() {
        return maintenanceService.getAllMaintenance();
    }

    // GET maintenance record by ID
    @GetMapping("/{id}")
    public ResponseEntity<Maintenance> getMaintenanceById(@PathVariable Long id) {

        return maintenanceService.getMaintenanceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ADD maintenance record
    @PostMapping
    public Maintenance addMaintenance(@RequestBody Maintenance maintenance) {
        return maintenanceService.addMaintenance(maintenance);
    }

    // UPDATE maintenance record
    @PutMapping("/{id}")
    public ResponseEntity<Maintenance> updateMaintenance(
            @PathVariable Long id,
            @RequestBody Maintenance maintenance) {

        try {
            return ResponseEntity.ok(
                    maintenanceService.updateMaintenance(id, maintenance)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE maintenance record
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaintenance(@PathVariable Long id) {

        maintenanceService.deleteMaintenance(id);

        return ResponseEntity.noContent().build();
    }
}