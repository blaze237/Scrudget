import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { theme, formatCurrency } from '../theme';

interface BudgetCardProps {
  name: string;
  balance: number;
  onPress: () => void;
  onDelete?: () => void;
}

export default function BudgetCard({ name, balance, onPress, onDelete }: BudgetCardProps) {
  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.cardMain}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.name}>{name}</Text>
        <View style={styles.balanceSection}>
          <Text
            style={[
              styles.balance,
              { color: balance >= 0 ? theme.colors.positive : theme.colors.negative },
            ]}
          >
            {formatCurrency(balance)}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </View>
      </TouchableOpacity>

      {onDelete && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.actionIcon}>⋮</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.md,
    borderBottomLeftRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: theme.colors.border,
    paddingVertical: 18,
    paddingHorizontal: theme.spacing.md,
  },
  name: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    flex: 1,
  },
  balanceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balance: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  chevron: {
    color: theme.colors.accent,
    fontSize: 22,
    fontWeight: '700',
    marginRight: 4,
  },
  actionBtn: {
    backgroundColor: theme.colors.surface,
    borderTopRightRadius: theme.borderRadius.md,
    borderBottomRightRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 18,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    color: theme.colors.accent,
    fontSize: 20,
    fontWeight: '700',
  },
});
