// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const os = require('os');

// Find the project and workspace directories
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

// 4. Configure Metro to handle monorepo packages
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'cjs'];

// 5. Optimize for Windows - reduce file watcher load
const isWindows = os.platform() === 'win32';

// Configure file watcher to be more stable on Windows
if (isWindows) {
  // On Windows, use fewer workers and configure watcher more conservatively
  config.watcher = {
    ...(config.watcher || {}),
    healthCheck: {
      enabled: true,
      interval: 30000,
      timeout: 5000,
    },
  };
}

// 6. Optimize worker count for Windows (use fewer workers to avoid file handle exhaustion)
config.maxWorkers = isWindows 
  ? Math.max(1, Math.floor(os.cpus().length / 2))
  : os.cpus().length;

// 7. Configure transformer to handle workspace packages
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
  // Increase stability on Windows
  unstable_allowRequireContext: true,
};

module.exports = config;

