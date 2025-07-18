import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import AstrologerCard from '../../components/AstrologerCard';
import favoritesService from '../../services/favoritesService';
import NetworkStatusBanner from '../../components/NetworkStatusBanner';

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('addedAt'); // 'addedAt', 'name', 'rating', 'ratePerMinute'
  const [sortOrder, setSortOrder] = useState('desc');
  const [showSortOptions, setShowSortOptions] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  useEffect(() => {
    filterAndSortFavorites();
  }, [favorites, searchQuery, sortBy, sortOrder]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const result = await favoritesService.getFavoritesSorted(sortBy, sortOrder);
      
      if (result.success) {
        setFavorites(result.data);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Load favorites error:', error);
      Alert.alert('Error', 'Failed to load favorites');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterAndSortFavorites = async () => {
    try {
      let result;
      
      if (searchQuery.trim()) {
        result = await favoritesService.searchFavorites(searchQuery);
      } else {
        result = await favoritesService.getFavoritesSorted(sortBy, sortOrder);
      }
      
      if (result.success) {
        setFilteredFavorites(result.data);
      }
    } catch (error) {
      console.error('Filter favorites error:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setShowSortOptions(false);
  };

  const handleAstrologerPress = (astrologer) => {
    navigation.navigate('AstrologerDetail', { 
      astrologerId: astrologer.id,
      astrologer 
    });
  };

  const handleFavoriteToggle = async (astrologerId, isFavorite) => {
    if (!isFavorite) {
      // Remove from favorites
      setFavorites(prev => prev.filter(fav => fav.id !== astrologerId));
      setFilteredFavorites(prev => prev.filter(fav => fav.id !== astrologerId));
    }
  };

  const handleClearAllFavorites = () => {
    Alert.alert(
      'Clear All Favorites',
      'Are you sure you want to remove all astrologers from your favorites? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await favoritesService.clearFavorites();
              if (result.success) {
                setFavorites([]);
                setFilteredFavorites([]);
                Alert.alert('Success', 'All favorites cleared');
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              console.error('Clear favorites error:', error);
              Alert.alert('Error', 'Failed to clear favorites');
            }
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.title}>My Favorites</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortOptions(!showSortOptions)}
          >
            <Ionicons name="funnel" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          
          {favorites.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearAllFavorites}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {favorites.length > 0 && (
        <>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search favorites..."
              placeholderTextColor={COLORS.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          
          {showSortOptions && (
            <View style={styles.sortOptions}>
              <Text style={styles.sortTitle}>Sort by:</Text>
              <View style={styles.sortButtons}>
                {[
                  { key: 'addedAt', label: 'Recently Added' },
                  { key: 'name', label: 'Name' },
                  { key: 'rating', label: 'Rating' },
                  { key: 'ratePerMinute', label: 'Price' }
                ].map(option => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.sortOption,
                      sortBy === option.key && styles.activeSortOption
                    ]}
                    onPress={() => handleSort(option.key)}
                  >
                    <Text style={[
                      styles.sortOptionText,
                      sortBy === option.key && styles.activeSortOptionText
                    ]}>
                      {option.label}
                    </Text>
                    {sortBy === option.key && (
                      <Ionicons 
                        name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'} 
                        size={16} 
                        color={COLORS.surface} 
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          <View style={styles.resultsInfo}>
            <Text style={styles.resultsText}>
              {filteredFavorites.length} of {favorites.length} favorites
            </Text>
            {searchQuery && (
              <Text style={styles.searchInfo}>
                matching "{searchQuery}"
              </Text>
            )}
          </View>
        </>
      )}
    </View>
  );

  const renderAstrologer = ({ item }) => (
    <AstrologerCard
      astrologer={item}
      onPress={() => handleAstrologerPress(item)}
      onFavoriteToggle={handleFavoriteToggle}
      showFavoriteButton={true}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No Matching Favorites' : 'No Favorites Yet'}
      </Text>
      <Text style={styles.emptyMessage}>
        {searchQuery 
          ? `No favorites match your search for "${searchQuery}".`
          : 'Start adding astrologers to your favorites by tapping the heart icon on their profiles.'
        }
      </Text>
      {searchQuery ? (
        <TouchableOpacity
          style={styles.clearSearchButton}
          onPress={() => handleSearch('')}
        >
          <Text style={styles.clearSearchText}>Clear Search</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('Astrologers')}
        >
          <Text style={styles.browseButtonText}>Browse Astrologers</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <NetworkStatusBanner />
      
      <FlatList
        data={filteredFavorites}
        renderItem={renderAstrologer}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          filteredFavorites.length === 0 && styles.emptyListContent
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingBottom: SPACING.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.xxl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: 'row',
  },
  sortButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
  },
  clearButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  sortOptions: {
    backgroundColor: COLORS.background,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sortTitle: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sortButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeSortOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortOptionText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  activeSortOptionText: {
    color: COLORS.surface,
  },
  resultsInfo: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  resultsText: {
    fontSize: FONTS.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  searchInfo: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONTS.lineHeight.md,
    marginBottom: SPACING.lg,
  },
  clearSearchButton: {
    backgroundColor: COLORS.textSecondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  clearSearchText: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    color: COLORS.surface,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  browseButtonText: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    color: COLORS.surface,
  },
});

export default FavoritesScreen;
