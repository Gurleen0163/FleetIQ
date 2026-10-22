package com.fleet.fleet_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fleet.fleet_management.entity.Driver;

public interface DriverRepository extends JpaRepository<Driver, Long> {

}