import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useScrudget } from '../context/ScrudgetContext';

interface AddExpenseModalProps {
  visible: boolean;
  scrudgetId: string;
  onClose: () => void;
  onSave: (name: string, amount: number) => void;
}

export default function AddExpenseModal({
  visible,
  scrudgetId,
  onClose,
  onSave,
}: AddExpenseModalProps) {
  const { colors } = useScrudget();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setName('');
      setAmount('');
    }
  }, [visible]);

  const handleSave = () => {
    const trimmedName = name.trim();
    const parsedAmount = parseFloat(amount);
    
    if (trimmedName && !isNaN(parsedAmount) && parsedAmount > 0) {
      onSave(trimmedName, parsedAmount);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}
      >
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.negative }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>New Expense</Text>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Expense Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Taxi, Coffee"
            placeholderTextColor={colors.textSecondary}
            autoFocus
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Amount (£)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />

          <View style={styles.buttons}>
            <TouchableOpacity 
              style={[styles.cancelBtn, { borderColor: colors.border }]} 
              onPress={onClose}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: colors.negative },
                (!name.trim() || !amount) && styles.saveBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={!name.trim() || !amount}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    borderRadius: 16,
    padding: 24,
    width: '85%',
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderRadius: 6,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
