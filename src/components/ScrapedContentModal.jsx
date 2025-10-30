import React from 'react';

const ScrapedContentModal = ({ isOpen, onClose, scrapedData, isLoading, error }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateText = (text, maxLength = 200) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const truncateTextForPreview = (text, maxLength = 300) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                🔍 Scraped Content
              </h2>
              <p className="text-blue-100 mt-1">Complete webpage analysis</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Scraping webpage content...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-red-600 text-xl">❌</span>
                <div>
                  <h3 className="font-semibold text-red-800">Scraping Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {scrapedData && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  📄 Page Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Title:</span>
                    <p className="text-gray-900 mt-1">{scrapedData.title}</p>
                  </div>
                  {scrapedData.metaDescription && (
                    <div>
                      <span className="font-medium text-gray-700">Description:</span>
                      <p className="text-gray-900 mt-1">{scrapedData.metaDescription}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">URL:</span>
                    <a 
                      href={scrapedData.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline block mt-1 break-all"
                    >
                      {scrapedData.url}
                    </a>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Scraped at:</span>
                    <p className="text-gray-600 mt-1">{formatDate(scrapedData.scrapedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Headings */}
              {scrapedData.headings && scrapedData.headings.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    📋 Page Structure ({scrapedData.headings.length} headings)
                  </h3>
                  <div className="space-y-2">
                    {scrapedData.headings.map((heading, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className={`text-xs px-2 py-1 rounded font-mono ${
                          heading.tag === 'h1' ? 'bg-red-100 text-red-700' :
                          heading.tag === 'h2' ? 'bg-orange-100 text-orange-700' :
                          heading.tag === 'h3' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {heading.tag.toUpperCase()}
                        </span>
                        <p className="text-gray-900 flex-1">{heading.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Preview */}
              {scrapedData.bodyText && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                    📝 Full Content ({scrapedData.bodyText.length} characters)
                  </h3>
                  <div className="bg-white rounded p-3 border max-h-96 overflow-y-auto">
                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {scrapedData.bodyText}
                    </p>
                  </div>
                </div>
              )}

              {/* Key Paragraphs */}
              {scrapedData.paragraphs && scrapedData.paragraphs.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    📄 Key Paragraphs ({scrapedData.paragraphs.length})
                  </h3>
                  <div className="space-y-3">
                    {scrapedData.paragraphs.slice(0, 5).map((paragraph, index) => (
                      <div key={index} className="bg-white rounded p-3 border">
                        <p className="text-gray-900 leading-relaxed">
                          {truncateText(paragraph, 300)}
                        </p>
                      </div>
                    ))}
                    {scrapedData.paragraphs.length > 5 && (
                      <p className="text-purple-600 text-sm italic">
                        And {scrapedData.paragraphs.length - 5} more paragraphs...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Links */}
              {scrapedData.links && scrapedData.links.length > 0 && (
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                    🔗 Links Found ({scrapedData.links.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {scrapedData.links.slice(0, 10).map((link, index) => (
                      <div key={index} className="bg-white rounded p-2 border">
                        <a 
                          href={link.href} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm font-medium block"
                        >
                          {truncateText(link.text, 50)}
                        </a>
                        <p className="text-xs text-gray-500 mt-1 break-all">
                          {truncateText(link.href, 60)}
                        </p>
                      </div>
                    ))}
                  </div>
                  {scrapedData.links.length > 10 && (
                    <p className="text-indigo-600 text-sm italic mt-2">
                      And {scrapedData.links.length - 10} more links...
                    </p>
                  )}
                </div>
              )}

              {/* Images */}
              {scrapedData.images && scrapedData.images.length > 0 && (
                <div className="bg-pink-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-pink-800 mb-3 flex items-center gap-2">
                    🖼️ Images Found ({scrapedData.images.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                    {scrapedData.images.slice(0, 6).map((image, index) => (
                      <div key={index} className="bg-white rounded p-2 border">
                        <img 
                          src={image.src} 
                          alt={image.alt}
                          className="w-full h-20 object-cover rounded mb-2"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        {image.alt && (
                          <p className="text-xs text-gray-600">{truncateText(image.alt, 40)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {scrapedData.images.length > 6 && (
                    <p className="text-pink-600 text-sm italic mt-2">
                      And {scrapedData.images.length - 6} more images...
                    </p>
                  )}
                </div>
              )}

              {/* Structured Data */}
              {scrapedData.structuredData && scrapedData.structuredData.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                    🏗️ Structured Data ({scrapedData.structuredData.length} items)
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {scrapedData.structuredData.map((data, index) => (
                      <div key={index} className="bg-white rounded p-2 border">
                        <pre className="text-xs text-gray-700 overflow-x-auto">
                          {JSON.stringify(data, null, 2).substring(0, 200)}...
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrapedContentModal;
