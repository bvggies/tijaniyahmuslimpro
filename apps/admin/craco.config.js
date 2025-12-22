const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Remove ModuleScopePlugin to allow importing from workspace packages
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) => constructor && constructor.name === 'ModuleScopePlugin'
      );

      if (scopePluginIndex !== -1) {
        webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
      }

      // Get workspace packages paths (both direct and through node_modules symlinks)
      const workspacePath = path.resolve(__dirname, '../../packages');
      const uiSrcPath = path.join(workspacePath, 'ui', 'src');
      const sharedSrcPath = path.join(workspacePath, 'shared', 'src');
      const nodeModulesPath = path.resolve(__dirname, '../../node_modules');
      const uiNodeModulesPath = path.join(nodeModulesPath, '@tmp', 'ui');
      const sharedNodeModulesPath = path.join(nodeModulesPath, '@tmp', 'shared');

      // Find existing babel-loader config to reuse its options
      let babelLoaderOptions = null;
      const oneOfRuleTemp = webpackConfig.module.rules.find((rule) => rule.oneOf);
      if (oneOfRuleTemp && oneOfRuleTemp.oneOf) {
        const babelRule = oneOfRuleTemp.oneOf.find(
          (rule) => rule.loader && rule.loader.includes('babel-loader')
        );
        if (babelRule && babelRule.options) {
          babelLoaderOptions = babelRule.options;
        }
      }

      // Add a specific rule for workspace packages BEFORE the oneOf rule
      // This ensures they're processed by babel-loader before source-map-loader
      const workspaceRule = {
        test: /\.(ts|tsx|js|jsx)$/,
        include: [uiSrcPath, sharedSrcPath],
        use: {
          loader: require.resolve('babel-loader'),
          options: babelLoaderOptions || {
            presets: [
              require.resolve('babel-preset-react-app'),
            ],
            cacheDirectory: true,
          },
        },
      };

      // Insert workspace rule at the beginning of module rules (before oneOf)
      if (!webpackConfig.module.rules) {
        webpackConfig.module.rules = [];
      }
      // Find oneOf rule index and insert before it
      const oneOfIndex = webpackConfig.module.rules.findIndex((rule) => rule.oneOf);
      if (oneOfIndex !== -1) {
        webpackConfig.module.rules.splice(oneOfIndex, 0, workspaceRule);
      } else {
        webpackConfig.module.rules.unshift(workspaceRule);
      }

      // Find the oneOf rule that handles js/jsx/ts/tsx files
      const oneOfRule = webpackConfig.module.rules.find((rule) => rule.oneOf);
      if (oneOfRule && oneOfRule.oneOf) {
        // Update all rules that process TypeScript/JavaScript files
        oneOfRule.oneOf.forEach((rule, index) => {
          // Check if this is source-map-loader - exclude workspace packages from it
          if (rule.loader && rule.loader.includes('source-map-loader')) {
            if (!rule.exclude) {
              rule.exclude = [];
            }
            if (Array.isArray(rule.exclude)) {
              rule.exclude.push(/packages\/ui/, /packages\/shared/, /@tmp\/ui/, /@tmp\/shared/);
            }
          }

          // Check if this rule processes TypeScript/JavaScript
          const processesTS = rule.test && (
            rule.test.toString().includes('tsx') ||
            rule.test.toString().includes('ts') ||
            rule.test.toString().includes('jsx') ||
            rule.test.toString().includes('js')
          );

          if (processesTS) {
            // Modify exclude to allow workspace packages
            if (rule.exclude) {
              if (typeof rule.exclude === 'function') {
                const originalExclude = rule.exclude;
                rule.exclude = (modulePath) => {
                  const normalizedPath = modulePath.replace(/\\/g, '/');
                  // Don't exclude workspace packages (check both direct paths and node_modules symlinks)
                  if (
                    normalizedPath.includes('packages/ui') ||
                    normalizedPath.includes('packages/shared') ||
                    normalizedPath.includes('@tmp/ui') ||
                    normalizedPath.includes('@tmp/shared')
                  ) {
                    return false;
                  }
                  return originalExclude(modulePath);
                };
              } else if (Array.isArray(rule.exclude)) {
                rule.exclude = rule.exclude.filter(
                  (exclude) => {
                    const excludeStr = exclude.toString();
                    return !excludeStr.includes('packages/ui') && 
                           !excludeStr.includes('packages/shared') &&
                           !excludeStr.includes('@tmp/ui') &&
                           !excludeStr.includes('@tmp/shared');
                  }
                );
              } else {
                // Replace regex/string exclude with function
                const originalExclude = rule.exclude;
                rule.exclude = (modulePath) => {
                  const normalizedPath = modulePath.replace(/\\/g, '/');
                  // Check if it matches original exclude
                  let shouldExclude = false;
                  if (originalExclude instanceof RegExp) {
                    shouldExclude = originalExclude.test(modulePath);
                  } else if (typeof originalExclude === 'string') {
                    shouldExclude = modulePath.includes(originalExclude);
                  } else if (typeof originalExclude === 'function') {
                    shouldExclude = originalExclude(modulePath);
                  }
                  
                  // But don't exclude workspace packages
                  if (
                    normalizedPath.includes('packages/ui') ||
                    normalizedPath.includes('packages/shared') ||
                    normalizedPath.includes('@tmp/ui') ||
                    normalizedPath.includes('@tmp/shared')
                  ) {
                    return false;
                  }
                  
                  return shouldExclude;
                };
              }
            }

            // Ensure workspace packages are included
            if (rule.include) {
              if (Array.isArray(rule.include)) {
                // Check if already included
                const alreadyIncluded = rule.include.some(
                  (inc) => {
                    const incStr = inc.toString ? inc.toString() : String(inc);
                    return incStr.includes('packages/ui') || 
                           incStr.includes('packages/shared') ||
                           incStr.includes('@tmp/ui') ||
                           incStr.includes('@tmp/shared');
                  }
                );
                if (!alreadyIncluded) {
                  rule.include.push(uiSrcPath, sharedSrcPath);
                }
              } else {
                // Convert to array and add workspace packages
                const existingInclude = rule.include;
                rule.include = [existingInclude, uiSrcPath, sharedSrcPath];
              }
            } else {
              // No include specified, add workspace packages
              rule.include = [uiSrcPath, sharedSrcPath];
            }
          }
        });
      }

      return webpackConfig;
    },
  },
};
