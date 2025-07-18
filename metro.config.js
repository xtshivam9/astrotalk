// metro.config.js
const { getDefaultConfig } = require("@expo/metro-config");

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Add the package(s) that need to be transpiled
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("metro-react-native-babel-transformer"),
};

config.resolver.sourceExts.push("ts", "tsx");

// Transpile specific packages
config.resolver = {
  ...config.resolver,
  unstable_enableSymlinks: true, // helpful if you're linking packages
};

module.exports = config;
