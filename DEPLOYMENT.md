# 🚀 Netlify Deployment Guide

This guide will walk you through deploying your Post Recommendation & Content Generation System to Netlify.

## 📋 Prerequisites

Before deploying, ensure you have:
- A GitHub account with your code pushed to a repository
- A Netlify account (free tier works fine)
- Your API keys ready:
  - **SerpAPI Key** from [serpapi.com](https://serpapi.com)
  - **Google Gemini API Key** from [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🔧 Pre-Deployment Setup

### 1. Environment Variables
Your `.env` file contains sensitive API keys. **Never commit this file to GitHub!**

Current `.env` content:
```
SERPAPI_KEY=7287605988b3a4d4aaa90dddc46b38a49be41470114dfedd3b25869efe2da780
```

You'll need to add your Gemini API key:
```
SERPAPI_KEY=your-serpapi-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

### 2. Verify Project Structure
Your project is already configured with:
- ✅ `netlify.toml` - Netlify configuration
- ✅ `netlify/functions/api.js` - Serverless functions
- ✅ `netlify/functions/package.json` - Function dependencies
- ✅ Optimized Puppeteer configuration for serverless

## 🚀 Deployment Steps

### Step 1: Push to GitHub
1. Make sure all your changes are committed and pushed to GitHub
2. Ensure your `.env` file is in `.gitignore` (it should be)

### Step 2: Connect to Netlify
1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "New site from Git"
3. Choose "GitHub" and authorize Netlify
4. Select your repository

### Step 3: Configure Build Settings
Netlify should auto-detect your settings, but verify:
- **Base directory**: Leave empty (root)
- **Build command**: `npm run build`
- **Publish directory**: `build`

### Step 4: Set Environment Variables
1. In your Netlify site dashboard, go to "Site settings"
2. Click "Environment variables" in the sidebar
3. Add these variables:
   - `SERPAPI_KEY`: Your SerpAPI key
   - `GEMINI_API_KEY`: Your Google Gemini API key

### Step 5: Deploy
1. Click "Deploy site"
2. Wait for the build to complete (usually 2-3 minutes)
3. Your site will be available at a random Netlify URL

### Step 6: Test Your Deployment
1. Visit your deployed site
2. Try searching for content
3. Test the scraping functionality
4. Verify AI content generation works

## 🔧 Build Configuration Details

### Netlify Configuration (`netlify.toml`)
```toml
[build]
  base = "."
  publish = "build"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

# API routes redirect to serverless functions
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

# SPA fallback
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Serverless Functions
Your API endpoints are handled by `netlify/functions/api.js`:
- `/api/search` - Search functionality
- `/api/scrape` - Web scraping
- `/api/format-content` - AI content generation
- `/api/search-history` - Search history
- `/api/health` - Health check

## 🐛 Troubleshooting

### Common Issues

**Build Fails:**
- Check that all dependencies are in `package.json`
- Verify Node.js version is 18 (set in `netlify.toml`)
- Check build logs for specific errors

**API Functions Don't Work:**
- Verify environment variables are set correctly
- Check function logs in Netlify dashboard
- Ensure API keys are valid and have sufficient quota

**Puppeteer/Scraping Issues:**
- The configuration uses `@sparticuz/chromium` for Netlify compatibility
- Scraping may be slower on serverless functions (30s timeout)
- Some websites may block serverless requests

**CORS Errors:**
- The API functions include CORS headers
- If issues persist, check browser console for specific errors

### Performance Optimization

**Cold Starts:**
- First request to functions may be slow (cold start)
- Subsequent requests will be faster
- Consider using Netlify's "Keep functions warm" feature

**Function Timeouts:**
- Netlify functions have a 10-second timeout on free tier
- Scraping complex sites may timeout
- Consider upgrading to Pro for 26-second timeout

## 🔒 Security Best Practices

1. **Never commit API keys** to your repository
2. **Use environment variables** for all sensitive data
3. **Regularly rotate API keys** for security
4. **Monitor API usage** to prevent unexpected charges
5. **Set up usage alerts** on your API providers

## 📊 Monitoring & Analytics

### Netlify Analytics
- Enable Netlify Analytics for traffic insights
- Monitor function invocations and errors
- Track build performance

### API Monitoring
- Monitor SerpAPI usage in your dashboard
- Track Gemini API calls and costs
- Set up alerts for quota limits

## 🔄 Updates & Maintenance

### Updating Your Site
1. Push changes to your GitHub repository
2. Netlify will automatically rebuild and deploy
3. Check the deploy log for any issues

### Dependency Updates
- Regularly update npm packages for security
- Test updates in development before deploying
- Monitor for breaking changes in APIs

## 💡 Advanced Configuration

### Custom Domain
1. Purchase a domain from any registrar
2. In Netlify, go to "Domain settings"
3. Add your custom domain
4. Update DNS records as instructed

### Performance Optimization
- Enable asset optimization in Netlify
- Use Netlify's CDN for faster global delivery
- Consider implementing caching strategies

## 📞 Support

If you encounter issues:
1. Check Netlify's function logs
2. Review the troubleshooting section above
3. Check API provider status pages
4. Contact support if needed

---

**Your site should now be live and fully functional on Netlify! 🎉**

The deployment includes:
- ✅ React frontend with optimized build
- ✅ Serverless API functions
- ✅ Web scraping with Puppeteer
- ✅ AI content generation
- ✅ Search functionality
- ✅ Proper CORS configuration
- ✅ Environment variable security
