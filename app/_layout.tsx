// import 'react-native-gesture-handler'; // Import at the top of the file
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot, SplashScreen, Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFonts } from 'expo-font';

import axios from 'axios';
import OnboardingScreen from '@/components/OnBoardingScreen';

export default function Layout() {

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    MontserratBold: require('../assets/fonts/Montserrat-Bold.ttf'),
    MontserratMedium: require('../assets/fonts/Montserrat-Medium.ttf'),
    MontserratRegular: require('../assets/fonts/Montserrat-Regular.ttf'),
    MontserratSemibold: require('../assets/fonts/Montserrat-SemiBold.ttf'),
  });
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  // useEffect(() => {
  //   checkOnboardingStatus();
  // }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // const checkOnboardingStatus = async () => {
  //   try {
  //     const value = await AsyncStorage.getItem('hasSeenOnboarding');
  //     setHasSeenOnboarding(value === 'true');
  //   } catch (error) {
  //     console.error('Error checking onboarding status:', error);
  //     setHasSeenOnboarding(false);
  //   }
  // };

  // if (hasSeenOnboarding === null) {
  //   return null; // Or a loading screen
  // }

  // if (!hasSeenOnboarding) {
  //   return <OnboardingScreen />;
  // }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Slot />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})


