package com.fleet.fleet_management.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fleet.fleet_management.entity.Trip;
import com.fleet.fleet_management.repository.TripRepository;

@Service
public class TripService {

    private final TripRepository tripRepository;

    public TripService(TripRepository tripRepository) {
        this.tripRepository = tripRepository;
    }

    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    public Trip createTrip(Trip trip) {
        return tripRepository.save(trip);
    }

    public Trip getTripById(Long id) {
        return tripRepository.findById(id).orElse(null);
    }

    public Trip updateTrip(Long id, Trip trip) {

        Trip existingTrip = tripRepository.findById(id).orElse(null);

        if (existingTrip == null) {
            return null;
        }

        existingTrip.setTripNumber(trip.getTripNumber());
        existingTrip.setVehicle(trip.getVehicle());
        existingTrip.setDriver(trip.getDriver());
        existingTrip.setOrigin(trip.getOrigin());
        existingTrip.setDestination(trip.getDestination());
        existingTrip.setTripDate(trip.getTripDate());
        existingTrip.setDistance(trip.getDistance());
        existingTrip.setStatus(trip.getStatus());

        return tripRepository.save(existingTrip);
    }

    public void deleteTrip(Long id) {
        tripRepository.deleteById(id);
    }
}