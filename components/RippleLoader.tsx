import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface RippleLoaderProps {
  size?: number;
  color?: string;
}

const RippleLoader: React.FC<RippleLoaderProps> = ({
  size = 20,
  color = '#7868e5', // Using your primary color
}) => {
  const rippleAnimations = [
    React.useRef(new Animated.Value(1)).current,
    React.useRef(new Animated.Value(1)).current,
    React.useRef(new Animated.Value(1)).current,
  ];

  React.useEffect(() => {
    const animations = rippleAnimations.map((anim, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(index * 700), // Stagger the animations
          Animated.parallel([
            Animated.timing(anim, {
              toValue: 2,
              duration: 1000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    });

    // Start all animations
    animations.forEach((animation) => animation.start());

    // Cleanup
    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, []);

  return (
    <View style={[styles.container, { width: size * 3, height: size * 3 }]}>
      {rippleAnimations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.ripple,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              transform: [{ scale: anim }],
              opacity: anim.interpolate({
                inputRange: [1, 2],
                outputRange: [1, 0],
              }),
              position: 'absolute',
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ripple: {
    position: 'absolute',
  },
});

export default RippleLoader;
