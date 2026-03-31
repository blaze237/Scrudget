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
import { formatCurrency } from '../theme';
import GraphModal from '../components/GraphModal';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ArchivedPeriods'>;

export default function ArchivedPeriodsScreen({ route, navigation }: Props) {
  const { scrudgetId } = route.params;
  const { state, colors } = useScrudget();
  const [showGraph, setShowGraph] = React.useState(false);

  const archivedPeriods = useMemo(
    () =>
      state.periods
        .filter((p) => p.scrudgetId === scrudgetId && p.endDate !== null)
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
    [state.periods, scrudgetId]
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.textSecondary }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Past Periods</Text>
        <View style={styles.headerSpacer}>
          {archivedPeriods.length > 0 && (
            <TouchableOpacity onPress={() => setShowGraph(true)} style={styles.graphBtn}>
              <Text style={{ fontSize: 24, color: colors.textPrimary }}>📈</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={archivedPeriods}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.periodCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() =>
              navigation.navigate('PeriodDetail', {
                scrudgetId,
                periodId: item.id,
              })
            }
            activeOpacity={0.7}
          >
            <View>
              <Text style={[styles.periodDates, { color: colors.textPrimary }]}>
                {formatDate(item.startDate)} — {item.endDate ? formatDate(item.endDate) : 'Now'}
              </Text>
              <Text style={[styles.periodInfo, { color: colors.textSecondary }]}>
                Started: £ {item.startingBalance.toFixed(2)}
              </Text>
            </View>
            <View style={styles.rightSection}>
              <Text
                style={[
                  styles.periodBalance,
                  {
                    color:
                      (item.finalBalance ?? 0) >= 0
                        ? colors.positive
                        : colors.negative,
                  },
                ]}
              >
                {formatCurrency(item.finalBalance ?? 0)}
              </Text>
              <Text style={[styles.chevron, { color: colors.accent }]}>›</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No archived periods</Text>
          </View>
        }
      />

      <GraphModal
        visible={showGraph}
        onClose={() => setShowGraph(false)}
        title="Balance History"
        periods={archivedPeriods}
        aggregateBy="period"
      />
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  graphBtn: {
    padding: 8,
  },
  graphBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  periodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  periodDates: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  periodInfo: {
    fontSize: 13,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  periodBalance: {
    fontSize: 16,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 22,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
