import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScoreDetailsModal from './ScoreDetailsModal';

const PostList = ({ posts, query }) => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  if (!posts || posts.length === 0) {
    return null;
  }

  const handleViewDetails = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const handleScrapeContent = (url, title) => {
    // Encode the URL to make it safe for use in the route
    const encodedUrl = encodeURIComponent(url);
    // Navigate to the scraping page with the URL and title as parameters
    navigate(`/scrape/${encodedUrl}?title=${encodeURIComponent(title)}`);
  };

  const highlightKeywords = (text, query) => {
    if (!query || !text) return text;
    
    const words = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    let highlightedText = text;
    
    words.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    });
    
    return highlightedText;
  };

  const formatScore = (score) => {
    return (score * 100).toFixed(1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          📊 Ranked Results ({posts.length} posts)
        </h2>
        <p className="text-gray-600">
          Posts ranked by combined keyword matching + TF-IDF similarity scores
        </p>
      </div>

      <div className="space-y-4">
        {posts.map((post, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            {/* Rank and Scores */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
                  #{index + 1}
                </span>
                <div className="flex gap-2 text-xs">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                    Final: {formatScore(post.finalScore)}%
                  </span>
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    Keywords: {formatScore(post.keywordScore)}%
                  </span>
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    TF-IDF: {formatScore(post.tfidfScore)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold mb-2">
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
                dangerouslySetInnerHTML={{
                  __html: highlightKeywords(post.title, query)
                }}
              />
            </h3>

            {/* Snippet */}
            <p
              className="text-gray-700 mb-3 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: highlightKeywords(post.snippet, query)
              }}
            />

            {/* Link and Actions */}
            <div className="flex items-center justify-between">
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:text-green-800 truncate max-w-md"
              >
                {post.link}
              </a>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDetails(post)}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-600 px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  📊 View Details
                </button>
                <button
                  onClick={() => handleScrapeContent(post.link, post.title)}
                  className="bg-orange-50 hover:bg-orange-100 text-orange-600 px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  🔍 Scrap
                </button>
                <button
                  onClick={() => window.open(post.link, '_blank')}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  Open →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-2">🔍 Ranking Summary</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Keyword Score:</strong> Measures how many query words appear in title + snippet</p>
          <p><strong>TF-IDF Score:</strong> Measures semantic similarity using term frequency and document frequency</p>
          <p><strong>Final Score:</strong> Weighted combination (40% keywords + 60% TF-IDF)</p>
          <p className="text-purple-600 font-medium">💡 Click "📊 View Details" on any post to see the complete calculation breakdown!</p>
        </div>
      </div>

      {/* Score Details Modal */}
      <ScoreDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        post={selectedPost}
        query={query}
        calculationDetails={selectedPost?.calculationDetails}
      />

    </div>
  );
};

export default PostList;
