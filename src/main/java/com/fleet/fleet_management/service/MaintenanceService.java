package com.fleet.fleet_management.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.fleet.fleet_management.entity.Maintenance;
import com.fleet.fleet_management.repository.MaintenanceRepository;

@Service
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;

    public MaintenanceService(MaintenanceRepository maintenanceRepository) {
        this.maintenanceRepository = maintenanceRepository;
    }

    // Get all maintenance records
    public List<Maintenance> getAllMaintenance() {
        return maintenanceRepository.findAll();
    }

    // Get maintenance record by ID
    public Optional<Maintenance> getMaintenanceById(Long id) {
        return maintenanceRepository.findById(id);
    }

    // Add new maintenance record
    public Maintenance addMaintenance(Maintenance maintenance) {
        return maintenanceRepository.save(maintenance);
    }

    // Update maintenance record
    public Maintenance updateMaintenance(Long id, Maintenance updatedMaintenance) {

        return maintenanceRepository.findById(id)
                .map(existingMaintenance -> {

                    existingMaintenance.setVehicle(updatedMaintenance.getVehicle());
                    existingMaintenance.setMaintenanceType(updatedMaintenance.getMaintenanceType());
                    existingMaintenance.setDescription(updatedMaintenance.getDescription());
                    existingMaintenance.setServiceDate(updatedMaintenance.getServiceDate());
                    existingMaintenance.setNextServiceDate(updatedMaintenance.getNextServiceDate());
                    existingMaintenance.setCost(updatedMaintenance.getCost());
                    existingMaintenance.setStatus(updatedMaintenance.getStatus());
                    existingMaintenance.setServiceProvider(updatedMaintenance.getServiceProvider());

                    return maintenanceRepository.save(existingMaintenance);
                })
                .orElseThrow(() -> new RuntimeException("Maintenance record not found with id: " + id));
    }

    // Delete maintenance record
    public void deleteMaintenance(Long id) {
        maintenanceRepository.deleteById(id);
    }
}