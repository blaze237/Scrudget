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
import { formatCurrency } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PeriodDetail'>;

export default function PeriodDetailScreen({ route, navigation }: Props) {
  const { scrudgetId, periodId } = route.params;
  const { state, colors } = useScrudget();

  const period = state.periods.find((p) => p.id === periodId);
  const scrudget = state.scrudgets.find((b) => b.id === scrudgetId);

  const periodExpenses = useMemo(
    () =>
      state.expenses
        .filter((e) => e.scrudgetId === scrudgetId && e.periodId === periodId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.negative }]}>Period not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.textSecondary }]}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{scrudget?.name ?? 'Scrudget'}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
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
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No expenses in this period</Text>
          </View>
        }
      />

      {/* Summary Footer */}
      <View style={[styles.bottomSection, { borderTopColor: colors.border }]}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Scrudget:{' '}
              <Text style={{ color: colors.positive }}>
                + £ {period.startingBalance.toFixed(2)}
              </Text>
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Expenses:{' '}
              <Text style={{ color: colors.negative }}>
                - £ {totalExpenses.toFixed(2)}
              </Text>
            </Text>
          </View>
          <View style={styles.balanceSection}>
            <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Final Balance</Text>
            <Text
              style={[
                styles.balanceAmount,
                {
                  color:
                    (period.finalBalance ?? 0) >= 0
                      ? colors.positive
                      : colors.negative,
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    flex: 1,
  },
  backText: {
    fontSize: 16,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
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
    fontSize: 16,
  },
  errorText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 100,
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  summaryLabel: {
    fontSize: 13,
    lineHeight: 20,
  },
  balanceSection: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
});
