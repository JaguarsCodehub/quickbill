import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { Table, Row } from 'react-native-table-component';
import { useRouter } from 'expo-router';

interface Customer {
    CustomerID: number;
    CustomerName: string;
    Code: string;
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

interface OrderItem extends Item {
    UTGSTTaxCode: any;
    IGSTTaxCode: any;
    GSTTaxCode: any;
    TaxCategory: any;
    Qty: number;
    Rate: number;
    Value: number;
    Disc: number;
    Taxable: number;
    TaxAmt: number;
    Amount: number;
}

interface OrderItemSubmit {
    ItemID: string;
    ItemCode: string;
    ItemName: string;
    HSNCode: string;
    TaxCategory: string;
    GSTTaxCode: string;
    IGSTTaxCode: string;
    UTGSTTaxCode: string;
    Qty: number;
    Rate: number;
    Value: number;
    Disc: number;
    Taxable: number;
    TaxAmt: number;
    Amount: number;
}

interface OrderSubmit {
    CustomerCode: string;
    Items: OrderItemSubmit[];
    // Add other order fields as needed
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
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const router = useRouter();

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
            // HSN: selectedItem.HSNCode || 'N/A',
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

    const addItemToOrder = () => {
        if (!selectedItem) return;

        const newItem: OrderItem = {
            ...selectedItem,
            Qty: parseFloat(quantity),
            Rate: parseFloat(rate),
            Value: parseFloat(value),
            Disc: 0, // You may want to add a discount input field
            Taxable: parseFloat(itemValues?.Taxable || '0'),
            TaxAmt: parseFloat(itemValues?.TaxAmt || '0'),
            Amount: parseFloat(itemValues?.Amount || '0'),
            UTGSTTaxCode: undefined,
            IGSTTaxCode: undefined,
            GSTTaxCode: undefined,
            TaxCategory: undefined
        };

        setOrderItems([...orderItems, newItem]);

        // Reset item selection
        setSelectedItem(null);
        setQuantity('1');
        setRate('');
        setValue('');
    };

    const removeItemFromOrder = (index: number) => {
        const newOrderItems = [...orderItems];
        newOrderItems.splice(index, 1);
        setOrderItems(newOrderItems);
    };

    const calculateOrderSummary = () => {
        let totalValueAmount = 0;
        let totalDiscountAmount = 0;
        let totalTaxableAmount = 0;
        let totalCGSTAmount = 0;
        let totalSGSTAmount = 0;
        let totalIGSTAmount = 0;
        let totalTaxAmount = 0;
        let totalAmount = 0;
        let totalGoodsQty = 0;
        let totalServicesQty = 0;

        orderItems.forEach(item => {
            totalValueAmount += item.Value;
            totalDiscountAmount += item.Disc;
            totalTaxableAmount += item.Taxable;
            // Assuming CGST and SGST are half of the total tax each
            totalCGSTAmount += item.TaxAmt / 2;
            totalSGSTAmount += item.TaxAmt / 2;
            totalTaxAmount += item.TaxAmt;
            totalAmount += item.Amount;
            // Assuming all items are goods for this example
            totalGoodsQty += item.Qty;
        });

        return {
            totalValueAmount,
            totalDiscountAmount,
            totalTaxableAmount,
            totalCGSTAmount,
            totalSGSTAmount,
            totalIGSTAmount,
            totalTaxAmount,
            totalAmount,
            totalGoodsQty,
            totalServicesQty
        };
    };

