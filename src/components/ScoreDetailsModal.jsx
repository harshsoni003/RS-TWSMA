import React from 'react';

const ScoreDetailsModal = ({ isOpen, onClose, post, query, calculationDetails }) => {
  if (!isOpen || !post || !calculationDetails) return null;

  const formatScore = (score) => {
    return (score * 100).toFixed(1);
  };

  const formatNumber = (num) => {
    return typeof num === 'number' ? num.toFixed(4) : '0.0000';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                📊 Score Calculation Details
              </h2>
              <p className="text-gray-600">
                How we calculated the relevance score for this post
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Post Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">📄 Post Information</h3>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Title:</strong> {post.title}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Snippet:</strong> {post.snippet}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Your Query:</strong> "{query}"
            </p>
          </div>

          {/* Final Score Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-3">🎯 Final Score Calculation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatScore(post.keywordScore)}%
                </div>
                <div className="text-sm text-gray-600">Keyword Score</div>
                <div className="text-xs text-gray-500">Weight: 40%</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatScore(post.tfidfScore)}%
                </div>
                <div className="text-sm text-gray-600">TF-IDF Score</div>
                <div className="text-xs text-gray-500">Weight: 60%</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {formatScore(post.finalScore)}%
                </div>
                <div className="text-sm text-gray-600">Final Score</div>
              </div>
            </div>
            <div className="bg-white rounded p-3 text-sm">
              <strong>Formula:</strong> Final Score = (Keyword Score × 0.4) + (TF-IDF Score × 0.6)
              <br />
              <strong>Calculation:</strong> ({formatScore(post.keywordScore)}% × 0.4) + ({formatScore(post.tfidfScore)}% × 0.6) = {formatScore(post.finalScore)}%
            </div>
          </div>

          {/* Keyword Score Details */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-3">🔍 Keyword Score Breakdown</h3>
            <div className="space-y-3">
              <div className="bg-white rounded p-3">
                <p className="text-sm mb-2">
                  <strong>How it works:</strong> Counts how many words from your query appear in the post's title and snippet.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Query Words:</strong>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {calculationDetails.queryWords.map((word, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <strong>Matched Words:</strong>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {calculationDetails.matchedWords.map((word, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-gray-50 rounded">
                  <strong>Calculation:</strong> {calculationDetails.matchedWords.length} matched words ÷ {calculationDetails.queryWords.length} total query words = {formatScore(post.keywordScore)}%
                </div>
              </div>
            </div>
          </div>

          {/* TF-IDF Score Details */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-purple-800 mb-3">🧠 TF-IDF Score Breakdown</h3>
            <div className="space-y-3">
              <div className="bg-white rounded p-3">
                <p className="text-sm mb-3">
                  <strong>How it works:</strong> Measures semantic similarity using Term Frequency (TF) and Inverse Document Frequency (IDF).
                </p>
                
                {/* TF-IDF Explanation */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-purple-700 mb-2">📈 Term Frequency (TF)</h4>
                    <p className="text-xs text-gray-600 mb-2">
                      How often each word appears in the document relative to total words.
                    </p>
                    <div className="bg-gray-50 rounded p-2 text-xs">
                      <strong>Top TF values in this post:</strong>
                      <div className="mt-1 space-y-2">
                        {calculationDetails.topTFWords.map((item, index) => (
                          <div key={index} className="bg-white rounded p-2">
                            <div className="flex justify-between items-center mb-1">
                              <div className="font-medium text-blue-700">"{item.word}"</div>
                              <div className="font-bold text-green-600">{formatNumber(item.tf)}</div>
                            </div>
                            <div className="text-xs text-gray-600">
                              <strong>Calculation:</strong> {item.count} occurrences ÷ {item.totalWords} total words = {formatNumber(item.tf)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              The word "{item.word}" appears {item.count} time{item.count !== 1 ? 's' : ''} in this post
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                        <strong>TF Formula:</strong> TF(word) = (word count in document) ÷ (total words in document)
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-purple-700 mb-2">📊 Inverse Document Frequency (IDF)</h4>
                    <p className="text-xs text-gray-600 mb-2">
                      How rare/unique each word is across all search results. Rare words get higher scores.
                    </p>
                    <div className="bg-gray-50 rounded p-2 text-xs">
                      <strong>Top IDF values from your query:</strong>
                      <div className="mt-1 space-y-2">
                        {calculationDetails.topIDFWords.map((item, index) => (
                          <div key={index} className="bg-white rounded p-2">
                            <div className="flex justify-between items-center mb-1">
                              <div className="font-medium text-blue-700">"{item.word}"</div>
                              <div className="font-bold text-purple-600">{formatNumber(item.idf)}</div>
                            </div>
                            <div className="text-xs text-gray-600">
                              <strong>Calculation:</strong> log({item.totalDocs} total docs ÷ {item.docsWithWord} docs containing "{item.word}") = {formatNumber(item.idf)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              "{item.word}" appears in {item.docsWithWord} out of {item.totalDocs} search results
                              {item.docsWithWord < item.totalDocs / 2 ? " (rare word - higher importance)" : " (common word - lower importance)"}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 p-2 bg-purple-50 rounded text-xs">
                        <strong>IDF Formula:</strong> IDF(word) = log(total documents ÷ documents containing word)
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-purple-700 mb-2">📐 Cosine Similarity</h4>
                    <p className="text-xs text-gray-600 mb-2">
                      Measures the angle between your query vector and this post's vector in multi-dimensional space.
                    </p>
                    <div className="bg-gray-50 rounded p-2 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="bg-white rounded p-2">
                          <div className="font-medium">Dot Product</div>
                          <div className="text-gray-500">{formatNumber(calculationDetails.dotProduct)}</div>
                        </div>
                        <div className="bg-white rounded p-2">
                          <div className="font-medium">Query Norm</div>
                          <div className="text-gray-500">{formatNumber(calculationDetails.queryNorm)}</div>
                        </div>
                        <div className="bg-white rounded p-2">
                          <div className="font-medium">Post Norm</div>
                          <div className="text-gray-500">{formatNumber(calculationDetails.postNorm)}</div>
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-purple-100 rounded">
                        <strong>Cosine Similarity:</strong> {formatNumber(calculationDetails.dotProduct)} ÷ ({formatNumber(calculationDetails.queryNorm)} × {formatNumber(calculationDetails.postNorm)}) = {formatScore(post.tfidfScore)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Algorithm Explanation */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">🤖 Algorithm Summary</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>1. Keyword Matching (40% weight):</strong> Simple but effective - counts exact word matches.</p>
              <p><strong>2. TF-IDF Similarity (60% weight):</strong> Advanced semantic analysis that understands context and meaning.</p>
              <p><strong>3. Combined Score:</strong> Balances precision (exact matches) with intelligence (semantic understanding).</p>
              <p><strong>4. Ranking:</strong> All posts are sorted by their final scores to show most relevant results first.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreDetailsModal;
