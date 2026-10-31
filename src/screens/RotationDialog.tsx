import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';
import type { RestStop } from '../types';
import { PrimaryButton, QuietButton } from '../components/Buttons';
import { Dialog, dialogStyles } from '../components/Dialog';
import { InfoCard } from '../components/InfoCard';

export function RotationDialog({
  driverLine,
  limit,
  rest,
  onClose,
  onAcknowledge,
  onRemind,
}: {
  driverLine: string;
  /** The driver's limit, like "4 hr". Falls back to a sample when no drivers are set up. */
  limit?: string;
  rest: RestStop;
  onClose: () => void;
  onAcknowledge: () => void;
  onRemind: () => void;
}) {
  return (
    <Dialog onClose={onClose}>
      <View style={styles.iconWrap}>
        <TouchableOpacity style={styles.close} onPress={onClose} activeOpacity={0.8}>
          <Ionicons name="close" size={18} color={C.orange} />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Driver Rotation Due</Text>
      <Text style={styles.body}>
        {driverLine}
        <Text style={styles.strong}>{(limit ?? '2.5 hours').replace(' ', '\u00A0')}</Text> without rest.
      </Text>
      <Text style={styles.hint}>For safety, please prepare to safely pull over and rotate drivers.</Text>
      <InfoCard kicker="NEXT REST STOP" title={rest.place} note={rest.note} trailing={rest.distance} />
      <View style={dialogStyles.actions}>
        <PrimaryButton label="Acknowledge Rotation" onPress={onAcknowledge} />
        <QuietButton label="Remind Me in 10 Min" onPress={onRemind} />
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.sun,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: C.orange,
    letterSpacing: -0.3,
  },
  body: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: C.body,
  },
  strong: {
    fontWeight: '700',
    color: C.ink,
  },
  hint: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: C.muted,
  },
});
