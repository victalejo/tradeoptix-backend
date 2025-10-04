import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  FlatList,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { MarketNews, Notification } from '../types';
import ApiService from '../services/api';

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

export const HomeScreen: React.FC = () => {
  const { user, token } = useAuth();
  const navigation = useNavigation<any>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [news, setNews] = useState<MarketNews[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isLoadingNews, setIsLoadingNews] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [token]);

  const loadInitialData = async () => {
    if (!token) return;
    
    try {
      await Promise.all([
        loadLatestNews(),
        loadUnreadNotificationCount(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadLatestNews = async () => {
    if (!token) return;
    
    try {
      setIsLoadingNews(true);
      const latestNews = await ApiService.getLatestNews(token, 5);
      setNews(latestNews);
    } catch (error) {
      console.error('Error loading news:', error);
      Alert.alert('Error', 'No se pudieron cargar las noticias');
    } finally {
      setIsLoadingNews(false);
    }
  };

  const loadUnreadNotificationCount = async () => {
    if (!token) return;
    
    try {
      const count = await ApiService.getUnreadNotificationCount(token);
      setUnreadNotifications(count);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadInitialData();
    setIsRefreshing(false);
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
    navigation.navigate('KYC');
  };

  const getNewsIcon = (category: string) => {
    switch (category) {
      case 'markets':
        return 'trending-up';
      case 'crypto':
        return 'logo-bitcoin';
      case 'analysis':
        return 'analytics';
      case 'regulation':
        return 'document-text';
      default:
        return 'newspaper';
    }
  };

  const getNewsCategoryColor = (category: string) => {
    switch (category) {
      case 'markets':
        return '#34C759';
      case 'crypto':
        return '#FF9500';
      case 'analysis':
        return '#007AFF';
      case 'regulation':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  return (
    <View style={styles.container}>
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
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>
                {user?.first_name} {user?.last_name}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.profileIcon}>
                <Ionicons name="person-circle" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Estado KYC - Solo mostrar si no está aprobado */}
        {user?.kyc_status !== 'approved' && (
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
                    {user?.kyc_status === 'rejected'
                      ? 'Tu verificación fue rechazada. Revisa los documentos'
                      : 'Completa tu verificación para acceder a todas las funciones'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
              </View>
            </TouchableOpacity>
          </View>
        )}

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
            <TouchableOpacity style={[styles.actionCard, { width: user?.kyc_status === 'approved' ? '30%' : '22%' }]}>
              <LinearGradient
                colors={['#007AFF', '#0056CC']}
                style={styles.actionIcon}
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.actionText}>Invertir</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionCard, { width: user?.kyc_status === 'approved' ? '30%' : '22%' }]}>
              <LinearGradient
                colors={['#FF9500', '#FF7A00']}
                style={styles.actionIcon}
              >
                <Ionicons name="card" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.actionText}>Depositar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionCard, { width: user?.kyc_status === 'approved' ? '30%' : '22%' }]}>
              <LinearGradient
                colors={['#34C759', '#28A745']}
                style={styles.actionIcon}
              >
                <Ionicons name="arrow-up" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.actionText}>Retirar</Text>
            </TouchableOpacity>

            {/* Solo mostrar botón de verificación si no está aprobado */}
            {user?.kyc_status !== 'approved' && (
              <TouchableOpacity style={[styles.actionCard, { width: '22%' }]} onPress={navigateToKYC}>
                <LinearGradient
                  colors={['#AF52DE', '#8E44AD']}
                  style={styles.actionIcon}
                >
                  <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.actionText}>Verificar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Noticias del Mercado - Resumen */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Noticias del Mercado</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('News')}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>Ver todas</Text>
              <Ionicons name="chevron-forward" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
          {isLoadingNews ? (
            <View style={styles.newsCard}>
              <Ionicons name="newspaper" size={24} color="#007AFF" />
              <View style={styles.newsContent}>
                <Text style={styles.newsTitle}>Cargando...</Text>
                <Text style={styles.newsDescription}>Obteniendo las últimas noticias...</Text>
              </View>
            </View>
          ) : news.length > 0 ? (
            <View>
              {news.slice(0, 3).map((item, index) => (
                <View key={item.id}>
                  <TouchableOpacity 
                    style={styles.newsCard}
                    onPress={() => navigation.navigate('NewsDetail', { news: item })}
                  >
                    <Ionicons 
                      name={getNewsIcon(item.category)} 
                      size={24} 
                      color={getNewsCategoryColor(item.category)} 
                    />
                    <View style={styles.newsContent}>
                      <Text style={styles.newsTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={styles.newsDescription} numberOfLines={2}>
                        {item.summary || item.content}
                      </Text>
                      <Text style={styles.newsDate}>
                        {new Date(item.published_at).toLocaleDateString('es-ES')}
                      </Text>
                    </View>
                    {item.priority > 2 && (
                      <View style={styles.priorityBadge}>
                        <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                      </View>
                    )}
                  </TouchableOpacity>
                  {index < 2 && <View style={{ height: 12 }} />}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.newsCard}>
              <Ionicons name="newspaper-outline" size={24} color="#8E8E93" />
              <View style={styles.newsContent}>
                <Text style={styles.newsTitle}>Sin noticias disponibles</Text>
                <Text style={styles.newsDescription}>
                  No hay noticias del mercado en este momento
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },

  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: STATUS_BAR_HEIGHT + 12,
    paddingBottom: 20,
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
    padding: 0,
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
  newsDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    fontStyle: 'italic',
  },
  priorityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationIcon: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 4,
  },
});