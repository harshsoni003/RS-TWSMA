import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const FormattedContentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formattedContent, setFormattedContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [originalData, setOriginalData] = useState(null);

  // Get the URL, title, and content from query parameters
  const url = searchParams.get('url') || '';
  const title = searchParams.get('title') || 'Formatted Content';
  const content = searchParams.get('content') || '';

  useEffect(() => {
    const formatContent = async () => {
      if (!content) {
        setError('No content available to format');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('Formatting content with Gemini AI...');
        const response = await axios.post(API_ENDPOINTS.FORMAT_CONTENT, {
          content: content,
          title: title,
          url: url
        }, {
          timeout: 60000 // 60 seconds timeout
        });

        if (response.data.formattedContent) {
          // Parse the formatted content into an array of tweets
          const threadText = response.data.formattedContent;
          const tweets = threadText.split(/\n\n/).filter(tweet => tweet.trim().length > 0);
          
          const formattedTweets = tweets.map((tweet, index) => ({
            headline: `Tweet ${index + 1}`,
            content: tweet.trim()
          }));
          
          setFormattedContent(formattedTweets);
          setOriginalData({ title, url, content: content.substring(0, 1000) });
        } else {
          throw new Error('Failed to format content');
        }
      } catch (error) {
        console.error('Content formatting error:', error);
        
        let errorMessage = 'Failed to format content';
        if (error.code === 'ECONNREFUSED') {
          errorMessage = 'Server is not running. Please start the backend server.';
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    formatContent();
  }, [content, title]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const copyAllContent = () => {
    const allContent = formattedContent.map((section, index) => 
      `${index + 1}. ${section.headline}\n${section.content}`
    ).join('\n\n');
    copyToClipboard(allContent);
  };

  const shareOnTwitter = (section, index) => {
    const tweetText = encodeURIComponent(`${section.headline}\n\n${section.content}`);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back
            </button>
            {formattedContent.length > 0 && (
              <button
                onClick={copyAllContent}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full font-medium transition-colors text-sm"
              >
                Copy All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {isLoading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-lg font-medium text-gray-700 mb-2">Enhancing Content with AI...</h2>
            <p className="text-gray-500 text-sm">This may take a few moments</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
            <div className="flex items-center gap-3">
              <span className="text-red-600 text-xl">❌</span>
              <div>
                <h3 className="font-semibold text-red-800">Content Formatting Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <button
                  onClick={() => navigate(-1)}
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}

        {formattedContent.length > 0 && (
          <div>
            {/* Thread Header */}
            <div className="border-b border-gray-200 pb-4 mb-0">
              <div className="flex items-start gap-3 px-4 pt-4">
                <img 
                  src="/Harsh_soni.png" 
                  alt="Harsh Soni" 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">Harsh Soni</h3>
                    <span className="text-blue-500">✓</span>
                    <span className="text-gray-500 text-sm">@harshsoni_hs</span>
                  </div>
                  <p className="text-gray-900 mt-2 leading-relaxed">
                    {title}:
                  </p>
                  <p className="text-gray-900 mt-2 leading-relaxed">
                    {formattedContent[0]?.content || "Here's what makes each one stand out:"}
                  </p>
                  <div className="flex items-center gap-6 mt-3 text-gray-500">
                    <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-2.83-.5l-2.17.87.87-2.17A8.013 8.013 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                      </svg>
                    </button>
                    <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    <button 
                      onClick={copyAllContent}
                      className="flex items-center gap-2 hover:text-blue-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Thread Sections */}
            <div>
              {formattedContent.slice(1).map((section, index) => (
                <div key={index + 1} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3 px-4 py-4">
                    <img 
                      src="/Harsh_soni.png" 
                      alt="Harsh Soni" 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">Harsh Soni</h3>
                        <span className="text-blue-500">✓</span>
                        <span className="text-gray-500 text-sm">@harshsoni_hs</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                          /{index + 2}
                        </span>
                      </div>
                      
                      {/* Section Content */}
                      <div className="text-gray-900 leading-relaxed">
                        <p className="font-medium mb-1">{section.headline}</p>
                        <p>{section.content}</p>
                      </div>
                      
                      <div className="flex items-center gap-6 mt-3 text-gray-500">
                        <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-2.83-.5l-2.17.87.87-2.17A8.013 8.013 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                          </svg>
                        </button>
                        <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                        <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => copyToClipboard(`${section.headline}\n\n${section.content}`)}
                          className="flex items-center gap-2 hover:text-blue-500 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => shareOnTwitter(section, index + 1)}
                          className="flex items-center gap-2 hover:text-blue-500 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default FormattedContentPage;
