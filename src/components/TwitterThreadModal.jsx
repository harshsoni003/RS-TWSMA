import React, { useState } from 'react';

const TwitterThreadModal = ({ isOpen, onClose, tweets, isLoading, onGenerate, contentTitle }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await onGenerate();
    setIsGenerating(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const copyAllTweets = () => {
    const allTweets = tweets.map((tweet, index) => `${index + 1}/${tweets.length} ${tweet}`).join('\n\n');
    copyToClipboard(allTweets);
  };

  const shareOnTwitter = (tweet, index) => {
    const tweetText = encodeURIComponent(`${index + 1}/${tweets.length} ${tweet}`);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                🧵 Twitter Thread Generator
              </h2>
              <p className="text-blue-100 mt-1">Alex Hormozi Style Business Insights</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!tweets || tweets.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Generate Your Twitter Thread
                </h3>
                <p className="text-gray-600 mb-6">
                  Transform "{contentTitle}" into an engaging Twitter thread with Alex Hormozi's no-nonsense business insights.
                </p>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating Thread...
                    </span>
                  ) : (
                    'Generate Twitter Thread 🧵'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Thread Actions */}
              <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                <button
                  onClick={copyAllTweets}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  📋 Copy All Tweets
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Regenerating...
                    </>
                  ) : (
                    <>🔄 Regenerate Thread</>
                  )}
                </button>
                <div className="text-sm text-gray-600 flex items-center">
                  📊 {tweets.length} tweets generated
                </div>
              </div>

              {/* Tweets */}
              <div className="space-y-4">
                {tweets.map((tweet, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                            {index + 1}/{tweets.length}
                          </span>
                          <span className="text-xs text-gray-500">
                            {tweet.length} characters
                          </span>
                        </div>
                        <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                          {tweet}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => copyToClipboard(`${index + 1}/${tweets.length} ${tweet}`)}
                          className="text-gray-500 hover:text-blue-600 p-1 rounded transition-colors"
                          title="Copy tweet"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => shareOnTwitter(tweet, index)}
                          className="text-gray-500 hover:text-blue-600 p-1 rounded transition-colors"
                          title="Share on Twitter"
                        >
                          🐦
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Thread Tips */}
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">💡 Thread Tips:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Post tweets in sequence, replying to the previous tweet</li>
                  <li>• Add relevant hashtags to increase visibility</li>
                  <li>• Engage with replies to boost thread performance</li>
                  <li>• Pin the first tweet for maximum exposure</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwitterThreadModal;
