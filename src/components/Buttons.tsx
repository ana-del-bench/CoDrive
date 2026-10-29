import type { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { C } from '../theme';

export function PrimaryButton({
  label,
  onPress,
  icon,
  compact,
  disabled,
}: {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  compact?: boolean;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.primary, compact && styles.compact, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.86}
    >
      {icon}
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

export function QuietButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.quiet}>
      <Text style={styles.quietText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: C.teal,
    borderRadius: 14,
    minHeight: 52,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  compact: {
    alignSelf: 'flex-start',
    marginTop: 18,
    borderRadius: 999,
    minHeight: 46,
    paddingHorizontal: 16,
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
  },
  quiet: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  quietText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.muted,
  },
});
