import React from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { KYCScreen } from '../screens/KYCScreen';
import { NewsScreen } from '../screens/NewsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';

// Stack Navigator para autenticación
const AuthStack = createStackNavigator();
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// Tab Navigator para la app principal (usuarios no verificados)
const Tab = createBottomTabNavigator();
const UnverifiedTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        switch (route.name) {
          case 'Home':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'KYC':
            iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
            break;
          default:
            iconName = 'help-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#8E8E93',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopColor: '#E5E5EA',
        borderTopWidth: 1,
        paddingTop: 8,
        paddingBottom: 8,
        height: 60,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      },
      headerStyle: {
        backgroundColor: '#007AFF',
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen} 
      options={({ navigation }) => ({ 
        title: 'Inicio',
        headerTitle: 'TradeOptix',
        headerRight: () => (
          <View style={{ flexDirection: 'row', marginRight: 15, gap: 10 }}>
            <TouchableOpacity onPress={() => navigation.navigate('News')}>
              <Ionicons name="newspaper" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={{ position: 'relative' }}>
              <Ionicons name="notifications" size={24} color="#FFFFFF" />
              <View style={{
                position: 'absolute',
                top: -2,
                right: -2,
                backgroundColor: '#FF3B30',
                borderRadius: 8,
                minWidth: 16,
                height: 16,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        )
      })} 
    />
    <Tab.Screen 
      name="KYC" 
      component={KYCScreen} 
      options={{ 
        title: 'Verificación',
        headerTitle: 'Verificación de Identidad'
      }} 
    />
  </Tab.Navigator>
);

// Stack Navigator que incluye el Tab Navigator y las pantallas adicionales
const UnverifiedStack = createStackNavigator();
const MainTabNavigator = () => (
  <UnverifiedStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#007AFF',
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <UnverifiedStack.Screen 
      name="MainTabs" 
      component={UnverifiedTabNavigator}
      options={{ headerShown: false }}
    />
    <UnverifiedStack.Screen 
      name="News" 
      component={NewsScreen}
      options={{ 
        headerTitle: 'Noticias',
      }}
    />
    <UnverifiedStack.Screen 
      name="Notifications" 
      component={NotificationsScreen}
      options={{ 
        headerTitle: 'Notificaciones',
      }}
    />
  </UnverifiedStack.Navigator>
);

// Stack Navigator para usuarios verificados (sin barra inferior)
const VerifiedStack = createStackNavigator();
const MainStackNavigator = () => (
  <VerifiedStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#007AFF',
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <VerifiedStack.Screen 
      name="Home" 
      component={HomeScreen} 
      options={({ navigation }) => ({ 
        headerTitle: 'TradeOptix',
        headerRight: () => (
          <View style={{ flexDirection: 'row', marginRight: 15, gap: 10 }}>
            <TouchableOpacity onPress={() => navigation.navigate('News')}>
              <Ionicons name="newspaper" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={{ position: 'relative' }}>
              <Ionicons name="notifications" size={24} color="#FFFFFF" />
              <View style={{
                position: 'absolute',
                top: -2,
                right: -2,
                backgroundColor: '#FF3B30',
                borderRadius: 8,
                minWidth: 16,
                height: 16,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        )
      })} 
    />
    <VerifiedStack.Screen 
      name="KYC" 
      component={KYCScreen} 
      options={{ 
        headerTitle: 'Verificación de Identidad'
      }} 
    />
    <VerifiedStack.Screen 
      name="News" 
      component={NewsScreen}
      options={{ 
        headerTitle: 'Noticias',
      }}
    />
    <VerifiedStack.Screen 
      name="Notifications" 
      component={NotificationsScreen}
      options={{ 
        headerTitle: 'Notificaciones',
      }}
    />
  </VerifiedStack.Navigator>
);

// Navegador principal
export const AppNavigator: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  // Si el usuario está verificado (aprovado), usar Stack Navigator sin barra inferior
  const isVerified = user?.kyc_status === 'approved';

  return (
    <NavigationContainer>
      {isVerified ? <MainStackNavigator /> : <MainTabNavigator />}
    </NavigationContainer>
  );
};