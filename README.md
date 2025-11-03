<p align="center">
  <img src="https://i.imgur.com/dWk6w4P.png" alt="Components Hierarchy" width="384" height="256"/>
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
Main script that analyzes component dependencies and displays them as a tree.

### `webpack.config.example.js`
Example webpack configuration for madge to resolve path aliases. Copy this to your project root as `webpack.config.js` and adapt it to match your project's path aliases.

**Important**: If your project uses Vite or another bundler (not webpack), madge still requires a `webpack.config.js` file to resolve custom path aliases like `/src/*` or `@components/*`.

## 🫳 Usage

### Setup in Your Project

1. Copy `show-component-tree.js` to your project root:

```bash
cp show-component-tree.js /path/to/your/project/
chmod +x /path/to/your/project/show-component-tree.js
```

2. Create a `webpack.config.js` in your project root (if you don't already have one):

```bash
cp webpack.config.example.js /path/to/your/project/webpack.config.js
```

3. Edit `webpack.config.js` to match your project's path aliases. For example, if your `vite.config.js` or `jsconfig.json` has:

```js
alias: {
 '/src': path.resolve(__dirname, 'app/javascript/packs'),
 '@components': path.resolve(__dirname, 'src/components')
}
```

Your `webpack.config.js` should have the same aliases:

```js
module.exports = {
 resolve: {
   alias: {
     '/src': path.resolve(__dirname, 'app/javascript/packs'),
     '@components': path.resolve(__dirname, 'src/components')
   },
   extensions: ['.js', '.jsx', '.svg']
 }
}
```

### Mode 1: Show Full Component Hierarchy

Display all component dependencies for a given file:

```bash
node show-component-tree.js path/to/component.jsx
```

**Example:**
```bash
node show-component-tree.js app/javascript/packs/ui/domain/library.jsx
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
node show-component-tree.js path/to/source.jsx path/to/target.jsx
```

**Example:**
```bash
node show-component-tree.js app/javascript/packs/ui/domain/library.jsx app/javascript/packs/ui/domain/seller.jsx
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
node show-component-tree.js app/javascript/packs/ui/domain/progresses/progress_form.jsx app/javascript/packs/ui/core/buttons/action_button.jsx
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

By default, the full hierarchy mode shows up to 3 levels of nesting. To change this, edit `show-component-tree.js` and modify the `maxDepth` parameter on line 25:

```js
function buildTree(file, graph, visited = new Set(), depth = 0, maxDepth = 5) {
  // Now shows up to 5 levels
```

### Customizing Filters

The tool excludes utilities, hooks, models, CSS, and JSON files by default. To customize what gets filtered, edit the `--exclude` pattern on line 11 of `show-component-tree.js`:

```js
`madge --webpack-config webpack.config.js --json --exclude '^(.*/(utils|models|hooks|static|css)/|.*\\.(css|json))' ${targetFile}`
```

## 🤔 How It Works

1. **madge** analyzes your JavaScript/JSX files and builds a dependency graph
2. The `webpack.config.js` helps madge resolve custom path aliases
3. `show-component-tree.js` filters the graph to show only `.jsx` components
4. For path finding, it uses depth-first search to find all routes from source to target
5. Results are formatted as an indented tree structure for easy reading

## 🆘 Troubleshooting

### "Graphviz could not be found" error
This only affects image generation. Install Graphviz or use the text-based output (this tool doesn't generate images by default).

### "Entry file not found in dependency graph"
- Check that the file path is correct
- Ensure your `webpack.config.js` has the correct path aliases
- Verify that madge can access the file

### No paths found between components
- The target component might not be a dependency of the source component
- Try running Mode 1 first to see the full hierarchy
- Check that both components use `.jsx` extension (`.js` files are excluded)
