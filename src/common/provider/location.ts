import * as Location from "expo-location";

type Callback = (loc: Location.LocationObject) => void;

const mockMode = __DEV__ && process.env.EXPO_PUBLIC_MOCK_LOCATION === "true";
const pace = Number(process.env.EXPO_PUBLIC_MOCK_LOCATION_PACE) || 6;
let timer: any = null;

const route = [
  [-29.107952, -49.6372042],
  [-29.1069, -49.6361],
  [-29.1058, -49.6359],
  [-29.1049, -49.6367],
  [-29.1052, -49.6381],
  [-29.1064, -49.6389],
  [-29.107952, -49.6372042],
];

export const LocationProvider: typeof Location = {
  ...Location,
  watchPositionAsync: (options, callback) => {
    if (mockMode) {
      return simulateWatchPosition(callback);
    }
    return Location.watchPositionAsync(options, callback);
  },
};

// ----- MODO SIMULADO -----

async function simulateWatchPosition(callback: Callback, paceMinPerKm = pace) {
  let index = 0;
  const interval = (paceMinPerKm  * 1000) / (route.length - 1);
console.log("interval", interval);
  timer = setInterval(() => {
    const [latitude, longitude] = route[index];
console.log("latitude", latitude, "longitude", longitude);
    callback({
      mocked: true,
      coords: {
        latitude,
        longitude,
        accuracy: 5,
        altitude: 0,
        altitudeAccuracy: 1,
        heading: 0,
        speed: (1000 / interval) * 3.6,
      },
      timestamp: Date.now(),
    });

    index = (index + 1) % route.length;
  }, interval);

  return {
    remove: () => clearInterval(timer),
  };
}