    const handleSubmit = async () => {
        if (!selectedCustomer || orderItems.length === 0) {
            Alert.alert('Error', 'Please select a customer and add at least one item to the order.');
            return;
        }

        const orderSubmit: OrderSubmit = {
            CustomerCode: selectedCustomer.Code,
            Items: orderItems.map(item => ({
                ItemID: String(item.ItemID),
                ItemCode: item.ItemCode,
                ItemName: item.ItemName,
                HSNCode: item.HSNCode,
                TaxCategory: item.TaxCategory,
                GSTTaxCode: item.GSTTaxCode,
                IGSTTaxCode: item.IGSTTaxCode,
                UTGSTTaxCode: item.UTGSTTaxCode,
                Qty: item.Qty,
                Rate: item.Rate,
                Value: item.Value,
                Disc: item.Disc,
                Taxable: item.Taxable,
                TaxAmt: item.TaxAmt,
                Amount: item.Amount,
            })),
            // Add other order fields as needed
        };

        try {
            // const response = await fetch('YOUR_API_ENDPOINT_HERE', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(orderSubmit),
            // });

            // if (!response.ok) {
            //     throw new Error('Failed to submit order');
            // }

            console.log("Submitted Order", orderSubmit);

            Alert.alert('Success', 'Order submitted successfully!');
            // router.push('/orders'); // Navigate to orders page or wherever appropriate
        } catch (error) {
            console.error('Error submitting order:', error);
            Alert.alert('Error', 'Failed to submit order. Please try again.');
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

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Order Items</Text>
                    {orderItems.length > 0 ? (
                        <View style={styles.tableContainer}>
                            <Table borderStyle={{ borderWidth: 1, borderColor: '#E5E5EA' }}>
                                <Row
                                    data={['Item Name', 'Qty', 'Rate', 'Amount', 'Action']}
                                    style={styles.tableHeader}
                                    textStyle={styles.tableHeaderText}
                                />
                                {orderItems.map((item, index) => (
                                    <Row
                                        key={index}
                                        data={[
                                            item.ItemName,
                                            item.Qty.toString(),
                                            item.Rate.toFixed(2),
                                            item.Amount.toFixed(2),
                                            <TouchableOpacity onPress={() => removeItemFromOrder(index)}>
                                                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                                            </TouchableOpacity>
                                        ]}
                                        style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}
                                        textStyle={styles.tableRowText}
                                    />
                                ))}
                            </Table>
                        </View>
                    ) : (
                        <Text style={styles.noItemsText}>No items added to the order yet.</Text>
                    )}
                </View>

                <TouchableOpacity style={styles.addButton} onPress={addItemToOrder}>
                    <Ionicons name="add" size={24} color="white" />
                    <Text style={styles.addButtonText}>Add to Order</Text>
                </TouchableOpacity>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    {/* <View style={styles.summaryHeader}>
                        <Text style={styles.summaryHeaderText}>Summary Goods Total Qty: {calculateOrderSummary().totalGoodsQty.toFixed(2)}</Text>
                        <Text style={styles.summaryHeaderText}>Services Total Qty: {calculateOrderSummary().totalServicesQty.toFixed(2)}</Text>
                    </View> */}
                    <View style={styles.summaryTable}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Value Amount</Text>
                            <Text style={styles.summaryValue}>{calculateOrderSummary().totalValueAmount.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Discount Amount</Text>
                            <Text style={styles.summaryValue}>{calculateOrderSummary().totalDiscountAmount.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Taxable Amount</Text>
                            <Text style={styles.summaryValue}>{calculateOrderSummary().totalTaxableAmount.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total CGST Amount</Text>
                            <Text style={styles.summaryValue}>{calculateOrderSummary().totalCGSTAmount.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total SGST Amount</Text>
                            <Text style={styles.summaryValue}>{calculateOrderSummary().totalSGSTAmount.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total IGST Amount</Text>
                            <Text style={styles.summaryValue}>{calculateOrderSummary().totalIGSTAmount.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Tax Amount</Text>
                            <Text style={styles.summaryValue}>{calculateOrderSummary().totalTaxAmount.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Round Off</Text>
                            <Text style={styles.summaryValue}>0.00</Text>
                        </View>
                    </View>
                    <View style={styles.totalAmountRow}>
                        <Text style={styles.totalAmountLabel}>Total Amount</Text>
                        <Text style={styles.totalAmountValue}>{calculateOrderSummary().totalAmount.toFixed(2)}</Text>
                    </View>

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Submit Order</Text>
                    </TouchableOpacity>
                </View>


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
    tableContainer: {
        marginTop: 10,
        marginBottom: 10,
    },
    tableHeader: {
        height: 50,
        backgroundColor: '#F2F2F7',
    },
    tableHeaderText: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16,
        color: '#007AFF',
    },
    tableRowEven: {
        height: 60,
        backgroundColor: '#FFFFFF',
    },
    tableRowOdd: {
        height: 60,
        backgroundColor: '#F8F8F8',
    },
    tableRowText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#000000',
        paddingHorizontal: 5,
    },
    noItemsText: {
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 20,
        fontSize: 16,
        color: '#8E8E93',
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryHeaderText: {
        fontSize: 14,
        color: '#007AFF',
    },
    summaryTable: {
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#000',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    totalAmountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        paddingTop: 8,
        borderTopWidth: 2,
        borderTopColor: '#000',
    },
    totalAmountLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    totalAmountValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
    },
});