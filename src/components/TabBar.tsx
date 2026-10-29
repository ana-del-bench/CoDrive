import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';
import type { Tab } from '../types';

const TABS: {
  id: Tab;
  label: string;
  icon: 'home' | 'map' | 'navigate' | 'wallet';
  idle: 'home-outline' | 'map-outline' | 'navigate-outline' | 'wallet-outline';
}[] = [
  { id: 'home', label: 'Home', icon: 'home', idle: 'home-outline' },
  { id: 'plan', label: 'Plan', icon: 'map', idle: 'map-outline' },
  { id: 'drive', label: 'Drive', icon: 'navigate', idle: 'navigate-outline' },
  { id: 'costs', label: 'Split', icon: 'wallet', idle: 'wallet-outline' },
];

export function TabBar({
  tab,
  onChange,
  paddingBottom,
}: {
  tab: Tab;
  onChange: (tab: Tab) => void;
  paddingBottom: number;
}) {
  return (
    <View style={[styles.wrap, { paddingBottom }]}>
      <View style={styles.nav}>
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <TouchableOpacity key={item.id} style={styles.item} onPress={() => onChange(item.id)} activeOpacity={0.75}>
              <Ionicons name={active ? item.icon : item.idle} size={22} color={active ? C.teal : C.faint} />
              <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: C.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.line,
  },
  nav: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: C.faint,
  },
  labelActive: {
    color: C.teal,
    fontWeight: '700',
  },
});
