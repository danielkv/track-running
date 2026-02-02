import { Coordinate } from "@/src/types/common";
import { calculateDistance, resamplePath } from "@/src/utils/geo";
import * as Location from "expo-location";

type Callback = (loc: Location.LocationObject) => void;

const mockMode = __DEV__ && process.env.EXPO_PUBLIC_MOCK_LOCATION === "true";
const pace = Number(process.env.EXPO_PUBLIC_MOCK_LOCATION_PACE) || 6;
let timer: any = null;

const route = [
  [-29.108976, -49.63399],
  [-29.109003, -49.633948],
  [-29.108074, -49.633509],
  [-29.108038, -49.633564],
  [-29.108071, -49.63358],
  [-29.108038, -49.633564],
  [-29.108074, -49.633509],
  [-29.106946, -49.632975],
  [-29.105887, -49.632475],
  [-29.105807, -49.632501],
  [-29.1058, -49.632517],
  [-29.105807, -49.632501],
  [-29.10581, -49.632477],
  [-29.105807, -49.632462],
  [-29.10579, -49.632438],
  [-29.106277, -49.631707],
  [-29.106262, -49.631683],
  [-29.10626, -49.631668],
  [-29.106262, -49.631654],
  [-29.106272, -49.63164],
  [-29.106277, -49.63163],
  [-29.106302, -49.631622],
  [-29.106326, -49.631632],
  [-29.106827, -49.630879],
  [-29.106839, -49.63086],
  [-29.107234, -49.630267],
  [-29.10788, -49.629295],
  [-29.10849, -49.628377],
  [-29.108474, -49.628347],
  [-29.108478, -49.628312],
  [-29.108488, -49.628298],
  [-29.108516, -49.628285],
  [-29.108545, -49.628295],
  [-29.109048, -49.627539],
  [-29.109414, -49.626987],
  [-29.109399, -49.626963],
  [-29.109398, -49.626934],
  [-29.109403, -49.62692],
  [-29.109413, -49.626908],
  [-29.10944, -49.626897],
  [-29.109467, -49.626907],
  [-29.109849, -49.626335],
  [-29.11016, -49.625869],
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
  
  const originalPath: Coordinate[] = route.map(([latitude, longitude]) => ({ 
    latitude, 
    longitude, 
    timestamp: Date.now() 
  }));
  const distance = calculateDistance(originalPath);
  
  // Calculate total duration in seconds based on pace
  // Pace (min/km) * distance (km) * 60 (sec/min)
  const totalTimeSeconds = (distance / 1000) * paceMinPerKm * 60;
  
  // We want approximately 1 update per second
  const numSteps = Math.max(2, Math.ceil(totalTimeSeconds)); 
  const interpolatedRoute = resamplePath(originalPath, numSteps);
  
  // Recalculate precise interval
  const interval = (totalTimeSeconds * 1000) / numSteps;
  const speedMetersPerSecond = distance / totalTimeSeconds;

  console.log(`Simulating run: Distance=${distance.toFixed(1)}m, Duration=${totalTimeSeconds.toFixed(1)}s, Steps=${numSteps}, Interval=${interval.toFixed(0)}ms`);

  timer = setInterval(() => {
    const { latitude, longitude } = interpolatedRoute[index];

    callback({
      mocked: true,
      coords: {
        latitude,
        longitude,
        accuracy: 5,
        altitude: 0,
        altitudeAccuracy: 1,
        heading: 0,
        speed: speedMetersPerSecond,
      },
      timestamp: Date.now(),
    });

    index = (index + 1) % interpolatedRoute.length;
  }, interval);

  return {
    remove: () => clearInterval(timer),
  };
}
