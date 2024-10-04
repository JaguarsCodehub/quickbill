import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform,
    ToastAndroid,
} from 'react-native';
import axios from 'axios';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from './LoadingScreen';


const LoginForm: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [year, setYear] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ userId?: string; password?: string }>({});

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
        // if (!validate()) return;

        setLoading(true);
        try {


            const response = await axios.post(
                `http://192.168.1.10:3000/login`,
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
                ]);

                console.log('Data was added to AsyncStorage');
                showToastWithGravityAndOffset('Welcome !');
                // setUsername('');
                // setPassword('');
                // console.log("Data:", response.data)
                router.push('/(user)')
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
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Login</Text>
                <TextInput
                    style={[
                        styles.input,
                        errors.userId ? styles.errorInput : {}
                    ]}
                    placeholder='Enter Your Username'
                    value={username}
                    onChangeText={setUsername}
                />
                {errors.userId && <Text style={styles.errorText}>{errors.userId}</Text>}

                <TextInput
                    style={[
                        styles.input,
                        errors.password ? styles.errorInput : {}
                    ]}
                    placeholder='Enter your Password'
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                <Text style={styles.label}>Select Year</Text>

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: '#f0f0f0',
    },
    card: {
        width: '90%',
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    errorInput: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        marginBottom: 10,
    },
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 20,
        backgroundColor: '#f1f1f1',
    },
    button: {
        backgroundColor: 'black',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LoginForm;