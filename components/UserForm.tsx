import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import LoadingScreen from './LoadingScreen';
import { COLORS } from '@/constants/Colors';

const UserForm: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ userId?: string; password?: string }>({});

  const handleYearChange = async (selectedYear: string) => {
    setYear(selectedYear);
    try {
      await AsyncStorage.setItem('SelectedYear', selectedYear);
    } catch (error) {
      console.error('Error saving year to AsyncStorage:', error);
    }
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
        { username, password }
      );

      setLoading(false);
      if (response.status === 200) {
        Alert.alert('Login Successful', `Welcome, ${response.data.Tag1}`);
        // ... AsyncStorage logic ...
        router.push('/(user)/dashboard' as never);
      } else {
        throw new Error(response.data.msg || 'Login failed');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Login Failed', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Sign in to your Account</Text>
          <Text style={styles.headerSubtitle}>Enter your Username and Password to sign in</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Username</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter your Username"
              placeholderTextColor="#A0A0A0"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter your Password"
              placeholderTextColor="#A0A0A0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#000"
              />
            </TouchableOpacity>
          </View>

          {/* <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity> */}

          <Text style={styles.inputLabel}>Select Financial Year</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={year}
              style={styles.picker}
              onValueChange={handleYearChange}
            >
              <Picker.Item label='Select Financial Year' value='' />
              <Picker.Item label='01 APR 2018 - 31 MAR 2019' value='18041903' />
              <Picker.Item label='01 APR 2019 - 31 MAR 2020' value='19042003' />
              <Picker.Item label='01 APR 2020 - 31 MAR 2021' value='20042103' />
              <Picker.Item label='01 APR 2022 - 31 MAR 2023' value='22042303' />
              <Picker.Item label='01 APR 2023 - 31 MAR 2024' value='23042403' />
              <Picker.Item label='01 APR 2024 - 31 MAR 2025' value='24042503' />
            </Picker>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          {/* <Text style={styles.orText}>Or Login with</Text>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity style={styles.socialButton}>
              
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.socialButton}>
              
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Don't have an account? {' '}
              <Text style={styles.registerLink}>Register</Text>
            </Text>
          </View> */}

          <View style={{ alignItems: 'center' }}>
            <Image
              source={require('@/assets/images/login.png')}
              style={{ width: '80%', height: 300, resizeMode: 'center' }}
            />
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
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  headerContainer: {
    marginTop: 40,
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.primary,
  },
  formContainer: {
    width: '100%',
    // marginTop: 40
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: '#000',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#7CB342',
    fontSize: 14,
  },
  pickerWrapper: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    // marginTop: 10
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 12,
    width: '48%',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  socialButtonText: {
    fontSize: 14,
    color: '#000',
  },
  registerContainer: {
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default UserForm;
