#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const targetFile = process.argv[2];
const targetComponent = process.argv[3]; // Optional: target component to find paths to

if (!targetFile) {
  console.error('Usage: node show-component-tree.js <path/to/component.jsx> [path/to/target-component.jsx]');
  process.exit(1);
}

// Get the directory where this script is located
const scriptDir = __dirname;
const webpackConfigPath = path.join(scriptDir, 'webpack.config.js');

// Convert target file to absolute path
const absoluteTargetFile = path.resolve(targetFile);

// Find project root from the target file (look for package.json)
function findProjectRoot(startPath) {
  const fs = require('fs');
  let currentDir = path.dirname(startPath);
  while (currentDir !== path.parse(currentDir).root) {
    if (fs.existsSync(path.join(currentDir, 'package.json'))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  return path.dirname(startPath); // Fallback to file directory
}

const projectRoot = findProjectRoot(absoluteTargetFile);

// Run madge with the webpack config from script directory and project root as env var
const output = execSync(
  `madge --webpack-config "${webpackConfigPath}" --json --exclude '^(.*/(utils|models|hooks|static|css)/|.*\\.(css|json))' "${absoluteTargetFile}"`,
  { encoding: 'utf-8', env: { ...process.env, PROJECT_ROOT: projectRoot } }
);

const graph = JSON.parse(output);

// Convert relative paths to component names
function toComponentName(filePath) {
  const name = path.basename(filePath, path.extname(filePath));
  // Convert snake_case to PascalCase for better readability
  return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

// Build dependency tree with depth tracking
function buildTree(file, graph, visited = new Set(), depth = 0, maxDepth = 3) {
  if (depth > maxDepth || visited.has(file)) {
    return '';
  }

  visited.add(file);
  const indent = '  '.repeat(depth);
  const componentName = toComponentName(file);
  const deps = graph[file] || [];

  // Filter to only .jsx components
  const jsxDeps = deps.filter(dep => dep.endsWith('.jsx'));

  let result = `${indent}${componentName}\n`;

  jsxDeps.forEach(dep => {
    result += buildTree(dep, graph, new Set(visited), depth + 1, maxDepth);
  });

  return result;
}

// Find all paths from source to target component
function findPaths(file, targetFile, graph, currentPath = [], allPaths = [], visited = new Set()) {
  // Avoid infinite loops
  if (visited.has(file)) {
    return allPaths;
  }

  visited.add(file);
  currentPath.push(file);

  // Check if we've reached the target
  const fileBasename = path.basename(file, path.extname(file));
  const targetBasename = path.basename(targetFile, path.extname(targetFile));

  if (fileBasename === targetBasename) {
    allPaths.push([...currentPath]);
  } else {
    // Continue searching in dependencies
    const deps = graph[file] || [];
    const jsxDeps = deps.filter(dep => dep.endsWith('.jsx'));

    jsxDeps.forEach(dep => {
      findPaths(dep, targetFile, graph, [...currentPath], allPaths, new Set(visited));
    });
  }

  return allPaths;
}

// Format paths as a tree
function formatPathsAsTree(paths) {
  if (paths.length === 0) {
    return 'No paths found';
  }

  let result = '';

  paths.forEach((pathArray, index) => {
    if (index > 0) {
      result += '\n';
    }
    if (paths.length > 1) {
      result += `Path ${index + 1}:\n`;
    }

    pathArray.forEach((file, depth) => {
      const indent = '  '.repeat(depth);
      const componentName = toComponentName(file);
      result += `${indent}${componentName}\n`;
    });
  });

  return result;
}

// Find the entry file in the graph
const entryFile = Object.keys(graph).find(key => key.includes(path.basename(targetFile, '.jsx')));

if (!entryFile) {
  console.log('Entry file not found in dependency graph');
  process.exit(1);
}

console.log('\nComponent Dependency Tree:\n');

if (targetComponent) {
  // Mode 2: Show paths from source to target
  const paths = findPaths(entryFile, targetComponent, graph);

  if (paths.length === 0) {
    console.log(`No path found from ${toComponentName(entryFile)} to ${toComponentName(targetComponent)}`);
  } else {
    console.log(formatPathsAsTree(paths));
  }
} else {
  // Mode 1: Show full tree
  console.log(buildTree(entryFile, graph));
}
