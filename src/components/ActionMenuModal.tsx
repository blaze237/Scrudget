import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useScrudget } from '../context/ScrudgetContext';

interface ActionMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  title?: string;
}

export default function ActionMenuModal({
  visible,
  onClose,
  onEdit,
  onDelete,
  title,
}: ActionMenuModalProps) {
  const { colors } = useScrudget();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}
      >
        <TouchableOpacity style={styles.backgroundTouch} onPress={onClose} activeOpacity={1}>
          <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {title && <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>}

            <TouchableOpacity 
              style={[styles.btn, styles.editBtn, { borderBottomColor: colors.border }]} 
              onPress={() => { onClose(); onEdit(); }}
            >
              <Text style={[styles.btnText, { color: colors.accent }]}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btn, styles.deleteBtn, { borderBottomColor: colors.border }]} 
              onPress={() => { onClose(); onDelete(); }}
            >
              <Text style={[styles.btnText, { color: colors.negative }]}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onClose}>
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
  backgroundTouch: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    borderRadius: 16,
    width: '80%',
    borderWidth: 1,
    overflow: 'hidden',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 16,
  },
  btn: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    borderBottomWidth: 1,
  },
  deleteBtn: {
    borderBottomWidth: 1,
  },
  cancelBtn: {
    backgroundColor: 'transparent',
  },
  btnText: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelText: {
    fontSize: 18,
    fontWeight: '500',
  },
});
