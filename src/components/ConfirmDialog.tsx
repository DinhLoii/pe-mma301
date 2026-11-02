import { Modal, Text, View } from 'react-native';
import { Button, styles } from './ui';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  busy?: boolean;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// Shared confirmation step; connect it to the real exam's delete action.
export function ConfirmDialog({
  visible, title, message, busy = false, confirmLabel = 'Confirm', onConfirm, onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => { if (!busy) onCancel(); }}>
      <View style={{ flex: 1, backgroundColor: '#0007', justifyContent: 'center', padding: 24 }}>
        <View style={styles.card} accessibilityViewIsModal>
          <Text accessibilityRole="header" style={styles.heading}>{title}</Text>
          <Text style={styles.text}>{message}</Text>
          <Button label={busy ? 'Please wait…' : confirmLabel} testID="confirm-action" disabled={busy} onPress={onConfirm} />
          <Button label="Cancel" testID="cancel-action" secondary disabled={busy} onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}
