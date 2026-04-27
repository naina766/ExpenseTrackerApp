import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';

const SummaryCard = ({ title, value, smallNote }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
    
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }} className="bg-surface rounded-3xl p-5 mb-4 shadow-lg">
      <Text className="text-textSecondary text-sm mb-2">{title}</Text>
      <Text className="text-text text-3xl font-extrabold">{value}</Text>
      {smallNote ? <Text className="text-textSecondary mt-2">{smallNote}</Text> : null}
    </Animated.View>
  );
};

export default SummaryCard;
