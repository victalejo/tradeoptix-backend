import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => logout()
        }
      ]
    );
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

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header con información del usuario */}
        <LinearGradient
          colors={['#007AFF', '#0056CC']}
          style={styles.header}
        >
          <View style={styles.profileIconContainer}>
            <Ionicons name="person-circle" size={80} color="#FFFFFF" />
          </View>
          <Text style={styles.userName}>
            {user?.first_name} {user?.last_name}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          {/* Estado KYC */}
          <View
            style={[
              styles.kycBadge,
              { backgroundColor: getKYCStatusColor() + '30' }
            ]}
          >
            <Ionicons 
              name={user?.kyc_status === 'approved' ? 'checkmark-circle' : 'time'} 
              size={16} 
              color={getKYCStatusColor()} 
            />
            <Text style={[styles.kycBadgeText, { color: getKYCStatusColor() }]}>
              {getKYCStatusText()}
            </Text>
          </View>
        </LinearGradient>

        {/* Información Personal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={20} color="#007AFF" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Correo Electrónico</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color="#007AFF" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{user?.phone_number || 'No especificado'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="card" size={20} color="#007AFF" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Documento</Text>
                <Text style={styles.infoValue}>{user?.document_number || 'No especificado'}</Text>
              </View>
            </View>

            {user?.address && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="location" size={20} color="#007AFF" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Dirección</Text>
                    <Text style={styles.infoValue}>{user.address}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Opciones de Cuenta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opciones de Cuenta</Text>
          
          {user?.kyc_status !== 'approved' && (
            <TouchableOpacity 
              style={styles.optionCard}
              onPress={() => navigation.navigate('KYC')}
            >
              <View style={styles.optionIcon}>
                <Ionicons name="shield-checkmark" size={24} color="#007AFF" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Verificación de Identidad</Text>
                <Text style={styles.optionDescription}>
                  {user?.kyc_status === 'rejected' 
                    ? 'Revisa y corrige tus documentos'
                    : 'Completa tu verificación KYC'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.optionCard}>
            <View style={styles.optionIcon}>
              <Ionicons name="lock-closed" size={24} color="#007AFF" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Seguridad</Text>
              <Text style={styles.optionDescription}>Cambiar contraseña y opciones de seguridad</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard}>
            <View style={styles.optionIcon}>
              <Ionicons name="notifications" size={24} color="#007AFF" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Notificaciones</Text>
              <Text style={styles.optionDescription}>Preferencias de notificaciones</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard}>
            <View style={styles.optionIcon}>
              <Ionicons name="help-circle" size={24} color="#007AFF" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Ayuda y Soporte</Text>
              <Text style={styles.optionDescription}>Obtén ayuda con tu cuenta</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* Botón de Cerrar Sesión */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={24} color="#FF3B30" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Información de la App */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>TradeOptix v1.0.0</Text>
          <Text style={styles.footerText}>© 2025 Todos los derechos reservados</Text>
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
  header: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileIconContainer: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  kycBadgeText: {
    fontSize: 14,
    fontWeight: '600',
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
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 16,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
});
