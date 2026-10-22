package com.fleet.fleet_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fleet.fleet_management.entity.Trip;

public interface TripRepository extends JpaRepository<Trip, Long> {

}