const PROXY_CONFIG = {
  '/api': {
    target: 'http://localhost:8083',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/api': '/api'
    }
  }
};

module.exports = PROXY_CONFIG;
