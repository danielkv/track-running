/**
 * Location Simulation Snippet - 100m Loop
 *
 * INSTRUCTIONS:
 * 1. Open Google Chrome DevTools (F12 or Cmd+Option+J).
 * 2. Go to the "Console" tab.
 * 3. Paste this entire script and press Enter.
 * 4. IMPORTANT: If you are already running, STOP the run and START it again.
 *    The app needs to call 'watchPosition' *after* this script runs.
 */

(function () {
  console.log("📍 Initializing Location Simulation (100m Loop)...");

  // Configuration
  const START_LAT = -29.107952;
  const START_LNG = -49.6372042;
  const TOTAL_DISTANCE_METERS = 100;
  const DURATION_SECONDS = 30; // 30s lap
  const UPDATE_INTERVAL_MS = 1000;

  // State
  const listeners = new Map();
  let watchIdCounter = 0;
  const startTime = Date.now();

  // Earth constants
  const R_EARTH = 6378137; // meters
  const radiusMeters = TOTAL_DISTANCE_METERS / (2 * Math.PI); // ~15.9m

  // Center Point Calculation
  // Starting at South (-90deg) relative to center
  const latOffsetRad = radiusMeters / R_EARTH;
  const centerLatRad = (START_LAT * Math.PI) / 180 + latOffsetRad;
  const centerLngRad = (START_LNG * Math.PI) / 180;
  const centerLat = (centerLatRad * 180) / Math.PI;
  const centerLng = (centerLngRad * 180) / Math.PI;

  console.log(
    `ℹ️ Simulation Configured: Radius ${radiusMeters.toFixed(1)}m around ${centerLat.toFixed(6)}, ${centerLng.toFixed(6)}`,
  );

  // Generate Position
  function getSimulatedPosition() {
    const elapsedMs = Date.now() - startTime;
    const progress =
      (elapsedMs % (DURATION_SECONDS * 1000)) / (DURATION_SECONDS * 1000);

    // Angle: -PI/2 to 3PI/2
    const currentAngle = -Math.PI / 2 + progress * 2 * Math.PI;

    const latOffset = (radiusMeters / R_EARTH) * Math.sin(currentAngle);
    const lngOffset =
      ((radiusMeters / R_EARTH) * Math.cos(currentAngle)) /
      Math.cos((centerLat * Math.PI) / 180);

    const currentLat = centerLat + (latOffset * 180) / Math.PI;
    const currentLng = centerLng + (lngOffset * 180) / Math.PI;

    let heading = ((currentAngle + Math.PI / 2) * 180) / Math.PI;
    heading = (heading + 360) % 360;

    return {
      coords: {
        latitude: currentLat,
        longitude: currentLng,
        accuracy: 5,
        altitude: 10,
        altitudeAccuracy: 5,
        heading: heading,
        speed: TOTAL_DISTANCE_METERS / DURATION_SECONDS,
      },
      timestamp: Date.now(),
    };
  }

  // Mock Geolocation
  const mockGeolocation = {
    currentPosition: getSimulatedPosition(), // Internal tracker

    getCurrentPosition: function (success, error, options) {
      console.log("⚡️ getCurrentPosition called by app");
      if (success) success(getSimulatedPosition());
    },

    watchPosition: function (success, error, options) {
      const id = ++watchIdCounter;
      console.log(`⚡️ watchPosition called by app (New Watcher ID: ${id})`);
      listeners.set(id, success);

      // Emit immediately
      setTimeout(() => {
        if (success) success(getSimulatedPosition());
      }, 0);

      return id;
    },

    clearWatch: function (id) {
      console.log(`stopped watch (ID: ${id})`);
      listeners.delete(id);
    },
  };

  // Override Logic
  // We mutate the existing object because some libraries (like expo-location) might have
  // captured a reference to 'navigator.geolocation' eagerly.
  if (navigator.geolocation) {
    console.log("⚡️ Monkey-patching existing navigator.geolocation methods...");

    navigator.geolocation.getCurrentPosition =
      mockGeolocation.getCurrentPosition;
    navigator.geolocation.watchPosition = mockGeolocation.watchPosition;
    navigator.geolocation.clearWatch = mockGeolocation.clearWatch;

    console.log("✅ navigator.geolocation methods overridden successfully.");
  } else {
    // Fallback if it doesn't exist (unlikely in Chrome)
    Object.defineProperty(navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    });
    console.log("✅ navigator.geolocation defined from scratch.");
  }

  // Simulation Loop
  setInterval(() => {
    const pos = getSimulatedPosition();
    const listenerCount = listeners.size;

    if (listenerCount > 0) {
      listeners.forEach((success) => {
        if (success) success(pos);
      });

      // Log update
      if (Math.floor(Date.now() / 1000) % 5 === 0) {
        console.log(
          `📍 Broadcasting: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`,
        );
      }
    } else {
      if (Math.floor(Date.now() / 1000) % 5 === 0) {
        // console.log("zzz Wrapper waiting for watchers...");
      }
    }
  }, UPDATE_INTERVAL_MS);
})();
