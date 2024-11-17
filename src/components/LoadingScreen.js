import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';
import { useApp } from '../context/AppContext';

const LoadingScreen = () => {
  const { state } = useApp();
  const { isLoading } = state;

  if (!isLoading) return null;

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: COLORS.white 
    }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
};

export default LoadingScreen; 