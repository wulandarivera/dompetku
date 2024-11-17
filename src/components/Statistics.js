import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';
import { transactionService } from '../services/transactionService';
import { useApp } from '../context/AppContext';

// Tambahkan konstanta warna untuk kategori pengeluaran
const EXPENSE_COLORS = {
  'Makanan': {
    main: '#FF6B6B',
    light: '#FFE8E8'
  },
  'Transport': {
    main: '#4ECDC4',
    light: '#E8F8F7'
  },
  'Belanja': {
    main: '#45B7D1',
    light: '#E8F6FA'
  },
  'Tagihan': {
    main: '#96CEB4',
    light: '#EEF6F2'
  },
  'Lainnya': {
    main: '#6C5CE7',
    light: '#ECEAFC'
  }
};

// Tambahkan konstanta untuk ikon kategori
const EXPENSE_CATEGORIES = {
  'Makanan': {
    main: '#FF6B6B',
    light: '#FFE8E8',
    icon: 'fast-food-outline'
  },
  'Transport': {
    main: '#4ECDC4',
    light: '#E8F8F7',
    icon: 'car-outline'
  },
  'Belanja': {
    main: '#45B7D1',
    light: '#E8F6FA',
    icon: 'cart-outline'
  },
  'Tagihan': {
    main: '#96CEB4',
    light: '#EEF6F2',
    icon: 'receipt-outline'
  },
  'Lainnya': {
    main: '#6C5CE7',
    light: '#ECEAFC',
    icon: 'ellipsis-horizontal-outline'
  }
};

