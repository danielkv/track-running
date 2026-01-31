const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Configure resolver for better dependency resolution
config.resolver = {
  ...config.resolver,
  unstable_enablePackageExports: false,
  resolveRequest: (context, moduleName, platform) => {
    // Alias react-native-maps to @teovilla/react-native-web-maps for web
    if (moduleName === "react-native-maps" && platform === "web") {
      return context.resolveRequest(
        context,
        "@teovilla/react-native-web-maps",
        platform
      );
    }
    // Default resolution
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Use a writable cache directory for Yarn PnP compatibility
  cacheDir: path.join(__dirname, ".cache/nativewind"),
});
