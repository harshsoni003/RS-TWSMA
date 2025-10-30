const express = require('express');
const axios = require('axios');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// SerpAPI configuration
const SERPAPI_KEY = '7287605988b3a4d4aaa90dddc46b38a49be41470114dfedd3b25869efe2da780';
const SERPAPI_URL = 'https://serpapi.com/search.json';

// Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyANI7q4mZFBl6DzoRGYVuSl5pgYxnhbZ-g';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Data storage paths
const DATA_DIR = path.join(__dirname, 'data');
const SEARCHES_DIR = path.join(DATA_DIR, 'searches');
const FORMATTED_DIR = path.join(DATA_DIR, 'formatted_content');

// Helper functions for data storage
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const saveSearchHistory = (searchData) => {
  ensureDirectoryExists(SEARCHES_DIR);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `search_${timestamp}.json`;
  const filepath = path.join(SEARCHES_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(searchData, null, 2));
  return filename;
};

const saveFormattedContent = (formattedData) => {
  ensureDirectoryExists(FORMATTED_DIR);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `formatted_${timestamp}.json`;
  const filepath = path.join(FORMATTED_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(formattedData, null, 2));
  return filename;
};

const getSearchHistory = () => {
  ensureDirectoryExists(SEARCHES_DIR);
  const files = fs.readdirSync(SEARCHES_DIR)
    .filter(file => file.endsWith('.json'))
    .sort((a, b) => b.localeCompare(a)) // Sort by newest first
    .slice(0, 20); // Get last 20 searches
  
  return files.map(file => {
    const filepath = path.join(SEARCHES_DIR, file);
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    return {
      ...data,
      filename: file,
      timestamp: file.replace('search_', '').replace('.json', '').replace(/-/g, ':')
    };
  });
};

// Proxy endpoint for SerpAPI
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    console.log(`Searching for: ${q}`);

    const response = await axios.get(SERPAPI_URL, {
      params: {
        api_key: SERPAPI_KEY,
        engine: 'google',
        q: q,
        num: 20,
        gl: 'us',
        hl: 'en'
      }
    });

    // Save search history
    const searchData = {
      query: q,
      timestamp: new Date().toISOString(),
      results: response.data.organic_results || [],
      totalResults: response.data.search_information?.total_results || 0
    };
    
    try {
      saveSearchHistory(searchData);
    } catch (saveError) {
      console.error('Error saving search history:', saveError.message);
    }

    // Return the search results
    res.json(response.data);
  } catch (error) {
    console.error('SerpAPI Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch search results',
      details: error.message 
    });
  }
});

// Web scraping endpoint using Puppeteer
app.get('/api/scrape', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    console.log(`Scraping URL: ${url}`);

    let browser;
    try {
      // Launch Puppeteer browser with better configuration
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ],
        timeout: 60000 // 60 second timeout for browser launch
      });
    } catch (browserError) {
      console.error('Browser launch error:', browserError.message);
      return res.status(500).json({ 
        error: 'Failed to launch browser',
        details: `Browser launch error: ${browserError.message}` 
      });
    }

    const page = await browser.newPage();
    
    // Configure page settings
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Set extra HTTP headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });
    
    // Block unnecessary resources to speed up loading
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (resourceType === 'stylesheet' || resourceType === 'font' || resourceType === 'media') {
        req.abort();
      } else {
        req.continue();
      }
    });
    
    // Navigate to the URL with timeout and better error handling
    try {
      await page.goto(url, { 
        waitUntil: 'domcontentloaded', // Changed from networkidle2 for faster loading
        timeout: 45000 // Increased timeout to 45 seconds
      });
      
      // Wait a bit more for dynamic content to load
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (navigationError) {
      console.error('Navigation error:', navigationError.message);
      await browser.close();
      return res.status(500).json({ 
        error: 'Failed to navigate to webpage',
        details: `Navigation timeout or error: ${navigationError.message}` 
      });
    }

    // Extract comprehensive data from the page
    let scrapedData;
    try {
      console.log('Starting page evaluation...');
      scrapedData = await page.evaluate(() => {
      // Get title
      const title = document.title || '';
      
      // Get meta description
      const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
      
      // Get all text content (cleaned)
      const bodyText = document.body?.innerText || '';
      
      // Get all headings
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
        tag: h.tagName.toLowerCase(),
        text: h.innerText.trim()
      })).filter(h => h.text);
      
      // Get all paragraphs
      const paragraphs = Array.from(document.querySelectorAll('p')).map(p => p.innerText.trim()).filter(p => p);
      
      // Get all links
      const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
        text: a.innerText.trim(),
        href: a.href
      })).filter(l => l.text && l.href);
      
      // Get all images
      const images = Array.from(document.querySelectorAll('img[src]')).map(img => ({
        src: img.src,
        alt: img.alt || '',
        title: img.title || ''
      }));
      
      // Get structured data (JSON-LD)
      const structuredData = [];
      const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
      jsonLdScripts.forEach(script => {
        try {
          const data = JSON.parse(script.textContent);
          structuredData.push(data);
        } catch (e) {
          // Ignore invalid JSON-LD
        }
      });

      return {
        title,
        metaDescription,
        bodyText: bodyText.substring(0, 20000), // Limit to first 20000 chars
        headings: headings.slice(0, 20), // Limit to first 20 headings
        paragraphs: paragraphs.slice(0, 10), // Limit to first 10 paragraphs
        links: links.slice(0, 20), // Limit to first 20 links
        images: images.slice(0, 10), // Limit to first 10 images
        structuredData,
        url: window.location.href,
        scrapedAt: new Date().toISOString()
      };
    });
    } catch (evaluationError) {
      console.error('Page evaluation error:', evaluationError.message);
      await browser.close();
      return res.status(500).json({ 
        error: 'Failed to extract data from webpage',
        details: `Page evaluation error: ${evaluationError.message}` 
      });
    }

    await browser.close();

    res.json({
      success: true,
      data: scrapedData
    });

  } catch (error) {
    console.error('Scraping Error Details:');
    console.error('- Error Type:', error.name);
    console.error('- Error Message:', error.message);
    console.error('- Stack Trace:', error.stack);
    console.error('- URL being scraped:', url);
    
    // Ensure browser is closed even on error
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError.message);
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to scrape webpage',
      details: error.message,
      errorType: error.name
    });
  }
});

