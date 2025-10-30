import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import SearchInput from './components/SearchInput';
import PostList from './components/PostList';
import ScrapedContentPage from './pages/ScrapedContentPage';
import FormattedContentPage from './pages/FormattedContentPage';
import { API_ENDPOINTS } from './config/api';

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // API configuration using environment-aware endpoints

  const searchPosts = async (query) => {
    setIsLoading(true);
    setError(null);
    setCurrentQuery(query);

    try {
      // Make API call to our backend proxy
      const response = await axios.get(API_ENDPOINTS.SEARCH, {
        params: {
          q: query
        }
      });

      if (response.data.results) {
        const results = response.data.results.map(result => ({
          title: result.title || '',
          link: result.link || '',
          snippet: result.snippet || '',
          relevanceScore: result.relevanceScore || 0
        }));

        setPosts(results);
        
        // Refresh search history after new search
        loadSearchHistory();
      } else {
        throw new Error('No results found');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to fetch results. Please try again.');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSearchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await axios.get(API_ENDPOINTS.SEARCH_HISTORY);
      if (response.data && Array.isArray(response.data)) {
        setSearchHistory(response.data);
      }
    } catch (err) {
      console.error('Error loading search history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Load search history on component mount
  React.useEffect(() => {
    loadSearchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 Content Generation System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find and rank relevant posts using advanced keyword matching.
          </p>
        </header>

        {/* Search Input */}
        <SearchInput onSearch={searchPosts} isLoading={isLoading} />

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <span className="text-red-600 text-xl">❌</span>
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {posts.length > 0 && (
          <PostList posts={posts} query={currentQuery} />
        )}

        {/* No Results */}
        {!isLoading && !error && posts.length === 0 && currentQuery && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No results found</h3>
            <p className="text-gray-500">Try a different search query</p>
          </div>
        )}

        {/* Search History Section */}
        {searchHistory.length > 0 && (
          <div className="mt-16">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                📚 Search History
              </h2>
              
              {isLoadingHistory ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading history...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {searchHistory.map((search, index) => (
                    <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                      {/* Search Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg">
                            🔍 "{search.query}"
                          </h3>
                          <div className="text-sm text-gray-600 mt-1">
                            📊 {search.results?.length || 0} results • {new Date(search.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      {/* Results in Row Layout */}
                      {search.results && search.results.length > 0 && (
                        <div className="space-y-3">
                          {search.results.map((result, resultIndex) => (
                            <div key={resultIndex} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-800 mb-2 leading-tight">
                                    {result.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                    {result.snippet}
                                  </p>
                                  <a 
                                    href={result.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                  >
                                    {result.link}
                                  </a>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex flex-col gap-2 min-w-[120px]">
                                  <button
                                    onClick={() => {
                                      const encodedUrl = encodeURIComponent(result.link);
                                      window.open(`/scrape/${encodedUrl}?title=${encodeURIComponent(result.title)}`, '_blank');
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white text-xs py-2 px-3 rounded transition-colors flex items-center gap-1"
                                  >
                                    🔍 Scrape
                                  </button>
                                  <a
                                    href={result.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded transition-colors text-center"
                                  >
                                    Open →
                                  </a>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 text-center">
                <button
                  onClick={loadSearchHistory}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  🔄 Refresh History
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Built with React • Powered by keyword matching • Search history saved locally</p>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scrape/:encodedUrl" element={<ScrapedContentPage />} />
        <Route path="/formatted" element={<FormattedContentPage />} />
      </Routes>
    </Router>
  );
}

export default App;
