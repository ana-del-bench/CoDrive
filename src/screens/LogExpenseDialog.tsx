import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton, QuietButton } from '../components/Buttons';
import { Dialog, dialogStyles } from '../components/Dialog';
import { ExpenseGlyph } from '../components/ExpenseGlyph';
import { Field } from '../components/Field';
import { SelectField } from '../components/SelectField';
import { EXPENSE_TYPES } from '../expenses';
import { C } from '../theme';
import type { ExpenseType } from '../types';

const TYPE_OPTIONS = EXPENSE_TYPES.map((item) => ({
  value: item.value,
  label: item.label,
  icon: <ExpenseGlyph kind={item.value} size={30} />,
}));

export function LogExpenseDialog({
  tripTitle,
  type,
  name,
  amount,
  payers,
  paidBy,
  notes,
  onType,
  onName,
  onAmount,
  onPayer,
  onNotes,
  onLog,
  onClose,
  canLog,
  submitting,
  error,
}: {
  tripTitle: string;
  type: ExpenseType | null;
  name: string;
  amount: string;
  /** Names offered in the "Paid by" menu. */
  payers: string[];
  paidBy: string[];
  notes: string;
  onType: (value: ExpenseType) => void;
  onName: (value: string) => void;
  onAmount: (value: string) => void;
  onPayer: (value: string) => void;
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
        <SelectField
          label="Type"
          options={TYPE_OPTIONS}
          selected={type ? [type] : []}
          onSelect={(value) => onType(value as ExpenseType)}
          placeholder="Choose a type"
        />
        <Field label="Item Name" value={name} onChangeText={onName} placeholder="Gas, dinner, stay" />
        <Field label="Amount" value={amount} onChangeText={onAmount} placeholder="45.00" numeric />
        <SelectField
          label="Paid by"
          options={payers.map((person) => ({ value: person, label: person }))}
          selected={paidBy}
          onSelect={onPayer}
          placeholder="Choose who paid"
          multiple
        />
        <Field
          label="Notes (optional)"
          value={notes}
          onChangeText={onNotes}
          placeholder="Anything else, like how it was split"
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
