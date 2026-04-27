import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '../theme';

const LoadingOverlay = () => (
  <View style={styles.overlay}>
    <ActivityIndicator size="large" color={theme.colors.primary} />
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)', // secondary with 75% opacity
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  }
});

export default LoadingOverlay;
