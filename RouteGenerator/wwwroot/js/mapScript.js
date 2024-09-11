let map; // Google Maps object
let startLocation = { lat: 53.428900, lng: -1.324000 }; // Initial map center
const RADIUS_EARTH = 6371000; // Earth radius in meters
let hotspots = []; // Array to store hotspot locations
let markers = []; // Array to store all markers
let directionsRenderer; // Global variable to store the DirectionsRenderer
let distanceInfoWindow; // Info window to display total distance on the map

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
    markerContent.textContent = 'Hotspot';
    markerContent.style.fontSize = '14px';
    markerContent.style.color = 'red'; // Set hotspot markers to red

    const marker = new google.maps.marker.AdvancedMarkerElement({
        position: location,
        map: map,
        content: markerContent
    });

    markers.push(marker); // Track the marker
}

// Generates a circular route and adjusts based on nearby hotspots
function generateRandomRoute(circumferenceInKm) {
    const radius = ((circumferenceInKm * 1000) / (2 * Math.PI))/2; // Calculate radius from circumference
    const waypoints = generateCircularWaypoints(startLocation, radius, circumferenceInKm);

    const directionsService = new google.maps.DirectionsService();

    // Ensure origin and destination are in LatLngLiteral format
    const origin = { lat: waypoints[0].lat, lng: waypoints[0].lng };
    const destination = { lat: waypoints[0].lat, lng: waypoints[0].lng };

    const request = {
        origin: origin, // Pass the first waypoint as the origin
        destination: destination, // Loop back to the first waypoint as the destination
        waypoints: waypoints.slice(1).map(waypoint => ({
            location: { lat: waypoint.lat, lng: waypoint.lng }, // Ensure waypoints are LatLngLiteral
            stopover: true
        })),
        optimizeWaypoints: false, // Ensure the route follows the order of waypoints
        travelMode: google.maps.TravelMode.WALKING
    };

    directionsService.route(request, function (result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);

            // Place custom markers and show total distance
            placeCustomMarkers(result);
            showTotalDistance(result);
        } else {
            console.error('Directions request failed due to ' + status);
        }
    });
}

// Display the total distance of the route in the HTML or on the map
function showTotalDistance(result) {
    let totalDistance = 0;
    const legs = result.routes[0].legs;

    // Calculate total distance by summing the distance of each leg
    legs.forEach(leg => {
        totalDistance += leg.distance.value; // distance in meters
    });

    totalDistance = (totalDistance / 1000).toFixed(2); // Convert meters to kilometers and round to 2 decimal places

    // Update the HTML element with the total distance
    document.getElementById('totalDistance').innerHTML = `Total Distance: ${totalDistance} km`;

    // Optionally, show distance on the map using an info window
    distanceInfoWindow.setContent(`Total Distance: ${totalDistance} km`);
    distanceInfoWindow.setPosition(startLocation);
    distanceInfoWindow.open(map);
}

// Place custom markers for origin, destination, and waypoints
function placeCustomMarkers(result) {
    const route = result.routes[0];
    const leg = route.legs[0];

    // Create custom marker for the origin
    const originMarkerContent = document.createElement('div');
    originMarkerContent.innerHTML = '<div class="custom-marker">A</div>'; // Custom HTML content

    const originMarker = new google.maps.marker.AdvancedMarkerElement({
        position: leg.start_location,
        map: map,
        content: originMarkerContent
    });
    markers.push(originMarker); // Track the marker

    // Create custom marker for the destination
    const destinationMarkerContent = document.createElement('div');
    destinationMarkerContent.innerHTML = '<div class="custom-marker">B</div>';

    const destinationMarker = new google.maps.marker.AdvancedMarkerElement({
        position: leg.end_location,
        map: map,
        content: destinationMarkerContent
    });
    markers.push(destinationMarker); // Track the marker

    // Create custom markers for each waypoint
    route.waypoint_order.forEach((waypointIndex) => {
        const waypoint = leg.via_waypoints[waypointIndex];
        const waypointMarkerContent = document.createElement('div');
        waypointMarkerContent.innerHTML = `<div class="custom-marker">${String.fromCharCode(67 + waypointIndex)}</div>`; // C, D, E, etc.

        const waypointMarker = new google.maps.marker.AdvancedMarkerElement({
            position: waypoint,
            map: map,
            content: waypointMarkerContent
        });
        markers.push(waypointMarker); // Track the marker
    });
}

