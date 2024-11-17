import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  Alert,
  Platform,
  Modal,
  ActivityIndicator
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { planningService } from '../services/planningService';
import { authService } from '../services/authService';
import { planningCategories } from '../constants/planningCategories';
import { useApp } from '../context/AppContext';
import { notificationService } from '../services/notificationService';

const Planning = ({ balance = 0 }) => {
  const [plannings, setPlannings] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [targetAmount, setTargetAmount] = useState('');
  const [otherDetail, setOtherDetail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { actions } = useApp();

  useEffect(() => {
    loadPlannings();
  }, []);

  const loadPlannings = async () => {
    try {
      setIsLoading(true);
      const user = await authService.getCurrentUser();
      if (user) {
        const data = await planningService.getPlannings(user.id);
        setPlannings(data);
        actions.setPlannings(data);
      }
    } catch (error) {
      console.error('Error loading plannings:', error);
      Alert.alert('Error', 'Gagal memuat data planning');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = (target) => {
    return Math.min(Math.round((balance / target) * 100), 100);
  };

  const handleSetTarget = async () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Pilih kategori terlebih dahulu');
      return;
    }

    if (!targetAmount) {
      Alert.alert('Error', 'Masukkan jumlah target');
      return;
    }

    try {
      const user = await authService.getCurrentUser();
      if (user) {
        const amount = parseFloat(targetAmount.replace(/[^0-9]/g, ''));
        
        const newPlanning = {
          user_id: user.id,
          name: selectedCategory.id === 6 ? otherDetail : selectedCategory.name,
          icon: selectedCategory.icon,
          color: selectedCategory.color,
          target_amount: amount,
          current_amount: 0,
          status: 'ongoing',
          created_at: new Date().toISOString()
        };

        await planningService.createPlanning(newPlanning);
        await loadPlannings();
        
        setSelectedCategory(null);
        setTargetAmount('');
        setOtherDetail('');
        setIsAddingNew(false);
        
        Alert.alert('Sukses', 'Target berhasil ditetapkan');
      }
    } catch (error) {
      console.error('Error setting target:', error);
      Alert.alert('Error', 'Gagal menetapkan target');
    }
  };

  const handleDeletePlanning = async (planId) => {
    Alert.alert(
      "Hapus Target",
      "Apakah Anda yakin ingin menghapus target ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await planningService.deletePlanning(planId);
              await loadPlannings();
              Alert.alert('Sukses', 'Target berhasil dihapus');
            } catch (error) {
              console.error('Error deleting planning:', error);
              Alert.alert('Error', 'Gagal menghapus target');
            }
          }
        }
      ]
    );
  };

  const handleTargetComplete = async (planId, planName) => {
    try {
      await planningService.completePlanning(planId);
      await loadPlannings();
      
      // Kirim notifikasi target tercapai
      await notificationService.sendTargetAchievedNotification(planName);
      
      Alert.alert('Sukses', 'Target berhasil diselesaikan!');
    } catch (error) {
      console.error('Error completing planning:', error);
      Alert.alert('Error', 'Gagal menyelesaikan target');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.sectionTitleContainer}>
          <Ionicons name="calendar" size={24} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Target Keuangan</Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.addButton,
            isAddingNew && styles.activeAddButton
          ]}
          onPress={() => setIsAddingNew(!isAddingNew)}
        >
          <Ionicons 
            name={isAddingNew ? "close" : "add"} 
            size={24} 
            color={COLORS.white} 
          />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      ) : (
        <ScrollView style={styles.planningList}>
          {isAddingNew && (
            <View style={styles.addForm}>
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Pilih Kategori</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoriesScroll}
                >
                  {planningCategories.map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryButton,
                        selectedCategory?.id === category.id && styles.selectedCategory
                      ]}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                        <Ionicons name={category.icon} size={24} color={category.color} />
                      </View>
                      <Text style={[
                        styles.categoryText,
                        selectedCategory?.id === category.id && styles.selectedCategoryText
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {selectedCategory?.id === 6 && (
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Detail Target</Text>
                  <TextInput
                    style={styles.input}
                    value={otherDetail}
                    onChangeText={setOtherDetail}
                    placeholder="Masukkan detail target"
                    placeholderTextColor={COLORS.gray}
                  />
                </View>
              )}

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Jumlah Target</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencyPrefix}>Rp</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={targetAmount}
                    onChangeText={(text) => {
                      const numericValue = text.replace(/[^0-9]/g, '');
                      if (numericValue) {
                        setTargetAmount(parseInt(numericValue).toLocaleString('id-ID'));
                      } else {
                        setTargetAmount('');
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={COLORS.gray}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  (!selectedCategory || !targetAmount) && styles.disabledButton
                ]}
                onPress={handleSetTarget}
                disabled={!selectedCategory || !targetAmount}
              >
                <Text style={styles.submitButtonText}>Tetapkan Target</Text>
              </TouchableOpacity>
            </View>
          )}

          {plannings.map(plan => {
            const progress = calculateProgress(plan.target_amount);
            const isCompleted = plan.status === 'completed';

            return (
              <View key={plan.id} style={styles.planCard}>
                <View style={styles.planHeader}>
                  <View style={[styles.iconContainer, { 
                    backgroundColor: isCompleted ? `${COLORS.secondary}20` : `${plan.color}20` 
                  }]}>
                    <Ionicons 
                      name={isCompleted ? "checkmark-circle" : plan.icon} 
                      size={24} 
                      color={isCompleted ? COLORS.secondary : plan.color} 
                    />
                  </View>
                  <View style={styles.planInfo}>
                    <View style={styles.planNameContainer}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      {isCompleted && (
                        <View style={styles.completedBadge}>
                          <Ionicons name="checkmark" size={12} color={COLORS.white} />
                          <Text style={styles.completedText}>Selesai</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.planTarget}>
                      Target: Rp {plan.target_amount.toLocaleString('id-ID')}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeletePlanning(plan.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color={COLORS.red} />
                  </TouchableOpacity>
                </View>

                <View style={styles.progressContainer}>
                  {isCompleted ? (
                    <View style={styles.completedContainer}>
                      <Ionicons name="trophy" size={24} color={COLORS.secondary} />
                      <Text style={styles.completedMessage}>Target tercapai!</Text>
                    </View>
                  ) : (
                    <>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill,
                            { 
                              width: `${progress}%`, 
                              backgroundColor: progress === 100 ? COLORS.secondary : plan.color 
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[
                        styles.progressText, 
                        { color: progress === 100 ? COLORS.secondary : plan.color }
                      ]}>
                        {progress}%
                      </Text>
                    </>
                  )}
                </View>

                <View style={styles.bottomSection}>
                  <Text style={styles.currentAmount}>
                    {isCompleted ? 'Target Selesai' : `Terkumpul: Rp ${balance.toLocaleString('id-ID')}`}
                  </Text>
                  {progress === 100 && !isCompleted && (
                    <TouchableOpacity 
                      style={styles.completeButton}
                      onPress={() => handleTargetComplete(plan.id, plan.name)}
                    >
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
                      <Text style={styles.completeText}>Selesaikan</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  summaryCard: {
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
  summaryTitle: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.padding,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  planningList: {
    padding: SIZES.padding,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
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
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.base,
  },
  planInfo: {
    flex: 1,
    marginRight: SIZES.base,
  },
  planName: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 2,
  },
  planTarget: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    marginRight: SIZES.base,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease-out',
  },
  progressText: {
    fontSize: SIZES.font * 0.9,
    fontWeight: '600',
    width: 45,
    textAlign: 'right',
  },
  currentAmount: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
    marginTop: SIZES.base,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  modalBody: {
    padding: SIZES.padding,
  },
  categoriesScroll: {
    marginTop: SIZES.base,
  },
  categoryButton: {
    alignItems: 'center',
    marginRight: SIZES.padding,
    padding: SIZES.base,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    width: 100,
  },
  selectedCategory: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  inputContainer: {
    marginBottom: SIZES.padding,
  },
  inputLabel: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginBottom: SIZES.base,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: SIZES.base,
    color: COLORS.primary,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
  },
  currencyPrefix: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginRight: SIZES.base,
  },
  amountInput: {
    flex: 1,
    padding: SIZES.padding,
    fontSize: SIZES.font,
    color: COLORS.primary,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: SIZES.padding,
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
    opacity: 0.5,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  deleteButton: {
    padding: SIZES.base,
    marginLeft: SIZES.base,
  },
  addForm: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    padding: SIZES.padding,
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
  formSection: {
    marginBottom: SIZES.padding * 1.5,
  },
  formLabel: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.base,
  },
  activeAddButton: {
    backgroundColor: COLORS.red,
  },
  categoryText: {
    fontSize: SIZES.font * 0.85,
    color: COLORS.gray,
    marginTop: SIZES.base,
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.base,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.secondary}15`,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    gap: SIZES.base / 2,
  },
  completeText: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  planNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.base,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SIZES.base,
    paddingVertical: 2,
    borderRadius: SIZES.radius,
    gap: 2,
  },
  completedText: {
    fontSize: SIZES.font * 0.7,
    color: COLORS.white,
    fontWeight: '600',
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.base,
    paddingVertical: SIZES.padding,
  },
  completedMessage: {
    fontSize: SIZES.font,
    color: COLORS.secondary,
    fontWeight: '600',
  },
});

export default Planning;






