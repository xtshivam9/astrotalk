import apiClient from './apiClient';

class AstrologerService {
  // Get all astrologers with filters and pagination
  async getAllAstrologers(params = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        specializations,
        languages,
        minRating,
        maxRate,
        minRate,
        sortBy = 'rating',
        sortOrder = 'desc',
        search,
        isOnline
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      });

      if (specializations && specializations.length > 0) {
        queryParams.append('specializations', specializations.join(','));
      }
      if (languages && languages.length > 0) {
        queryParams.append('languages', languages.join(','));
      }
      if (minRating) queryParams.append('minRating', minRating.toString());
      if (maxRate) queryParams.append('maxRate', maxRate.toString());
      if (minRate) queryParams.append('minRate', minRate.toString());
      if (search) queryParams.append('search', search);
      if (isOnline !== undefined) queryParams.append('isOnline', isOnline.toString());

      const response = await apiClient.get(`/astrologers?${queryParams.toString()}`);
      
      return {
        success: true,
        data: response.data.data,
        message: 'Astrologers fetched successfully'
      };
    } catch (error) {
      console.error('Get all astrologers error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch astrologers',
        error: error.response?.data || error.message
      };
    }
  }

  // Advanced search for astrologers
  async searchAstrologers(params = {}) {
    try {
      const {
        query,
        specializations,
        languages,
        minRating,
        maxRate,
        minRate,
        experience,
        gender,
        isOnline,
        isVerified,
        sortBy = 'relevance',
        sortOrder = 'desc',
        page = 1,
        limit = 20
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      });

      if (query) queryParams.append('query', query);
      if (specializations && specializations.length > 0) {
        queryParams.append('specializations', specializations.join(','));
      }
      if (languages && languages.length > 0) {
        queryParams.append('languages', languages.join(','));
      }
      if (minRating) queryParams.append('minRating', minRating.toString());
      if (maxRate) queryParams.append('maxRate', maxRate.toString());
      if (minRate) queryParams.append('minRate', minRate.toString());
      if (experience) queryParams.append('experience', experience);
      if (gender) queryParams.append('gender', gender);
      if (isOnline !== undefined) queryParams.append('isOnline', isOnline.toString());
      if (isVerified !== undefined) queryParams.append('isVerified', isVerified.toString());

      const response = await apiClient.get(`/astrologers/search?${queryParams.toString()}`);
      
      return {
        success: true,
        data: response.data.data,
        message: 'Search completed successfully'
      };
    } catch (error) {
      console.error('Search astrologers error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Search failed',
        error: error.response?.data || error.message
      };
    }
  }

  // Get available astrologers
  async getAvailableAstrologers(params = {}) {
    try {
      const {
        specializations,
        languages,
        minRating,
        maxRate,
        minRate,
        limit = 20
      } = params;

      const queryParams = new URLSearchParams({
        limit: limit.toString()
      });

      if (specializations && specializations.length > 0) {
        queryParams.append('specializations', specializations.join(','));
      }
      if (languages && languages.length > 0) {
        queryParams.append('languages', languages.join(','));
      }
      if (minRating) queryParams.append('minRating', minRating.toString());
      if (maxRate) queryParams.append('maxRate', maxRate.toString());
      if (minRate) queryParams.append('minRate', minRate.toString());

      const response = await apiClient.get(`/astrologers/available?${queryParams.toString()}`);
      
      return {
        success: true,
        data: response.data.data,
        message: 'Available astrologers fetched successfully'
      };
    } catch (error) {
      console.error('Get available astrologers error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch available astrologers',
        error: error.response?.data || error.message
      };
    }
  }

  // Get astrologer by ID
  async getAstrologerById(id) {
    try {
      const response = await apiClient.get(`/astrologers/${id}`);
      
      return {
        success: true,
        data: response.data.data.astrologer,
        message: 'Astrologer details fetched successfully'
      };
    } catch (error) {
      console.error('Get astrologer by ID error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch astrologer details',
        error: error.response?.data || error.message
      };
    }
  }

  // Get filter options
  async getFilterOptions() {
    try {
      const response = await apiClient.get('/astrologers/filters');
      
      return {
        success: true,
        data: response.data.data,
        message: 'Filter options fetched successfully'
      };
    } catch (error) {
      console.error('Get filter options error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch filter options',
        error: error.response?.data || error.message
      };
    }
  }

  // Get astrologer reviews
  async getAstrologerReviews(astrologerId, params = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        minRating,
        maxRating
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      });

      if (minRating) queryParams.append('minRating', minRating.toString());
      if (maxRating) queryParams.append('maxRating', maxRating.toString());

      const response = await apiClient.get(`/astrologers/${astrologerId}/reviews?${queryParams.toString()}`);
      
      return {
        success: true,
        data: response.data.data,
        message: 'Reviews fetched successfully'
      };
    } catch (error) {
      console.error('Get astrologer reviews error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch reviews',
        error: error.response?.data || error.message
      };
    }
  }

  // Create review (authenticated)
  async createReview(astrologerId, reviewData) {
    try {
      const response = await apiClient.post(`/astrologers/${astrologerId}/reviews`, reviewData);
      
      return {
        success: true,
        data: response.data.data.review,
        message: 'Review created successfully'
      };
    } catch (error) {
      console.error('Create review error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create review',
        error: error.response?.data || error.message
      };
    }
  }

  // Mark review as helpful (authenticated)
  async markReviewHelpful(reviewId) {
    try {
      const response = await apiClient.post(`/astrologers/reviews/${reviewId}/helpful`);
      
      return {
        success: true,
        data: response.data.data,
        message: 'Review marked as helpful'
      };
    } catch (error) {
      console.error('Mark review helpful error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark review as helpful',
        error: error.response?.data || error.message
      };
    }
  }

  // Remove helpful vote (authenticated)
  async removeHelpfulVote(reviewId) {
    try {
      const response = await apiClient.delete(`/astrologers/reviews/${reviewId}/helpful`);
      
      return {
        success: true,
        data: response.data.data,
        message: 'Helpful vote removed'
      };
    } catch (error) {
      console.error('Remove helpful vote error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove helpful vote',
        error: error.response?.data || error.message
      };
    }
  }

  // Report review (authenticated)
  async reportReview(reviewId, reason) {
    try {
      const response = await apiClient.post(`/astrologers/reviews/${reviewId}/report`, { reason });
      
      return {
        success: true,
        message: 'Review reported successfully'
      };
    } catch (error) {
      console.error('Report review error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to report review',
        error: error.response?.data || error.message
      };
    }
  }

  // Helper method to format specializations for display
  formatSpecialization(specialization) {
    return specialization
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Helper method to format languages for display
  formatLanguage(language) {
    return language.charAt(0).toUpperCase() + language.slice(1);
  }

  // Helper method to get rating color
  getRatingColor(rating) {
    if (rating >= 4.5) return '#4CAF50'; // Green
    if (rating >= 4.0) return '#8BC34A'; // Light Green
    if (rating >= 3.5) return '#FFC107'; // Amber
    if (rating >= 3.0) return '#FF9800'; // Orange
    return '#F44336'; // Red
  }

  // Helper method to get experience level
  getExperienceLevel(years) {
    if (years >= 20) return 'Master';
    if (years >= 15) return 'Expert';
    if (years >= 10) return 'Senior';
    if (years >= 5) return 'Experienced';
    return 'Junior';
  }
}

export default new AstrologerService();
