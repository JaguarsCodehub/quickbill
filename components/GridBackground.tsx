import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const GRID_SIZE = 30;

const GridBackground = () => {
  const numHorizontalLines = Math.floor(height / GRID_SIZE);
  const numVerticalLines = Math.floor(width / GRID_SIZE);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#f8f9fe', '#ffffff']} style={styles.gradient}>
        {/* Horizontal lines */}
        {Array(numHorizontalLines)
          .fill(0)
          .map((_, i) => (
            <View
              key={`h-${i}`}
              style={[
                styles.line,
                styles.horizontalLine,
                { top: i * GRID_SIZE },
              ]}
            />
          ))}

        {/* Vertical lines */}
        {Array(numVerticalLines)
          .fill(0)
          .map((_, i) => (
            <View
              key={`v-${i}`}
              style={[
                styles.line,
                styles.verticalLine,
                { left: i * GRID_SIZE },
              ]}
            />
          ))}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
  },
  line: {
    position: 'absolute',
    backgroundColor: 'rgba(230, 230, 230, 0.5)',
  },
  horizontalLine: {
    left: 0,
    right: 0,
    height: 1,
  },
  verticalLine: {
    top: 0,
    bottom: 0,
    width: 1,
  },
});

export default GridBackground;
