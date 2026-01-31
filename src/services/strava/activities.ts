import axios from 'axios';
import { useAppStore } from '../../lib/store';

const stravaApi = axios.create({
  baseURL: 'https://www.strava.com/api/v3',
});

stravaApi.interceptors.request.use((config) => {
    const token = useAppStore.getState().stravaAccessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export async function getActivities() {
  const response = await stravaApi.get('/athlete/activities?per_page=30');
  return response.data;
}

export async function getActivityStream(activityId: number) {
  // Streams: latlng, time, altitude
  const response = await stravaApi.get(`/activities/${activityId}/streams?keys=latlng,time&key_by_type=true`);
  return response.data;
}
