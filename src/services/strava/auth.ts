import { makeRedirectUri } from 'expo-auth-session';

const STRAVA_CLIENT_ID = process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID || 'REPLACE_WITH_ID';
const STRAVA_CLIENT_SECRET = process.env.EXPO_PUBLIC_STRAVA_CLIENT_SECRET || 'REPLACE_WITH_SECRET';

export const stravaConfig = {
  clientId: STRAVA_CLIENT_ID,
  scopes: ['activity:read_all'],
  redirectUri: makeRedirectUri({
    scheme: 'nascent-coronal', // Ensure this matches app.json scheme
  }),
};

export const getStravaAuthUrl = () => {
    return `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${stravaConfig.redirectUri}&response_type=code&scope=${stravaConfig.scopes.join(',')}`
}

export async function exchangeToken(code: string) {
    const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: STRAVA_CLIENT_ID,
            client_secret: STRAVA_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
        }),
    });
    return response.json();
}
