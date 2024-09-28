let map; // Google Maps object
let startLocation = { lat: 53.428900, lng: -1.324000 }; // Initial map center
const RADIUS_EARTH = 6371000; // Earth radius in meters
let hotspots = []; // Array to store hotspot locations
let markers = []; // Array to store all markers
let directionsRenderer; // Global variable to store the DirectionsRenderer
let distanceInfoWindow; // Info window to display total distance on the map
let markersVisible = true; // Flag to track the visibility of markers

function initMap() {
    // Initialise Google Maps
    map = new google.maps.Map(document.getElementById('map'), {
        mapId: "dd5c4669aa0f8a85",
        zoom: 14,
        center: startLocation,
    });

    // Initialise a marker for the starting point
    const markerContent = document.createElement('div');
    markerContent.textContent = 'Start';
    markerContent.style.fontSize = '14px';

    const marker = new google.maps.marker.AdvancedMarkerElement({
        position: startLocation,
        map: map,
        content: markerContent
    });

    markers.push(marker); // Track the marker

    // Allow users to add hotspots by clicking on the map
    map.addListener('click', function (e) {
        addHotspot(e.latLng);
    });

    // Initialise the DirectionsRenderer
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // Initialise the InfoWindow to display the total distance
    distanceInfoWindow = new google.maps.InfoWindow();
}

// Add a hotspot when the user clicks on the map
function addHotspot(location) {
    hotspots.push(location);

    const markerContent = document.createElement('div');
    markerContent.innerHTML = '🔥'; // Fire emoji
    markerContent.style.fontSize = '32px';
    markerContent.style.color = 'red'; // Red circular marker

    const marker = new google.maps.marker.AdvancedMarkerElement({
        position: location,
        map: map,
        content: markerContent
    });

    markers.push(marker); // Track the marker
}

function generateRandomRoute(targetDistanceKm) {
    const directionsService = new google.maps.DirectionsService();
    let divisor = 1.1; // Start divisor
    let currentRadius = ((targetDistanceKm * 1000) / (2 * Math.PI)) / divisor; // Calculate initial radius
    let maxIterations = 100;
    let iteration = 0;

    // Loop until a valid route is found within bounds
    const findValidRoute = () => {
        iteration++;
        console.log(`Iteration ${iteration}: Generating route with radius ${currentRadius} meters and divisor ${divisor}`);

        const waypoints = generateCircularWaypoints(startLocation, currentRadius);

        const request = {
            origin: waypoints[0],
            destination: waypoints[0],
            waypoints: waypoints.slice(1).map(waypoint => ({
                location: waypoint,
                stopover: true
            })),
            optimizeWaypoints: false,
            travelMode: google.maps.TravelMode.WALKING
        };

        directionsService.route(request, function (result, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                let totalDistance = calculateTotalDistance(result.routes[0].legs);

                console.log(`Iteration ${iteration}: Total distance: ${totalDistance} km`);

                if (Math.abs(totalDistance - targetDistanceKm) <= 0.2 || iteration >= maxIterations) {
                    console.log(`Valid route found within bounds on iteration ${iteration}: ${totalDistance} km`);
                    directionsRenderer.setDirections(result);
                    showTotalDistance(totalDistance);
                } else {
                    // Adjust the divisor every 20 attempts
                    if (iteration % 20 === 0) {
                        divisor += 0.1;
                        console.log(`Divisor increased to ${divisor}`);
                    }

                    // Adjust the radius based on total distance
                    currentRadius = ((targetDistanceKm * 1000) / (2 * Math.PI)) / divisor;

                    findValidRoute(); // Recurse until within bounds
                }
            } else {
                console.error('Directions request failed due to ' + status);
            }
        });
    };

    findValidRoute(); // Start the loop
}

function toggleMarkers() {
    markersVisible = !markersVisible; // Toggle the visibility state

    // Iterate through each marker and set its map property based on the visibility state
    markers.forEach(marker => {
        marker.map = markersVisible ? map : null;
    });

    // Update the toggle button text based on the visibility state
    document.getElementById('toggleMarkersBtn').textContent = markersVisible ? 'Hide Markers' : 'Show Markers';
}

// Display the total distance of the route in kilometers
function showTotalDistance(totalDistance) {
    totalDistance = totalDistance.toFixed(2);
    document.getElementById('totalDistance').innerHTML = `Total Distance: ${totalDistance} km`;

    distanceInfoWindow.setContent(`Total Distance: ${totalDistance} km`);
    distanceInfoWindow.setPosition(startLocation);
    distanceInfoWindow.open(map);
}

