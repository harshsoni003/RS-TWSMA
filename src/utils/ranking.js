// Common English stopwords
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with',
  'but', 'or', 'not', 'this', 'they', 'have', 'had', 'what', 'said', 'each',
  'which', 'do', 'how', 'their', 'if', 'up', 'out', 'many', 'then', 'them',
  'can', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'will'
]);

/**
 * Preprocess text: lowercase, remove punctuation, filter stopwords
 */
export const preprocessText = (text) => {
  if (!text) return [];
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOPWORDS.has(word));
};

/**
 * Calculate keyword matching score with details
 */
export const calculateKeywordScore = (prompt, text, returnDetails = false) => {
  const promptWords = preprocessText(prompt);
  const textWords = preprocessText(text);
  
  if (promptWords.length === 0) return returnDetails ? { score: 0, details: {} } : 0;
  
  const matches = promptWords.filter(word => textWords.includes(word));
  const score = matches.length / promptWords.length;
  
  if (returnDetails) {
    return {
      score,
      details: {
        queryWords: promptWords,
        textWords: textWords,
        matchedWords: matches,
        totalQueryWords: promptWords.length,
        matchedCount: matches.length
      }
    };
  }
  
  return score;
};

/**
 * Calculate Term Frequency (TF)
 */
const calculateTF = (words) => {
  const tf = {};
  const totalWords = words.length;
  
  words.forEach(word => {
    tf[word] = (tf[word] || 0) + 1;
  });
  
  // Normalize by total words
  Object.keys(tf).forEach(word => {
    tf[word] = tf[word] / totalWords;
  });
  
  return tf;
};

/**
 * Calculate Inverse Document Frequency (IDF)
 */
const calculateIDF = (documents) => {
  const idf = {};
  const totalDocs = documents.length;
  
  // Get all unique words
  const allWords = new Set();
  documents.forEach(doc => {
    doc.forEach(word => allWords.add(word));
  });
  
  // Calculate IDF for each word
  allWords.forEach(word => {
    const docsWithWord = documents.filter(doc => doc.includes(word)).length;
    idf[word] = Math.log(totalDocs / (docsWithWord + 1)); // +1 to avoid division by zero
  });
  
  return idf;
};

/**
 * Calculate TF-IDF vectors
 */
const calculateTFIDF = (documents) => {
  const tfidfVectors = [];
  const idf = calculateIDF(documents);
  
  documents.forEach(doc => {
    const tf = calculateTF(doc);
    const tfidf = {};
    
    Object.keys(tf).forEach(word => {
      tfidf[word] = tf[word] * idf[word];
    });
    
    tfidfVectors.push(tfidf);
  });
  
  return tfidfVectors;
};

/**
 * Calculate cosine similarity between two TF-IDF vectors with details
 */
const cosineSimilarity = (vec1, vec2, returnDetails = false) => {
  const words1 = Object.keys(vec1);
  const words2 = Object.keys(vec2);
  const allWords = new Set([...words1, ...words2]);
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  allWords.forEach(word => {
    const val1 = vec1[word] || 0;
    const val2 = vec2[word] || 0;
    
    dotProduct += val1 * val2;
    norm1 += val1 * val1;
    norm2 += val2 * val2;
  });
  
  if (norm1 === 0 || norm2 === 0) {
    return returnDetails ? { similarity: 0, details: { dotProduct: 0, norm1: 0, norm2: 0 } } : 0;
  }
  
  const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  
  if (returnDetails) {
    return {
      similarity,
      details: {
        dotProduct,
        norm1: Math.sqrt(norm1),
        norm2: Math.sqrt(norm2)
      }
    };
  }
  
  return similarity;
};

/**
 * Calculate TF-IDF similarity score between prompt and text
 */
export const calculateTFIDFScore = (prompt, posts) => {
  const promptWords = preprocessText(prompt);
  const postTexts = posts.map(post => 
    preprocessText(`${post.title} ${post.snippet}`)
  );
  
  // Create documents array (prompt + all posts)
  const documents = [promptWords, ...postTexts];
  
  // Calculate TF-IDF vectors
  const tfidfVectors = calculateTFIDF(documents);
  
  // Calculate similarity between prompt (index 0) and each post
  const promptVector = tfidfVectors[0];
  const scores = [];
  
  for (let i = 1; i < tfidfVectors.length; i++) {
    const similarity = cosineSimilarity(promptVector, tfidfVectors[i]);
    scores.push(similarity);
  }
  
  return scores;
};

/**
 * Rank posts based on combined keyword and TF-IDF scores with detailed calculations
 */
export const rankPosts = (prompt, posts, keywordWeight = 0.4, tfidfWeight = 0.6) => {
  if (!posts || posts.length === 0) return [];
  
  // Preprocess data for detailed calculations
  const promptWords = preprocessText(prompt);
  const postTexts = posts.map(post => 
    preprocessText(`${post.title} ${post.snippet}`)
  );
  
  // Create documents array (prompt + all posts)
  const documents = [promptWords, ...postTexts];
  
  // Calculate TF-IDF vectors and IDF
  const idf = calculateIDF(documents);
  const tfidfVectors = calculateTFIDF(documents);
  const promptVector = tfidfVectors[0];
  
  // Calculate TF-IDF scores for all posts
  const tfidfScores = calculateTFIDFScore(prompt, posts);
  
  // Calculate combined scores with detailed information
  const rankedPosts = posts.map((post, index) => {
    const postText = `${post.title} ${post.snippet}`;
    const keywordResult = calculateKeywordScore(prompt, postText, true);
    const tfidfScore = tfidfScores[index] || 0;
    
    // Get detailed TF-IDF calculation
    const postVector = tfidfVectors[index + 1];
    const similarityResult = cosineSimilarity(promptVector, postVector, true);
    
    // Get top TF words for this post with detailed calculation data
    const postWords = preprocessText(postText);
    const tf = calculateTF(postWords);
    const wordCounts = {};
    postWords.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    const topTFWords = Object.entries(tf)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4)
      .map(([word, tfValue]) => ({ 
        word, 
        tf: tfValue,
        count: wordCounts[word] || 0,
        totalWords: postWords.length
      }));
    
    // Get top IDF words from query with detailed calculation data
    const totalDocs = documents.length;
    const topIDFWords = promptWords
      .map(word => {
        const docsWithWord = documents.filter(doc => doc.includes(word)).length;
        return { 
          word, 
          idf: idf[word] || 0,
          totalDocs,
          docsWithWord
        };
      })
      .sort((a, b) => b.idf - a.idf)
      .slice(0, 4);
    
    const finalScore = (keywordResult.score * keywordWeight) + (tfidfScore * tfidfWeight);
    
    return {
      ...post,
      keywordScore: keywordResult.score,
      tfidfScore,
      finalScore,
      calculationDetails: {
        queryWords: keywordResult.details.queryWords,
        matchedWords: keywordResult.details.matchedWords,
        topTFWords,
        topIDFWords,
        dotProduct: similarityResult.details.dotProduct,
        queryNorm: similarityResult.details.norm1,
        postNorm: similarityResult.details.norm2
      }
    };
  });
  
  // Sort by final score (descending)
  return rankedPosts.sort((a, b) => b.finalScore - a.finalScore);
};
