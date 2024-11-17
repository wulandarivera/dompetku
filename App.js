import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { authService } from './src/services/authService';
import LoadingScreen from './src/components/LoadingScreen';
import { notificationService } from './src/services/notificationService';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import AboutScreen from './src/screens/AboutScreen';
import HelpScreen from './src/screens/HelpScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';

// Import AppProvider
import { AppProvider } from './src/context/AppContext';

const Stack = createNativeStackNavigator();

// Auth Navigator
const AuthStack = createNativeStackNavigator();
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// Main Navigator
const MainStack = createNativeStackNavigator();
const MainNavigator = () => (
  <MainStack.Navigator screenOptions={{ headerShown: false }}>
    <MainStack.Screen name="Dashboard" component={DashboardScreen} />
    <MainStack.Screen name="Notifications" component={NotificationScreen} />
    <MainStack.Screen name="About" component={AboutScreen} />
    <MainStack.Screen name="Help" component={HelpScreen} />
    <MainStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
  </MainStack.Navigator>
);

// Root Component
const RootNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
    notificationService.init();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const { isLoggedIn: loggedIn } = await authService.checkAuth();
      setIsLoggedIn(loggedIn);
    } catch (error) {
      console.error('Check login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={isLoggedIn ? "Main" : "Auth"}
    >
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  );
};

// App Component
export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}