const Statistics = () => {
  const { state } = useApp();
  const { transactions, expenses, savings, balance } = state;
  const [monthlyStats, setMonthlyStats] = useState({});
  const [expenseDistribution, setExpenseDistribution] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('6'); // '3', '6', '12' bulan
  const [isOverviewVisible, setIsOverviewVisible] = useState(false);
  const [isTrendVisible, setIsTrendVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadStatisticsData = async () => {
    setIsLoading(true);
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        const monthsAgo = new Date();
        monthsAgo.setMonth(monthsAgo.getMonth() - parseInt(selectedPeriod));

        // Ambil transaksi dari database
        const allTransactions = await transactionService.getTransactions(user.id);
        
        // Filter transaksi sesuai periode yang dipilih
        const filteredTransactions = allTransactions.filter(
          t => new Date(t.created_at) >= monthsAgo
        );

        // Hitung statistik bulanan
        const monthlyData = calculateMonthlyStats(filteredTransactions);
        setMonthlyStats(monthlyData);

        // Hitung distribusi pengeluaran
        const expenseData = calculateExpenseDistribution(filteredTransactions);
        setExpenseDistribution(expenseData);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
      Alert.alert('Error', 'Gagal memuat data statistik');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatisticsData();
  }, [selectedPeriod]); // Reload saat periode berubah

  const calculateMonthlyStats = (transactionData) => {
    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

    // Inisialisasi data untuk 6 bulan terakhir
    for (let i = 0; i < parseInt(selectedPeriod); i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = `${months[date.getMonth()]} ${date.getFullYear()}`;
      monthlyData[monthYear] = {
        income: 0,
        expense: 0
      };
    }

    // Isi data transaksi
    transactionData.forEach(transaction => {
      const date = new Date(transaction.created_at);
      const monthYear = `${months[date.getMonth()]} ${date.getFullYear()}`;
      
      if (monthlyData[monthYear]) {
        const amount = parseFloat(transaction.amount);
        if (transaction.type === 'add') {
          monthlyData[monthYear].income += amount;
        } else {
          monthlyData[monthYear].expense += amount;
        }
      }
    });

    return monthlyData;
  };

  const calculateExpenseDistribution = (transactionData) => {
    const expensesByCategory = {};
    const totalExpense = transactionData
      .filter(t => t.type === 'subtract')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    transactionData
      .filter(t => t.type === 'subtract')
      .forEach(t => {
        if (!expensesByCategory[t.category_name]) {
          expensesByCategory[t.category_name] = {
            amount: 0,
            color: EXPENSE_CATEGORIES[t.category_name]?.main || EXPENSE_CATEGORIES['Lainnya'].main,
            bgColor: EXPENSE_CATEGORIES[t.category_name]?.light || EXPENSE_CATEGORIES['Lainnya'].light,
            icon: EXPENSE_CATEGORIES[t.category_name]?.icon || EXPENSE_CATEGORIES['Lainnya'].icon
          };
        }
        expensesByCategory[t.category_name].amount += parseFloat(t.amount);
      });

    return Object.entries(expensesByCategory)
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        percentage: ((data.amount / totalExpense) * 100).toFixed(1),
        color: data.color,
        bgColor: data.bgColor,
        icon: data.icon
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const getLineChartData = () => {
    // Urutkan data berdasarkan tanggal
    const sortedLabels = Object.keys(monthlyStats).sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      const dateA = new Date(`${monthA} 1, ${yearA}`);
      const dateB = new Date(`${monthB} 1, ${yearB}`);
      return dateA - dateB;
    });

    const incomeData = sortedLabels.map(month => monthlyStats[month].income);
    const expenseData = sortedLabels.map(month => monthlyStats[month].expense);

    return {
      labels: sortedLabels,
      datasets: [
        {
          data: incomeData,
          color: (opacity = 1) => COLORS.secondary,
          strokeWidth: 2
        },
        {
          data: expenseData,
          color: (opacity = 1) => COLORS.red,
          strokeWidth: 2
        }
      ],
      legend: ['Pemasukan', 'Pengeluaran']
    };
  };

  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    color: (opacity = 1) => COLORS.primary,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    formatYLabel: (value) => `${(parseInt(value)/1000000).toFixed(1)}jt`,
  };

  const PeriodSelector = () => (
    <View style={styles.periodSelector}>
      {['3', '6', '12'].map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period && styles.periodButtonTextActive
          ]}>
            {period} Bulan
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Distribusi Pengeluaran Card */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="pie-chart" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Distribusi Pengeluaran</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Memuat data...</Text>
          </View>
        ) : expenseDistribution.length > 0 ? (
          <>
            <View style={styles.totalExpenseContainer}>
              <Text style={styles.totalExpenseLabel}>Total Pengeluaran</Text>
              <Text style={styles.totalExpenseValue}>
                Rp {expenseDistribution.reduce((sum, item) => sum + item.amount, 0).toLocaleString('id-ID')}
              </Text>
            </View>

            <View style={styles.distributionList}>
              {expenseDistribution.map((item, index) => (
                <View 
                  key={index} 
                  style={styles.distributionItem}
                >
                  <View style={styles.distributionLeft}>
                    <View style={[styles.categoryIcon, { backgroundColor: item.bgColor }]}>
                      <Ionicons 
                        name={item.icon}
                        size={20} 
                        color={item.color} 
                      />
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={[styles.categoryName, { color: item.color }]}>
                        {item.name}
                      </Text>
                      <Text style={styles.categoryAmount}>
                        Rp {item.amount.toLocaleString('id-ID')}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.percentageBox, { backgroundColor: item.bgColor }]}>
                    <Text style={[styles.percentageText, { color: item.color }]}>
                      {item.percentage}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyChart}>
            <Ionicons name="pie-chart-outline" size={48} color={COLORS.gray} />
            <Text style={styles.emptyText}>Belum ada data pengeluaran</Text>
          </View>
        )}
      </View>

      {/* Ringkasan Keuangan Card */}
      <View style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="wallet" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Ringkasan Keuangan</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={() => setIsOverviewVisible(!isOverviewVisible)}
          style={[
            styles.toggleButton,
            isOverviewVisible ? styles.toggleButtonActive : styles.toggleButtonInactive
          ]}
        >
          <Ionicons 
            name={isOverviewVisible ? "lock-closed" : "lock-open"} 
            size={18} 
            color={isOverviewVisible ? COLORS.white : COLORS.primary} 
          />
          <Text style={[
            styles.toggleButtonText,
            isOverviewVisible ? styles.toggleButtonTextActive : styles.toggleButtonTextInactive
          ]}>
            {isOverviewVisible ? 'Sembunyikan Detail' : 'Tampilkan Detail'}
          </Text>
        </TouchableOpacity>
        
        {isOverviewVisible && (
          <View style={styles.statsColumn}>
            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <View style={[styles.iconWrapper, { backgroundColor: `${COLORS.primary}15` }]}>
                  <Ionicons name="wallet-outline" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.statLabel}>Total Saldo</Text>
              </View>
              <Text style={[styles.statAmount, { color: COLORS.primary }]}>
                Rp {balance.toLocaleString('id-ID')}
              </Text>
            </View>

            <View style={styles.horizontalDivider} />

            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <View style={[styles.iconWrapper, { backgroundColor: `${COLORS.red}15` }]}>
                  <Ionicons name="trending-down" size={20} color={COLORS.red} />
                </View>
                <Text style={styles.statLabel}>Total Pengeluaran</Text>
              </View>
              <Text style={[styles.statAmount, { color: COLORS.red }]}>
                Rp {expenses.toLocaleString('id-ID')}
              </Text>
            </View>

            <View style={styles.horizontalDivider} />

            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <View style={[styles.iconWrapper, { backgroundColor: `${COLORS.secondary}15` }]}>
                  <Ionicons name="save" size={20} color={COLORS.secondary} />
                </View>
                <Text style={styles.statLabel}>Total Tabungan</Text>
              </View>
              <Text style={[styles.statAmount, { color: COLORS.secondary }]}>
                Rp {savings.toLocaleString('id-ID')}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Tren Keuangan Card */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="trending-up" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Tren Keuangan</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => setIsTrendVisible(!isTrendVisible)}
          style={[
            styles.toggleButton,
            isTrendVisible ? styles.toggleButtonActive : styles.toggleButtonInactive
          ]}
        >
          <Ionicons 
            name={isTrendVisible ? "lock-closed" : "lock-open"} 
            size={18} 
            color={isTrendVisible ? COLORS.white : COLORS.primary} 
          />
          <Text style={[
            styles.toggleButtonText,
            isTrendVisible ? styles.toggleButtonTextActive : styles.toggleButtonTextInactive
          ]}>
            {isTrendVisible ? 'Sembunyikan Detail' : 'Tampilkan Detail'}
          </Text>
        </TouchableOpacity>

        {isTrendVisible && (
          <>
            <View style={styles.periodSelectorContainer}>
              <View style={styles.periodSelector}>
                {['3', '6', '12'].map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodButton,
                      selectedPeriod === period && styles.periodButtonActive
                    ]}
                    onPress={() => setSelectedPeriod(period)}
                  >
                    <Text style={[
                      styles.periodButtonText,
                      selectedPeriod === period && styles.periodButtonTextActive
                    ]}>
                      {period} Bulan
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {Object.keys(monthlyStats).length > 0 ? (
              <>
                <View style={styles.chartSummary}>
                  <View style={styles.summaryItem}>
                    <View style={[styles.summaryIcon, { backgroundColor: `${COLORS.secondary}20` }]}>
                      <Ionicons name="trending-up" size={20} color={COLORS.secondary} />
                    </View>
                    <Text style={styles.summaryLabel}>Total Pemasukan</Text>
                    <Text style={[styles.summaryValue, { color: COLORS.secondary }]}>
                      Rp {Object.values(monthlyStats).reduce((sum, stat) => sum + stat.income, 0).toLocaleString('id-ID')}
                    </Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <View style={[styles.summaryIcon, { backgroundColor: `${COLORS.red}20` }]}>
                      <Ionicons name="trending-down" size={20} color={COLORS.red} />
                    </View>
                    <Text style={styles.summaryLabel}>Total Pengeluaran</Text>
                    <Text style={[styles.summaryValue, { color: COLORS.red }]}>
                      Rp {Object.values(monthlyStats).reduce((sum, stat) => sum + stat.expense, 0).toLocaleString('id-ID')}
                    </Text>
                  </View>
                </View>

                <View style={styles.chartContainer}>
                  <LineChart
                    data={getLineChartData()}
                    width={screenWidth - (SIZES.padding * 4)}
                    height={220}
                    chartConfig={{
                      ...chartConfig,
                      propsForLabels: {
                        fontSize: 10,
                      },
                      propsForVerticalLabels: {
                        fontSize: 10,
                      },
                    }}
                    bezier
                    style={styles.chart}
                  />
                </View>

                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: COLORS.secondary }]} />
                    <Text style={styles.legendText}>Pemasukan</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: COLORS.red }]} />
                    <Text style={styles.legendText}>Pengeluaran</Text>
                  </View>
                </View>

                <View style={styles.monthlyDetails}>
                  {Object.entries(monthlyStats)
                    .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                    .map(([month, data]) => (
                      <View key={month} style={styles.monthlyItem}>
                        <Text style={styles.monthLabel}>{month}</Text>
                        <View style={styles.monthValues}>
                          <Text style={[styles.monthValue, { color: COLORS.secondary }]}>
                            +Rp {data.income.toLocaleString('id-ID')}
                          </Text>
                          <Text style={[styles.monthValue, { color: COLORS.red }]}>
                            -Rp {data.expense.toLocaleString('id-ID')}
                          </Text>
                        </View>
                      </View>
                    ))}
                </View>
              </>
            ) : (
              <View style={styles.emptyChart}>
                <Ionicons name="bar-chart-outline" size={48} color={COLORS.gray} />
                <Text style={styles.emptyText}>Belum ada data transaksi</Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  overviewCard: {
    backgroundColor: COLORS.white,
    margin: SIZES.padding,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gray,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  chartCard: {
    backgroundColor: COLORS.white,
    margin: SIZES.padding,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gray,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.padding,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statBox: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gray,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statLabel: {
    fontSize: SIZES.font * 0.8,
    color: COLORS.gray,
    marginVertical: SIZES.base,
    textAlign: 'center',
  },
  statValue: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chartHeader: {
    marginBottom: SIZES.padding * 1.5,
  },
  periodSelectorContainer: {
    marginTop: SIZES.padding,
  },
  periodLabel: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
    marginBottom: SIZES.base,
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius - 2,
    minWidth: 40,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gray,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  periodButtonText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  periodSuffix: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
    marginLeft: SIZES.base,
    marginRight: SIZES.base,
  },
  chartContainer: {
    marginVertical: SIZES.padding,
  },
  chart: {
    marginVertical: SIZES.base,
    borderRadius: SIZES.radius,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SIZES.padding * 2,
    paddingTop: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.base,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
    fontWeight: '500',
  },
  distributionList: {
    paddingTop: SIZES.padding,
    gap: SIZES.base,
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gray,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  distributionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: SIZES.font,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryAmount: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
  },
  percentageBox: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    minWidth: 60,
    alignItems: 'center',
  },
  percentageText: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
  totalExpenseContainer: {
    alignItems: 'center',
    paddingBottom: SIZES.padding,
    marginBottom: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  totalExpenseLabel: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginBottom: SIZES.base,
  },
  totalExpenseValue: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding,
    height: 220,
  },
  pieChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  distributionListContainer: {
    maxHeight: 300,
    paddingHorizontal: SIZES.padding,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.padding * 0.8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  distributionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.base,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  categoryAmount: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
  },
  percentageText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginLeft: SIZES.padding,
    minWidth: 50,
    textAlign: 'right',
  },
  overviewHeader: {
    marginBottom: SIZES.base,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.base,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  emptyChart: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.base,
  },
  emptyText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.padding,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statAmount: {
    fontSize: SIZES.medium,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
    fontWeight: '500',
    textAlign: 'center',
  },
  verticalDivider: {
    width: 1,
    height: '70%',
    backgroundColor: COLORS.lightGray,
    marginHorizontal: SIZES.base,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.base * 0.8,
    paddingHorizontal: SIZES.base * 1.5,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    marginBottom: SIZES.padding,
    alignSelf: 'center',
    gap: SIZES.base * 0.5,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleButtonInactive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
  },
  toggleButtonText: {
    fontSize: SIZES.font * 0.8,
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: COLORS.white,
  },
  toggleButtonTextInactive: {
    color: COLORS.primary,
  },
  statsColumn: {
    paddingTop: SIZES.base,
  },
  statItem: {
    paddingVertical: SIZES.base,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  statAmount: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginLeft: SIZES.padding + 28, // Sejajar dengan label setelah ikon
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: -SIZES.padding,
    marginVertical: SIZES.padding * 0.8,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.base,
  },
  chartSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginVertical: SIZES.padding,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  summaryLabel: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
  summaryDivider: {
    width: 1,
    height: '100%',
    backgroundColor: COLORS.lightGray,
    marginHorizontal: SIZES.padding,
  },
  monthlyDetails: {
    marginTop: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: SIZES.padding,
  },
  monthlyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.base,
  },
  monthLabel: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    fontWeight: '500',
  },
  monthValues: {
    alignItems: 'flex-end',
  },
  monthValue: {
    fontSize: SIZES.font * 0.9,
    marginBottom: 2,
  },
  periodSelectorContainer: {
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: 2,
  },
  totalExpenseContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  totalExpenseLabel: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginBottom: SIZES.base,
  },
  totalExpenseValue: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  distributionChartContainer: {
    alignItems: 'center',
    marginVertical: SIZES.padding,
    height: 200,
  },
  pieChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  distributionListContainer: {
    maxHeight: 300,
    paddingHorizontal: SIZES.padding,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.padding * 0.8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  distributionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.base,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  categoryAmount: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
  },
  percentageText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginLeft: SIZES.padding,
    minWidth: 50,
    textAlign: 'right',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.padding,
  },
  loadingText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
});

export default Statistics;