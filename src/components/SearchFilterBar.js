import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import astrologerService from '../services/astrologerService';

const SearchFilterBar = ({ 
  onSearch, 
  onFilterChange, 
  initialFilters = {},
  showAdvancedFilters = true 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
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
    sortOrder: 'desc',
    ...initialFilters
  });
  const [filterOptions, setFilterOptions] = useState({
    specializations: [],
    languages: [],
    rateRange: { minRate: 0, maxRate: 1000 },
    experienceRanges: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      const result = await astrologerService.getFilterOptions();
      if (result.success) {
        setFilterOptions(result.data);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleFilterUpdate = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };

  const toggleArrayFilter = (filterKey, value) => {
    const currentArray = filters[filterKey] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    handleFilterUpdate({ [filterKey]: newArray });
  };

  const clearFilters = () => {
    const clearedFilters = {
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
    };
    setFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.specializations.length > 0) count++;
    if (filters.languages.length > 0) count++;
    if (filters.minRating > 0) count++;
    if (filters.maxRate !== null) count++;
    if (filters.minRate !== null) count++;
    if (filters.experience) count++;
    if (filters.gender) count++;
    if (filters.isOnline !== null) count++;
    if (filters.isVerified !== null) count++;
    return count;
  };

  const renderFilterChip = (label, isActive, onPress) => (
    <TouchableOpacity
      key={label}
      style={[styles.filterChip, isActive && styles.activeFilterChip]}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, isActive && styles.activeFilterChipText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderSpecializationFilters = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>Specializations</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterChipsContainer}>
          {filterOptions.specializations.map(spec => 
            renderFilterChip(
              spec.label,
              filters.specializations.includes(spec.value),
              () => toggleArrayFilter('specializations', spec.value)
            )
          )}
        </View>
      </ScrollView>
    </View>
  );

  const renderLanguageFilters = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>Languages</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterChipsContainer}>
          {filterOptions.languages.map(lang => 
            renderFilterChip(
              lang.label,
              filters.languages.includes(lang.value),
              () => toggleArrayFilter('languages', lang.value)
            )
          )}
        </View>
      </ScrollView>
    </View>
  );

  const renderRatingFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>Minimum Rating</Text>
      <View style={styles.ratingContainer}>
        {[0, 3, 3.5, 4, 4.5].map(rating => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.ratingButton,
              filters.minRating === rating && styles.activeRatingButton
            ]}
            onPress={() => handleFilterUpdate({ minRating: rating })}
          >
            <Ionicons name="star" size={16} color={COLORS.accent} />
            <Text style={[
              styles.ratingButtonText,
              filters.minRating === rating && styles.activeRatingButtonText
            ]}>
              {rating === 0 ? 'Any' : `${rating}+`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSortOptions = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>Sort By</Text>
      <View style={styles.sortContainer}>
        {[
          { key: 'rating', label: 'Rating' },
          { key: 'ratePerMinute', label: 'Price' },
          { key: 'experience', label: 'Experience' },
          { key: 'totalReviews', label: 'Reviews' },
          { key: 'name', label: 'Name' }
        ].map(sort => (
          <TouchableOpacity
            key={sort.key}
            style={[
              styles.sortButton,
              filters.sortBy === sort.key && styles.activeSortButton
            ]}
            onPress={() => handleFilterUpdate({ sortBy: sort.key })}
          >
            <Text style={[
              styles.sortButtonText,
              filters.sortBy === sort.key && styles.activeSortButtonText
            ]}>
              {sort.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.sortOrderContainer}>
        <TouchableOpacity
          style={[
            styles.sortOrderButton,
            filters.sortOrder === 'desc' && styles.activeSortOrderButton
          ]}
          onPress={() => handleFilterUpdate({ sortOrder: 'desc' })}
        >
          <Ionicons name="arrow-down" size={16} color={
            filters.sortOrder === 'desc' ? COLORS.surface : COLORS.textSecondary
          } />
          <Text style={[
            styles.sortOrderText,
            filters.sortOrder === 'desc' && styles.activeSortOrderText
          ]}>
            High to Low
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.sortOrderButton,
            filters.sortOrder === 'asc' && styles.activeSortOrderButton
          ]}
          onPress={() => handleFilterUpdate({ sortOrder: 'asc' })}
        >
          <Ionicons name="arrow-up" size={16} color={
            filters.sortOrder === 'asc' ? COLORS.surface : COLORS.textSecondary
          } />
          <Text style={[
            styles.sortOrderText,
            filters.sortOrder === 'asc' && styles.activeSortOrderText
          ]}>
            Low to High
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search astrologers..."
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
        
        {showAdvancedFilters && (
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options" size={20} color={COLORS.primary} />
            {getActiveFiltersCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {getActiveFiltersCount()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.quickFiltersContainer}
      >
        <TouchableOpacity
          style={[
            styles.quickFilterChip,
            filters.isOnline === true && styles.activeQuickFilterChip
          ]}
          onPress={() => handleFilterUpdate({ 
            isOnline: filters.isOnline === true ? null : true 
          })}
        >
          <View style={[styles.onlineIndicator, { 
            backgroundColor: filters.isOnline === true ? COLORS.surface : COLORS.success 
          }]} />
          <Text style={[
            styles.quickFilterText,
            filters.isOnline === true && styles.activeQuickFilterText
          ]}>
            Online Now
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickFilterChip,
            filters.isVerified === true && styles.activeQuickFilterChip
          ]}
          onPress={() => handleFilterUpdate({ 
            isVerified: filters.isVerified === true ? null : true 
          })}
        >
          <Ionicons 
            name="checkmark-circle" 
            size={16} 
            color={filters.isVerified === true ? COLORS.surface : COLORS.success} 
          />
          <Text style={[
            styles.quickFilterText,
            filters.isVerified === true && styles.activeQuickFilterText
          ]}>
            Verified
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickFilterChip,
            filters.minRating >= 4.5 && styles.activeQuickFilterChip
          ]}
          onPress={() => handleFilterUpdate({ 
            minRating: filters.minRating >= 4.5 ? 0 : 4.5 
          })}
        >
          <Ionicons 
            name="star" 
            size={16} 
            color={filters.minRating >= 4.5 ? COLORS.surface : COLORS.accent} 
          />
          <Text style={[
            styles.quickFilterText,
            filters.minRating >= 4.5 && styles.activeQuickFilterText
          ]}>
            Top Rated
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Advanced Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.clearButton}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.modalContent}>
            {renderSpecializationFilters()}
            {renderLanguageFilters()}
            {renderRatingFilter()}
            {renderSortOptions()}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>
                Apply Filters ({getActiveFiltersCount()})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  filterButton: {
    position: 'relative',
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
  },
  filterBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.bold,
    color: COLORS.surface,
  },
  quickFiltersContainer: {
    flexDirection: 'row',
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
  },
  activeQuickFilterChip: {
    backgroundColor: COLORS.primary,
  },
  quickFilterText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  activeQuickFilterText: {
    color: COLORS.surface,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    fontSize: FONTS.md,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginRight: SPACING.md,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.md,
  },
  filterSection: {
    marginBottom: SPACING.lg,
  },
  filterSectionTitle: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  activeFilterChipText: {
    color: COLORS.surface,
  },
  ratingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ratingButton: {
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
  activeRatingButton: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  ratingButtonText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  activeRatingButtonText: {
    color: COLORS.surface,
  },
  sortContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  sortButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeSortButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortButtonText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  activeSortButtonText: {
    color: COLORS.surface,
  },
  sortOrderContainer: {
    flexDirection: 'row',
  },
  sortOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeSortOrderButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortOrderText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  activeSortOrderText: {
    color: COLORS.surface,
  },
  modalFooter: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.surface,
  },
});

export default SearchFilterBar;
