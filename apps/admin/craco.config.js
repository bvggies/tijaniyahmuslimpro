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

      // Find the oneOf rule that handles js/jsx/ts/tsx files
      const oneOfRule = webpackConfig.module.rules.find((rule) => rule.oneOf);
      if (oneOfRule) {
        // Find the babel-loader rule
        const babelRule = oneOfRule.oneOf.find(
          (rule) => rule.test && rule.test.toString().includes('jsx|tsx')
        );
        
        if (babelRule && babelRule.include) {
          // Add workspace packages to the include array
          const workspacePath = path.resolve(__dirname, '../../packages');
          if (Array.isArray(babelRule.include)) {
            babelRule.include.push(
              path.join(workspacePath, 'ui', 'src'),
              path.join(workspacePath, 'shared', 'src')
            );
          } else {
            babelRule.include = [
              babelRule.include,
              path.join(workspacePath, 'ui', 'src'),
              path.join(workspacePath, 'shared', 'src'),
            ];
          }
        }
      }

      return webpackConfig;
    },
  },
};