// Calculate total distance from all legs of the route
function calculateTotalDistance(legs) {
    let totalDistance = 0;
    legs.forEach(leg => {
        totalDistance += leg.distance.value; // meters
    });
    return totalDistance / 1000; // Convert meters to kilometers
}

// Generate circular waypoints adjusted by nearby hotspots
function generateCircularWaypoints(center, radius) {
    const waypoints = [];
    const numPoints = 8; // Number of waypoints for the circle
    const influenceRadius = 2000; // Hotspot influence radius (in meters)

    // Start with an initial angle of 0 and increment clockwise (angleStep) for each waypoint
    const angleStep = 360 / numPoints; // Divide the circle into equal parts (in degrees)
    let startingAngle = Math.floor(Math.random() * 360) + 1;
    let home = calculateWaypoint(center, radius, startingAngle);

    for (let i = 0; i < numPoints; i++) {
        const angle = (startingAngle + i * angleStep) % 360; // Clockwise increment angle
        let waypoint = calculateWaypoint(home, radius, angle);

        // Find the closest hotspot to the current waypoint
        let closestHotspot = findClosestHotspot(waypoint);

        // Adjust the waypoint if it is within the influence radius of a hotspot
        let isInfluenced = false;
        if (closestHotspot) {
            const distanceToHotspot = calculateDistance(waypoint, closestHotspot);
            if (distanceToHotspot < influenceRadius) {
                waypoint = adjustWaypointTowardsHotspot(waypoint, closestHotspot, distanceToHotspot, influenceRadius);
                isInfluenced = true;
            }
        }

        // Visual marker content for the waypoints
        const markerContent = document.createElement('div');
        markerContent.style.fontSize = '8px';

        if (isInfluenced) {
            markerContent.textContent = '🔥';
            markerContent.style.color = 'orange';
        } else {
            markerContent.textContent = '⬤';
            markerContent.style.color = 'blue';
        }

        // Create a marker for the waypoint and track it
        const marker = new google.maps.marker.AdvancedMarkerElement({
            position: waypoint,
            map: map,
            content: markerContent
        });

        markers.push(marker); // Track the marker
        waypoints.push(waypoint);
    }

    return waypoints;
}

// Find the closest hotspot to a given waypoint
function findClosestHotspot(waypoint) {
    if (hotspots.length === 0) return null;

    let closestHotspot = null;
    let minDistance = Infinity;

    hotspots.forEach(hotspot => {
        const distance = calculateDistance(waypoint, hotspot);
        if (distance < minDistance) {
            minDistance = distance;
            closestHotspot = hotspot;
        }
    });

    return closestHotspot;
}

// Adjust the waypoint to move it halfway towards the closest hotspot
function adjustWaypointTowardsHotspot(waypoint, hotspot, distanceToHotspot, influenceRadius) {
    const factor = 0.2; // Move the waypoint halfway to the hotspot
    const latDelta = (hotspot.lat() - waypoint.lat) * factor;
    const lngDelta = (hotspot.lng() - waypoint.lng) * factor;

    return {
        lat: waypoint.lat + latDelta,
        lng: waypoint.lng + lngDelta
    };
}

// Calculates waypoint coordinates based on center, radius, and angle
function calculateWaypoint(center, radius, angle) {
    const latRadians = degreesToRadians(center.lat);
    const lngRadians = degreesToRadians(center.lng);
    const bearing = degreesToRadians(angle);

    const lat = Math.asin(Math.sin(latRadians) * Math.cos(radius / RADIUS_EARTH) +
        Math.cos(latRadians) * Math.sin(radius / RADIUS_EARTH) * Math.cos(bearing));

    const lng = lngRadians + Math.atan2(Math.sin(bearing) * Math.sin(radius / RADIUS_EARTH) * Math.cos(latRadians),
        Math.cos(radius / RADIUS_EARTH) - Math.sin(latRadians) * Math.sin(lat));

    return {
        lat: radiansToDegrees(lat),
        lng: radiansToDegrees(lng)
    };
}

// Calculates the distance between two points in meters
function calculateDistance(point1, point2) {
    const lat1 = degreesToRadians(point1.lat);
    const lng1 = degreesToRadians(point1.lng);
    const lat2 = degreesToRadians(point2.lat());
    const lng2 = degreesToRadians(point2.lng());

    const dLat = lat2 - lat1;
    const dLng = lng2 - lng1;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return RADIUS_EARTH * c; // Distance in meters
}

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}

// Remove all markers from the map
function removeAllMarkers() {
    // Remove all manually added markers
    markers.forEach(marker => {
        marker.map = null; // Remove the marker from the map
    });
    markers = []; // Clear the marker array

    // Clear the route and its waypoint markers (A, B, C, D markers)
    directionsRenderer.setDirections({ routes: [] });
}