//// Generate circular waypoints adjusted by nearby hotspots
//function generateCircularWaypoints(center, radius, circumferenceInKm) {
//    let waypoints = [];
//    const numPoints = 8; // Number of waypoints for the circle
//    const influenceRadius = 1000; // Hotspot influence radius (in meters)
//    const minDistance = (circumferenceInKm * 1000) - 2000; // Minimum acceptable total distance
//    const maxDistance = (circumferenceInKm * 1000) + 2000; // Maximum acceptable total distance
//    let totalDistance = 0;

//    // Loop until the total distance is within the acceptable range
//    while (totalDistance < minDistance || totalDistance > maxDistance) {
//        waypoints = []; // Clear previous waypoints
//        totalDistance = 0; // Reset total distance

//        let startingAngle = Math.floor(Math.random() * 360); // Random start angle
//        const angleStep = 360 / numPoints; // Equal division of the circle for waypoints

//        // Generate waypoints in a consistent (clockwise) order
//        for (let i = 0; i < numPoints; i++) {
//            const angle = (startingAngle + i * angleStep) % 360; // Ensures a circular path
//            let waypoint = calculateWaypoint(center, radius, angle);

//            // Find the closest hotspot to the current waypoint
//            let closestHotspot = findClosestHotspot(waypoint);

//            // Adjust the waypoint if it is within the influence radius of a hotspot
//            let isInfluenced = false;
//            if (closestHotspot) {
//                const distanceToHotspot = calculateDistance(waypoint, closestHotspot);
//                if (distanceToHotspot < influenceRadius) {
//                    waypoint = adjustWaypointTowardsHotspot(waypoint, closestHotspot, distanceToHotspot, influenceRadius);
//                    isInfluenced = true;
//                }
//            }

//            // Visual indicator: Hotspot-influenced waypoints are in orange
//            const markerContent = document.createElement('div');
//            markerContent.style.fontSize = '20px';
//            if (isInfluenced) {
//                markerContent.textContent = '🔥';
//                markerContent.style.color = 'orange';
//            } else {
//                markerContent.textContent = '⬤';
//                markerContent.style.color = 'blue';
//            }

//            const marker = new google.maps.marker.AdvancedMarkerElement({
//                position: waypoint,
//                map: map,
//                content: markerContent
//            });

//            markers.push(marker); // Track the marker
//            waypoints.push(waypoint);

//            // Add the distance from the previous waypoint to the current total distance
//            if (i > 0) {
//                totalDistance += calculateDistance(waypoints[i - 1], waypoint);
//            }
//        }

//        // Add the distance from the last waypoint back to the first one
//        totalDistance += calculateDistance(waypoints[waypoints.length - 1], waypoints[0]);
//    }

//    return waypoints;
//}

// Generate circular waypoints adjusted by nearby hotspots
function generateCircularWaypoints(center, radius) {
    const waypoints = [];
    const numPoints = 8; // Number of waypoints for the circle
    const influenceRadius = 1000; // Hotspot influence radius (in meters)
    
    // Start with an initial angle of 0 and increment clockwise (angleStep) for each waypoint
    const angleStep = 360 / numPoints; // Divide the circle into equal parts (in degrees)
    let startingAngle = 0; // Start at 0 degrees for the first waypoint

    for (let i = 0; i < numPoints; i++) {
        const angle = (startingAngle + i * angleStep) % 360; // Clockwise increment angle
        let waypoint = calculateWaypoint(center, radius, angle);

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
        markerContent.style.fontSize = '14px';

        if (isInfluenced) {
            markerContent.textContent = 'Influenced Waypoint';
            markerContent.style.color = 'green'; // Influenced waypoints in green
        } else {
            markerContent.textContent = 'Waypoint';
            markerContent.style.color = 'blue'; // Standard waypoints in blue
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
    const factor = 0.5; // Move the waypoint halfway to the hotspot
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