import * as Location from 'expo-location';

/**
 * High-accuracy location retrieval using expo-location
 * Matches required specification:
 * 
 * const getUserLocation = async () => {
 *   const { status } = await Location.requestForegroundPermissionsAsync();
 *   if (status !== 'granted') {
 *     throw new Error('Location permission denied');
 *   }
 *   const location = await Location.getCurrentPositionAsync({
 *     accuracy: Location.Accuracy.High
 *   });
 *   return {
 *     latitude: location.coords.latitude,
 *     longitude: location.coords.longitude
 *   };
 * };
 */
export const getUserLocation = async (): Promise<{ latitude: number; longitude: number }> => {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
};
