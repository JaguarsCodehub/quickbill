import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

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
        try {
            const response = await fetch('http://192.168.1.10:3000/addCustomer', {
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

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            Alert.alert('Success', `Customer added successfully. ID: ${result.customerId}, Code: ${result.code}`);
        } catch (error) {
            console.error('Error submitting form:', error);
            Alert.alert('Error', 'Failed to add customer. Please try again.');
        }
    };

    // Sample group names, replace with your actual options
    const groupNames = [
        'Sundry Debtors (Customers)',
        'Sundry Creditors (Suppliers)',
    ];

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <Text style={styles.title}>New Account</Text>
                <Ionicons name="person-add" size={24} color="#1E90FF" />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.formContainer}>
                    {Object.entries(formData).map(([key, value], index) => (
                        <View key={key} style={[styles.inputContainer, index % 2 === 0 ? styles.leftInput : styles.rightInput]}>
                            <Text style={styles.label}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                            {key === 'groupName' ? (
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={value}
                                        onValueChange={(itemValue) => handleInputChange(key, itemValue)}
                                        style={styles.picker}
                                    >
                                        {groupNames.map((groupName) => (
                                            <Picker.Item key={groupName} label={groupName} value={groupName} />
                                        ))}
                                    </Picker>
                                </View>
                            ) : (
                                <TextInput
                                    style={styles.input}
                                    value={value}
                                    onChangeText={(text) => handleInputChange(key, text)}
                                    placeholder={`Enter ${key}`}
                                    placeholderTextColor="#B0C4DE"
                                />
                            )}
                        </View>
                    ))}
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Create Account</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.asyncDataContainer}>
                    <Text style={styles.asyncDataTitle}>Current Session</Text>
                    <View style={styles.asyncDataRow}>
                        <Ionicons name="business" size={20} color="#4169E1" />
                        <Text style={styles.asyncDataText}>{asyncStorageData.CompanyName}</Text>
                    </View>
                    <View style={styles.asyncDataRow}>
                        <Ionicons name="person" size={20} color="#4169E1" />
                        <Text style={styles.asyncDataText}>User ID: {asyncStorageData.UserID}</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        marginTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        // backgroundColor: '#FFFFFF',
        // borderBottomWidth: 1,
        // borderBottomColor: '#E0E0E0',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333333',
    },
    scrollContent: {
        padding: 20,
    },
    formContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    inputContainer: {
        width: '48%',
        marginBottom: 20,
    },
    leftInput: {
        marginRight: '2%',
    },
    rightInput: {
        marginLeft: '2%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        borderColor: '#CCCCCC',
        borderWidth: 1,
        padding: 12,
        fontSize: 16,
        color: '#333333',
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 1 },
        // shadowOpacity: 0.1,
        // shadowRadius: 1,
        // elevation: 2,
    },
    pickerContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        borderColor: '#CCCCCC',
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
    },
    picker: {
        height: 50,
        width: '100%',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        borderRadius: 4,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginRight: 10,
    },
    asyncDataContainer: {
        marginTop: 30,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    asyncDataTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333333',
        marginBottom: 15,
    },
    asyncDataRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    asyncDataText: {
        fontSize: 16,
        color: '#555555',
        marginLeft: 15,
    },
});

export default User;