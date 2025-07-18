import AsyncStorage from '@react-native-async-storage/async-storage';

class FavoritesService {
  constructor() {
    this.FAVORITES_KEY = 'astrotalk_favorites';
  }

  // Get all favorite astrologers
  async getFavorites() {
    try {
      const favoritesJson = await AsyncStorage.getItem(this.FAVORITES_KEY);
      if (favoritesJson) {
        const favorites = JSON.parse(favoritesJson);
        return {
          success: true,
          data: favorites,
          message: 'Favorites retrieved successfully'
        };
      }
      return {
        success: true,
        data: [],
        message: 'No favorites found'
      };
    } catch (error) {
      console.error('Get favorites error:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to retrieve favorites',
        error: error.message
      };
    }
  }

  // Add astrologer to favorites
  async addToFavorites(astrologer) {
    try {
      const favoritesResult = await this.getFavorites();
      const favorites = favoritesResult.data || [];

      // Check if already in favorites
      const existingIndex = favorites.findIndex(fav => fav.id === astrologer.id);
      if (existingIndex !== -1) {
        return {
          success: false,
          message: 'Astrologer is already in favorites'
        };
      }

      // Add to favorites with timestamp
      const favoriteItem = {
        ...astrologer,
        addedAt: new Date().toISOString()
      };

      favorites.push(favoriteItem);
      await AsyncStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));

