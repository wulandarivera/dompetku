import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Platform,
  Linking 
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const HelpScreen = () => {
  const helpSections = [
    {
      title: 'Transaksi',
      items: [
        {
          question: 'Bagaimana cara menambah transaksi?',
          answer: 'Tekan tombol + (pemasukan) atau - (pengeluaran) pada halaman utama, lalu isi jumlah dan pilih kategori yang sesuai.',
          icon: 'wallet-outline'
        },
        {
          question: 'Bagaimana cara menghapus transaksi?',
          answer: 'Geser transaksi ke kiri pada halaman riwayat transaksi, lalu tekan tombol hapus.',
          icon: 'trash-outline'
        }
      ]
    },
    {
      title: 'Target Keuangan',
      items: [
        {
          question: 'Cara membuat target baru?',
          answer: 'Buka menu Target, tekan tombol + untuk membuat target baru. Isi nama target dan jumlah yang ingin dicapai.',
          icon: 'flag-outline'
        },
        {
          question: 'Bagaimana menandai target selesai?',
          answer: 'Saat target mencapai 100%, tekan tombol "Selesaikan" pada target tersebut.',
          icon: 'checkmark-circle-outline'
        }
      ]
    },
    {
      title: 'Akun & Keamanan',
      items: [
        {
          question: 'Cara mengubah password?',
          answer: 'Buka menu Profil, pilih "Ubah Password", masukkan password lama dan password baru Anda.',
          icon: 'lock-closed-outline'
        },
        {
          question: 'Cara mengatur notifikasi?',
          answer: 'Buka menu Profil, pilih "Notifikasi" untuk mengatur jenis notifikasi yang ingin Anda terima.',
          icon: 'notifications-outline'
        }
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pusat Bantuan</Text>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Help Sections */}
          {helpSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item, itemIndex) => (
                <View 
                  key={itemIndex} 
                  style={[
                    styles.helpItem,
                    itemIndex === section.items.length - 1 && { borderBottomWidth: 0 }
                  ]}
                >
                  <View style={styles.helpHeader}>
                    <View style={styles.iconContainer}>
                      <Ionicons name={item.icon} size={24} color={COLORS.primary} />
                    </View>
                    <Text style={styles.question}>{item.question}</Text>
                  </View>
                  <Text style={styles.answer}>{item.answer}</Text>
                </View>
              ))}
            </View>
          ))}

          {/* Contact Support */}
          <View style={styles.supportSection}>
            <Text style={styles.supportTitle}>Butuh bantuan lebih lanjut?</Text>
            <TouchableOpacity 
              style={styles.supportButton}
              onPress={() => Linking.openURL('mailto:sometechssh@gmail.com')}
            >
              <Ionicons name="mail-outline" size={20} color={COLORS.white} />
              <Text style={styles.supportButtonText}>Hubungi Support</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    paddingTop: Platform.OS === 'android' ? SIZES.padding * 2 : SIZES.padding,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.padding,
  },
  helpItem: {
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.base,
  },
  question: {
    flex: 1,
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.primary,
  },
  answer: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
    marginLeft: 48,
    lineHeight: 20,
  },
  supportSection: {
    padding: SIZES.padding * 2,
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginBottom: SIZES.padding,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 2,
    borderRadius: SIZES.radius,
    gap: SIZES.base,
  },
  supportButtonText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontWeight: '600',
  }
});

export default HelpScreen; 