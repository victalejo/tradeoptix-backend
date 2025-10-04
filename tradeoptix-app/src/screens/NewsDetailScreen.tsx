import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MarketNews } from '../types';

type NewsDetailRouteProp = RouteProp<{ NewsDetail: { news: MarketNews } }, 'NewsDetail'>;

export const NewsDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<NewsDetailRouteProp>();
  const { news } = route.params;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'markets': '#007AFF',
      'crypto': '#FF9500',
      'analysis': '#34C759',
      'regulation': '#FF3B30',
      'general': '#8E8E93',
    };
    return colors[category.toLowerCase()] || colors['general'];
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      'markets': 'trending-up',
      'crypto': 'logo-bitcoin',
      'analysis': 'analytics',
      'regulation': 'document-text',
      'general': 'newspaper',
    };
    return icons[category.toLowerCase()] || icons['general'];
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Imagen de portada */}
        {news.image_url && (
          <Image source={{ uri: news.image_url }} style={styles.headerImage} />
        )}

        {/* Contenido */}
        <View style={styles.content}>
          {/* Badge de categoría */}
          <View style={styles.categoryContainer}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: getCategoryColor(news.category) },
              ]}
            >
              <Ionicons
                name={getCategoryIcon(news.category)}
                size={16}
                color="#FFFFFF"
                style={styles.categoryIcon}
              />
              <Text style={styles.categoryText}>{news.category.toUpperCase()}</Text>
            </View>
          </View>

          {/* Título */}
          <Text style={styles.title}>{news.title}</Text>

          {/* Fecha de publicación */}
          <View style={styles.metaContainer}>
            <Ionicons name="time-outline" size={16} color="#8E8E93" />
            <Text style={styles.metaText}>{formatDate(news.published_at)}</Text>
          </View>

          {/* Resumen (si existe) */}
          {news.summary && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>{news.summary}</Text>
            </View>
          )}

          {/* Contenido principal */}
          <Text style={styles.contentText}>{news.content}</Text>
        </View>
      </ScrollView>

      {/* Botón de volver (opcional, ya que hay back en header) */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  headerImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    lineHeight: 36,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  metaText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
  },
  summaryContainer: {
    backgroundColor: '#F8FAFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  summaryText: {
    fontSize: 16,
    color: '#48484A',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  contentText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 26,
    marginBottom: 20,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    marginTop: 10,
  },
  sourceText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 6,
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
