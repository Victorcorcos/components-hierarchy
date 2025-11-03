const path = require('path')

// This config is only used by madge for resolving module paths
// The actual build uses vite.config.js
module.exports = {
  resolve: {
    alias: {
      '/src': path.resolve(__dirname, 'app/javascript/packs'),
      '/public': path.resolve(__dirname, 'public')
    },
    extensions: ['.js', '.jsx', '.svg']
  }
}
