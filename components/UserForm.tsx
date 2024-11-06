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
import LoadingScreen from './LoadingScreen';

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
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.content}>
        {/* Logo and Header Section */}
        <View style={styles.headerContainer}>
          <Image
            source={require('../assets/logo.jpg')}
            style={styles.logo}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Quick Bill</Text>
            <Text style={styles.headerSubtitle}>
              Professional Accounting Solution
            </Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          {/* Username Input */}
          <View style={styles.inputWrapper}>
            {/* <Text style={styles.inputLabel}>Username</Text> */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#58a6ff" />
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#8b949e"
                value={username}
                onChangeText={setUsername}
              />
            </View>
            {errors.userId && (
              <Text style={styles.errorText}>{errors.userId}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            {/* <Text style={styles.inputLabel}>Password</Text> */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#58a6ff" />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#8b949e"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#58a6ff"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Year Picker */}
          <View style={styles.inputWrapper}>
            {/* <Text style={styles.inputLabel}>Financial Year</Text> */}
            <View style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={20} color="#58a6ff" />
              <Picker
                selectedValue={year}
                style={styles.picker}
                dropdownIconColor="#58a6ff"
                onValueChange={handleYearChange}
              >
                <Picker.Item
                  label="Select Financial Year"
                  value=""
                  style={styles.pickerPlaceholder}
                />
                <Picker.Item
                  label='01 APR 2018 - 31 MAR 2019'
                  value='18041903'
                />
                <Picker.Item
                  label='01 APR 2019 - 31 MAR 2020'
                  value='19042003'
                />
                <Picker.Item
                  label='01 APR 2020 - 31 MAR 2021'
                  value='20042103'
                />
                <Picker.Item
                  label='01 APR 2022 - 31 MAR 2023'
                  value='22042303'
                />
                <Picker.Item
                  label='01 APR 2023 - 31 MAR 2024'
                  value='23042403'
                />
                <Picker.Item
                  label='01 APR 2024 - 31 MAR 2025'
                  value='24042503'
                />
              </Picker>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>LOGIN</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Don't have an account? {' '}
              <Text style={styles.registerLink}>Register Now</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {loading && <LoadingScreen />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#c9d1d9',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8b949e',
  },
  formContainer: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#8b949e',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1117',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  input: {
    flex: 1,
    color: '#c9d1d9',
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  picker: {
    flex: 1,
    color: '#c9d1d9',
  },
  pickerPlaceholder: {
    color: '#8b949e',
  },
  actionContainer: {
    marginTop: 20,
  },
  loginButton: {
    backgroundColor: '#58a6ff',
    borderRadius: 15,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  registerContainer: {
    alignItems: 'center',
  },
  registerText: {
    color: '#8b949e',
    fontSize: 14,
  },
  registerLink: {
    color: '#58a6ff',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 10,
  },
});

export default UserForm;
