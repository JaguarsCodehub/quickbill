import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GridBackground from './GridBackground';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Simplify Your Invoicing',
    description:
      'Create professional invoices in seconds, ensuring you get paid faster and more efficiently.',
    image: require('@/assets/images/1.png'),
  },
  {
    id: '2',
    title: 'Manage Orders Effortlessly',
    description:
      'Track and manage your orders seamlessly, keeping your business organized and your customers happy.',
    image: require('@/assets/images/2.png'),
  },
  {
    id: '3',
    title: 'Instant Receipts at Your Fingertips',
    description:
      'Generate and send receipts instantly, making transactions hassle-free for you and your clients.',
    image: require('@/assets/images/3.png'),
  },
];

const OnboardingScreen = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const updateCurrentSlideIndex = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex < slides.length) {
      flatListRef.current?.scrollToIndex({
        index: nextSlideIndex,
        animated: true,
      });
      setCurrentSlideIndex(nextSlideIndex);
    }
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/(user)');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const Slide = ({ item }: { item: (typeof slides)[0] }) => {
    return (
      <View style={styles.slide}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.image} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <GridBackground />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.indicatorContainer}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  currentSlideIndex === index && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={({ item }) => <Slide item={item} />}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={updateCurrentSlideIndex}
          bounces={false}
        />

        <View style={styles.footer}>
          {currentSlideIndex === slides.length - 1 ? (
            <TouchableOpacity
              style={styles.button}
              onPress={handleGetStarted}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={goToNextSlide}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  slide: {
    width,
    height: height - 200,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  title: {
    fontSize: 36,
    fontFamily: 'MontserratBold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 44,
  },
  description: {
    fontSize: 16,
    fontFamily: 'MontserratRegular',
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    height: 4,
    width: width * 0.2,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  activeIndicator: {
    backgroundColor: '#7868e5',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#e0aaf3',
    borderColor: '#300042',
    borderWidth: 2,
    borderRadius: 10,
    boxShadow: '#300042 4px 4px 0 0',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    paddingHorizontal: 18,
    marginTop: 20,
  },
  buttonText: {
    color: '#300042',
    fontFamily: 'MontserratSemibold',
    fontSize: 18,
  },
});

export default OnboardingScreen;
