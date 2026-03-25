import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatCurrency } from '../theme';
import { useBudget } from '../context/BudgetContext';

interface ExpenseRowProps {
  name: string;
  amount: number;
  date: string;
  isIncome?: boolean;
  onAction?: () => void;
}

export default function ExpenseRow({ name, amount, date, isIncome, onAction }: ExpenseRowProps) {
  const { colors } = useBudget();
  const displayDate = new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text
        style={[
          styles.name,
          { color: isIncome ? colors.positive : (colors.textPrimary || colors.accent) },
        ]}
      >
        {name}
      </Text>
      <Text
        style={[
          styles.amount,
          { color: isIncome ? colors.positive : colors.negative },
        ]}
      >
        {isIncome ? formatCurrency(amount) : formatCurrency(-amount)}
      </Text>
      <Text style={[styles.date, { color: colors.textSecondary }]}>{displayDate}</Text>
      {onAction ? (
        <TouchableOpacity 
          onPress={onAction} 
          style={[styles.actionBtn, { borderLeftColor: colors.border }]}
        >
          <Text style={[styles.actionIcon, { color: colors.accent }]}>⋮</Text>
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
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  date: {
    fontSize: 13,
    width: 45,
    textAlign: 'center',
    marginRight: 6,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderLeftWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyActionSpace: {
    width: 32,
  },
  actionIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
});
