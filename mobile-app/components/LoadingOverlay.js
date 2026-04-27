import React from 'react';
import { View, ActivityIndicator } from 'react-native';

const LoadingOverlay = () => (
  <View className="absolute inset-0 bg-secondary bg-opacity-75 justify-center items-center z-10">
    <ActivityIndicator size="large" color="#38bdf8" />
  </View>
);

export default LoadingOverlay;
