import { ScrollView, Text, View } from 'react-native';
import { PrimaryButton, QuietButton } from '../components/Buttons';
import { Dialog, dialogStyles } from '../components/Dialog';
import { Field } from '../components/Field';

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
        <View style={dialogStyles.actions}>
          <PrimaryButton label="Log Expense" onPress={onLog} disabled={!canLog} />
          <QuietButton label="Cancel" onPress={onClose} />
        </View>
      </ScrollView>
    </Dialog>
  );
}
