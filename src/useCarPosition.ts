import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export type CarPlace = { latitude: number; longitude: number };
export type LocationState = 'asking' | 'denied' | 'unavailable' | 'ready';

/**
 * Follows the phone's location while `enabled`. Asks for permission the first time.
 * Never throws: `status` says why there is no position.
 */
export function useCarPosition(enabled: boolean) {
  const [position, setPosition] = useState<CarPlace | null>(null);
  const [status, setStatus] = useState<LocationState>('asking');

  useEffect(() => {
    if (!enabled) return;
    let gone = false;
    let watcher: { remove: () => void } | null = null;

    (async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (gone) return;
      if (permission.status !== 'granted') {
        setStatus('denied');
        return;
      }
      const subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 50, timeInterval: 5000 },
        (update) => {
          if (gone) return;
          setPosition({ latitude: update.coords.latitude, longitude: update.coords.longitude });
          setStatus('ready');
        },
      );
      if (gone) subscription.remove();
      else watcher = subscription;
    })().catch(() => {
      if (!gone) setStatus('unavailable');
    });

    return () => {
      gone = true;
      watcher?.remove();
    };
  }, [enabled]);

  return { position, status };
}
