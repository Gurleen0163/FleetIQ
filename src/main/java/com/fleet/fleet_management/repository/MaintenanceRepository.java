package com.fleet.fleet_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fleet.fleet_management.entity.Maintenance;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
}