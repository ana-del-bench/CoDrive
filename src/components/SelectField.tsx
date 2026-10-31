import type { ReactNode } from 'react';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';

export type SelectOption = { value: string; label: string; icon?: ReactNode };

/**
 * A dropdown that opens its options inline. With `multiple`, the list stays open so several
 * options can be ticked; otherwise choosing an option closes it. The parent owns `selected`
 * and decides what a tap means in `onSelect`.
 */
export function SelectField({
  label,
  options,
  selected,
  onSelect,
  placeholder,
  multiple,
}: {
  label: string;
  options: SelectOption[];
  selected: string[];
  onSelect: (value: string) => void;
  placeholder: string;
  multiple?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const chosen = options.filter((option) => selected.includes(option.value));
  const summary = chosen.map((option) => option.label).join(', ');

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${label}${summary ? `, ${summary}` : ''}`}
      >
        {!multiple && chosen[0]?.icon ? <View style={styles.triggerIcon}>{chosen[0].icon}</View> : null}
        <Text style={[styles.triggerText, !summary && styles.placeholder]} numberOfLines={1}>
          {summary || placeholder}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={C.muted} />
      </TouchableOpacity>

      {open ? (
        <View style={styles.list}>
          {options.map((option) => {
            const active = selected.includes(option.value);
            return (
              <TouchableOpacity
                key={option.value}
                style={styles.option}
                activeOpacity={0.7}
                onPress={() => {
                  onSelect(option.value);
                  if (!multiple) setOpen(false);
                }}
                accessibilityRole={multiple ? 'checkbox' : 'button'}
                accessibilityState={{ selected: active, checked: active }}
              >
                {option.icon ? <View style={styles.optionIcon}>{option.icon}</View> : null}
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text>
                {multiple ? (
                  <View style={[styles.box, active && styles.boxActive]}>
                    {active ? <Ionicons name="checkmark" size={14} color={C.white} /> : null}
                  </View>
                ) : active ? (
                  <Ionicons name="checkmark" size={18} color={C.teal} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.body,
    marginBottom: 6,
  },
  trigger: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: C.field,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  triggerIcon: {
    marginLeft: -4,
  },
  triggerText: {
    flex: 1,
    fontSize: 16,
    color: C.ink,
  },
  placeholder: {
    color: C.faint,
  },
  list: {
    marginTop: 6,
    borderRadius: 14,
    backgroundColor: C.field,
    paddingVertical: 4,
  },
  option: {
    minHeight: 46,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionIcon: {
    width: 32,
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: C.body,
  },
  optionTextActive: {
    color: C.ink,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: C.faint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: {
    backgroundColor: C.teal,
    borderColor: C.teal,
  },
});
