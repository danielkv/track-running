import { Territory } from '../../types/Territory';

// Mock DB - Storing full Territory objects now
let CAPTURED_TERRITORIES: Territory[] = [];

export async function captureTerritories(territory: Territory): Promise<Territory[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    CAPTURED_TERRITORIES.push(territory);
    return CAPTURED_TERRITORIES;
}

export async function getCapturedTerritories(): Promise<Territory[]> {
     await new Promise(resolve => setTimeout(resolve, 500));
     return CAPTURED_TERRITORIES;
}
