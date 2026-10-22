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

import com.fleet.fleet_management.entity.Trip;
import com.fleet.fleet_management.service.TripService;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @GetMapping
    public List<Trip> getAllTrips() {
        return tripService.getAllTrips();
    }

    @PostMapping
    public Trip createTrip(@RequestBody Trip trip) {
        return tripService.createTrip(trip);
    }

    @GetMapping("/{id}")
    public Trip getTripById(@PathVariable Long id) {
        return tripService.getTripById(id);
    }

    @PutMapping("/{id}")
    public Trip updateTrip(
            @PathVariable Long id,
            @RequestBody Trip trip) {

        return tripService.updateTrip(id, trip);
    }

    @DeleteMapping("/{id}")
    public String deleteTrip(@PathVariable Long id) {
        tripService.deleteTrip(id);
        return "Trip deleted successfully";
    }
}