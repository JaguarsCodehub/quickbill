import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    valueKey
}: {
    items: any[],
    onSelect: (item: any) => void,
    placeholder: string,
    labelKey: string,
    valueKey: string
}) => {
    const [query, setQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const filteredItems = items.filter((item) =>
        (item[labelKey] && item[labelKey].toString().toLowerCase().includes(query.toLowerCase())) ||
        (item[valueKey] && item[valueKey].toString().toLowerCase().includes(query.toLowerCase()))
    );

    return (
        <View style={styles.pickerContainer}>
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
                            <Text>{item[labelKey]} - {item[valueKey]}</Text>
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
    const [nextSerial, setNextSerial] = useState<string>('');
    const [currentDate, setCurrentDate] = useState<string>('');
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [quantity, setQuantity] = useState<string>('1');

    useEffect(() => {
        fetchCustomers();
        fetchItems();
        setCurrentDate(new Date().toISOString().split('T')[0]); // Set current date
    }, []);

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
        }
    };

    const calculateItemValues = () => {
        if (!selectedItem) return null;

        const qty = parseFloat(quantity) || 0;
        const rate = parseFloat(selectedItem.SalRate.toString()) || 0;
        const value = qty * rate;
        const discPercent = 0; // You may want to add a state for this
        const discAmount = (value * discPercent) / 100;
        const taxable = value - discAmount;
        const taxRate = 0.18; // Assuming 18% tax, you may want to fetch this from the server
        const taxAmount = taxable * taxRate;
        const totalAmount = taxable + taxAmount;

        return {
            HSN: selectedItem.HSNCode || 'N/A',
            Qty: qty.toFixed(2),
            Rate: rate.toFixed(2),
            Value: value.toFixed(2),
            'Disc(%)': discPercent.toFixed(2),
            Taxable: taxable.toFixed(2),
            TaxCode: selectedItem.TaxCode || 'N/A',
            TaxAmt: taxAmount.toFixed(2),
            Amount: totalAmount.toFixed(2),
        };
    };

    const itemValues = calculateItemValues();

    return (
        <ScrollView style={styles.container} nestedScrollEnabled={true}>
            <Text style={styles.title}>Sales Order Entry</Text>

            <View style={styles.headerInfo}>
                <Text style={styles.headerText}>Date: {currentDate}</Text>
                <Text style={styles.headerText}>Doc No: {nextSerial}</Text>
            </View>

            <Text style={styles.sectionTitle}>Select Customer</Text>
            <SearchablePicker
                items={customers}
                onSelect={setSelectedCustomer}
                placeholder="Search and select a customer..."
                labelKey="CustomerName"
                valueKey="CustomerID"
            />
            {selectedCustomer && (
                <Text style={styles.selectedCustomer}>
                    Selected: {selectedCustomer.CustomerName}
                </Text>
            )}

            <Text style={styles.sectionTitle}>Select Item</Text>
            <SearchablePicker
                items={items}
                onSelect={setSelectedItem}
                placeholder="Search and select an item..."
                labelKey="ItemName"
                valueKey="ItemCode"
            />
            {selectedItem && (
                <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{selectedItem.ItemName}</Text>
                    <Text style={styles.itemCode}>Code: {selectedItem.ItemCode}</Text>
                    <TextInput
                        style={styles.quantityInput}
                        placeholder="Quantity"
                        value={quantity}
                        onChangeText={setQuantity}
                        keyboardType="numeric"
                    />
                    {itemValues && (
                        <View style={styles.itemValuesContainer}>
                            {Object.entries(itemValues).map(([key, value]) => (
                                <View key={key} style={styles.itemValue}>
                                    <Text style={styles.itemValueLabel}>{key}:</Text>
                                    <Text style={styles.itemValueText}>{value}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            )}
        </ScrollView>
    );
};

export default CreateOrder;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    pickerContainer: {
        marginBottom: 20,
    },
    searchInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        paddingHorizontal: 10,
    },
    dropdown: {
        maxHeight: 200,
        borderColor: 'gray',
        borderWidth: 1,
        borderTopWidth: 0,
    },
    dropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectedCustomer: {
        marginTop: 10,
        fontSize: 16,
    },
    headerInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    itemContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 10,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemCode: {
        fontSize: 14,
        color: '#666',
    },
    itemPrice: {
        fontSize: 14,
        color: '#333',
    },
    itemDetails: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
    },
    quantityInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginTop: 10,
        paddingHorizontal: 10,
    },
    itemValuesContainer: {
        marginTop: 10,
        paddingBottom: 100,
    },
    itemValue: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    itemValueLabel: {
        fontWeight: 'bold',
    },
    itemValueText: {
        marginLeft: 10,
    },
});