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
import { useScrudget } from '../context/ScrudgetContext';

export const PASTEL_COLORS = [
  '#FFB3BA', // Red
  '#FBCFE8', // Pink
  '#E9D5FF', // Lavender
  '#C7D2FE', // Indigo
  '#BFDBFE', // Blue
  '#D3B8D8', // Purple
  '#F3D1F4', // Pink
  '#B5E1E9', // Teal
  '#FDFD96', // Pastel Lemon
  '#CFCFC4', // Pastel Grey
  '#FFC0CB', // Classic Pink
  '#E6E6FA', // Lavender
  '#98FF98', // Mint
  '#FFD1DC', // Pastel Rose
  '#AEC6CF', // Pastel Blue
  '#F49AC2', // Pastel Magenta
];

export const getRandomPastel = () => PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];

interface EditScrudgetModalProps {
  visible: boolean;
  scrudgetId: string | null;
  initialName: string;
  initialAmount: string;
  initialColor: string;
  onClose: () => void;
  onSave: (id: string, name: string, amount: number, color: string) => void;
}

export default function EditScrudgetModal({
  visible,
  scrudgetId,
  initialName,
  initialAmount,
  initialColor,
  onClose,
  onSave,
}: EditScrudgetModalProps) {
  const { colors } = useScrudget();
  const [name, setName] = useState(initialName);
  const [amount, setAmount] = useState(initialAmount);
  const [color, setColor] = useState(initialColor);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setAmount(initialAmount);
      setColor(initialColor);
    }
  }, [visible, initialName, initialAmount, initialColor]);

  const handleSave = () => {
    if (!scrudgetId) return;
    const trimmedName = name.trim();
    const parsedAmount = parseFloat(amount);
    if (trimmedName && !isNaN(parsedAmount) && parsedAmount > 0) {
      onSave(scrudgetId, trimmedName, parsedAmount, color);
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
          <Text style={[styles.title, { color: colors.textPrimary }]}>Edit Scrudget</Text>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Scrudget Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Base Value (£)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
            value={amount}
            onChangeText={setAmount}
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Color Indicator</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.colorRow}
            contentContainerStyle={styles.colorContent}
          >
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
    marginTop: 8,
    marginBottom: 8,
  },
  colorContent: {
    paddingVertical: 5,
    paddingHorizontal: 2,
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
