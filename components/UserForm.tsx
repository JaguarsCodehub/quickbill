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

    if (loading) {
        return <LoadingScreen />;
    }

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle='light-content' />
        <View style={styles.content}>
          <View style={styles.header}>
            <Image source={require('../assets/logo.jpg')} style={styles.icon} />
            <View style={styles.languageSelector}>
              <Ionicons name='globe-outline' size={20} color='#fff' />
              <Text style={styles.languageText}>EN</Text>
              <Ionicons name='chevron-down' size={20} color='#fff' />
            </View>
          </View>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>Quick Bill App</Text>
            <Text style={styles.headerDescription}>
              Accounting at your fingertips
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons
                name='person-circle-outline'
                size={24}
                color='#7868e5'
              />
              <TextInput
                style={styles.input}
                placeholder='User Name'
                placeholderTextColor='#8E8E93'
                value={username}
                onChangeText={setUsername}
              />
            </View>
            {errors.userId && (
              <Text style={styles.errorText}>{errors.userId}</Text>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name='key-outline' size={24} color='#7868e5' />
              <TextInput
                style={styles.input}
                placeholder='Password'
                placeholderTextColor='#8E8E93'
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={24}
                  color='#7868e5'
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name='calendar-outline' size={24} color='#7868e5' />
              <Picker
                selectedValue={year}
                style={styles.picker}
                onValueChange={handleYearChange}
              >
                <Picker.Item label='Select a Year' value='' />
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

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Log in</Text>
          </TouchableOpacity>

          <Text style={styles.registerText}>
            Don't have an account yet?{' '}
            <Text style={styles.registerLink}>Register Now</Text>
          </Text>
        </View>
      </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  icon: {
    width: 40,
    height: 40,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    color: '#fff',
    marginHorizontal: 5,
  },
  headerTextContainer: {
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerDescription: {
    fontSize: 16,
    color: '#8E8E93',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    color: '#fff',
    paddingVertical: 15,
    marginLeft: 10,
  },
  picker: {
    flex: 1,
    color: '#fff',
  },
  loginButton: {
    backgroundColor: '#7868e5',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerText: {
    color: '#8E8E93',
    textAlign: 'center',
  },
  registerLink: {
    color: '#7868e5',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 10,
  },
});

export default UserForm;
