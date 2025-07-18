import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import favoritesService from '../services/favoritesService';
import astrologerService from '../services/astrologerService';

const AstrologerCard = ({ 
  astrologer, 
  onPress, 
  onFavoriteToggle,
  showFavoriteButton = true,
  compact = false 
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();
  }, [astrologer.id]);

  const checkFavoriteStatus = async () => {
    try {
      const result = await favoritesService.isFavorite(astrologer.id);
      if (result.success) {
        setIsFavorite(result.data);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (isTogglingFavorite) return;

    setIsTogglingFavorite(true);
    try {
      const result = await favoritesService.toggleFavorite(astrologer);
      if (result.success) {
        setIsFavorite(!isFavorite);
        if (onFavoriteToggle) {
          onFavoriteToggle(astrologer.id, !isFavorite);
        }
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const getStatusColor = () => {
    if (astrologer.isOnline) return COLORS.success;
    return COLORS.textSecondary;
  };

  const getStatusText = () => {
    if (astrologer.isOnline) return 'Online';
    return 'Offline';
  };

  const formatSpecializations = () => {
    if (!astrologer.specializations || astrologer.specializations.length === 0) {
      return 'General Astrology';
    }
    
    const formatted = astrologer.specializations
      .slice(0, 2)
      .map(spec => astrologerService.formatSpecialization(spec))
      .join(', ');
    
    if (astrologer.specializations.length > 2) {
      return `${formatted} +${astrologer.specializations.length - 2}`;
    }
    
    return formatted;
  };

  const formatLanguages = () => {
    if (!astrologer.languages || astrologer.languages.length === 0) {
      return 'English';
    }
    
    const formatted = astrologer.languages
      .slice(0, 3)
      .map(lang => astrologerService.formatLanguage(lang))
      .join(', ');
    
    if (astrologer.languages.length > 3) {
      return `${formatted} +${astrologer.languages.length - 3}`;
    }
    
    return formatted;
  };

  const renderRating = () => {
    const rating = astrologer.rating || 0;
    const ratingColor = astrologerService.getRatingColor(rating);
    
    return (
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={14} color={ratingColor} />
        <Text style={[styles.ratingText, { color: ratingColor }]}>
          {rating.toFixed(1)}
        </Text>
        <Text style={styles.reviewCount}>
          ({astrologer.totalReviews || 0})
        </Text>
      </View>
    );
  };

  const renderExperienceBadge = () => {
    const experienceLevel = astrologerService.getExperienceLevel(astrologer.experience || 0);
    const badgeColor = experienceLevel === 'Master' ? COLORS.accent : 
                      experienceLevel === 'Expert' ? COLORS.primary : COLORS.textSecondary;
    
    return (
      <View style={[styles.experienceBadge, { backgroundColor: badgeColor }]}>
        <Text style={styles.experienceText}>
          {astrologer.experience || 0}Y {experienceLevel}
        </Text>
      </View>
    );
  };

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress}>
        <Image
          source={{ 
            uri: astrologer.profileImage || 'https://via.placeholder.com/60x60?text=👤' 
          }}
          style={styles.compactAvatar}
        />
        <View style={styles.compactInfo}>
          <Text style={styles.compactName} numberOfLines={1}>
            {astrologer.name}
          </Text>
          <Text style={styles.compactSpecialization} numberOfLines={1}>
            {formatSpecializations()}
          </Text>
          <View style={styles.compactMeta}>
            {renderRating()}
            <Text style={styles.compactRate}>
              ₹{astrologer.ratePerMinute}/min
            </Text>
          </View>
        </View>
        <View style={[styles.compactStatus, { backgroundColor: getStatusColor() }]} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ 
              uri: astrologer.profileImage || 'https://via.placeholder.com/80x80?text=👤' 
            }}
            style={styles.avatar}
          />
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          {astrologer.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            </View>
          )}
        </View>
        
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {astrologer.name}
            </Text>
            {showFavoriteButton && (
              <TouchableOpacity 
                style={styles.favoriteButton}
                onPress={handleFavoriteToggle}
                disabled={isTogglingFavorite}
              >
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFavorite ? COLORS.error : COLORS.textSecondary} 
                />
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.specializations} numberOfLines={2}>
            {formatSpecializations()}
          </Text>
          
          <View style={styles.metaRow}>
            {renderRating()}
            {renderExperienceBadge()}
          </View>
          
          <View style={styles.detailsRow}>
            <Text style={styles.languages} numberOfLines={1}>
              🗣️ {formatLanguages()}
            </Text>
            <Text style={[styles.status, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.currency}>₹</Text>
          <Text style={styles.rate}>{astrologer.ratePerMinute}</Text>
          <Text style={styles.perMinute}>/min</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{astrologer.totalSessions || 0}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {astrologer.responseTime ? `${astrologer.responseTime}s` : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Response</Text>
          </View>
        </View>
      </View>
      
      {astrologer.bio && (
        <Text style={styles.bio} numberOfLines={2}>
          {astrologer.bio}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
  },
  compactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  compactStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: SPACING.xs,
  },
  verifiedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
  },
  info: {
    flex: 1,
  },
  compactInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  name: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    flex: 1,
  },
  compactName: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  favoriteButton: {
    padding: SPACING.xs,
  },
  specializations: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  compactSpecialization: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  ratingText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.bold,
    marginLeft: SPACING.xs,
  },
  reviewCount: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  experienceBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  experienceText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.bold,
    color: COLORS.surface,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languages: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    flex: 1,
  },
  status: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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
  rate: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
    color: COLORS.accent,
  },
  compactRate: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.bold,
    color: COLORS.accent,
  },
  perMinute: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  stat: {
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  statValue: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  bio: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: FONTS.lineHeight.sm,
    marginTop: SPACING.sm,
  },
});

export default AstrologerCard;
