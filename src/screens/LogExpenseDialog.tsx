import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton, QuietButton } from '../components/Buttons';
import { Dialog, dialogStyles } from '../components/Dialog';
import { Field } from '../components/Field';
import { C } from '../theme';

export function LogExpenseDialog({
  tripTitle,
  name,
  amount,
  notes,
  onName,
  onAmount,
  onNotes,
  onLog,
  onClose,
  canLog,
  submitting,
  error,
}: {
  tripTitle: string;
  name: string;
  amount: string;
  notes: string;
  onName: (value: string) => void;
  onAmount: (value: string) => void;
  onNotes: (value: string) => void;
  onLog: () => void;
  onClose: () => void;
  canLog: boolean;
  submitting?: boolean;
  error?: string | null;
}) {
  return (
    <Dialog onClose={onClose}>
      <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
        <Text style={dialogStyles.title}>Log Expense</Text>
        <Text style={dialogStyles.sub}>Add it to the shared log for {tripTitle}.</Text>
        <Field label="What was it" value={name} onChangeText={onName} placeholder="Gas, dinner, stay" />
        <Field label="Amount" value={amount} onChangeText={onAmount} placeholder="45.00" keyboardType="decimal-pad" />
        <Field
          label="Notes"
          value={notes}
          onChangeText={onNotes}
          placeholder="Who paid, and if it was split"
          multiline
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={dialogStyles.actions}>
          <PrimaryButton
            label={submitting ? 'Logging…' : 'Log Expense'}
            onPress={onLog}
            disabled={!canLog || submitting}
            loading={submitting}
          />
          <QuietButton label="Cancel" onPress={onClose} />
        </View>
      </ScrollView>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  error: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 18,
    color: C.muted,
  },
});
