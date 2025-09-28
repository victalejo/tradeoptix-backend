import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { KYCDocument } from '../types';
import ApiService from '../services/api';

const documentTypes = [
  {
    type: 'cedula_front',
    title: 'Cédula - Frente',
    description: 'Foto de la parte frontal de tu cédula',
    icon: 'card' as keyof typeof Ionicons.glyphMap,
  },
  {
    type: 'cedula_back',
    title: 'Cédula - Reverso',
    description: 'Foto de la parte trasera de tu cédula',
    icon: 'card' as keyof typeof Ionicons.glyphMap,
  },
  {
    type: 'face_photo',
    title: 'Foto Facial',
    description: 'Selfie sosteniendo tu cédula junto a tu rostro',
    icon: 'camera' as keyof typeof Ionicons.glyphMap,
  },
];

export const KYCScreen: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos requeridos',
        'Necesitamos permisos para acceder a tu galería de fotos.'
      );
    }

    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus.status !== 'granted') {
      Alert.alert(
        'Permisos requeridos',
        'Necesitamos permisos para acceder a tu cámara.'
      );
    }
  };

  const loadDocuments = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const docs = await ApiService.getKYCDocuments(token);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      Alert.alert('Error', 'No se pudieron cargar los documentos');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadDocuments();
    setIsRefreshing(false);
  };

  const getDocumentStatus = (type: string) => {
    const doc = documents.find(d => d.document_type === type);
    return doc ? doc.status : null;
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'approved':
        return '#34C759';
      case 'rejected':
        return '#FF3B30';
      case 'pending':
        return '#FF9500';
      default:
        return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'pending':
        return 'time';
      default:
        return 'add-circle-outline';
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'pending':
        return 'En revisión';
      default:
        return 'No subido';
    }
  };

  const showImagePicker = (documentType: string) => {
    Alert.alert(
      'Seleccionar imagen',
      'Elige cómo quieres obtener la imagen',
      [
        { text: 'Cámara', onPress: () => takePhoto(documentType) },
        { text: 'Galería', onPress: () => pickImage(documentType) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const takePhoto = async (documentType: string) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadDocument(documentType, result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const pickImage = async (documentType: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadDocument(documentType, result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const uploadDocument = async (documentType: string, imageUri: string) => {
    if (!token) return;

    try {
      setUploadingType(documentType);
      
      const fileName = `${documentType}_${Date.now()}.jpg`;
      await ApiService.uploadKYCDocument(token, documentType, imageUri, fileName);

      Alert.alert('Éxito', 'Documento subido correctamente');
      await loadDocuments();
      
      // Verificar si todos los documentos están subidos
      checkKYCCompletion();
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert(
        'Error', 
        error instanceof Error ? error.message : 'No se pudo subir el documento'
      );
    } finally {
      setUploadingType(null);
    }
  };

  const checkKYCCompletion = () => {
    const requiredDocs: ('cedula_front' | 'cedula_back' | 'face_photo')[] = ['cedula_front', 'cedula_back', 'face_photo'];
    const uploadedDocs = documents.map(d => d.document_type);
    const allUploaded = requiredDocs.every(type => uploadedDocs.includes(type));

    if (allUploaded && user) {
      Alert.alert(
        'KYC Completado',
        'Has subido todos los documentos requeridos. Tu verificación será procesada en las próximas 24-48 horas.',
        [{ text: 'OK' }]
      );
    }
  };

  const getOverallKYCStatus = () => {
    if (!documents.length) return 'incomplete';
    
    const requiredDocs: ('cedula_front' | 'cedula_back' | 'face_photo')[] = ['cedula_front', 'cedula_back', 'face_photo'];
    const uploadedDocs = documents.map(d => d.document_type);
    const allUploaded = requiredDocs.every(type => uploadedDocs.includes(type));

    if (!allUploaded) return 'incomplete';
    
    const hasRejected = documents.some(d => d.status === 'rejected');
    const allApproved = documents.every(d => d.status === 'approved');
    
    if (hasRejected) return 'rejected';
    if (allApproved) return 'approved';
    return 'pending';
  };

  const overallStatus = getOverallKYCStatus();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Verificación de Identidad</Text>
          <Text style={styles.subtitle}>
            Sube los siguientes documentos para verificar tu identidad
          </Text>
        </View>

        {/* Status Card */}
        <View style={styles.section}>
          <LinearGradient
            colors={
              overallStatus === 'approved'
                ? ['#34C759', '#28A745']
                : overallStatus === 'rejected'
                ? ['#FF3B30', '#DC2626']
                : overallStatus === 'pending'
                ? ['#FF9500', '#F59E0B']
                : ['#8E8E93', '#6B7280']
            }
            style={styles.statusCard}
          >
            <View style={styles.statusContent}>
              <Ionicons
                name={
                  overallStatus === 'approved'
                    ? 'shield-checkmark'
                    : overallStatus === 'rejected'
                    ? 'shield'
                    : overallStatus === 'pending'
                    ? 'hourglass'
                    : 'shield-outline'
                }
                size={32}
                color="#FFFFFF"
              />
              <View style={styles.statusText}>
                <Text style={styles.statusTitle}>
                  {overallStatus === 'approved'
                    ? 'Verificación Completada'
                    : overallStatus === 'rejected'
                    ? 'Verificación Rechazada'
                    : overallStatus === 'pending'
                    ? 'En Proceso de Revisión'
                    : 'Verificación Pendiente'}
                </Text>
                <Text style={styles.statusDescription}>
                  {overallStatus === 'approved'
                    ? 'Tu identidad ha sido verificada exitosamente'
                    : overallStatus === 'rejected'
                    ? 'Algunos documentos fueron rechazados. Vuelve a subirlos'
                    : overallStatus === 'pending'
                    ? 'Tus documentos están siendo revisados'
                    : 'Sube todos los documentos requeridos'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Documents List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documentos Requeridos</Text>
          
          {documentTypes.map((docType) => {
            const status = getDocumentStatus(docType.type);
            const isUploading = uploadingType === docType.type;
            const rejectedDoc = documents.find(
              d => d.document_type === docType.type && d.status === 'rejected'
            );

            return (
              <TouchableOpacity
                key={docType.type}
                style={[
                  styles.documentCard,
                  { borderLeftColor: getStatusColor(status) }
                ]}
                onPress={() => showImagePicker(docType.type)}
                disabled={isUploading}
              >
                <View style={styles.documentContent}>
                  <View style={styles.documentIcon}>
                    <Ionicons
                      name={docType.icon}
                      size={24}
                      color={getStatusColor(status)}
                    />
                  </View>
                  
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentTitle}>{docType.title}</Text>
                    <Text style={styles.documentDescription}>
                      {docType.description}
                    </Text>
                    
                    {rejectedDoc?.rejection_reason && (
                      <Text style={styles.rejectionReason}>
                        Motivo: {rejectedDoc.rejection_reason}
                      </Text>
                    )}
                  </View>

                  <View style={styles.documentStatus}>
                    {isUploading ? (
                      <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Subiendo...</Text>
                      </View>
                    ) : (
                      <>
                        <Ionicons
                          name={getStatusIcon(status)}
                          size={24}
                          color={getStatusColor(status)}
                        />
                        <Text
                          style={[
                            styles.statusLabel,
                            { color: getStatusColor(status) }
                          ]}
                        >
                          {getStatusText(status)}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instrucciones</Text>
          <View style={styles.instructionsCard}>
            <View style={styles.instruction}>
              <Text style={styles.instructionNumber}>1</Text>
              <Text style={styles.instructionText}>
                Asegúrate de que las fotos sean claras y legibles
              </Text>
            </View>
            
            <View style={styles.instruction}>
              <Text style={styles.instructionNumber}>2</Text>
              <Text style={styles.instructionText}>
                La información debe ser visible completamente
              </Text>
            </View>
            
            <View style={styles.instruction}>
              <Text style={styles.instructionNumber}>3</Text>
              <Text style={styles.instructionText}>
                Para la foto facial, sostén tu cédula junto a tu rostro
              </Text>
            </View>

            <View style={styles.instruction}>
              <Text style={styles.instructionNumber}>4</Text>
              <Text style={styles.instructionText}>
                La revisión toma entre 24-48 horas hábiles
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Support */}
        <View style={styles.section}>
          <Button
            title="Contactar Soporte"
            onPress={() => {
              Alert.alert(
                'Contactar Soporte',
                'Puedes contactar a nuestro equipo de soporte en:\n\nEmail: support@tradeoptix.com\nTeléfono: +57 300 123 4567'
              );
            }}
            variant="outline"
          />
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
    padding: 24,
    paddingTop: 40,
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
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  statusCard: {
    borderRadius: 16,
    padding: 20,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 16,
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
  documentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentIcon: {
    width: 40,
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  rejectionReason: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    fontStyle: 'italic',
  },
  documentStatus: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
  },
});