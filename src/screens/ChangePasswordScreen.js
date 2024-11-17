import React, { useState } from 'react';

import { 

  View, 

  Text, 

  StyleSheet, 

  SafeAreaView, 

  TextInput, 

  TouchableOpacity, 

  Alert,

  Platform,

  ActivityIndicator

} from 'react-native';

import { COLORS, SIZES } from '../constants/theme';

import { Ionicons } from '@expo/vector-icons';

import { supabase } from '../config/supabase';



const ChangePasswordScreen = ({ navigation }) => {

  const [currentPassword, setCurrentPassword] = useState('');

  const [newPassword, setNewPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);



  const handleChangePassword = async () => {

    if (!currentPassword || !newPassword || !confirmPassword) {

      Alert.alert('Error', 'Semua field harus diisi');

      return;

    }



    if (newPassword !== confirmPassword) {

      Alert.alert('Error', 'Password baru dan konfirmasi tidak cocok');

      return;

    }



    if (newPassword.length < 6) {

      Alert.alert('Error', 'Password minimal 6 karakter');

      return;

    }



    try {

      setLoading(true);



      const { error } = await supabase.auth.updateUser({

        password: newPassword

      });



      if (error) throw error;



      Alert.alert(

        'Sukses',

        'Password berhasil diubah',

        [{ text: 'OK', onPress: () => navigation.goBack() }]

      );



    } catch (error) {

      console.error('Change password error:', error);

      Alert.alert('Error', 'Gagal mengubah password. Silakan coba lagi.');

    } finally {

      setLoading(false);

    }

  };



  return (

    <SafeAreaView style={styles.safeArea}>

      <View style={styles.container}>

        {/* Header */}

        <View style={styles.header}>

          <TouchableOpacity 

            style={styles.backButton}

            onPress={() => navigation.goBack()}

          >

            <Ionicons name="chevron-back" size={28} color={COLORS.primary} />

          </TouchableOpacity>

          <Text style={styles.headerTitle}>Ubah Password</Text>

          <View style={{ width: 28 }} />

        </View>



        <View style={styles.content}>

          {/* Current Password */}

          <View style={styles.inputContainer}>

            <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />

            <TextInput

              style={styles.input}

              placeholder="Password Saat Ini"

              value={currentPassword}

              onChangeText={setCurrentPassword}

              secureTextEntry={!showCurrentPassword}

              placeholderTextColor={COLORS.gray}

            />

            <TouchableOpacity 

              onPress={() => setShowCurrentPassword(!showCurrentPassword)}

              style={styles.eyeIcon}

            >

              <Ionicons 

                name={showCurrentPassword ? "eye-outline" : "eye-off-outline"} 

                size={20} 

                color={COLORS.gray} 

              />

            </TouchableOpacity>

          </View>



          {/* New Password */}

          <View style={styles.inputContainer}>

            <Ionicons name="key-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />

            <TextInput

              style={styles.input}

              placeholder="Password Baru"

              value={newPassword}

              onChangeText={setNewPassword}

              secureTextEntry={!showNewPassword}

              placeholderTextColor={COLORS.gray}

            />

            <TouchableOpacity 

              onPress={() => setShowNewPassword(!showNewPassword)}

              style={styles.eyeIcon}

            >

              <Ionicons 

                name={showNewPassword ? "eye-outline" : "eye-off-outline"} 

                size={20} 

                color={COLORS.gray} 

              />

            </TouchableOpacity>

          </View>



          {/* Confirm New Password */}

          <View style={styles.inputContainer}>

            <Ionicons name="key-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />

            <TextInput

              style={styles.input}

              placeholder="Konfirmasi Password Baru"

              value={confirmPassword}

              onChangeText={setConfirmPassword}

              secureTextEntry={!showConfirmPassword}

              placeholderTextColor={COLORS.gray}

            />

            <TouchableOpacity 

              onPress={() => setShowConfirmPassword(!showConfirmPassword)}

              style={styles.eyeIcon}

            >

              <Ionicons 

                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 

                size={20} 

                color={COLORS.gray} 

              />

            </TouchableOpacity>

          </View>



          {/* Submit Button */}

          <TouchableOpacity 

            style={styles.submitButton}

            onPress={handleChangePassword}

            disabled={loading}

          >

            {loading ? (

              <ActivityIndicator color={COLORS.white} />

            ) : (

              <Text style={styles.submitButtonText}>Ubah Password</Text>

            )}

          </TouchableOpacity>

        </View>

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

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    padding: SIZES.padding,

    paddingTop: Platform.OS === 'android' ? SIZES.padding * 2 : SIZES.padding,

    backgroundColor: COLORS.white,

    borderBottomWidth: 1,

    borderBottomColor: COLORS.lightGray,

  },

  backButton: {

    padding: SIZES.base,

  },

  headerTitle: {

    fontSize: SIZES.large,

    fontWeight: '600',

    color: COLORS.primary,

  },

  content: {

    padding: SIZES.padding,

    gap: SIZES.padding,

  },

  inputContainer: {

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: COLORS.white,

    borderRadius: SIZES.radius,

    paddingHorizontal: SIZES.padding,

    borderWidth: 1,

    borderColor: COLORS.lightGray,

  },

  inputIcon: {

    marginRight: SIZES.base,

  },

  input: {

    flex: 1,

    paddingVertical: SIZES.padding,

    fontSize: SIZES.font,

    color: COLORS.primary,

  },

  eyeIcon: {

    padding: SIZES.base,

  },

  submitButton: {

    backgroundColor: COLORS.primary,

    padding: SIZES.padding,

    borderRadius: SIZES.radius,

    alignItems: 'center',

    marginTop: SIZES.padding,

  },

  submitButtonText: {

    color: COLORS.white,

    fontSize: SIZES.font,

    fontWeight: '600',

  }

});



export default ChangePasswordScreen; 