      return {
        success: true,
        data: favoriteItem,
        message: 'Added to favorites successfully'
      };
    } catch (error) {
      console.error('Add to favorites error:', error);
      return {
        success: false,
        message: 'Failed to add to favorites',
        error: error.message
      };
    }
  }

  // Remove astrologer from favorites
  async removeFromFavorites(astrologerId) {
    try {
      const favoritesResult = await this.getFavorites();
      const favorites = favoritesResult.data || [];

      const filteredFavorites = favorites.filter(fav => fav.id !== astrologerId);
      
      if (filteredFavorites.length === favorites.length) {
        return {
          success: false,
          message: 'Astrologer not found in favorites'
        };
      }

      await AsyncStorage.setItem(this.FAVORITES_KEY, JSON.stringify(filteredFavorites));

      return {
        success: true,
        data: filteredFavorites,
        message: 'Removed from favorites successfully'
      };
    } catch (error) {
      console.error('Remove from favorites error:', error);
      return {
        success: false,
        message: 'Failed to remove from favorites',
        error: error.message
      };
    }
  }

  // Check if astrologer is in favorites
  async isFavorite(astrologerId) {
    try {
      const favoritesResult = await this.getFavorites();
      const favorites = favoritesResult.data || [];
      
      const isFav = favorites.some(fav => fav.id === astrologerId);
      return {
        success: true,
        data: isFav,
        message: 'Favorite status checked'
      };
    } catch (error) {
      console.error('Check favorite error:', error);
      return {
        success: false,
        data: false,
        message: 'Failed to check favorite status',
        error: error.message
      };
    }
  }

  // Toggle favorite status
  async toggleFavorite(astrologer) {
    try {
      const isFavoriteResult = await this.isFavorite(astrologer.id);
      
      if (isFavoriteResult.data) {
        // Remove from favorites
        return await this.removeFromFavorites(astrologer.id);
      } else {
        // Add to favorites
        return await this.addToFavorites(astrologer);
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      return {
        success: false,
        message: 'Failed to toggle favorite status',
        error: error.message
      };
    }
  }

  // Get favorites count
  async getFavoritesCount() {
    try {
      const favoritesResult = await this.getFavorites();
      const favorites = favoritesResult.data || [];
      
      return {
        success: true,
        data: favorites.length,
        message: 'Favorites count retrieved'
      };
    } catch (error) {
      console.error('Get favorites count error:', error);
      return {
        success: false,
        data: 0,
        message: 'Failed to get favorites count',
        error: error.message
      };
    }
  }

  // Clear all favorites
  async clearFavorites() {
    try {
      await AsyncStorage.removeItem(this.FAVORITES_KEY);
      return {
        success: true,
        message: 'All favorites cleared successfully'
      };
    } catch (error) {
      console.error('Clear favorites error:', error);
      return {
        success: false,
        message: 'Failed to clear favorites',
        error: error.message
      };
    }
  }

  // Get favorites sorted by different criteria
  async getFavoritesSorted(sortBy = 'addedAt', sortOrder = 'desc') {
    try {
      const favoritesResult = await this.getFavorites();
      let favorites = favoritesResult.data || [];

      favorites.sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'rating':
            aValue = a.rating || 0;
            bValue = b.rating || 0;
            break;
          case 'ratePerMinute':
            aValue = a.ratePerMinute || 0;
            bValue = b.ratePerMinute || 0;
            break;
          case 'experience':
            aValue = a.experience || 0;
            bValue = b.experience || 0;
            break;
          case 'addedAt':
          default:
            aValue = new Date(a.addedAt || 0);
            bValue = new Date(b.addedAt || 0);
            break;
        }

        if (sortOrder === 'desc') {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
      });

      return {
        success: true,
        data: favorites,
        message: 'Sorted favorites retrieved successfully'
      };
    } catch (error) {
      console.error('Get sorted favorites error:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to get sorted favorites',
        error: error.message
      };
    }
  }

  // Search within favorites
  async searchFavorites(query) {
    try {
      const favoritesResult = await this.getFavorites();
      const favorites = favoritesResult.data || [];

      if (!query || query.trim() === '') {
        return favoritesResult;
      }

      const searchQuery = query.toLowerCase().trim();
      const filteredFavorites = favorites.filter(astrologer => {
        return (
          astrologer.name.toLowerCase().includes(searchQuery) ||
          astrologer.bio.toLowerCase().includes(searchQuery) ||
          astrologer.specializations.some(spec => 
            spec.toLowerCase().includes(searchQuery)
          ) ||
          astrologer.languages.some(lang => 
            lang.toLowerCase().includes(searchQuery)
          )
        );
      });

      return {
        success: true,
        data: filteredFavorites,
        message: `Found ${filteredFavorites.length} matching favorites`
      };
    } catch (error) {
      console.error('Search favorites error:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to search favorites',
        error: error.message
      };
    }
  }

  // Export favorites (for backup or sharing)
  async exportFavorites() {
    try {
      const favoritesResult = await this.getFavorites();
      const favorites = favoritesResult.data || [];

      const exportData = {
        favorites,
        exportedAt: new Date().toISOString(),
        version: '1.0',
        totalCount: favorites.length
      };

      return {
        success: true,
        data: exportData,
        message: 'Favorites exported successfully'
      };
    } catch (error) {
      console.error('Export favorites error:', error);
      return {
        success: false,
        message: 'Failed to export favorites',
        error: error.message
      };
    }
  }

  // Import favorites (from backup)
  async importFavorites(importData, mergeWithExisting = true) {
    try {
      if (!importData || !importData.favorites || !Array.isArray(importData.favorites)) {
        return {
          success: false,
          message: 'Invalid import data format'
        };
      }

      let finalFavorites = importData.favorites;

      if (mergeWithExisting) {
        const existingResult = await this.getFavorites();
        const existingFavorites = existingResult.data || [];

        // Merge and remove duplicates
        const mergedFavorites = [...existingFavorites];
        importData.favorites.forEach(importedFav => {
          const exists = mergedFavorites.some(existing => existing.id === importedFav.id);
          if (!exists) {
            mergedFavorites.push(importedFav);
          }
        });

        finalFavorites = mergedFavorites;
      }

      await AsyncStorage.setItem(this.FAVORITES_KEY, JSON.stringify(finalFavorites));

      return {
        success: true,
        data: finalFavorites,
        message: `Successfully imported ${finalFavorites.length} favorites`
      };
    } catch (error) {
      console.error('Import favorites error:', error);
      return {
        success: false,
        message: 'Failed to import favorites',
        error: error.message
      };
    }
  }
}

export default new FavoritesService();
