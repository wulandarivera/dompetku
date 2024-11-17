import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Animated, Alert, TouchableOpacity, Platform } from 'react-native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';

// Import Components
import Header from '../components/Header';
import BalanceCard from '../components/BalanceCard';
import QuickStats from '../components/QuickStats';
import RecentTransactions from '../components/RecentTransactions';
import BottomNav from '../components/BottomNav';
import TransactionModal from '../components/TransactionModal';

// Import categories
import { incomeCategories, expenseCategories } from '../constants/categories';

// Import komponen Statistics
import Statistics from '../components/Statistics';

// Import ProfileScreen
import ProfileScreen from './ProfileScreen';

// Import services
import { transactionService } from '../services/transactionService';

// Import auth service
import { authService } from '../services/authService';

// Import Planning
import Planning from '../components/Planning';

// Import PlanningSnippet
import PlanningSnippet from '../components/PlanningSnippet';

// Import PlanningService
import { planningService } from '../services/planningService';

// Import context
import { useApp } from '../context/AppContext';

// Import notification service
import { notificationService } from '../services/notificationService';

export default function DashboardScreen() {
  const { state, actions } = useApp();
  const { balance, expenses, savings, transactions, plannings, isLoading } = state;

  // State lokal untuk UI
  const [activeTab, setActiveTab] = useState('home');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [otherCategoryDetail, setOtherCategoryDetail] = useState('');

  // Load data saat komponen mount
  useEffect(() => {
    setupNotifications();
    loadDashboardData();
  }, []);

  const setupNotifications = async () => {
    const hasPermission = await notificationService.requestPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Izin Notifikasi',
        'Mohon izinkan notifikasi untuk mendapatkan informasi penting'
      );
    }
  };

  // Tambahkan state untuk filter
  const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'
  const [filterDate, setFilterDate] = useState('all'); // 'all', 'today', 'week', 'month'

  // Tambahkan state untuk date range
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Animated Values
  const balanceScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Animation Functions
  const animateBalance = () => {
    Animated.sequence([
      Animated.timing(balanceScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(balanceScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTabChange = (tab) => {
    if (tab === 'home') {
      loadDashboardData();
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveTab(tab);
      slideAnim.setValue(50);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Transaction Handlers
  const handleTransaction = (type) => {
    setModalType(type);
    setAmount('');
    setSelectedCategory('');
    setOtherCategoryDetail('');
    setShowModal(true);
  };

  const handleConfirmTransaction = async (transactionData) => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        const transaction = {
          ...transactionData,
          user_id: user.id,
          created_at: new Date().toISOString()
        };

        await transactionService.createTransaction(transaction);
        setShowModal(false);
        setAmount('');
        setSelectedCategory('');
        setOtherCategoryDetail('');
        
        // Update data setelah transaksi
        actions.updateFinancialData();

        // Kirim notifikasi transaksi
        await notificationService.sendTransactionNotification(
          transactionData.type,
          parseFloat(transactionData.amount)
        );

        // Cek saldo rendah
        if (state.balance < 100000) {
          await notificationService.sendLowBalanceNotification(state.balance);
        }
      }
    } catch (error) {
      console.error('Transaction error:', error);
      Alert.alert('Error', 'Gagal menyimpan transaksi');
    }
  };

  // Tambahkan handler untuk profile button
  const handleProfilePress = () => {
    handleTabChange('profile');
  };

  // Tab Content Renderers
  const renderHomeTab = () => (
    <ScrollView style={styles.tabContent}>
      <BalanceCard 
        balance={Number(balance)}
        onPressAdd={() => handleTransaction('add')}
        onPressSubtract={() => handleTransaction('subtract')}
        balanceScale={balanceScale}
        rotateAnim={rotateAnim}
      />
      <PlanningSnippet 
        plannings={plannings}
        balance={Number(balance)}
      />
      <RecentTransactions 
        transactions={transactions ? transactions.slice(0, 5) : []} 
        onViewAll={() => handleTabChange('history')}
      />
    </ScrollView>
  );

  const renderStatisticsTab = () => (
    <Statistics 
      transactions={transactions || []}
      expenses={Number(expenses)}
      savings={Number(savings)}
      balance={Number(balance)}
    />
  );

  const renderProfileTab = () => (
    <ProfileScreen />
  );

  const renderTransactionHistory = () => {
    const groupTransactionsByDate = () => {
      const groups = {};
      const filteredTransactions = getFilteredTransactions();
      
      filteredTransactions.forEach(transaction => {
        const date = new Date(transaction.created_at).toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(transaction);
      });
      
      // Urutkan transaksi dalam setiap grup dari yang terbaru
      Object.keys(groups).forEach(date => {
        groups[date].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      });
      
      return groups;
    };

    const getFilteredTransactions = () => {
      let filtered = [...transactions];

      // Filter berdasarkan tipe
      if (filterType !== 'all') {
        filtered = filtered.filter(t => 
          filterType === 'income' ? t.type === 'add' : t.type === 'subtract'
        );
      }

      // Filter berdasarkan tanggal
      if (filterDate === 'custom') {
        filtered = filtered.filter(t => {
          const transactionDate = new Date(t.created_at);
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return transactionDate >= start && transactionDate <= end;
        });
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        filtered = filtered.filter(t => {
          const transactionDate = new Date(t.created_at);
          switch (filterDate) {
            case 'today':
              const endOfDay = new Date(today);
              endOfDay.setHours(23, 59, 59, 999);
              return transactionDate >= today && transactionDate <= endOfDay;
            case 'week':
              return transactionDate >= weekAgo;
            case 'month':
              return transactionDate >= monthAgo;
            default:
              return true;
          }
        });
      }

      return filtered;
    };

    const filteredTransactions = getFilteredTransactions();
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'add')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpense = filteredTransactions
      .filter(t => t.type === 'subtract')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return (
      <ScrollView style={styles.tabContent}>
        {/* Filter Section */}
        <View style={styles.filterCard}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filter Transaksi</Text>
            {(filterType !== 'all' || filterDate !== 'all') && (
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => {
                  setFilterType('all');
                  setFilterDate('all');
                }}
              >
                <Ionicons name="refresh" size={18} color={COLORS.primary} />
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Type Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Tipe Transaksi</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filterButtonsScroll}
            >
              <View style={styles.filterButtons}>
                <TouchableOpacity 
                  style={[
                    styles.filterButton,
                    filterType === 'all' && styles.filterButtonActive
                  ]}
                  onPress={() => setFilterType('all')}
                >
                  <Ionicons 
                    name="swap-horizontal" 
                    size={18} 
                    color={filterType === 'all' ? COLORS.white : COLORS.primary} 
                  />
                  <Text style={[
                    styles.filterButtonText,
                    filterType === 'all' && styles.filterButtonTextActive
                  ]}>Semua</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.filterButton,
                    filterType === 'income' && styles.filterButtonActive
                  ]}
                  onPress={() => setFilterType('income')}
                >
                  <Ionicons 
                    name="trending-up" 
                    size={18} 
                    color={filterType === 'income' ? COLORS.white : COLORS.secondary} 
                  />
                  <Text style={[
                    styles.filterButtonText,
                    filterType === 'income' && styles.filterButtonTextActive
                  ]}>Pemasukan</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.filterButton,
                    filterType === 'expense' && styles.filterButtonActive
                  ]}
                  onPress={() => setFilterType('expense')}
                >
                  <Ionicons 
                    name="trending-down" 
                    size={18} 
                    color={filterType === 'expense' ? COLORS.white : COLORS.red} 
                  />
                  <Text style={[
                    styles.filterButtonText,
                    filterType === 'expense' && styles.filterButtonTextActive
                  ]}>Pengeluaran</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          {/* Date Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Periode</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filterButtonsScroll}
            >
              <View style={styles.filterButtons}>
                <TouchableOpacity 
                  style={[
                    styles.filterButton,
                    filterDate === 'all' && styles.filterButtonActive
                  ]}
                  onPress={() => setFilterDate('all')}
                >
                  <Ionicons 
                    name="calendar" 
                    size={18} 
                    color={filterDate === 'all' ? COLORS.white : COLORS.primary} 
                  />
                  <Text style={[
                    styles.filterButtonText,
                    filterDate === 'all' && styles.filterButtonTextActive
                  ]}>Semua</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.filterButton,
                    filterDate === 'today' && styles.filterButtonActive
                  ]}
                  onPress={() => setFilterDate('today')}
                >
                  <Ionicons 
                    name="today" 
                    size={18} 
                    color={filterDate === 'today' ? COLORS.white : COLORS.primary} 
                  />
                  <Text style={[
                    styles.filterButtonText,
                    filterDate === 'today' && styles.filterButtonTextActive
                  ]}>Hari Ini</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.filterButton,
                    filterDate === 'week' && styles.filterButtonActive
                  ]}
                  onPress={() => setFilterDate('week')}
                >
                  <Ionicons 
                    name="calendar-outline" 
                    size={18} 
                    color={filterDate === 'week' ? COLORS.white : COLORS.primary} 
                  />
                  <Text style={[
                    styles.filterButtonText,
                    filterDate === 'week' && styles.filterButtonTextActive
                  ]}>7 Hari</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.filterButton,
                    filterDate === 'month' && styles.filterButtonActive
                  ]}
                  onPress={() => setFilterDate('month')}
                >
                  <Ionicons 
                    name="calendar" 
                    size={18} 
                    color={filterDate === 'month' ? COLORS.white : COLORS.primary} 
                  />
                  <Text style={[
                    styles.filterButtonText,
                    filterDate === 'month' && styles.filterButtonTextActive
                  ]}>30 Hari</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.filterButton,
                    filterDate === 'custom' && styles.filterButtonActive
                  ]}
                  onPress={() => setFilterDate('custom')}
                >
                  <Ionicons 
                    name="calendar-sharp" 
                    size={18} 
                    color={filterDate === 'custom' ? COLORS.white : COLORS.primary} 
                  />
                  <Text style={[
                    styles.filterButtonText,
                    filterDate === 'custom' && styles.filterButtonTextActive
                  ]}>Pilih Tanggal</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          {/* Custom Date Range */}
          {filterDate === 'custom' && (
            <View style={styles.dateRangeContainer}>
              <View style={styles.datePickerGroup}>
                <Text style={styles.dateLabel}>Dari Tanggal</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowStartPicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.dateButtonText}>
                    {startDate.toLocaleDateString('id-ID')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.datePickerGroup}>
                <Text style={styles.dateLabel}>Sampai Tanggal</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowEndPicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.dateButtonText}>
                    {endDate.toLocaleDateString('id-ID')}
                  </Text>
                </TouchableOpacity>
              </View>

              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowStartPicker(false);
                    if (selectedDate) {
                      setStartDate(selectedDate);
                    }
                  }}
                  maximumDate={endDate}
                />
              )}

              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowEndPicker(false);
                    if (selectedDate) {
                      setEndDate(selectedDate);
                    }
                  }}
                  minimumDate={startDate}
                  maximumDate={new Date()}
                />
              )}
            </View>
          )}
        </View>

        {/* Summary Section */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Pemasukan</Text>
            <Text style={[styles.summaryValue, { color: COLORS.secondary }]}>
              Rp {totalIncome.toLocaleString('id-ID')}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Pengeluaran</Text>
            <Text style={[styles.summaryValue, { color: COLORS.red }]}>
              Rp {totalExpense.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={COLORS.gray} />
            <Text style={styles.emptyText}>Tidak ada transaksi</Text>
            <Text style={styles.emptySubtext}>Coba ubah filter untuk melihat transaksi lain</Text>
          </View>
        ) : (
          Object.entries(groupTransactionsByDate()).map(([date, transactions]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{date}</Text>
              {transactions.map(transaction => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <View style={[
                      styles.iconContainer,
                      {
                        backgroundColor: transaction.type === 'add' 
                          ? `${COLORS.secondary}20` 
                          : `${COLORS.red}20`
                      }
                    ]}>
                      <Ionicons 
                        name={transaction.type === 'add' ? "trending-up" : "trending-down"}
                        size={20}
                        color={transaction.type === 'add' ? COLORS.secondary : COLORS.red}
                      />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionTitle}>
                        {transaction.category_name}
                        {transaction.category_detail ? ` - ${transaction.category_detail}` : ''}
                      </Text>
                      <Text style={styles.transactionTime}>
                        {new Date(transaction.created_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    { color: transaction.type === 'add' ? COLORS.secondary : COLORS.red }
                  ]}>
                    {transaction.type === 'add' ? '+' : '-'}Rp {parseFloat(transaction.amount).toLocaleString('id-ID')}
                  </Text>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  const renderActiveTab = () => {
    const content = (() => {
      switch (activeTab) {
        case 'home':
          return renderHomeTab();
        case 'statistics':
          return renderStatisticsTab();
        case 'history':
          return renderTransactionHistory();
        case 'planning':
          return (
            <Planning 
              balance={Number(balance)}
              plannings={plannings}
            />
          );
        case 'profile':
          return renderProfileTab();
        default:
          return renderHomeTab();
      }
    })();

    return (
      <Animated.View
        style={[
          styles.tabContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          }
        ]}
      >
        {content}
      </Animated.View>
    );
  };

  const loadDashboardData = async () => {
    try {
      await actions.updateFinancialData();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Gagal memuat data dashboard');
    }
  };

  // Tambahkan useEffect untuk memuat data saat komponen mount dan saat activeTab berubah
  useEffect(() => {
    if (activeTab === 'home') {
      loadDashboardData();
    }
  }, [activeTab]);

  // Tambahkan fungsi untuk refresh data
  const handleRefresh = async () => {
    await loadDashboardData();
  };

  return (
    <View style={styles.container}>
      <Header onProfilePress={handleProfilePress} />
      {renderActiveTab()}
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
      />
      <TransactionModal
        visible={showModal}
        modalType={modalType}
        amount={amount}
        selectedCategory={selectedCategory}
        otherCategoryDetail={otherCategoryDetail}
        onClose={() => {
          setShowModal(false);
          setSelectedCategory('');
          setOtherCategoryDetail('');
        }}
        onAmountChange={(text) => {
          const numericValue = text.replace(/[^0-9]/g, '');
          if (numericValue) {
            setAmount(parseInt(numericValue).toLocaleString('id-ID'));
          } else {
            setAmount('');
          }
        }}
        onCategorySelect={setSelectedCategory}
        onOtherCategoryChange={setOtherCategoryDetail}
        onConfirm={handleConfirmTransaction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  comingSoon: {
    fontSize: SIZES.large,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: '50%',
  },
  historyHeader: {
    backgroundColor: COLORS.white,
    padding: SIZES.base * 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  historyTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginLeft: SIZES.base,
  },
  historyScrollView: {
    flex: 1,
  },
  historyList: {
    padding: SIZES.padding,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
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
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
  },
  transactionAmount: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.base,
  },
  emptyHistory: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '50%',
    gap: SIZES.padding,
  },
  emptyText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    textAlign: 'center',
  },
  filterContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    margin: SIZES.padding,
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
  filterGroup: {
    marginBottom: SIZES.padding,
  },
  filterLabel: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.base,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.base,
  },
  filterButton: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
  },
  filterButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  dateRangeContainer: {
    marginTop: SIZES.padding,
    gap: SIZES.padding,
  },
  datePickerGroup: {
    gap: SIZES.base,
  },
  dateLabel: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    gap: SIZES.base,
  },
  dateButtonText: {
    fontSize: SIZES.font,
    color: COLORS.primary,
  },
  filterCard: {
    backgroundColor: COLORS.white,
    margin: SIZES.padding,
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
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  filterTitle: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.primary,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.base / 2,
  },
  resetText: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.primary,
  },
  filterSection: {
    marginBottom: SIZES.padding,
  },
  filterLabel: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
    marginBottom: SIZES.base,
  },
  filterButtonsScroll: {
    flexGrow: 0,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: SIZES.base,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    gap: SIZES.base / 2,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
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
  summaryItem: {
    flex: 1,
    alignItems: 'center',
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
  emptyState: {
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  emptyText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginTop: SIZES.padding,
  },
  emptySubtext: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
    marginTop: SIZES.base,
    textAlign: 'center',
  },
  dateGroup: {
    marginBottom: SIZES.padding,
  },
  dateHeader: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.gray,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.base,
  },
  transactionTime: {
    fontSize: SIZES.font * 0.8,
    color: COLORS.gray,
  },
}); 












