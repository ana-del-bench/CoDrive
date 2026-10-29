import { StyleSheet, Text, TextInput, View } from 'react-native';
import { C } from '../theme';

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'decimal-pad';
  multiline?: boolean;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.faint}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.notes]}
      />
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
  input: {
    height: 48,
    borderRadius: 12,
    backgroundColor: C.field,
    paddingHorizontal: 14,
    fontSize: 16,
    color: C.ink,
  },
  notes: {
    height: 88,
    paddingTop: 12,
    paddingBottom: 12,
  },
});
