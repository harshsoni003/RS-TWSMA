import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const ScrapedContentPage = () => {
  const { encodedUrl } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [scrapedData, setScrapedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the original URL and title from params
  const url = decodeURIComponent(encodedUrl);
  const title = searchParams.get('title') || 'Scraped Content';

  useEffect(() => {
    const scrapeContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('Scraping URL:', url);
        const response = await axios.get(API_ENDPOINTS.SCRAPE, {
          params: { url },
          timeout: 90000 // Increased to 90 seconds to match server timeout
        });

        if (response.data) {
          setScrapedData(response.data);
        } else {
          throw new Error('Failed to scrape content');
        }
      } catch (error) {
        console.error('Scraping error:', error);
        
        let errorMessage = 'Failed to scrape content';
        if (error.code === 'ECONNREFUSED') {
          errorMessage = 'Server is not running. Please start the backend server.';
        } else if (error.response?.status === 404) {
          errorMessage = 'Scraping endpoint not found. Please check if the server is running properly.';
        } else if (error.response?.data?.details) {
          errorMessage = error.response.data.details;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (url) {
      scrapeContent();
    }
  }, [url]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateText = (text, maxLength = 200) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const navigateToFormattedContent = () => {
    if (!scrapedData?.textContent) {
      alert('No content available to format');
      return;
    }

    // Navigate to formatted content page with content as URL params
    const params = new URLSearchParams({
      title: scrapedData.title || title,
      content: scrapedData.textContent,
      url: url
    });
    
    // Use a safe route without the URL in the path
    navigate(`/formatted?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-blue-100 hover:text-white mb-3 transition-colors"
              >
                ← Back to Results
              </button>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                🔍 Scraped Content Analysis
              </h1>
              <p className="text-blue-100 mt-2">{title}</p>
            </div>
            {scrapedData && (
              <button
                onClick={navigateToFormattedContent}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              >
                ✨ AI-Enhanced View
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Scraping Content...</h2>
            <p className="text-gray-600">This may take a few moments</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-4">
              <span className="text-red-600 text-3xl">❌</span>
              <div>
                <h3 className="text-xl font-semibold text-red-800">Scraping Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button
                  onClick={() => navigate(-1)}
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}

        {scrapedData && (
          <div className="space-y-8">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📄 Page Information
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Title:</h3>
                  <p className="text-gray-900 text-lg">{scrapedData.title}</p>
                </div>
                {scrapedData.metaDescription && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Description:</h3>
                    <p className="text-gray-900">{scrapedData.metaDescription}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">URL:</h3>
                  <a 
                    href={scrapedData.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                  >
                    {scrapedData.url}
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Scraped at:</h3>
                  <p className="text-gray-600">{formatDate(scrapedData.scrapedAt)}</p>
                </div>
              </div>
            </div>

            {/* Full Content */}
            {scrapedData.textContent && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
                  📝 Complete Content ({scrapedData.textContent.length.toLocaleString()} characters)
                </h2>
                <div className="bg-gray-50 rounded-lg p-6 border">
                  <div className="prose max-w-none">
                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap text-base">
                      {scrapedData.textContent}
                    </p>
                  </div>
                </div>
              </div>
            )}



            {/* Links */}
            {scrapedData.links && scrapedData.links.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-indigo-800 mb-4 flex items-center gap-2">
                  🔗 Links Found ({scrapedData.links.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scrapedData.links.map((link, index) => (
                    <div key={index} className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                      <a 
                        href={link.href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium block mb-2"
                      >
                        {truncateText(link.text, 60)}
                      </a>
                      <p className="text-xs text-gray-500 break-all">
                        {truncateText(link.href, 80)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Images */}
            {scrapedData.images && scrapedData.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-pink-800 mb-4 flex items-center gap-2">
                  🖼️ Images Found ({scrapedData.images.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {scrapedData.images.map((image, index) => (
                    <div key={index} className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                      <img 
                        src={image.src} 
                        alt={image.alt}
                        className="w-full h-32 object-cover rounded mb-2"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      {image.alt && (
                        <p className="text-xs text-gray-600">{truncateText(image.alt, 50)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-300">
            Scraped content analysis powered by Puppeteer • 
            <button
              onClick={() => navigate(-1)}
              className="text-blue-400 hover:text-blue-300 ml-2 underline"
            >
              Back to Search Results
            </button>
          </p>
        </div>
      </footer>

    </div>
  );
};

export default ScrapedContentPage;
