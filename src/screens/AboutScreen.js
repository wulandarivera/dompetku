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

const AboutScreen = () => {
  const appFeatures = [
    {
      icon: 'wallet-outline',
      title: 'Manajemen Keuangan',
      description: 'Kelola pemasukan dan pengeluaran dengan mudah',
      color: COLORS.secondary
    },
    {
      icon: 'bar-chart-outline',
      title: 'Statistik',
      description: 'Visualisasi data keuangan yang informatif',
      color: '#4CAF50'
    },
    {
      icon: 'flag-outline',
      title: 'Target Keuangan',
      description: 'Tetapkan dan pantau target finansial Anda',
      color: '#FF9800'
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="wallet" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.appName}>DOMPETKU</Text>
          <Text style={styles.version}>Versi 1.0.0</Text>
          <Text style={styles.tagline}>
            Solusi Pintar untuk Mengelola Keuangan Anda
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitur Utama</Text>
          <View style={styles.featureList}>
            {appFeatures.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}15` }]}>
                  <Ionicons name={feature.icon} size={24} color={feature.color} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Developer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pengembang</Text>
          <View style={styles.developerCard}>
            <Text style={styles.developerName}>SomeTech</Text>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => Linking.openURL('mailto:sometechssh@gmail.com')}
            >
              <Ionicons name="mail-outline" size={20} color={COLORS.white} />
              <Text style={styles.contactButtonText}>Hubungi Kami</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.footer}>
          <Text style={styles.copyright}>
            © 2024 DOMPETKU by SomeTech
          </Text>
          <Text style={styles.rights}>
            All rights reserved
          </Text>
        </View>
      </ScrollView>
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
  },
  header: {
    alignItems: 'center',
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.white,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  appName: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.base,
  },
  version: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginBottom: SIZES.padding,
  },
  tagline: {
    fontSize: SIZES.font * 1.1,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    padding: SIZES.padding * 2,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.padding,
  },
  featureList: {
    gap: SIZES.padding,
  },
  featureCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
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
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  featureTitle: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.base,
  },
  featureDescription: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
    lineHeight: 20,
  },
  developerCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: 'center',
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
  developerName: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.padding,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    gap: SIZES.base,
  },
  contactButtonText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  copyright: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginBottom: 4,
  },
  rights: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
  }
});

export default AboutScreen;


