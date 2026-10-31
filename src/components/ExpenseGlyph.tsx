import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { ExpenseType } from '../types';

type IonName = ComponentProps<typeof Ionicons>['name'];

const TONE: Record<ExpenseType, { bg: string; color: string }> = {
  food: { bg: '#FDE8D8', color: '#E07A3D' },
  housing: { bg: '#E8E4F8', color: '#6B5BD6' },
  recreation: { bg: '#DDF3EF', color: '#0E9F8A' },
  gas: { bg: '#E5EEF8', color: '#3A78C2' },
  retail: { bg: '#FDE7F0', color: '#D4537E' },
  necessities: { bg: '#FBF0D5', color: '#B7791F' },
  other: { bg: '#EDEBE6', color: '#7C776F' },
};

const ICON: Record<Exclude<ExpenseType, 'gas'>, IonName> = {
  food: 'restaurant-outline',
  housing: 'bed-outline',
  recreation: 'ticket-outline',
  retail: 'bag-handle-outline',
  necessities: 'basket-outline',
  other: 'ellipsis-horizontal',
};

export function ExpenseGlyph({ kind, size = 40 }: { kind: ExpenseType; size?: number }) {
  const tone = TONE[kind];
  const iconSize = Math.round(size * 0.45);

  return (
    <View
      style={[styles.glyph, { width: size, height: size, borderRadius: size / 2, backgroundColor: tone.bg }]}
    >
      {kind === 'gas' ? (
        <MaterialCommunityIcons name="gas-station" size={iconSize} color={tone.color} />
      ) : (
        <Ionicons name={ICON[kind]} size={iconSize} color={tone.color} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  glyph: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
