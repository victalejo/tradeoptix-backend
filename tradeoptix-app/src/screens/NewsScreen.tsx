import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MarketNews } from '../types';

export const NewsScreen: React.FC = () => {
  const [news, setNews] = useState<MarketNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();

  const loadNews = async () => {
    try {
      if (!token) return;
      const newsData = await api.getLatestNews(token, 20);
      setNews(newsData);
    } catch (error) {
      console.error('Error loading news:', error);
      Alert.alert('Error', 'No se pudieron cargar las noticias');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const handleNewsPress = (newsItem: MarketNews) => {
    // Mostrar el contenido completo de la noticia
    Alert.alert(
      newsItem.title,
      newsItem.content,
      [
        {
          text: 'Cerrar',
          style: 'cancel'
        }
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    loadNews();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
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

  const renderNewsItem = (item: MarketNews) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.newsCard}
      onPress={() => handleNewsPress(item)}
    >
      {item.image_url && (
        <Image source={{ uri: item.image_url }} style={styles.newsImage} />
      )}
      <View style={styles.newsContent}>
        <View style={styles.newsHeader}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor(item.category) },
            ]}
          >
            <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
          </View>
          <Text style={styles.newsDate}>{formatDate(item.published_at)}</Text>
        </View>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsExcerpt} numberOfLines={3}>
          {item.summary || item.content}
        </Text>
        <View style={styles.readMoreContainer}>
          <Text style={styles.readMoreText}>Leer más</Text>
          <Ionicons name="chevron-forward" size={16} color="#007AFF" />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando noticias...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Noticias Financieras</Text>
          <Text style={styles.headerSubtitle}>
            Mantente al día con las últimas noticias del mercado
          </Text>
        </View>

        {news.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyTitle}>No hay noticias disponibles</Text>
            <Text style={styles.emptySubtitle}>
              Revisa más tarde para ver las últimas actualizaciones
            </Text>
          </View>
        ) : (
          <View style={styles.newsList}>
            {news.map(renderNewsItem)}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  newsList: {
    padding: 16,
  },
  newsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newsImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
  },
  newsContent: {
    padding: 16,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newsDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 24,
  },
  newsExcerpt: {
    fontSize: 14,
    color: '#48484A',
    lineHeight: 20,
    marginBottom: 12,
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#48484A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});