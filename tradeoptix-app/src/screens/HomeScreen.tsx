import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../services/api';

export const HomeScreen: React.FC = () => {
  const { user, token } = useAuth();
  const navigation = useNavigation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    // Aquí podrías actualizar datos del usuario
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const getKYCStatusColor = () => {
    switch (user?.kyc_status) {
      case 'approved':
        return '#34C759';
      case 'rejected':
        return '#FF3B30';
      default:
        return '#FF9500';
    }
  };

  const getKYCStatusText = () => {
    switch (user?.kyc_status) {
      case 'approved':
        return 'Verificado';
      case 'rejected':
        return 'Rechazado';
      default:
        return 'Pendiente';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const navigateToKYC = () => {
    // @ts-ignore - navegación será configurada más tarde
    navigation.navigate('KYC');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header con saludo */}
        <LinearGradient
          colors={['#007AFF', '#0056CC']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>
                {user?.first_name} {user?.last_name}
              </Text>
            </View>
            <TouchableOpacity style={styles.profileIcon}>
              <Ionicons name="person-circle" size={40} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Estado KYC */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado de Verificación</Text>
          <TouchableOpacity
            style={[
              styles.kycCard,
              { borderLeftColor: getKYCStatusColor() }
            ]}
            onPress={navigateToKYC}
          >
            <View style={styles.kycContent}>
              <View style={styles.kycInfo}>
                <View
                  style={[
                    styles.kycStatus,
                    { backgroundColor: getKYCStatusColor() + '20' }
                  ]}
                >
                  <Text
                    style={[
                      styles.kycStatusText,
                      { color: getKYCStatusColor() }
                    ]}
                  >
                    {getKYCStatusText()}
                  </Text>
                </View>
                <Text style={styles.kycTitle}>Verificación de Identidad</Text>
                <Text style={styles.kycDescription}>
                  {user?.kyc_status === 'approved'
                    ? 'Tu identidad ha sido verificada exitosamente'
                    : user?.kyc_status === 'rejected'
                    ? 'Tu verificación fue rechazada. Revisa los documentos'
                    : 'Completa tu verificación para acceder a todas las funciones'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Resumen de cuenta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de Cuenta</Text>
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={['#34C759', '#28A745']}
              style={styles.balanceCard}
            >
              <Text style={styles.balanceLabel}>Balance Total</Text>
              <Text style={styles.balanceAmount}>$0.00</Text>
              <Text style={styles.balanceSubtext}>USD</Text>
            </LinearGradient>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="trending-up" size={24} color="#34C759" />
                <Text style={styles.statValue}>$0.00</Text>
                <Text style={styles.statLabel}>Ganancias</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="wallet" size={24} color="#007AFF" />
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Inversiones</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Acciones rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient
                colors={['#007AFF', '#0056CC']}
                style={styles.actionIcon}
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.actionText}>Invertir</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient
                colors={['#FF9500', '#FF7A00']}
                style={styles.actionIcon}
              >
                <Ionicons name="card" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.actionText}>Depositar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient
                colors={['#34C759', '#28A745']}
                style={styles.actionIcon}
              >
                <Ionicons name="arrow-up" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.actionText}>Retirar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={navigateToKYC}>
              <LinearGradient
                colors={['#AF52DE', '#8E44AD']}
                style={styles.actionIcon}
              >
                <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.actionText}>Verificar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Noticias/Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Noticias del Mercado</Text>
          <View style={styles.newsCard}>
            <Ionicons name="newspaper" size={24} color="#007AFF" />
            <View style={styles.newsContent}>
              <Text style={styles.newsTitle}>
                Mercados en Alza
              </Text>
              <Text style={styles.newsDescription}>
                Los índices principales muestran tendencia positiva...
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  profileIcon: {
    padding: 4,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  kycCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  kycContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kycInfo: {
    flex: 1,
  },
  kycStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  kycStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  kycTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  kycDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  summaryCard: {
    gap: 16,
  },
  balanceCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  balanceSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionCard: {
    alignItems: 'center',
    width: '22%',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#1C1C1E',
    fontWeight: '500',
    textAlign: 'center',
  },
  newsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newsContent: {
    marginLeft: 16,
    flex: 1,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  newsDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});