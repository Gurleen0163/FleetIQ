package com.fleet.fleet_management.entity;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "maintenance")
public class Maintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String vehicle;

    private String maintenanceType;

    private String description;

    private LocalDate serviceDate;

    private LocalDate nextServiceDate;

    private Double cost;

    private String status;

    private String serviceProvider;

    public Maintenance() {
    }

    public Maintenance(
            String vehicle,
            String maintenanceType,
            String description,
            LocalDate serviceDate,
            LocalDate nextServiceDate,
            Double cost,
            String status,
            String serviceProvider
    ) {
        this.vehicle = vehicle;
        this.maintenanceType = maintenanceType;
        this.description = description;
        this.serviceDate = serviceDate;
        this.nextServiceDate = nextServiceDate;
        this.cost = cost;
        this.status = status;
        this.serviceProvider = serviceProvider;
    }

    public Long getId() {
        return id;
    }

    public String getVehicle() {
        return vehicle;
    }

    public void setVehicle(String vehicle) {
        this.vehicle = vehicle;
    }

    public String getMaintenanceType() {
        return maintenanceType;
    }

    public void setMaintenanceType(String maintenanceType) {
        this.maintenanceType = maintenanceType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getServiceDate() {
        return serviceDate;
    }

    public void setServiceDate(LocalDate serviceDate) {
        this.serviceDate = serviceDate;
    }

    public LocalDate getNextServiceDate() {
        return nextServiceDate;
    }

    public void setNextServiceDate(LocalDate nextServiceDate) {
        this.nextServiceDate = nextServiceDate;
    }

    public Double getCost() {
        return cost;
    }

    public void setCost(Double cost) {
        this.cost = cost;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getServiceProvider() {
        return serviceProvider;
    }

    public void setServiceProvider(String serviceProvider) {
        this.serviceProvider = serviceProvider;
    }
}