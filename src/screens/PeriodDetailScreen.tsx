import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useScrudget } from '../context/ScrudgetContext';
import ExpenseRow from '../components/ExpenseRow';
import { theme, formatCurrency } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PeriodDetail'>;

export default function PeriodDetailScreen({ route, navigation }: Props) {
  const { scrudgetId, periodId } = route.params;
  const { state } = useScrudget();

  const period = state.periods.find((p) => p.id === periodId);
  const scrudget = state.scrudgets.find((b) => b.id === scrudgetId);

  const periodExpenses = useMemo(
    () =>
      state.expenses
        .filter((e) => e.scrudgetId === scrudgetId && e.periodId === periodId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [state.expenses, scrudgetId, periodId]
  );

  const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  if (!period) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Period not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{scrudget?.name ?? 'Scrudget'}</Text>
          <Text style={styles.headerSubtitle}>
            {formatDate(period.startDate)} — {period.endDate ? formatDate(period.endDate) : 'Now'}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Expense List (read-only) */}
      <FlatList
        data={periodExpenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <ExpenseRow
            name="Scrudget"
            amount={period.startingBalance}
            date={period.startDate}
            isIncome
          />
        }
        renderItem={({ item }) => (
          <ExpenseRow
            name={item.name}
            amount={item.amount}
            date={item.createdAt}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No expenses in this period</Text>
          </View>
        }
      />

      {/* Summary Footer */}
      <View style={styles.bottomSection}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>
              Scrudget:{' '}
              <Text style={{ color: theme.colors.positive }}>
                + £ {period.startingBalance.toFixed(2)}
              </Text>
            </Text>
            <Text style={styles.summaryLabel}>
              Expenses:{' '}
              <Text style={{ color: theme.colors.negative }}>
                - £ {totalExpenses.toFixed(2)}
              </Text>
            </Text>
          </View>
          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Final Balance</Text>
            <Text
              style={[
                styles.balanceAmount,
                {
                  color:
                    (period.finalBalance ?? 0) >= 0
                      ? theme.colors.positive
                      : theme.colors.negative,
                },
              ]}
            >
              {formatCurrency(period.finalBalance ?? 0)}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    flex: 1,
  },
  backText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: 2,
  },
  headerSpacer: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
  errorText: {
    color: theme.colors.negative,
    fontSize: theme.fontSize.lg,
    textAlign: 'center',
    marginTop: 100,
  },
  bottomSection: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  balanceSection: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
});
