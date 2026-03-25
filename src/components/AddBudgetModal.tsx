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
  ScrollView,
} from 'react-native';
import { useBudget } from '../context/BudgetContext';
import { PASTEL_COLORS, getRandomPastel } from './EditBudgetModal';

interface AddBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, baseValue: number, color: string) => void;
}

export default function AddBudgetModal({ visible, onClose, onSave }: AddBudgetModalProps) {
  const { colors } = useBudget();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    if (visible) {
      setName('');
      setAmount('');
      setColor(getRandomPastel());
    }
  }, [visible]);

  const handleSave = () => {
    const trimmedName = name.trim();
    const parsedAmount = parseFloat(amount);
    if (trimmedName && !isNaN(parsedAmount) && parsedAmount > 0) {
      onSave(trimmedName, parsedAmount, color);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}
      >
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>New Budget</Text>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Budget Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Travel, Groceries"
            placeholderTextColor={colors.textSecondary}
            autoFocus
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Base Value (£)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Color Indicator</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorRow}>
            {PASTEL_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorCircle,
                  { backgroundColor: c },
                  color === c && styles.selectedColorCircle,
                ]}
                onPress={() => setColor(c)}
              />
            ))}
          </ScrollView>

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
                { backgroundColor: colors.accent },
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
  colorRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 8,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorCircle: {
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
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
