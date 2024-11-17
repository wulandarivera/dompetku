import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Alert
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { incomeCategories, expenseCategories } from '../constants/categories';
import { useApp } from '../context/AppContext';

const TransactionModal = ({
  visible,
  modalType,
  amount,
  selectedCategory,
  otherCategoryDetail,
  onClose,
  onAmountChange,
  onCategorySelect,
  onOtherCategoryChange,
  onConfirm,
}) => {
  const { actions } = useApp();
  const categories = modalType === 'add' ? incomeCategories : expenseCategories;

  const handleConfirm = async () => {
    try {
      // Validasi input
      if (!amount || amount === '0') {
        Alert.alert('Error', 'Masukkan jumlah transaksi');
        return;
      }

      if (!selectedCategory) {
        Alert.alert('Error', 'Pilih kategori transaksi');
        return;
      }

      // Dapatkan kategori yang dipilih
      const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
      if (!selectedCategoryData) {
        Alert.alert('Error', 'Kategori tidak valid');
        return;
      }

      // Validasi detail kategori lainnya jika dipilih
      if (
        (modalType === 'add' && selectedCategory === 4 && !otherCategoryDetail) ||
        (modalType === 'subtract' && selectedCategory === 5 && !otherCategoryDetail)
      ) {
        Alert.alert('Error', 'Masukkan detail kategori');
        return;
      }

      // Siapkan data transaksi dengan default values untuk menghindari undefined
      const transactionData = {
        type: modalType,
        amount: parseInt(amount.replace(/[^0-9]/g, '')),
        category_id: selectedCategoryData.id,
        category_name: selectedCategoryData.name || 'Lainnya',
        category_icon: selectedCategoryData.icon || 'ellipsis-horizontal',
        category_color: selectedCategoryData.color || COLORS.primary,
        category_detail: otherCategoryDetail || ''
      };

      // Panggil fungsi onConfirm dengan data transaksi
      await onConfirm(transactionData);
      
      // Reset form setelah berhasil
      onAmountChange('');
      onCategorySelect('');
      onOtherCategoryChange('');
      onClose();
    } catch (error) {
      console.error('Transaction error:', error);
      Alert.alert('Error', 'Gagal menyimpan transaksi. Pastikan semua data terisi dengan benar.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.gray} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {modalType === 'add' ? 'Tambah Pemasukan' : 'Tambah Pengeluaran'}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Amount Input */}
              <View style={styles.amountContainer}>
                <Text style={styles.currencyPrefix}>Rp</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={text => {
                    // Hanya terima angka
                    const numericValue = text.replace(/[^0-9]/g, '');
                    onAmountChange(numericValue);
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.gray}
                />
              </View>

              {/* Categories */}
              <Text style={styles.sectionTitle}>Pilih Kategori</Text>
              <View style={styles.categoriesGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category.id && styles.selectedCategory
                    ]}
                    onPress={() => onCategorySelect(category.id)}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: `${category.color}15` }]}>
                      <Ionicons name={category.icon} size={24} color={category.color} />
                    </View>
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === category.id && styles.selectedCategoryText
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Other Category Detail */}
              {((modalType === 'add' && selectedCategory === 4) || 
                (modalType === 'subtract' && selectedCategory === 5)) && (
                <View style={styles.detailContainer}>
                  <Text style={styles.sectionTitle}>Detail Kategori</Text>
                  <TextInput
                    style={styles.detailInput}
                    value={otherCategoryDetail}
                    onChangeText={onOtherCategoryChange}
                    placeholder="Masukkan detail kategori"
                    placeholderTextColor={COLORS.gray}
                  />
                </View>
              )}
            </ScrollView>

            {/* Confirm Button */}
            <TouchableOpacity 
              style={[
                styles.confirmButton,
                { backgroundColor: modalType === 'add' ? COLORS.secondary : COLORS.primary }
              ]} 
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>Konfirmasi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    paddingBottom: Platform.OS === 'ios' ? 34 : SIZES.padding,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  closeButton: {
    padding: SIZES.base,
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  modalBody: {
    padding: SIZES.padding,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding * 2,
  },
  currencyPrefix: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: SIZES.base,
  },
  amountInput: {
    flex: 1,
    fontSize: SIZES.large * 1.2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.padding,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.padding,
    marginBottom: SIZES.padding * 2,
  },
  categoryButton: {
    width: '29%',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  selectedCategory: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  categoryText: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  detailContainer: {
    marginBottom: SIZES.padding * 2,
  },
  detailInput: {
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    fontSize: SIZES.font,
    color: COLORS.primary,
  },
  confirmButton: {
    margin: SIZES.padding,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontWeight: 'bold',
  }
});

export default TransactionModal;














