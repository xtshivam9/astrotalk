import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import AstrologerCard from '../../components/AstrologerCard';
import SearchFilterBar from '../../components/SearchFilterBar';
import astrologerService from '../../services/astrologerService';
import NetworkStatusBanner from '../../components/NetworkStatusBanner';

const AstrologersScreen = ({ navigation }) => {
  const [astrologers, setAstrologers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    specializations: [],
    languages: [],
    minRating: 0,
    maxRate: null,
    minRate: null,
    experience: '',
    gender: '',
    isOnline: null,
    isVerified: null,
    sortBy: 'rating',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'compact'

  useFocusEffect(
    useCallback(() => {
      loadAstrologers(true);
    }, [searchQuery, filters])
  );

  const loadAstrologers = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const page = reset ? 1 : pagination.currentPage + 1;
      const params = {
        page,
        limit: pagination.itemsPerPage,
        search: searchQuery,
        ...filters
      };

      let result;
      if (searchQuery.trim()) {
        // Use advanced search when there's a search query
        result = await astrologerService.searchAstrologers({
          query: searchQuery,
          ...params
        });
      } else {
        // Use regular listing
        result = await astrologerService.getAllAstrologers(params);
      }

      if (result.success) {
        const newAstrologers = result.data.astrologers || [];

        if (reset) {
          setAstrologers(newAstrologers);
        } else {
          setAstrologers(prev => [...prev, ...newAstrologers]);
        }

        setPagination(result.data.pagination || pagination);
        setError(null);
      } else {
        setError(result.message);
        if (reset) {
          setAstrologers([]);
        }
      }
    } catch (error) {
      console.error('Load astrologers error:', error);
      setError('Failed to load astrologers. Please try again.');
      if (reset) {
        setAstrologers([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAstrologers(true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && pagination.currentPage < pagination.totalPages) {
      loadAstrologers(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // loadAstrologers will be called by useFocusEffect
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // loadAstrologers will be called by useFocusEffect
  };

  const handleAstrologerPress = (astrologer) => {
    navigation.navigate('AstrologerDetail', {
      astrologerId: astrologer.id,
      astrologer
    });
  };

  const handleFavoriteToggle = (astrologerId, isFavorite) => {
    // Update the local state to reflect the change
    setAstrologers(prev =>
      prev.map(astrologer =>
        astrologer.id === astrologerId
          ? { ...astrologer, isFavorite }
          : astrologer
      )
    );
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'card' ? 'compact' : 'card');
  };

  const renderAstrologer = ({ item }) => (
    <AstrologerCard
      astrologer={item}
      onPress={() => handleAstrologerPress(item)}
      onFavoriteToggle={handleFavoriteToggle}
      compact={viewMode === 'compact'}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.title}>Find Your Astrologer</Text>
        <TouchableOpacity
          style={styles.viewModeButton}
          onPress={toggleViewMode}
        >
          <Ionicons
            name={viewMode === 'card' ? 'list' : 'grid'}
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      <SearchFilterBar
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      {astrologers.length > 0 && (
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            {pagination.totalItems} astrologers found
          </Text>
          {searchQuery && (
            <Text style={styles.searchInfo}>
              for "{searchQuery}"
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingMoreText}>Loading more...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search" size={80} color={COLORS.textSecondary} />
        <Text style={styles.emptyTitle}>
          {searchQuery ? 'No Results Found' : 'No Astrologers Available'}
        </Text>
        <Text style={styles.emptyMessage}>
          {searchQuery
            ? `No astrologers match your search for "${searchQuery}". Try adjusting your filters or search terms.`
            : 'There are no astrologers available at the moment. Please check back later.'
          }
        </Text>
        {(searchQuery || Object.values(filters).some(f => f && f.length > 0)) && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={() => {
              setSearchQuery('');
              setFilters({
                specializations: [],
                languages: [],
                minRating: 0,
                maxRate: null,
                minRate: null,
                experience: '',
                gender: '',
                isOnline: null,
                isVerified: null,
                sortBy: 'rating',
                sortOrder: 'desc'
              });
            }}
          >
            <Text style={styles.clearFiltersText}>Clear All Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle" size={80} color={COLORS.error} />
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => loadAstrologers(true)}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && astrologers.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <NetworkStatusBanner />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding astrologers for you...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && astrologers.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <NetworkStatusBanner />
        {renderHeader()}
        {renderError()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <NetworkStatusBanner />

      <FlatList
        data={astrologers}
        renderItem={renderAstrologer}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          astrologers.length === 0 && styles.emptyListContent
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
  viewModeButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
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
  loadingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  loadingMoreText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
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
  clearFiltersButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  clearFiltersText: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    color: COLORS.surface,
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

export default AstrologersScreen;
