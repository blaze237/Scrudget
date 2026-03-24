import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme, formatCurrency } from '../theme';

interface ExpenseRowProps {
  name: string;
  amount: number;
  date: string;
  isIncome?: boolean;
  onDelete?: () => void;
}

export default function ExpenseRow({ name, amount, date, isIncome, onDelete }: ExpenseRowProps) {
  const displayDate = new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });

  return (
    <View style={styles.row}>
      <Text
        style={[
          styles.name,
          { color: isIncome ? theme.colors.positive : theme.colors.accent },
        ]}
      >
        {name}
      </Text>
      <Text
        style={[
          styles.amount,
          { color: isIncome ? theme.colors.positive : theme.colors.negative },
        ]}
      >
        {isIncome ? formatCurrency(amount) : formatCurrency(-amount)}
      </Text>
      <Text style={styles.date}>{displayDate}</Text>
      {onDelete ? (
        <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
          <Text style={styles.actionIcon}>⋮</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.emptyActionSpace} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  name: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: '500',
  },
  amount: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginRight: 12,
  },
  date: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    width: 45,
    textAlign: 'center',
    marginRight: 6,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyActionSpace: {
    width: 32, // approximately the width of the action button so fields align
  },
  actionIcon: {
    color: theme.colors.accent,
    fontSize: 20,
    fontWeight: '700',
  },
});
