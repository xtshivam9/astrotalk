import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import astrologerService from '../../services/astrologerService';
import favoritesService from '../../services/favoritesService';
import NetworkStatusBanner from '../../components/NetworkStatusBanner';

const AstrologerDetailScreen = ({ route, navigation }) => {
  const { astrologerId, astrologer: initialAstrologer } = route.params;
  
  const [astrologer, setAstrologer] = useState(initialAstrologer || null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(!initialAstrologer);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about'); // 'about', 'reviews'

  useEffect(() => {
    if (!initialAstrologer) {
      loadAstrologerDetails();
    }
    loadReviews();
    checkFavoriteStatus();
  }, [astrologerId]);

  const loadAstrologerDetails = async () => {
    try {
      setLoading(true);
      const result = await astrologerService.getAstrologerById(astrologerId);
      
      if (result.success) {
        setAstrologer(result.data);
        setError(null);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Load astrologer details error:', error);
      setError('Failed to load astrologer details');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const result = await astrologerService.getAstrologerReviews(astrologerId, {
        page: 1,
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (result.success) {
        setReviews(result.data.reviews || []);
      }
    } catch (error) {
      console.error('Load reviews error:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const result = await favoritesService.isFavorite(astrologerId);
      if (result.success) {
        setIsFavorite(result.data);
      }
    } catch (error) {
      console.error('Check favorite status error:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (isTogglingFavorite || !astrologer) return;

    setIsTogglingFavorite(true);
    try {
      const result = await favoritesService.toggleFavorite(astrologer);
      if (result.success) {
        setIsFavorite(!isFavorite);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      Alert.alert('Error', 'Failed to update favorites');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleShare = async () => {
    try {
      const message = `Check out ${astrologer.name} on Astrotalk!\n\n${astrologer.bio}\n\nSpecializations: ${astrologer.specializations.map(s => astrologerService.formatSpecialization(s)).join(', ')}\nRating: ${astrologer.rating}/5 (${astrologer.totalReviews} reviews)\nRate: ₹${astrologer.ratePerMinute}/min`;
      
      await Share.share({
        message,
        title: `${astrologer.name} - Astrotalk`
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleStartChat = () => {
    if (!astrologer.isOnline) {
      Alert.alert(
        'Astrologer Offline',
        `${astrologer.name} is currently offline. Would you like to be notified when they come online?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Notify Me', onPress: () => {
            // TODO: Implement notification system
            Alert.alert('Notification Set', 'You will be notified when the astrologer comes online.');
          }}
        ]
      );
      return;
    }

    // TODO: Navigate to chat screen
    Alert.alert('Coming Soon', 'Chat functionality will be available soon!');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </TouchableOpacity>
      
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleFavoriteToggle}
          disabled={isTogglingFavorite}
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? COLORS.error : COLORS.text} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProfile = () => (
    <View style={styles.profileSection}>
      <View style={styles.avatarContainer}>
        <Image
          source={{ 
            uri: astrologer.profileImage || 'https://via.placeholder.com/120x120?text=👤' 
          }}
          style={styles.avatar}
        />
        <View style={[styles.statusIndicator, { 
          backgroundColor: astrologer.isOnline ? COLORS.success : COLORS.textSecondary 
        }]} />
        {astrologer.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
          </View>
        )}
      </View>
      
      <Text style={styles.name}>{astrologer.name}</Text>
      <Text style={styles.experience}>
        {astrologer.experience} years • {astrologerService.getExperienceLevel(astrologer.experience)}
      </Text>
      
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={20} color={astrologerService.getRatingColor(astrologer.rating)} />
        <Text style={[styles.rating, { color: astrologerService.getRatingColor(astrologer.rating) }]}>
          {astrologer.rating.toFixed(1)}
        </Text>
        <Text style={styles.reviewCount}>
          ({astrologer.totalReviews} reviews)
        </Text>
      </View>
      
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { 
          backgroundColor: astrologer.isOnline ? COLORS.success : COLORS.textSecondary 
        }]} />
        <Text style={[styles.statusText, { 
          color: astrologer.isOnline ? COLORS.success : COLORS.textSecondary 
        }]}>
          {astrologer.isOnline ? 'Online Now' : 'Offline'}
        </Text>
      </View>
    </View>
  );

  const renderSpecializations = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Specializations</Text>
      <View style={styles.tagsContainer}>
        {astrologer.specializations.map((spec, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>
              {astrologerService.formatSpecialization(spec)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderLanguages = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Languages</Text>
      <View style={styles.tagsContainer}>
        {astrologer.languages.map((lang, index) => (
          <View key={index} style={[styles.tag, styles.languageTag]}>
            <Text style={[styles.tagText, styles.languageTagText]}>
              {astrologerService.formatLanguage(lang)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.stat}>
        <Text style={styles.statValue}>{astrologer.totalSessions}</Text>
        <Text style={styles.statLabel}>Sessions</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.stat}>
        <Text style={styles.statValue}>
          {astrologer.responseTime ? `${astrologer.responseTime}s` : 'N/A'}
        </Text>
        <Text style={styles.statLabel}>Response Time</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.stat}>
        <Text style={styles.statValue}>{astrologer.completionRate}%</Text>
        <Text style={styles.statLabel}>Completion Rate</Text>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'about' && styles.activeTab]}
        onPress={() => setActiveTab('about')}
      >
        <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
          About
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
        onPress={() => setActiveTab('reviews')}
      >
        <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
          Reviews ({astrologer.totalReviews})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderAboutTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bio}>{astrologer.bio}</Text>
      </View>
      
      {renderSpecializations()}
      {renderLanguages()}
      {renderStats()}
    </View>
  );

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>{item.user?.name || 'Anonymous'}</Text>
        <View style={styles.reviewRating}>
          <Ionicons name="star" size={14} color={COLORS.accent} />
          <Text style={styles.reviewRatingText}>{item.rating}</Text>
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
      <Text style={styles.reviewDate}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  const renderReviewsTab = () => (
    <View style={styles.tabContent}>
      {reviewsLoading ? (
        <View style={styles.reviewsLoading}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      ) : reviews.length > 0 ? (
        <>
          {reviews.map((review, index) => (
            <View key={index}>
              {renderReviewItem({ item: review })}
            </View>
          ))}
          {astrologer.totalReviews > 5 && (
            <TouchableOpacity style={styles.viewAllReviews}>
              <Text style={styles.viewAllReviewsText}>
                View All {astrologer.totalReviews} Reviews
              </Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View style={styles.noReviews}>
          <Ionicons name="chatbubble-outline" size={60} color={COLORS.textSecondary} />
          <Text style={styles.noReviewsText}>No reviews yet</Text>
        </View>
      )}
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <View style={styles.priceInfo}>
        <Text style={styles.priceLabel}>Consultation Rate</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.currency}>₹</Text>
          <Text style={styles.price}>{astrologer.ratePerMinute}</Text>
          <Text style={styles.perMinute}>/min</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.chatButton, !astrologer.isOnline && styles.chatButtonDisabled]}
        onPress={handleStartChat}
      >
        <Ionicons 
          name="chatbubble" 
          size={20} 
          color={COLORS.surface} 
        />
        <Text style={styles.chatButtonText}>
          {astrologer.isOnline ? 'Start Chat' : 'Offline'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <NetworkStatusBanner />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading astrologer details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !astrologer) {
    return (
      <SafeAreaView style={styles.container}>
        <NetworkStatusBanner />
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={80} color={COLORS.error} />
          <Text style={styles.errorTitle}>Unable to load details</Text>
          <Text style={styles.errorMessage}>{error || 'Astrologer not found'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadAstrologerDetails}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <NetworkStatusBanner />
      {renderHeader()}
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderProfile()}
        {renderTabs()}
        {activeTab === 'about' ? renderAboutTab() : renderReviewsTab()}
      </ScrollView>
      
      {renderFooter()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  name: {
    fontSize: FONTS.xxl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  experience: {
    fontSize: FONTS.md,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  rating: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    marginLeft: SPACING.xs,
  },
  reviewCount: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.bold,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONTS.md,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  tabContent: {
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  bio: {
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: FONTS.lineHeight.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  languageTag: {
    backgroundColor: COLORS.accent,
  },
  tagText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.surface,
  },
  languageTagText: {
    color: COLORS.text,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  statValue: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  reviewItem: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reviewerName: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.bold,
    color: COLORS.accent,
    marginLeft: SPACING.xs,
  },
  reviewComment: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: FONTS.lineHeight.sm,
    marginBottom: SPACING.sm,
  },
  reviewDate: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  reviewsLoading: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  noReviews: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  noReviewsText: {
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  viewAllReviews: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  viewAllReviewsText: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    color: COLORS.accent,
  },
  price: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
    color: COLORS.accent,
  },
  perMinute: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  chatButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  chatButtonText: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    color: COLORS.surface,
    marginLeft: SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  errorTitle: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONTS.lineHeight.md,
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    color: COLORS.surface,
  },
});

export default AstrologerDetailScreen;