// Twitter thread generation endpoint using Gemini API
app.post('/api/generate-thread', async (req, res) => {
  try {
    const { content, title } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    console.log('Generating Twitter thread for content...');

    // Alex Hormozi-style prompt for Twitter thread generation
    const prompt = `You are Alex Hormozi, a successful entrepreneur and investor known for your no-nonsense approach to business advice. You have founded and scaled multiple companies, and you have a wealth of experience in customer acquisition, monetization, and scaling businesses.

Your goal is to create a compelling Twitter thread from the provided content. Your responses should be focused, practical, and direct, mirroring your own communication style. Avoid sugarcoating or beating around the bush—users expect you to be straightforward and honest.

Create a Twitter thread (8-12 tweets) from the following content. Each tweet should:
1. Be under 280 characters
2. Provide actionable business insights
3. Use your signature no-bullshit approach
4. Include relevant emojis and hooks
5. End with a strong call-to-action

Content Title: ${title || 'Business Content'}

Content: ${content.substring(0, 4000)}

Format the response as a JSON array where each tweet is a separate string. Start with a hook tweet and end with a CTA tweet. Make it valuable and engaging.`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };

    const response = await axios.post(GEMINI_API_URL, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      timeout: 30000
    });

    if (response.data && response.data.candidates && response.data.candidates[0]) {
      const generatedText = response.data.candidates[0].content.parts[0].text;
      
      // Try to parse as JSON array, fallback to splitting by lines
      let tweets;
      try {
        tweets = JSON.parse(generatedText);
      } catch (parseError) {
        // Fallback: split by lines and clean up
        tweets = generatedText
          .split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
          .filter(tweet => tweet.length > 0 && tweet.length <= 280);
      }

      res.json({
        success: true,
        tweets: Array.isArray(tweets) ? tweets : [generatedText],
        originalContent: {
          title: title || 'Generated Content',
          contentLength: content.length
        }
      });
    } else {
      throw new Error('Invalid response from Gemini API');
    }

  } catch (error) {
    console.error('Thread generation error:', error.message);
    
    let errorMessage = 'Failed to generate Twitter thread';
    if (error.response?.status === 429) {
      errorMessage = 'API rate limit exceeded. Please try again later.';
    } else if (error.response?.status === 401) {
      errorMessage = 'Invalid API key. Please check your Gemini API configuration.';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Unable to connect to Gemini API. Please check your internet connection.';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message 
    });
  }
});

