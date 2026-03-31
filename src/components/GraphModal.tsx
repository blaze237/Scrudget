import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { useScrudget } from '../context/ScrudgetContext';
import { formatCurrency } from '../theme';

import { Period } from '../types';

interface GraphModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  periods: Period[];
  aggregateBy?: 'month' | 'period';
}

type EntryRangeType = 'ALL' | 'LAST_12' | 'LAST_6' | 'LAST_3';

export default function GraphModal({ visible, onClose, title, periods, aggregateBy = 'month' }: GraphModalProps) {
  const { colors } = useScrudget();
  const { width: windowWidth } = useWindowDimensions();
  const screenWidth = Math.min(windowWidth - 32, 800); // padding, max width 800

  const [entryRange, setEntryRange] = useState<EntryRangeType>('ALL');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Process data for the chart
  const { labels, dataPoints } = useMemo(() => {
    if (!periods || periods.length === 0) {
      return { labels: [], dataPoints: [] };
    }

    const sortedRawPeriods = [...periods].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    let filteredPeriods = sortedRawPeriods;
    if (entryRange === 'LAST_12') {
      filteredPeriods = sortedRawPeriods.slice(-12);
    } else if (entryRange === 'LAST_6') {
      filteredPeriods = sortedRawPeriods.slice(-6);
    } else if (entryRange === 'LAST_3') {
      filteredPeriods = sortedRawPeriods.slice(-3);
    }

    const sortedPeriods = filteredPeriods;

    let outLabels: string[] = [];
    let outData: number[] = [];

    if (aggregateBy === 'month') {
      // Group by month-year
      const monthlyData: Record<string, number> = {};
      sortedPeriods.forEach((p) => {
        // Use endDate if available, else startDate to determine month
        const dateToUse = p.endDate ? new Date(p.endDate) : new Date(p.startDate);
        const monthYear = dateToUse.toLocaleString('en-GB', { month: 'short', year: '2-digit' });
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = 0;
        }
        monthlyData[monthYear] += p.finalBalance ?? 0;
      });
      outLabels = Object.keys(monthlyData);
      outData = Object.values(monthlyData);
    } else {
      // Display each period individually
      sortedPeriods.forEach((p, i) => {
        // Use ordinal index (1 to N) rather than date to ensure distinct points
        // even if multiple periods end on the exact same date
        const label = (i + 1).toString();
        outLabels.push(label);
        outData.push(p.finalBalance ?? 0);
      });
    }

    // Workaround: react-native-chart-kit renders incorrectly with only 1 data point.
    // We add a leading 0-point to give the real value context and a visible line.
    if (outData.length === 1) {
      outLabels = ['Start', ...outLabels];
      outData = [0, ...outData];
    }

    return { labels: outLabels, dataPoints: outData };
  }, [periods, entryRange, aggregateBy]);

  const getRangeLabel = (range: EntryRangeType) => {
    switch(range) {
      case 'ALL': return 'All Entries';
      case 'LAST_12': return 'Last 12 Entries';
      case 'LAST_6': return 'Last 6 Entries';
      case 'LAST_3': return 'Last 3 Entries';
    }
  };

  const handleSelectRange = (range: EntryRangeType) => {
    setEntryRange(range);
    setShowFilterModal(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: colors.textSecondary }]}>Close</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{title}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.filterContainer}>
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Show:</Text>
            <TouchableOpacity 
              style={[styles.filterValueBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => setShowFilterModal(true)}
            >
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{getRangeLabel(entryRange)} ▾</Text>
            </TouchableOpacity>
          </View>

          {dataPoints.length > 0 ? (
            (() => {
              const actualMax = Math.max(0, ...dataPoints);
              const actualMin = Math.min(0, ...dataPoints);
              
              // Snap to nearest 50 for Y-axis bounds
              const roundedMax = Math.ceil(actualMax / 50) * 50;
              const roundedMin = Math.floor(actualMin / 50) * 50;
              const visualRange = roundedMax - roundedMin;
              
              const zeroPercent = visualRange === 0 ? 0 : (roundedMax / visualRange) * 100;
              const segmentsCount = Math.max(1, visualRange / 50);

              // Invisible dataset to force perfectly rounded bounds
              const invisibleBounds = dataPoints.map((_, i) => {
                if (i === 0) return roundedMax;
                if (i === 1) return roundedMin;
                return 0;
              });

              // Dataset specifically for dashed zero line
              const zeroLineData = dataPoints.map(() => 0);

              return (
            <LineChart
              data={{
                labels: labels,
                datasets: [
                  {
                    // Main line
                    data: dataPoints,
                    color: () => 'url(#lineColor)',
                    strokeWidth: 3,
                    colors: dataPoints.map((val) => 
                       () => val >= 0 ? colors.positive : colors.negative
                    )
                  },
                  {
                    // Hidden bounds to force Y-Axis to nice £50 numbers
                    data: invisibleBounds,
                    color: () => 'transparent',
                    withDots: false,
                    strokeWidth: 0,
                  },
                  {
                    // Dashed line at Y=0
                    data: zeroLineData,
                    color: () => colors.border,
                    strokeWidth: 2,
                    withDots: false,
                    strokeDashArray: [5, 5] as any,
                  }
                ],
              }}
              decorator={() => (
                <Defs>
                  <LinearGradient id="lineColor" x1="0" y1="0" x2="0" y2="100%">
                    <Stop offset="0%" stopColor={colors.positive} stopOpacity="1" />
                    <Stop offset={`${zeroPercent}%`} stopColor={colors.positive} stopOpacity="1" />
                    <Stop offset={`${zeroPercent + 0.001}%`} stopColor={colors.negative} stopOpacity="1" />
                    <Stop offset="100%" stopColor={colors.negative} stopOpacity="1" />
                  </LinearGradient>
                </Defs>
              )}
              width={screenWidth}
              height={300}
              withVerticalLabels={false}
              yAxisLabel="£ "
              yAxisSuffix=""
              yAxisInterval={1}
              segments={segmentsCount}
              fromZero
              withShadow={false}
              getDotColor={(dataPoint) => 
                dataPoint >= 0 ? colors.positive : colors.negative
              }
              renderDotContent={({ x, y, index, indexData }) => {
                // Ensure we only render the tooltip for the primary dataset
                if (indexData !== dataPoints[index]) return null;
                
                return (
                  <Circle
                    key={`tooltip-${index}`}
                    cx={x}
                    cy={y}
                    r="14"
                    fill="transparent"
                    {...({ title: formatCurrency(indexData) } as any)}
                  />
                );
              }}
              verticalLabelRotation={labels.length > 6 ? 45 : 0} // rotate if crowded
              chartConfig={{
                backgroundColor: colors.surface,
                backgroundGradientFrom: colors.surface,
                backgroundGradientTo: colors.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => colors.textSecondary,
                labelColor: (opacity = 1) => colors.textPrimary,
                propsForBackgroundLines: {
                  stroke: colors.border,
                  strokeDasharray: "4", // Solidish lines
                },
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: colors.surface,
                },
              }}
              bezier
              style={{
                marginVertical: 16,
                borderRadius: 16,
              }}
            />
            );
            })()
          ) : (
            <View style={styles.emptyView}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No data available for this range.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Filter Selection Modal */}
        <Modal visible={showFilterModal} transparent animationType="fade" onRequestClose={() => setShowFilterModal(false)}>
          <View style={[styles.filterOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <View style={[styles.filterDialog, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.filterDialogTitle, { color: colors.textPrimary }]}>Select Range</Text>
              
              {(['ALL', 'LAST_12', 'LAST_6', 'LAST_3'] as EntryRangeType[]).map((range) => (
                <TouchableOpacity 
                  key={range} 
                  style={[
                    styles.filterOption, 
                    { borderTopColor: colors.border },
                    entryRange === range && { backgroundColor: colors.surface }
                  ]}
                  onPress={() => handleSelectRange(range)}
                >
                  <Text style={[
                    styles.filterOptionText, 
                    { color: entryRange === range ? colors.accent : colors.textPrimary }
                  ]}>
                    {getRangeLabel(range)}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity 
                style={[styles.filterCancelBtn, { borderTopColor: colors.border }]} 
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={[styles.filterCancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalSafeArea: {
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
  closeBtn: {
    flex: 1,
  },
  closeText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  content: {
    padding: 16,
    alignItems: 'center',
    paddingBottom: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    justifyContent: 'flex-start',
  },
  filterLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  filterValueBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  emptyView: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  emptyText: {
    fontSize: 16,
  },
  summaryBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    width: '100%',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryNote: {
    fontSize: 13,
  },
  filterOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  filterDialog: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  filterDialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    padding: 20,
    textAlign: 'center',
  },
  filterOption: {
    padding: 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  filterOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  filterCancelBtn: {
    padding: 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  filterCancelText: {
    fontSize: 16,
    fontWeight: '600',
  }
});
