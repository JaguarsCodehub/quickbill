import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const User = () => {
    const [formData, setFormData] = useState({
        name: '',
        groupName: 'Sundry Debtors (Customers)',
        contactName: '',
        address1: '',
        address2: '',
        city: '',
        postalCode: '',
        state: '',
        country: '',
        gstNo: '',
    });

    const [asyncStorageData, setAsyncStorageData] = useState({
        CompanyID: '',
        CompanyName: '',
        Tag5: '',
        UserID: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchAsyncStorageData = async () => {
            try {
                const keys = ['CompanyID', 'CompanyName', 'Tag5', 'UserID'];
                const result = await AsyncStorage.multiGet(keys);
                const data = Object.fromEntries(result);
                setAsyncStorageData(data as { CompanyID: string, CompanyName: string, Tag5: string, UserID: string });
            } catch (error) {
                console.error('Error fetching data from AsyncStorage:', error);
            }
        };

        fetchAsyncStorageData();
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prevData => ({ ...prevData, [field]: value }));
    };

    const handleSubmit = async () => {
        if (isLoading) return; // Prevent multiple submissions
        setIsLoading(true);
        try {
            const response = await fetch('https://quickbill-backlend.vercel.app/addCustomer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    companyId: parseInt(asyncStorageData.CompanyID),
                    userId: parseInt(asyncStorageData.UserID),
                    regType_tag3: 'R',
                    D_tag5: 'D',
                    created_by_userId: parseInt(asyncStorageData.UserID),
                    modified_by_userId: parseInt(asyncStorageData.UserID),
                    modified_date: new Date().toISOString(),
                    flag_L: 'L',
                    groupCode: '000000023'
                }),
            });
            // console.log(response)
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            setFormData({ name: '', groupName: 'Sundry Debtors (Customers)', contactName: '', address1: '', address2: '', city: '', postalCode: '', state: '', country: '', gstNo: '' })
            const result = await response.json();
            Alert.alert('Success', `Customer added successfully. ID: ${result.customerId}, Code: ${result.code}`);
            router.push('/create-order');
        } catch (error) {
            console.error('Error submitting form:', error);
            Alert.alert('Error', 'Failed to add customer. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const validateInputs = () => {
        const errors = [];

        // ... existing validations ...

        // GST number validation
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (formData.gstNo.trim()) {
            if (!gstRegex.test(formData.gstNo.trim())) {
                errors.push("Invalid GST Number format");
            }
        }

        return errors;
    };

    // Sample group names, replace with your actual options
    const groupNames = [
        'Sundry Debtors (Customers)',
        // 'Sundry Creditors (Suppliers)',
    ];

    // Add this array of states
    const states = [
        'ANDHRA PRADESH', 'ARUNACHAL PRADESH', 'ASSAM', 'BIHAR', 'CHHATTISGARH',
        'GOA', 'GUJARAT', 'HARYANA', 'HIMACHAL PRADESH', 'JHARKHND', 'KARNATAKA',
        'KERALA', 'MADHYA PRADESH', 'MAHARASHTRA', 'MANIPUR', 'MEGHALAYA', 'MIZORAM',
        'NAGALND', 'ODISHA', 'PUNJAB', 'RAJASTHAN', 'SIKKIM', 'TAMIL NADU', 'TELANGANA',
        'TRIPURA', 'UTTAR PRADESH', 'UTTARAKHND', 'WEST BENGAL'
    ];

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={['#1a1a1a', '#0a0a0a']}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>New Customer Account</Text>
                    <Ionicons name="person-add" size={24} color="#4CAF50" />
                </View>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.formContainer}>
                        {Object.entries(formData).reduce<Array<Array<{ key: string; value: string }>>>((rows, [key, value], index) => {
                            if (index % 2 === 0) rows.push([]);
                            rows[rows.length - 1].push({ key, value: value as string });
                            return rows;
                        }, []).map((row, rowIndex) => (
                            <View key={rowIndex} style={styles.rowContainer}>
                                {row.map(({ key, value }) => (
                                    <View key={key} style={styles.inputContainer}>
                                        <Text style={styles.label}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                                        {key === 'groupName' ? (
                                            <View style={styles.pickerContainer}>
                                                <Picker
                                                    selectedValue={value}
                                                    onValueChange={(itemValue) => handleInputChange(key, itemValue)}
                                                    style={styles.picker}
                                                >
                                                    {groupNames.map((groupName) => (
                                                        <Picker.Item key={groupName} label={groupName} value={groupName} color="#e0e0e0" />
                                                    ))}
                                                </Picker>
                                            </View>
                                        ) : key === 'state' ? (
                                            <View style={styles.pickerContainer}>
                                                <Picker
                                                    selectedValue={value}
                                                    onValueChange={(itemValue) => handleInputChange(key, itemValue)}
                                                    style={styles.picker}
                                                >
                                                    <Picker.Item label="Select a state" value="" color="#e0e0e0" />
                                                    {states.map((state) => (
                                                        <Picker.Item key={state} label={state} value={state} color="#e0e0e0" />
                                                    ))}
                                                </Picker>
                                            </View>
                                        ) : (
                                            <TextInput
                                                style={styles.input}
                                                value={value}
                                                onChangeText={(text) => handleInputChange(key, text)}
                                                placeholder={`Enter ${key}`}
                                                placeholderTextColor="#808080"
                                            />
                                        )}
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#0a0a0a" />
                        ) : (
                            <>
                                <Text style={styles.submitButtonText}>Create Customer Account</Text>
                                <Ionicons name="arrow-forward" size={20} color="#0a0a0a" />
                            </>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                        onPress={() => router.push('/create-order')}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#0a0a0a" />
                        ) : (
                            <>
                                <Text style={styles.submitButtonText}>Go to Sales Order</Text>
                                <Ionicons name="arrow-forward" size={20} color="#0a0a0a" />
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.asyncDataContainer}>
                        <Text style={styles.asyncDataTitle}>Current Session</Text>
                        <View style={styles.asyncDataRow}>
                            <Ionicons name="business" size={20} color="#4CAF50" />
                            <Text style={styles.asyncDataText}>{asyncStorageData.CompanyName}</Text>
                        </View>
                        <View style={styles.asyncDataRow}>
                            <Ionicons name="person" size={20} color="#4CAF50" />
                            <Text style={styles.asyncDataText}>User ID: {asyncStorageData.UserID}</Text>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    gradient: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#e0e0e0',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    formContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 20,
        marginBottom: 20,
    },
    inputContainer: {
        flex: 1,
        marginHorizontal: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#e0e0e0',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: '#e0e0e0',
    },
    pickerContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        overflow: 'hidden',
    },
    picker: {
        color: '#e0e0e0',
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 10,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: '#0a0a0a',
        fontSize: 18,
        fontWeight: '600',
        marginRight: 10,
    },
    asyncDataContainer: {
        marginTop: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 15,
        padding: 20,
    },
    asyncDataTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#e0e0e0',
        marginBottom: 15,
    },
    asyncDataRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    asyncDataText: {
        fontSize: 16,
        color: '#e0e0e0',
        marginLeft: 15,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
});

export default User;
