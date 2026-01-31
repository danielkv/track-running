import { useMutation, useQuery } from '@tanstack/react-query';
import { getActivities, getActivityStream } from '../services/strava/activities';
import { Coordinate } from '../types/Run';
import { useTerritoryCapture } from './useTerritoryCapture';

export function useStravaActivities() {
    return useQuery({
        queryKey: ['strava-activities'],
        queryFn: getActivities,
        retry: false,
    });
}

export function useImportStravaActivity() {
    const { captureRoute } = useTerritoryCapture();
    
    return useMutation({
        mutationFn: async (activityId: number) => {
            const streams = await getActivityStream(activityId);
            // streams[0] is typically latlng if we requested key_by_type=true, need to parse
            // Validating strava stream format is tricky without types, assuming latlng stream exists
            
            const latLngStream = streams.latlng;
            if (!latLngStream || !latLngStream.data) throw new Error("No GPS data in activity");

            const route: Coordinate[] = latLngStream.data.map((pair: number[]) => ({
                latitude: pair[0],
                longitude: pair[1]
            }));

            return captureRoute(route);
        }
    });
}
