import { StyleSheet, Text, View } from 'react-native';
import type { WaypointStatus } from '../types';

const TONE: Record<WaypointStatus, { label: string; bg: string }> = {
  suggested: { label: 'Suggested', bg: 'rgba(107, 114, 128, 0.82)' },
  selected: { label: 'Selected', bg: 'rgba(34, 139, 80, 0.85)' },
  vetoed: { label: 'Vetoed', bg: 'rgba(205, 60, 60, 0.85)' },
};

/** Small semi-opaque tag pinned to the top right corner of a stop card. */
export function StatusBadge({ status }: { status: WaypointStatus }) {
  const tone = TONE[status];
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]} accessibilityLabel={`Status: ${tone.label}`}>
      <Text style={styles.text}>{tone.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
