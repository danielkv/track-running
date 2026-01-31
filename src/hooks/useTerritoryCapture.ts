import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { captureTerritories, getCapturedTerritories } from '../services/territory/api';
import { Coordinate } from '../types/Run';
import { detectTerritoryFromRoute } from '../utils/territoryEngine';

export function useTerritoryCapture() {
  const queryClient = useQueryClient();

  const { data: capturedTerritories = [], isLoading } = useQuery({
    queryKey: ['captured-territories'],
    queryFn: getCapturedTerritories,
  });

  const captureMutation = useMutation({
    mutationFn: async (route: Coordinate[]) => {
      const territory = detectTerritoryFromRoute(route);
      if (!territory) return [];
      return captureTerritories(territory);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['captured-territories'] });
    },
  });

  return {
    capturedTerritories,
    isLoading,
    captureRoute: captureMutation.mutateAsync,
    isCapturing: captureMutation.isPending,
  };
}
