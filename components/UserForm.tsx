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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import LoadingScreen from './LoadingScreen';
import GridBackground from './GridBackground';

const { width, height } = Dimensions.get('window');

const UserForm: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ userId?: string; password?: string; role?: string }>({});
  const [role, setRole] = useState<string>('')

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
    const newErrors: { userId?: string; password?: string; role?: string } = {};

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

    if (!role) {
      newErrors.role = 'Role is Required'
      valid = false
    } else if (role === '') {
      newErrors.role = 'Please select A role first'
      valid = false
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // Dynamically determine the endpoint based on the selected role
      const endpoint =
        role === "Admin"
          ? "https://quickbill-backlend.vercel.app/admin-login"
          : "https://quickbill-backlend.vercel.app/login";

      console.log("Role:", role)

      const response = await axios.post(endpoint, { username, password });

      setLoading(false);
      if (response.status === 200) {
        const { CompanyID, CompanyName, Tag5, UserID } = response.data;
        await AsyncStorage.multiSet([
          ["CompanyID", CompanyID.toString()],
          ["CompanyName", CompanyName],
          ["Tag5", Tag5],
          ["UserID", UserID.toString()],
          ["SelectedYear", year],
        ]);
        console.log("Data was added to AsyncStorage");
        console.log("Selected Year:", year);

        setUsername("");
        setPassword("");
        Alert.alert("Login Successful", `Welcome, ${response.data.Tag1}`);

        router.push('/(user)/dashboard');
      } else {
        throw new Error(response.data.msg || "Login failed");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Login Failed", "Authentication Error. Please check your credentials again.");
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='dark-content' />
      <GridBackground />
      <ScrollView style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Welcome Back!</Text>
          <Text style={styles.headerSubtitle}>
            Sign in to continue your journey
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder='Enter your Username'
                placeholderTextColor='#666'
                value={username}
                onChangeText={setUsername}
              />
            </View>
            {errors.userId && (
              <Text style={styles.errorText}>{errors.userId}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder='Enter your Password'
                placeholderTextColor='#666'
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color='#666'
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Select Role</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={role}
                onValueChange={setRole}
                style={styles.picker}
              >
                <Picker.Item label='Select your Role' value='' style={{ fontFamily: 'MontserratRegular' }} />
                <Picker.Item
                  label='Admin'
                  value='Admin'
                  style={{ fontFamily: 'MontserratRegular' }}
                />
                <Picker.Item
                  label='User'
                  value='User'
                  style={{ fontFamily: 'MontserratRegular' }}
                />
              </Picker>

            </View>
            {errors.role && (
              <Text style={styles.errorText}>{errors.role}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Select Year</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={year}
                onValueChange={handleYearChange}
                style={styles.picker}
              >
                <Picker.Item label='Select Financial Year' value='' style={{ fontFamily: 'MontserratRegular' }} />
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

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign In</Text>
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
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    zIndex: 1,
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 36,
    fontFamily: 'MontserratBold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'MontserratRegular',
    color: '#666',
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'MontserratSemibold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    position: 'relative',
  },
  input: {
    padding: 16,
    fontSize: 16,
    fontFamily: 'MontserratRegular',
    color: '#1a1a1a',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  pickerWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: '#e0aaf3',
    borderColor: '#300042',
    borderWidth: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    marginTop: 20,
  },
  buttonText: {
    color: '#300042',
    fontFamily: 'MontserratSemibold',
    fontSize: 18,
  },
  errorText: {
    color: '#ff4444',
    fontFamily: 'MontserratRegular',
    fontSize: 14,
    marginTop: 4,
  },
});

export default UserForm;
