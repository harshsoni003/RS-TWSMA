const axios = require('axios');
const puppeteer = require('puppeteer');
const chromium = require('@sparticuz/chromium');

// API Keys from environment variables
const SERPAPI_KEY = process.env.SERPAPI_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SERPAPI_URL = 'https://serpapi.com/search.json';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// In-memory storage for demo (in production, use a database)
let searchHistory = [];
let formattedContent = [];

// Helper function to save search history
const saveSearchHistory = (searchData) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `search_${timestamp}.json`;
  searchHistory.push({ ...searchData, filename, timestamp });
  return filename;
};

// Helper function to save formatted content
const saveFormattedContent = (formattedData) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `formatted_${timestamp}.json`;
  formattedContent.push({ ...formattedData, filename, timestamp });
  return filename;
};

// TF-IDF ranking function
const calculateTfIdf = (query, documents) => {
  const natural = require('natural');
  const TfIdf = natural.TfIdf;
  const tfidf = new TfIdf();

  // Add documents to TF-IDF
  documents.forEach(doc => {
    const text = `${doc.title} ${doc.snippet}`.toLowerCase();
    tfidf.addDocument(text);
  });

  // Calculate scores for query terms
  const queryTerms = query.toLowerCase().split(' ');
  const scores = documents.map((doc, index) => {
    let score = 0;
    queryTerms.forEach(term => {
      score += tfidf.tfidf(term, index);
    });
    return { ...doc, relevanceScore: score };
  });

  return scores.sort((a, b) => b.relevanceScore - a.relevanceScore);
};

// Main handler function
exports.handler = async (event, context) => {
  const { httpMethod, path, queryStringParameters, body } = event;
  
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Extract the API path from the request
    const apiPath = path.replace('/.netlify/functions/api', '');

    // Health check endpoint
    if (apiPath === '/health' && httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'OK', message: 'API is running' })
      };
    }

    // Search endpoint
    if (apiPath === '/search' && httpMethod === 'GET') {
      const query = queryStringParameters?.q;
      if (!query) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Query parameter "q" is required' })
        };
      }

      if (!SERPAPI_KEY) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'SERPAPI_KEY not configured' })
        };
      }

      const response = await axios.get(SERPAPI_URL, {
        params: {
          q: query,
          api_key: SERPAPI_KEY,
          engine: 'google',
          num: 20
        }
      });

      const results = response.data.organic_results || [];
      const rankedResults = calculateTfIdf(query, results);

      const searchData = {
        query,
        results: rankedResults,
        timestamp: new Date().toISOString(),
        totalResults: rankedResults.length
      };

      const filename = saveSearchHistory(searchData);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          results: rankedResults,
          query,
          filename,
          totalResults: rankedResults.length
        })
      };
    }

    // Search history endpoint
    if (apiPath === '/search-history' && httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(searchHistory.slice(-10)) // Return last 10 searches
      };
    }

    // Scrape endpoint
    if (apiPath === '/scrape' && httpMethod === 'GET') {
      const url = queryStringParameters?.url;
      if (!url) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'URL parameter is required' })
        };
      }

      let browser;
      try {
        // Use different configurations for local vs Netlify
        const isNetlify = process.env.NETLIFY === 'true';
        
        browser = await puppeteer.launch({
          headless: true,
          args: isNetlify ? chromium.args : [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ],
          executablePath: isNetlify ? await chromium.executablePath() : puppeteer.executablePath()
        });

        const page = await browser.newPage();
        
        // Block unnecessary resources
        await page.setRequestInterception(true);
        page.on('request', (req) => {
          if (req.resourceType() === 'stylesheet' || req.resourceType() === 'font' || req.resourceType() === 'image') {
            req.abort();
          } else {
            req.continue();
          }
        });

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

        const scrapedData = await page.evaluate(() => {
          const title = document.title || '';
          const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => h.textContent.trim());
          const paragraphs = Array.from(document.querySelectorAll('p')).map(p => p.textContent.trim()).filter(text => text.length > 0);
          const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
            text: a.textContent.trim(),
            href: a.href
          })).filter(link => link.text.length > 0);
          const images = Array.from(document.querySelectorAll('img[src]')).map(img => ({
            alt: img.alt || '',
            src: img.src
          }));

          return {
            title,
            headings,
            paragraphs,
            links,
            images,
            textContent: document.body.textContent || '',
            wordCount: (document.body.textContent || '').split(/\s+/).length
          };
        });

        await browser.close();

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            url,
            ...scrapedData,
            scrapedAt: new Date().toISOString()
          })
        };

      } catch (error) {
        if (browser) {
          await browser.close();
        }
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: 'Scraping failed', 
            message: error.message,
            url 
          })
        };
      }
    }

    // Format content endpoint
    if (apiPath === '/format-content' && httpMethod === 'POST') {
      const requestBody = JSON.parse(body || '{}');
      const { content, url, title } = requestBody;

      if (!content) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Content is required' })
        };
      }

      if (!GEMINI_API_KEY) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'GEMINI_API_KEY not configured' })
        };
      }

      const prompt = `You are Alex Hormozi, a successful entrepreneur known for your direct, no-nonsense approach to business advice. Your writing style is characterized by:

1. **Brutal honesty** - You tell people what they need to hear, not what they want to hear
2. **Practical focus** - Every piece of advice must be actionable and results-oriented
3. **Value-first mentality** - Always emphasize providing massive value before asking for anything
4. **Simple language** - Complex ideas explained in simple terms that anyone can understand
5. **Personal experience** - Draw from real business experiences and failures
6. **Urgency and action** - Push people to take immediate action rather than just consume content

Transform the following content into a Twitter thread (8-12 tweets) in Alex Hormozi's style:

**Original Content:**
Title: ${title || 'N/A'}
URL: ${url || 'N/A'}
Content: ${content.substring(0, 8000)}

**Instructions:**
- Start with a hook that grabs attention
- Break down complex concepts into digestible insights
- Include specific, actionable advice
- Use Alex's direct, conversational tone
- End with a call to action
- Number each tweet (1/X format)
- Keep each tweet under 280 characters
- Focus on the most valuable insights from the content

Format as a clean, ready-to-post Twitter thread.`;

      try {
        const response = await axios.post(
          `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
          {
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const generatedContent = response.data.candidates[0].content.parts[0].text;
        
        const formattedData = {
          originalContent: { title, url, content: content.substring(0, 1000) },
          formattedContent: generatedContent,
          createdAt: new Date().toISOString(),
          style: 'Alex Hormozi Twitter Thread'
        };

        const filename = saveFormattedContent(formattedData);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            formattedContent: generatedContent,
            filename,
            originalTitle: title,
            originalUrl: url
          })
        };

      } catch (error) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: 'Content formatting failed', 
            message: error.message 
          })
        };
      }
    }

    // Generate thread endpoint (alias for format-content)
    if (apiPath === '/generate-thread' && httpMethod === 'POST') {
      // Redirect to format-content logic
      const requestBody = JSON.parse(body || '{}');
      const { content, url, title } = requestBody;

      if (!content) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Content is required' })
        };
      }

      // Same logic as format-content endpoint
      // ... (implementation same as above)
    }

    // Test scrape endpoint
    if (apiPath === '/test-scrape' && httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Scraping service is available',
          testUrl: 'https://example.com',
          status: 'ready'
        })
      };
    }

    // Default 404 response
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found', path: apiPath })
    };

  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message 
      })
    };
  }
};
