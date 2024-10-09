import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';

interface Customer {
    CustomerID: number;
    CustomerName: string;
    // Add other fields as needed
}


interface Item {
    ItemID: number;
    ItemCode: string;
    ItemName: string;
    SalRate: number;
    HSNCode: string;
    TaxCode: string;
    // Add other fields as needed
}

const SearchablePicker = ({
    items,
    onSelect,
    placeholder,
    labelKey,
    valueKey,
    icon
}: {
    items: any[],
    onSelect: (item: any) => void,
    placeholder: string,
    labelKey: string,
    valueKey: string,
    icon: string
}) => {
    const [query, setQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const filteredItems = items.filter((item) =>
        (item[labelKey] && item[labelKey].toString().toLowerCase().includes(query.toLowerCase())) ||
        (item[valueKey] && item[valueKey].toString().toLowerCase().includes(query.toLowerCase()))
    );

    return (
        <View style={styles.pickerContainer}>
            <View style={styles.inputContainer}>
                <Ionicons name={icon as any} size={24} color="#007AFF" style={styles.inputIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={placeholder}
                    value={query}
                    onChangeText={(text) => {
                        setQuery(text);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                />
            </View>
            {showDropdown && (
                <FlatList
                    data={filteredItems}
                    keyExtractor={(item) => item[valueKey]?.toString() || item[labelKey]?.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => {
                                onSelect(item);
                                setQuery(item[labelKey]?.toString() || '');
                                setShowDropdown(false);
                            }}
                        >
                            <Text style={styles.dropdownItemText}>{item[labelKey]} - {item[valueKey]}</Text>
                        </TouchableOpacity>
                    )}
                    style={styles.dropdown}
                    nestedScrollEnabled={true}
                />
            )}
        </View>
    );
};

const CreateOrder = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [nextSerial, setNextSerial] = useState<string>('');
    const [currentDate, setCurrentDate] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('1');
    const [rate, setRate] = useState<string>('');
    const [value, setValue] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([fetchCustomers(), fetchItems()]);
            setCurrentDate(new Date().toISOString().split('T')[0]);
        } catch (error) {
            console.error('Error fetching data:', error);
            // You might want to show an error message to the user here
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const userId = await AsyncStorage.getItem('UserID');
            const response = await axios.get('http://192.168.1.9:3000/customers', {
                headers: {
                    'UserID': userId,
                }
            });
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
            throw error;
        }
    };

    const fetchItems = async () => {
        try {
            const userId = await AsyncStorage.getItem('UserID');
            const companyId = await AsyncStorage.getItem('CompanyID');
            const prefix = await AsyncStorage.getItem('SelectedYear');

            const response = await axios.get('http://192.168.1.9:3000/items', {
                headers: {
                    'UserID': userId,
                    'CompanyID': companyId,
                    'Prefix': prefix,
                }
            });
            setItems(response.data.items);
            setNextSerial(response.data.nextSerial);
        } catch (error) {
            console.error('Error fetching items:', error);
            throw error;
        }
    };

    const calculateItemValues = () => {
        if (!selectedItem) return null;

        const qty = parseFloat(quantity) || 0;
        const itemRate = parseFloat(rate) || parseFloat(selectedItem.SalRate.toString()) || 0;
        const itemValue = parseFloat(value) || (qty * itemRate);
        const discPercent = 0; // You may want to add a state for this
        const discAmount = (itemValue * discPercent) / 100;
        const taxable = itemValue - discAmount;
        const taxRate = 0.18; // Assuming 18% tax, you may want to fetch this from the server
        const taxAmount = taxable * taxRate;
        const totalAmount = taxable + taxAmount;

        return {
            HSN: selectedItem.HSNCode || 'N/A',
            Qty: qty.toFixed(2),
            Rate: itemRate.toFixed(2),
            Value: itemValue.toFixed(2),
            'Disc(%)': discPercent.toFixed(2),
            Taxable: taxable.toFixed(2),
            TaxCode: selectedItem.TaxCode || 'N/A',
            TaxAmt: taxAmount.toFixed(2),
            Amount: totalAmount.toFixed(2),
        };
    };

    const itemValues = calculateItemValues();

    const updateRate = (newRate: string) => {
        setRate(newRate);
        if (selectedItem) {
            const qty = parseFloat(quantity) || 0;
            const itemRate = parseFloat(newRate) || 0;
            setValue((qty * itemRate).toFixed(2));
        }
    };

    const updateValue = (newValue: string) => {
        setValue(newValue);
        if (selectedItem) {
            const qty = parseFloat(quantity) || 0;
            if (qty !== 0) {
                setRate((parseFloat(newValue) / qty).toFixed(2));
            }
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading order data...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerTitle: 'New Order' }} />
            <ScrollView nestedScrollEnabled={true}>
                <Text style={styles.title}>New Order</Text>

                <View style={styles.card}>
                    <View style={styles.headerInfo}>
                        <View style={styles.headerItem}>
                            <Ionicons name="calendar-outline" size={24} color="#007AFF" />
                            <Text style={styles.headerText}>Order Date:</Text>
                            <Text style={styles.headerValue}>{currentDate}</Text>
                        </View>
                        <View style={styles.headerItem}>
                            <Ionicons name="document-text-outline" size={24} color="#007AFF" />
                            <Text style={styles.headerText}>DocNo:</Text>
                            <Text style={styles.headerValue}>{nextSerial}</Text>
                        </View>
                        <View style={styles.headerItem}>
                            <Ionicons name="document-text-outline" size={24} color="#007AFF" />
                            <Text style={styles.headerText}>Order No:</Text>
                            <Text style={styles.headerValue}>SOR/{nextSerial}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Customer</Text>
                    <SearchablePicker
                        items={customers}
                        onSelect={setSelectedCustomer}
                        placeholder="Search customers..."
                        labelKey="CustomerName"
                        valueKey="CustomerID"
                        icon="person-outline"
                    />
                    {selectedCustomer && (
                        <View style={styles.selectedInfo}>
                            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                            <Text style={styles.selectedInfoText}>{selectedCustomer.CustomerName}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Item</Text>
                    <SearchablePicker
                        items={items}
                        onSelect={(item) => {
                            setSelectedItem(item);
                            setRate(item.SalRate.toString());
                            setValue((parseFloat(quantity) * item.SalRate).toFixed(2));
                        }}
                        placeholder="Search items..."
                        labelKey="ItemName"
                        valueKey="ItemCode"
                        icon="cube-outline"
                    />
                    {selectedItem && (
                        <View style={styles.itemDetails}>
                            <Text style={styles.itemName}>{selectedItem.ItemName}</Text>
                            <Text style={styles.itemCode}>Code: {selectedItem.ItemCode}</Text>
                            <View style={styles.inputRow}>
                                <View style={styles.boxinputContainer}>
                                    <Text style={styles.inputLabel}>Quantity</Text>
                                    <View style={styles.quantityContainer}>
                                        <Ionicons name="remove-circle-outline" size={24} color="#007AFF" onPress={() => setQuantity((prev) => (Math.max(1, parseInt(prev) - 1)).toString())} />
                                        <TextInput
                                            style={styles.quantityInput}
                                            value={quantity}
                                            onChangeText={(text) => {
                                                setQuantity(text);
                                                setValue((parseFloat(text) * parseFloat(rate)).toFixed(2));
                                            }}
                                            keyboardType="numeric"
                                        />
                                        <Ionicons name="add-circle-outline" size={24} color="#007AFF" onPress={() => setQuantity((prev) => (parseInt(prev) + 1).toString())} />
                                    </View>
                                </View>
                                <View style={styles.boxinputContainer}>
                                    <Text style={styles.inputLabel}>Rate</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={rate}
                                        onChangeText={updateRate}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={styles.boxinputContainer}>
                                    <Text style={styles.inputLabel}>Value</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={value}
                                        onChangeText={updateValue}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                            {itemValues && (
                                <View style={styles.itemValuesContainer}>
                                    {Object.entries(itemValues).map(([key, value]) => (
                                        <View key={key} style={styles.itemValue}>
                                            <Text style={styles.itemValueLabel}>{key}</Text>
                                            <Text style={styles.itemValueText}>{value}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}
                </View>

                <TouchableOpacity style={styles.addButton}>
                    <Ionicons name="add" size={24} color="white" />
                    <Text style={styles.addButtonText}>Add to Order</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default CreateOrder;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    title: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerInfo: {
        flexDirection: 'column',
    },
    headerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    headerText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
        marginLeft: 8,
        marginRight: 4,
    },
    headerValue: {
        fontSize: 16,
        fontWeight: '400',
        color: '#000',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
        marginBottom: 12,
    },
    pickerContainer: {
        marginBottom: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
    },
    dropdown: {
        maxHeight: 200,
        borderColor: '#E5E5EA',
        borderWidth: 1,
        borderTopWidth: 0,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#000',
    },
    selectedInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    selectedInfoText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#34C759',
        marginLeft: 8,
    },
    itemDetails: {
        marginTop: 12,
    },
    itemName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    itemCode: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 4,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    boxinputContainer: {
        flex: 1,
        marginHorizontal: 4,
    },
    inputLabel: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 4,
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 8,
        paddingHorizontal: 8,
        fontSize: 16,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    quantityInput: {
        height: 40,
        width: 40,
        textAlign: 'center',
        fontSize: 16,
    },
    itemValuesContainer: {
        marginTop: 16,
    },
    itemValue: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemValueLabel: {
        fontSize: 14,
        color: '#8E8E93',
    },
    itemValueText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 32,
    },
    addButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#007AFF',
    },
});