// Content formatting endpoint using Gemini API
app.post('/api/format-content', async (req, res) => {
  try {
    const { content, title } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    console.log('Formatting content with Gemini AI...');

    // Enhanced Alex Hormozi-style prompt for better content formatting
    const prompt = `You are Alex Hormozi, a successful entrepreneur and investor known for your no-nonsense approach to business advice. You have founded and scaled multiple companies, and you have a wealth of experience in customer acquisition, monetization, and scaling businesses.

Your goal is to transform the provided content into a compelling Twitter thread that delivers maximum value. Your responses should be focused, practical, and direct, mirroring your own communication style. Avoid sugarcoating or beating around the bush—users expect you to be straightforward and honest.

CONTENT TO TRANSFORM:
Title: ${title || 'Business Content'}
Content: ${content.substring(0, 8000)}

THREAD REQUIREMENTS:
Create exactly 8-12 tweet-sized sections following this EXACT format and style:

EXAMPLE THREAD FORMAT TO FOLLOW:
---
From Cursor to Bolt to Lovable:

These 10 vibe coding tools helped me go from idea to shipped product in weeks, not months.

Here's what makes each one stand out:
---
/1

Cursor: Blazingly fast, AI-assisted coding. Instantly surfaces relevant code, docs, and context-perfect for deep work. If you want to stay in flow, this is my go-to.
---
/2

Bolt: Dead simple code snippets and automations. I use it to save repetitive tasks-building, testing, deploying-all with a click. Speed is everything when iterating fast.
---
/3

Lovable: Turns your codebase into a collaborative playground. Real-time reviews, AI-powered suggestions, and a UI that actually feels fun. Feedback cycles are way shorter.
---

FORMATTING RULES:
1. Start with a compelling hook and overview
2. Use "/1", "/2", "/3" etc. for numbering (NOT JSON brackets)
3. Each section: Tool/Concept name + colon + practical explanation
4. Keep each section under 280 characters
5. Use specific, actionable language
6. Include real benefits and outcomes
7. End sections with impact statements
8. NO JSON formatting, NO brackets, NO quotes around content
9. Use bullet points (•) for lists when needed
10. Make it conversational but authoritative

RESPONSE FORMAT:
Return ONLY the clean thread content without any JSON formatting, brackets, or quotes. Just the raw thread text exactly as it should appear on Twitter.

Transform the provided content into this exact format, focusing on the most valuable business insights and actionable takeaways that would genuinely help entrepreneurs succeed.`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 3000,
      }
    };

    const response = await axios.post(GEMINI_API_URL, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      timeout: 30000
    });

    if (response.data && response.data.candidates && response.data.candidates[0]) {
      const generatedText = response.data.candidates[0].content.parts[0].text;
      
      // Parse the clean thread format (no JSON)
      const sections = generatedText.split('---').filter(section => section.trim());
      let formattedSections = [];
      
      // First section is usually the intro
      if (sections.length > 0) {
        const introText = sections[0].trim();
        if (introText) {
          formattedSections.push({
            headline: "📄 Thread Intro",
            content: introText
          });
        }
      }
      
      // Parse numbered sections (/1, /2, /3, etc.)
      for (let i = 1; i < sections.length; i++) {
        const section = sections[i].trim();
        if (section.match(/^\/\d+/)) {
          // Extract the number and content
          const lines = section.split('\n').filter(line => line.trim());
          if (lines.length >= 2) {
            const numberLine = lines[0]; // e.g., "/1"
            const contentLines = lines.slice(1).join(' ').trim();
            
            // Try to extract headline from content (text before first colon)
            const colonIndex = contentLines.indexOf(':');
            let headline, content;
            
            if (colonIndex > 0 && colonIndex < 50) {
              headline = contentLines.substring(0, colonIndex).trim();
              content = contentLines.substring(colonIndex + 1).trim();
            } else {
              headline = `${numberLine} Section`;
              content = contentLines;
            }
            
            formattedSections.push({
              headline: headline,
              content: content
            });
          }
        } else if (section.length > 10) {
          // Handle other content sections
          formattedSections.push({
            headline: "📝 Additional Info",
            content: section
          });
        }
      }

      const finalFormattedContent = formattedSections.length > 0 ? formattedSections : [
        {
          headline: "📄 Formatted Content",
          content: generatedText
        }
      ];

      // Save formatted content
      const formattedData = {
        title: title || 'Generated Content',
        originalContentLength: content.length,
        formattedContent: finalFormattedContent,
        timestamp: new Date().toISOString()
      };
      
      try {
        saveFormattedContent(formattedData);
      } catch (saveError) {
        console.error('Error saving formatted content:', saveError.message);
      }

      res.json({
        success: true,
        formattedContent: finalFormattedContent,
        originalContent: {
          title: title || 'Generated Content',
          contentLength: content.length
        }
      });
    } else {
      throw new Error('Invalid response from Gemini API');
    }

  } catch (error) {
    console.error('Content formatting error:', error.message);
    
    let errorMessage = 'Failed to format content';
    if (error.response?.status === 429) {
      errorMessage = 'API rate limit exceeded. Please try again later.';
    } else if (error.response?.status === 401) {
      errorMessage = 'Invalid API key. Please check your Gemini API configuration.';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Unable to connect to Gemini API. Please check your internet connection.';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message 
    });
  }
});

// Get search history endpoint
app.get('/api/search-history', (req, res) => {
  try {
    const history = getSearchHistory();
    res.json({
      success: true,
      history: history
    });
  } catch (error) {
    console.error('Error getting search history:', error.message);
    res.status(500).json({
      error: 'Failed to get search history',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Test scraping endpoint with a simple URL
app.get('/api/test-scrape', async (req, res) => {
  try {
    console.log('Testing scrape with example.com...');
    const testUrl = 'https://example.com';
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto(testUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    const title = await page.title();
    await browser.close();
    
    res.json({ 
      success: true, 
      message: 'Scraping test successful',
      testUrl,
      title
    });
  } catch (error) {
    console.error('Test scraping error:', error.message);
    res.status(500).json({ 
      error: 'Test scraping failed',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 SerpAPI proxy available at http://localhost:${PORT}/api/search`);
  console.log(`🔍 Puppeteer scraping available at http://localhost:${PORT}/api/scrape`);
});
