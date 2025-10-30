# 🎯 Post Recommendation & Content Generation System

A powerful web application that combines intelligent search, web scraping, and AI-powered content generation to create Twitter-style threads from any web content.

## 🚀 Features

### 🔍 **Intelligent Search**
- **SerpAPI Integration**: Search the web using Google's search results
- **Smart Ranking**: Advanced TF-IDF similarity algorithms rank results by relevance
- **Search History**: Automatically saves and displays previous searches
- **Real-time Results**: Fast, responsive search with loading indicators

### 🕷️ **Advanced Web Scraping**
- **Puppeteer-Powered**: Robust web scraping using headless Chrome
- **Comprehensive Extraction**: Captures titles, content, links, images, and metadata
- **Smart Content Processing**: Handles dynamic content and JavaScript-heavy sites
- **Error Handling**: Graceful handling of failed scrapes with detailed error messages

### 🤖 **AI Content Generation**
- **Twitter Thread Creation**: Converts scraped content into engaging Twitter threads
- **Alex Hormozi Style**: Business-focused, no-nonsense content style
- **Gemini AI Integration**: Powered by Google's Gemini 2.0 Flash model
- **Formatted Output**: Clean, ready-to-post thread format

### 📊 **Content Management**
- **Data Persistence**: Saves search history and formatted content locally
- **Content Analysis**: Detailed breakdown of scraped content
- **Export Options**: Easy copying and sharing of generated threads

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **Puppeteer** - Web scraping and automation
- **Natural.js** - Text processing and TF-IDF algorithms

### APIs & Services
- **SerpAPI** - Google search results
- **Google Gemini AI** - Content generation
- **File System** - Local data storage

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14 or higher)
- **npm** or **yarn** package manager
- **SerpAPI Key** - Get one from [serpapi.com](https://serpapi.com)
- **Google Gemini API Key** - Get one from [Google AI Studio](https://makersuite.google.com/app/apikey)

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd RS-project
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure API Keys
Edit `server.js` and replace the API keys:
```javascript
// SerpAPI configuration
const SERPAPI_KEY = 'your-serpapi-key-here';

// Gemini API configuration  
const GEMINI_API_KEY = 'your-gemini-api-key-here';
```

### 4. Start the Application
```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
# Backend only
npm run server

# Frontend only (in another terminal)
npm start
```

### 5. Open in Browser
Navigate to `http://localhost:3000` to use the application.

## 🎮 How to Use

### Step 1: Search for Content
1. Enter keywords in the search box (e.g., "machine learning tutorials")
2. Click "Search & Rank Posts" to get relevant results
3. Results are automatically ranked by relevance using TF-IDF algorithms

### Step 2: Scrape Web Content
1. Click the "🔍 Scrape" button on any search result
2. The system will extract all content from the webpage
3. View comprehensive analysis including text, links, and images

### Step 3: Generate Twitter Threads
1. From the scraped content page, click "✨ AI-Enhanced View"
2. The AI will generate a Twitter thread in Alex Hormozi's style
3. Copy the formatted thread for posting on social media

### Step 4: Manage Your Content
- View search history on the main page
- Access previously scraped content
- Export generated threads

## 📁 Project Structure

```
RS-project/
├── src/
│   ├── components/
│   │   ├── SearchInput.jsx          # Search interface
│   │   ├── PostList.jsx             # Results display
│   │   ├── ScrapedContentModal.jsx  # Content viewer
│   │   └── TwitterThreadModal.jsx   # Thread generator
│   ├── pages/
│   │   ├── ScrapedContentPage.jsx   # Detailed content view
│   │   └── FormattedContentPage.jsx # AI-generated threads
│   ├── utils/
│   │   └── ranking.js               # TF-IDF algorithms
│   └── App.js                       # Main application
├── data/
│   ├── searches/                    # Search history
│   └── formatted_content/           # Generated content
├── server.js                        # Backend server
└── package.json                     # Dependencies
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file for secure API key storage:
```env
SERPAPI_KEY=your-serpapi-key
GEMINI_API_KEY=your-gemini-api-key
PORT=5000
```

### Puppeteer Settings
The scraper is configured for optimal performance:
- Headless Chrome browser
- Resource blocking for faster loading
- 45-second timeout for complex pages
- Mobile and desktop user agents

### AI Content Generation
Customize the content style by modifying the prompt in `server.js`:
```javascript
const prompt = `You are Alex Hormozi... [customize this section]`;
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run server
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000 5000
CMD ["npm", "run", "dev"]
```

## 🔍 API Endpoints

### Search
- `GET /api/search?q=query` - Search using SerpAPI
- `GET /api/search-history` - Get search history

### Scraping  
- `GET /api/scrape?url=website` - Scrape webpage content
- `GET /api/test-scrape` - Test scraping functionality

### Content Generation
- `POST /api/format-content` - Generate formatted content
- `POST /api/generate-thread` - Create Twitter threads

### Utilities
- `GET /api/health` - Health check

## 🎯 Use Cases

### Content Creators
- Research trending topics
- Generate engaging social media content
- Repurpose web articles into threads

### Marketers
- Analyze competitor content
- Create educational content series
- Build thought leadership posts

### Researchers
- Gather information from multiple sources
- Summarize complex topics
- Create digestible content formats

### Business Owners
- Share industry insights
- Create valuable content for audience
- Build personal brand through consistent posting

## 🛡️ Security & Privacy

- API keys are server-side only
- No user data is transmitted to third parties
- Local storage for search history
- Secure HTTPS connections for all API calls

## 🐛 Troubleshooting

### Common Issues

**Server won't start:**
```bash
# Check if ports are available
lsof -i :3000
lsof -i :5000

# Kill processes if needed
kill -9 <PID>
```

**Scraping fails:**
- Check if the target website blocks automated access
- Verify internet connection
- Try with a different URL

**AI generation errors:**
- Verify Gemini API key is valid
- Check API quota limits
- Ensure content isn't too long (max 8000 chars)

**Search not working:**
- Verify SerpAPI key is active
- Check API usage limits
- Ensure backend server is running

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **SerpAPI** for search functionality
- **Google Gemini** for AI content generation
- **Puppeteer** team for web scraping capabilities
- **Alex Hormozi** for content style inspiration

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

---

**Built with ❤️ for content creators and marketers who want to turn web content into engaging social media posts.**
