import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
  ToastAndroid,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import LoadingScreen from './LoadingScreen'; // Assuming you have this component

const UserForm: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ userId?: string; password?: string }>({});

  // useEffect(() => {
  //     const fetchAsyncStorageData = async () => {
  //         try {
  //             const selectedYear = await AsyncStorage.getItem('SelectedYear');
  //             if (selectedYear) {
  //                 setYear(selectedYear);
  //             }
  //         } catch (error) {
  //             console.error('Error fetching year from AsyncStorage:', error);
  //         }
  //     };

  //     fetchAsyncStorageData();
  // }, []);

  const handleYearChange = async (selectedYear: string) => {
    setYear(selectedYear);
    try {
      await AsyncStorage.setItem('SelectedYear', selectedYear);
    } catch (error) {
      console.error('Error saving year to AsyncStorage:', error);
    }
  };

  const showToastWithGravityAndOffset = (msg: string) => {
    ToastAndroid.showWithGravityAndOffset(
      msg,
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      50,
      50
    );
  };

  const validate = () => {
    let valid = true;
    const newErrors: { userId?: string; password?: string } = {};

    if (!username) {
      newErrors.userId = 'User ID is required';
      valid = false;
    } else if (username.length < 6) {
      newErrors.userId = 'User ID must be at least 6 characters long';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 3) {
      newErrors.password = 'Password must be at least 3 characters long';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `https://quickbill-backlend.vercel.app/login`,
        {
          username,
          password,
        }
      );

      setLoading(false);

      if (response.status === 200) {
        Alert.alert(
          'Login Successful',
          `Welcome, ${response.data.Tag1}`
        );

        const { CompanyID, CompanyName, Tag5, UserID } = response.data;
        await AsyncStorage.multiSet([
          ['CompanyID', CompanyID.toString()],
          ['CompanyName', CompanyName],
          ['Tag5', Tag5],
          ['UserID', UserID.toString()],
          ['SelectedYear', year],
        ]);

        console.log('Data was added to AsyncStorage');
        console.log("Selected Year:", year);
        showToastWithGravityAndOffset('Welcome !');
        setUsername('');
        setPassword('');
        router.push('/(user)/dashboard' as never);
      } else {
        throw new Error(response.data.msg || 'Login failed');
      }
    } catch (error) {
      setLoading(false);
      console.error('Login error:', error);

      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error instanceof Error) {
        if (error.message === 'No internet connection') {
          errorMessage = 'Please check your internet connection and try again.';
        } else if (axios.isAxiosError(error) && error.response) {
          errorMessage = error.response.data.msg || errorMessage;
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert('Login Failed', errorMessage);
      showToastWithGravityAndOffset('Login failed. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.content}>
        {/* Decorative Background Elements */}
        {/* <Image
          source={{ uri: 'https://example.com/curved-lines.png' }} // Replace with actual curved lines background image
          style={styles.backgroundImage}
        /> */}

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={styles.title}>Manage your bills and accounts.</Text>
          <Text style={styles.subtitle}>Create Invoices under few minutes</Text>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Log in</Text>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Email"
                placeholderTextColor="#A0A0A0"
              />
              {username.length > 0 && (
                <View style={styles.checkmarkContainer}>
                  <Ionicons name="checkmark" size={20} color="#0066FF" />
                </View>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Password"
                placeholderTextColor="#A0A0A0"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#A0A0A0"
                />
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleLogin}
            >
              <Text style={styles.signInText}>Sign in</Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password</Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity>
                <Text style={styles.signUpLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      {loading && <LoadingScreen />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: 300,
    top: 0,
    resizeMode: 'cover',
  },
  mainContent: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
  },
  formContainer: {
    // marginTop: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000',
  },
  checkmarkContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  signInButton: {
    backgroundColor: '#0066FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#0066FF',
    fontSize: 14,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signUpText: {
    color: '#666666',
    fontSize: 14,
  },
  signUpLink: {
    color: '#0066FF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default UserForm;
