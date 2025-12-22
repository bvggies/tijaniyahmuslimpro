module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // NativeWind v4: The Babel plugin is optional and may cause issues.
    // If you encounter styling issues, try adding it back as: plugins: ['nativewind/babel']
    plugins: [],
  };
};


