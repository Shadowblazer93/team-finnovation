// API Client for Wealth Wellness Hub

const API_BASE = '/api';

// Generic fetch wrapper
async function fetchAPI<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`API Error: ${endpoint}`, error);
    return { success: false, error: 'Network error' };
  }
}

// Portfolio API
export const portfolioAPI = {
  // Get all portfolio data
  getPortfolio: () => fetchAPI('/portfolio'),
  
  // Add a new asset
  addAsset: (asset: {
    name: string;
    category: string;
    value: number;
    currency?: string;
    platform?: string;
  }) => fetchAPI('/portfolio', {
    method: 'POST',
    body: JSON.stringify(asset),
  }),
};

// Wellness API
export const wellnessAPI = {
  // Get wellness metrics
  getWellness: () => fetchAPI('/wellness'),
  
  // Recalculate wellness score
  recalculate: (params: {
    riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
    investmentHorizon?: 'short' | 'medium' | 'long';
  }) => fetchAPI('/wellness', {
    method: 'POST',
    body: JSON.stringify(params),
  }),
};

// Recommendations API
export const recommendationsAPI = {
  // Get recommendations (with optional filters)
  getRecommendations: (filters?: {
    priority?: 'high' | 'medium' | 'low';
    type?: 'action' | 'insight' | 'warning' | 'opportunity';
  }) => {
    const params = new URLSearchParams();
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.type) params.set('type', filters.type);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchAPI(`/recommendations${query}`);
  },
  
  // Mark recommendation as completed/dismissed/snoozed
  updateRecommendation: (
    recommendationId: string, 
    action: 'completed' | 'dismissed' | 'snoozed'
  ) => fetchAPI('/recommendations', {
    method: 'POST',
    body: JSON.stringify({ recommendationId, action }),
  }),
};

// Scenarios API
export const scenariosAPI = {
  // Get all predefined scenarios
  getScenarios: () => fetchAPI('/scenarios'),
  
  // Run custom scenario analysis
  runScenario: (params: {
    scenarioType: 'market_drop' | 'interest_rate_rise' | 'crypto_volatility';
    parameters?: Record<string, number>;
  }) => fetchAPI('/scenarios', {
    method: 'POST',
    body: JSON.stringify(params),
  }),
};

// Export all APIs
export const api = {
  portfolio: portfolioAPI,
  wellness: wellnessAPI,
  recommendations: recommendationsAPI,
  scenarios: scenariosAPI,
};

export default api;
