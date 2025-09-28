import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Picker } from '@react-native-picker/picker';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { AuthStackParamList } from '../types/navigation';
import { RegisterRequest } from '../types';

type RegisterScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Register'
>;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    document_type: 'cedula' as 'cedula' | 'pasaporte',
    document_number: '',
    email: '',
    phone_number: '',
    address: '',
    password: '',
    confirmPassword: '',
    facebook_profile: '',
    instagram_profile: '',
    twitter_profile: '',
    linkedin_profile: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSocialMedia, setShowSocialMedia] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Campos requeridos
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = 'El apellido debe tener al menos 2 caracteres';
    }

    if (!formData.document_number.trim()) {
      newErrors.document_number = 'El número de documento es requerido';
    } else if (formData.document_number.length < 5) {
      newErrors.document_number = 'El documento debe tener al menos 5 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'El número de teléfono es requerido';
    } else if (formData.phone_number.length < 10) {
      newErrors.phone_number = 'El teléfono debe tener al menos 10 dígitos';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    } else if (formData.address.length < 10) {
      newErrors.address = 'La dirección debe ser más específica';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const registerData: RegisterRequest = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        document_type: formData.document_type,
        document_number: formData.document_number,
        email: formData.email,
        phone_number: formData.phone_number,
        address: formData.address,
        password: formData.password,
        facebook_profile: formData.facebook_profile || undefined,
        instagram_profile: formData.instagram_profile || undefined,
        twitter_profile: formData.twitter_profile || undefined,
        linkedin_profile: formData.linkedin_profile || undefined,
      };

      await register(registerData);
      Alert.alert(
        'Registro exitoso',
        'Tu cuenta ha sido creada. Ahora puedes completar tu proceso KYC.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error de registro',
        error instanceof Error ? error.message : 'Error al crear la cuenta'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario comience a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>
              Únete a TradeOptix y comienza tu viaje de inversión
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Información personal */}
            <Text style={styles.sectionTitle}>Información Personal</Text>
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="Nombres"
                  value={formData.first_name}
                  onChangeText={(value) => updateFormData('first_name', value)}
                  placeholder="Juan"
                  leftIcon="person"
                  error={errors.first_name}
                  required
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Apellidos"
                  value={formData.last_name}
                  onChangeText={(value) => updateFormData('last_name', value)}
                  placeholder="Pérez"
                  leftIcon="person"
                  error={errors.last_name}
                  required
                />
              </View>
            </View>

            {/* Documento */}
            <Text style={styles.label}>
              Tipo de documento <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.document_type}
                onValueChange={(value: string) => updateFormData('document_type', value)}
                style={styles.picker}
              >
                <Picker.Item label="Cédula de Ciudadanía" value="cedula" />
                <Picker.Item label="Pasaporte" value="pasaporte" />
              </Picker>
            </View>

            <Input
              label="Número de documento"
              value={formData.document_number}
              onChangeText={(value) => updateFormData('document_number', value)}
              placeholder="12345678"
              leftIcon="card"
              keyboardType="numeric"
              error={errors.document_number}
              required
            />

            {/* Contacto */}
            <Text style={styles.sectionTitle}>Información de Contacto</Text>
            
            <Input
              label="Correo electrónico"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="ejemplo@correo.com"
              leftIcon="mail"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              required
            />

            <Input
              label="Teléfono"
              value={formData.phone_number}
              onChangeText={(value) => updateFormData('phone_number', value)}
              placeholder="+57 300 123 4567"
              leftIcon="call"
              keyboardType="phone-pad"
              error={errors.phone_number}
              required
            />

            <Input
              label="Dirección"
              value={formData.address}
              onChangeText={(value) => updateFormData('address', value)}
              placeholder="Calle 123 #45-67, Bogotá"
              leftIcon="location"
              multiline
              numberOfLines={2}
              error={errors.address}
              required
            />

            {/* Contraseña */}
            <Text style={styles.sectionTitle}>Seguridad</Text>
            
            <Input
              label="Contraseña"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              placeholder="Mínimo 8 caracteres"
              leftIcon="lock-closed"
              secureTextEntry
              error={errors.password}
              required
            />

            <Input
              label="Confirmar contraseña"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              placeholder="Repite tu contraseña"
              leftIcon="lock-closed"
              secureTextEntry
              error={errors.confirmPassword}
              required
            />

            {/* Redes sociales opcionales */}
            <TouchableOpacity
              style={styles.toggleSection}
              onPress={() => setShowSocialMedia(!showSocialMedia)}
            >
              <Text style={styles.toggleText}>
                Redes sociales (opcional)
              </Text>
              <Text style={styles.toggleIcon}>
                {showSocialMedia ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {showSocialMedia && (
              <View style={styles.socialSection}>
                <Input
                  label="Facebook"
                  value={formData.facebook_profile}
                  onChangeText={(value) => updateFormData('facebook_profile', value)}
                  placeholder="facebook.com/tu-perfil"
                  leftIcon="logo-facebook"
                />

                <Input
                  label="Instagram"
                  value={formData.instagram_profile}
                  onChangeText={(value) => updateFormData('instagram_profile', value)}
                  placeholder="instagram.com/tu-perfil"
                  leftIcon="logo-instagram"
                />

                <Input
                  label="Twitter"
                  value={formData.twitter_profile}
                  onChangeText={(value) => updateFormData('twitter_profile', value)}
                  placeholder="twitter.com/tu-perfil"
                  leftIcon="logo-twitter"
                />

                <Input
                  label="LinkedIn"
                  value={formData.linkedin_profile}
                  onChangeText={(value) => updateFormData('linkedin_profile', value)}
                  placeholder="linkedin.com/in/tu-perfil"
                  leftIcon="logo-linkedin"
                />
              </View>
            )}
          </View>

          {/* Register Button */}
          <Button
            title="Crear Cuenta"
            onPress={handleRegister}
            loading={isLoading}
            size="large"
            style={styles.registerButton}
          />

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  form: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 24,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  pickerContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 16,
  },
  picker: {
    height: 48,
  },
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 16,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  toggleIcon: {
    fontSize: 16,
    color: '#007AFF',
  },
  socialSection: {
    marginTop: 16,
  },
  registerButton: {
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  loginLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});