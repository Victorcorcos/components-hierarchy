<p align="center">
  <img src="https://i.imgur.com/4V221bH.png" alt="Components Hierarchy" width="384" height="256"/>
</p>

## 📋 Description

#### Discover component hierarchy trees in React (.jsx) projects with ease!

This tool helps you visualize React component dependencies by analyzing your codebase and showing:
- **Full component hierarchy**: See all components a file depends on, nested to show the complete dependency tree
- **Specific paths**: Find all the different ways one component reaches another component

Built on top of [madge](https://github.com/pahen/madge), this tool filters out utility functions, hooks, models, CSS, and JSON files to focus only on component relationships (`.jsx` files).

## 🎯 Prerequisites

1. **Node.js** installed on your system

2. **madge** installed globally or locally:

```rb
npm install -g madge
```

3. **Graphviz** (optional, only needed for generating visual graphs):

```rb
# Ubuntu/Debian/Linux Mint
sudo apt install graphviz

# macOS
brew install graphviz
```

## 📁 Files

### `show-component-tree.js`
Main script that analyzes component dependencies and displays them as a tree. No installation required - just run it directly from this repository!

### `webpack.config.js`
Webpack configuration used by madge to resolve path aliases. Pre-configured for common React project structures. The script automatically detects your project root and applies the correct paths.

## 🫳 Usage

**No setup required!** You just need to be **inside the repository you want to see the components dependencies** and run the script from this repository pointing to your project files.

### Mode 1: Show Full Component Hierarchy

Display all component dependencies for a given file:

```bash
node /path/to/components-hierarchy/show-component-tree.js PATH/TO/component.jsx
```

**Example:**
```bash
node /path/to/components-hierarchy/show-component-tree.js app/javascript/packs/ui/domain/library.jsx
```

**Output:**
```yml
Component Dependency Tree:

Library
  Book
    Color
    Chapter
      Page
      Word
      Sentence
      Chapter
      ...
    Difficulty
  Worker
    Secretary
    Seller
    Cleaner
  Location
```

### Mode 2: Find Paths Between Components

Show all paths from a source component to a target component:

```bash
node /path/to/components-hierarchy/show-component-tree.js PATH/TO/source.jsx PATH/TO/target.jsx
```

**Example:**
```bash
node /path/to/components-hierarchy/show-component-tree.js app/javascript/packs/ui/domain/library.jsx app/javascript/packs/ui/domain/seller.jsx
```

**Output:**
```yml
Component Dependency Tree:

Library
  Worker
    Seller
```

**Example with multiple paths:**
```bash
node /path/to/components-hierarchy/show-component-tree.js app/javascript/packs/ui/domain/progresses/progress_form.jsx app/javascript/packs/ui/core/buttons/action_button.jsx
```

**Output:**
```yml
Component Dependency Tree:

Path 1:
ProgressForm
  Form
    ColumnInput
      InputMultipleEntries
        ActionButton

Path 2:
ProgressForm
  FormButtons
    ActionButton

Path 3:
ProgressForm
  FormButtons
    ActionToolbar
      ActionButton
```

## ⚙️ Configuration

### Adjusting Tree Depth

By default, the full hierarchy mode shows up to 3 levels of nesting. To change this, edit `show-component-tree.js` and modify the `maxDepth` parameter:

```js
function buildTree(file, graph, visited = new Set(), depth = 0, maxDepth = 5) {
  // Now shows up to 5 levels
}
```

### Customizing Filters

The tool excludes utilities, hooks, models, CSS, and JSON files by default. To customize what gets filtered, edit the `--exclude` pattern in `show-component-tree.js`:

```js
`madge --webpack-config "${webpackConfigPath}" --json --exclude '^(.*/(utils|models|hooks|static|css)/|.*\\.(css|json))' "${absoluteTargetFile}"`
```

### Adjusting Path Aliases

If your project uses different path aliases, edit `webpack.config.js` to match your project structure:

```js
module.exports = {
  resolve: {
    alias: {
      '/src': path.resolve(projectRoot, 'app/javascript/packs'),
      '/public': path.resolve(projectRoot, 'public'),
      // Add your custom aliases here
      '@components': path.resolve(projectRoot, 'src/components'),
      '@utils': path.resolve(projectRoot, 'src/utils')
    },
    extensions: ['.js', '.jsx', '.svg']
  }
}
```

## 🤔 How It Works

1. Script detects your project root by looking for `package.json`
2. Passes the project root to `webpack.config.js` via environment variable
3. **madge** analyzes your JavaScript/JSX files and builds a dependency graph using the webpack config to resolve path aliases
4. `show-component-tree.js` filters the graph to show only `.jsx` components
5. For path finding, it uses depth-first search to find all routes from source to target
6. Results are formatted as an indented tree structure for easy reading

## 🆘 Troubleshooting

### "Graphviz could not be found" error
This only affects image generation. Install Graphviz or use the text-based output (this tool doesn't generate images by default).

### "Entry file not found in dependency graph"
- Check that the file path is correct and the file exists
- Ensure the file path is relative to your current directory or use an absolute path
- Verify that madge can access the file

### No paths found between components
- The target component might not be a dependency of the source component
- Try running Mode 1 first to see the full hierarchy
- Check that both components use `.jsx` extension (`.js` files are excluded)

### Path aliases not resolving correctly
- Check if your project uses different path aliases than the default (`/src` and `/public`)
- Edit `webpack.config.js` in the components-hierarchy repository to match your project's aliases
- Make sure your project has a `package.json` file so the script can detect the project root
