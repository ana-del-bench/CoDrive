import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';
import type { Trip } from '../types';
import { AvatarStack } from './AvatarStack';

export function TripHeader({ trip, onInvite }: { trip: Trip; onInvite?: () => void }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title} numberOfLines={2}>
        {trip.title}
      </Text>
      {onInvite ? (
        <TouchableOpacity style={styles.invite} onPress={onInvite} activeOpacity={0.8}>
          <Ionicons name="person-add-outline" size={18} color={C.teal} />
        </TouchableOpacity>
      ) : null}
      <AvatarStack people={trip.crew} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '700',
    color: C.ink,
    letterSpacing: -0.5,
  },
  invite: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
