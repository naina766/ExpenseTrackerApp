const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// NativeWind v2 requires CSS source extension support
config.resolver.sourceExts.push('css');

module.exports = config;
