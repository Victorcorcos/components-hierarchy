const path = require('path')

// This config is only used by madge for resolving module paths
// PROJECT_ROOT is passed as an environment variable by show-component-tree.js
const projectRoot = process.env.PROJECT_ROOT || process.cwd()

module.exports = {
  resolve: {
    alias: {
      '/src': path.resolve(projectRoot, 'app/javascript/packs'),
      '/public': path.resolve(projectRoot, 'public')
    },
    extensions: ['.js', '.jsx', '.svg']
  }
}
