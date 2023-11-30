const express = require("express");
const NewsRouter = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');


const apiConfigs = {
  news: {
    target: 'https://newsapi.org',
    pathRewrite: (path) => {
      const apiKey = 'e7c31c435fc945ee9943008a24b6fb2b';
      return `/v2/top-headlines?country=in&apiKey=${apiKey}`;
    },
  },
  sports: {
    target: 'https://newsapi.org',
    pathRewrite: (path) => {
      const apiKey = 'e7c31c435fc945ee9943008a24b6fb2b';
      return `/v2/top-headlines?country=in&category=sports&apiKey=${apiKey}`;
    },
  },
  business: {
    target: 'https://newsapi.org',
    pathRewrite: (path) => {
      const apiKey = 'e7c31c435fc945ee9943008a24b6fb2b';
      return `/v2/top-headlines?country=in&category=business&apiKey=${apiKey}`;
    },
  },
  health: {
    target: 'https://newsapi.org',
    pathRewrite: (path) => {
      const apiKey = 'e7c31c435fc945ee9943008a24b6fb2b';
      return `/v2/top-headlines?country=in&category=health&apiKey=${apiKey}`;
    },
  },
  entertainment: {
    target: 'https://newsapi.org',
    pathRewrite: (path) => {
      const apiKey = 'e7c31c435fc945ee9943008a24b6fb2b';
      return `/v2/top-headlines?country=in&category=entertainment&apiKey=${apiKey}`;
    },
  },
  // Add more APIs here as needed
};

// Create proxy middleware based on the specified API
const createApiProxy = (apiConfig) => {
  return createProxyMiddleware({
    target: apiConfig.target,
    changeOrigin: true,
    pathRewrite: apiConfig.pathRewrite,
    onProxyRes: (proxyRes) => {
      console.log('Proxy response received:', proxyRes.statusCode);
    },
  });
};

// Use the proxy middleware for the specified API route
NewsRouter.use('/api/news', createApiProxy(apiConfigs.news));
NewsRouter.use('/api/sports', createApiProxy(apiConfigs.sports));
NewsRouter.use('/api/business', createApiProxy(apiConfigs.business));
NewsRouter.use('/api/health', createApiProxy(apiConfigs.health));
NewsRouter.use('/api/entertainment', createApiProxy(apiConfigs.entertainment));

// Add more routes for additional APIs














module.exports = NewsRouter;

/* 
const newsApiProxy = createProxyMiddleware({
  target: 'https://newsapi.org',
  changeOrigin: true,
  pathRewrite: (path) => {
    // Rewrite /api/news to /v2/top-headlines?country=in&apiKey=e7c31c435fc945ee9943008a24b6fb2b
    const apiKey = 'e7c31c435fc945ee9943008a24b6fb2b';
    return `/v2/top-headlines?country=in&apiKey=${apiKey}`;
  },
  onProxyRes: (proxyRes) => {
    console.log('Proxy response received:', proxyRes.statusCode);
  },
});

// Use the proxy middleware for the /api/news route
NewsRouter.use('/api/news', newsApiProxy);




*/





