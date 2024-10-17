import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { Table, Row } from 'react-native-table-component';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

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
    srl: string;
    sNo: string;
    currName: string;
    currRate: number;
    docDate: string;
    itemCode: string;
    qty: number;
    rate: number;
    disc: number;
    amt: number;
    storeCode: string;
    narration: string;
    branchCode: string;
    unit: string;
    discAmt: number;
    mrp: number;
    newRate: number;
    taxCode: string;
    taxAmt: number;
    cessAmt: number;
    taxable: number;
    barcodeValue: string;
    cgst: number;
    sgst: number;
    igst: number;
    utgst: number;
    pnding: number;
    delivaryDate: string;
}

interface OrderSubmit {
    docNo: string;
    docDate: string;
    orderNo: string;
    orderDate: string;
    pageNo: string;
    partyCode: string;
    billAmt: number;
    totalQty: number;
    netAmt: number;
    taxAmt: number;
    discAmt: number;
    mainType: string;
    subType: string;
    type: string;
    prefix: string;
    narration: string;
    userId: string;
    companyId: string;
    createdBy: string;
    modifiedBy: string;
    partyName: string;
    selection: string;
    productName: string;
    discPer: number;
    cgst: number;
    sgst: number;
    igst: number;
    utgst: number;
    rate: number;
    totalAmt: number;
    addCode: string;
    items: OrderItemSubmit[];
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
                <Ionicons name={icon as any} size={24} color="#4CAF50" style={styles.inputIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={placeholder}
                    placeholderTextColor="#808080"
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
            const response = await axios.get('https://quickbill-backlend.vercel.app/customers', {
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

            const response = await axios.get('https://quickbill-backlend.vercel.app/items', {
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

        const summary = calculateOrderSummary();
        console.log('Order summary:', summary);
        const userId = await AsyncStorage.getItem('UserID');
        const companyId = await AsyncStorage.getItem('CompanyID');
        const prefix = await AsyncStorage.getItem('SelectedYear');

        const orderSubmit: OrderSubmit = {
            docNo: nextSerial,
            docDate: currentDate,
            orderNo: `SOR/${nextSerial}`,
            orderDate: currentDate,
            pageNo: '',
            partyCode: selectedCustomer.Code,
            billAmt: summary.totalAmount,
            totalQty: summary.totalGoodsQty + summary.totalServicesQty,
            netAmt: summary.totalTaxableAmount,
            taxAmt: summary.totalTaxAmount,
            discAmt: summary.totalDiscountAmount,
            mainType: 'SL', // Adjust as needed
            subType: 'RS', // Adjust as needed
            type: 'SOR', // Adjust as needed
            prefix: await AsyncStorage.getItem('SelectedYear') || '',
            narration: '', // Add a narration field if needed
            userId: userId || '',
            companyId: companyId || '',
            createdBy: userId || '',
            modifiedBy: userId || '',
            partyName: selectedCustomer.CustomerName,
            selection: '', // Add a selection field if needed
            productName: '', // Add a productName field if needed
            discPer: 0, // Calculate discount percentage if needed
            cgst: summary.totalCGSTAmount,
            sgst: summary.totalSGSTAmount,
            igst: summary.totalIGSTAmount,
            utgst: 0, // Add UTGST if needed
            rate: 0, // Add an overall rate if needed
            addCode: '',
            totalAmt: summary.totalAmount,
            items: orderItems.map((item, index) => ({
                srl: nextSerial,
                sNo: '00001' + index,
                currName: item.HSNCode, // Adjust as needed
                currRate: 0, // Adjust as needed
                docDate: currentDate,
                itemCode: item.ItemCode,
                qty: item.Qty,
                rate: item.Rate,
                disc: item.Disc,
                amt: item.Amount,
                partyCode: selectedCustomer.Code,
                storeCode: '', // Add a storeCode if needed
                mainType: 'SL',
                subType: 'RS',
                type: 'SOR',
                prefix: prefix || '',
                narration: '', // Add a narration if needed
                branchCode: '', // Add a branchCode if needed
                unit: '', // Add a unit if needed
                discAmt: item.Disc,
                mrp: item.Rate, // Adjust if MRP is different from Rate
                newRate: item.Rate,
                taxCode: item.TaxCode || '',
                taxAmt: item.TaxAmt,
                cessAmt: 0, // Add cess amount if applicable
                taxable: item.Taxable,
                barcodeValue: '', // Add barcode value if available
                userId: userId || '',
                companyId: companyId || '',
                createdBy: userId || '',
                modifiedBy: userId || '',
                cgst: item.TaxAmt / 2, // Assuming equal split between CGST and SGST
                sgst: item.TaxAmt / 2,
                igst: 0, // Add IGST if applicable
                utgst: 0, // Add UTGST if applicable
                pnding: item.Qty, // Make sure this field is correctly set
                delivaryDate: currentDate // Make sure this field is correctly set
            }))
        };

        try {
            const response = await fetch('http://192.168.1.9:3000/api/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderSubmit),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to submit order');
            }

            Alert.alert('Success', 'Order submitted successfully!');
            // router.push('/orders'); // Navigate to orders page or wherever appropriate
        } catch (error: any) {
            console.error('Error submitting order:', error);
            Alert.alert('Error', `Failed to submit order. ${error.message}`);
        }
    };

    if (isLoading) {
        return (
            <LinearGradient colors={['#1a1a1a', '#0a0a0a']} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Loading order data...</Text>
            </LinearGradient>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient colors={['#1a1a1a', '#0a0a0a']} style={styles.gradient}>
                <ScrollView nestedScrollEnabled={true}>
                    <View style={styles.header}>
                        <Text style={styles.title}>New Order</Text>
                        <Ionicons name="cart" size={24} color="#4CAF50" />
                    </View>

                    <View style={styles.card}>
                        <View style={styles.headerInfo}>
                            <View style={styles.headerItem}>
                                <Ionicons name="calendar-outline" size={24} color="#4CAF50" />
                                <Text style={styles.headerText}>Order Date:</Text>
                                <Text style={styles.headerValue}>{currentDate}</Text>
                            </View>
                            <View style={styles.headerItem}>
                                <Ionicons name="document-text-outline" size={24} color="#4CAF50" />
                                <Text style={styles.headerText}>DocNo:</Text>
                                <Text style={styles.headerValue}>{nextSerial}</Text>
                            </View>
                            <View style={styles.headerItem}>
                                <Ionicons name="document-text-outline" size={24} color="#4CAF50" />
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
                                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
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
                                            <Ionicons name="remove-circle-outline" size={24} color="#4CAF50" onPress={() => setQuantity((prev) => (Math.max(1, parseInt(prev) - 1)).toString())} />
                                            <TextInput
                                                style={styles.quantityInput}
                                                value={quantity}
                                                onChangeText={(text) => {
                                                    setQuantity(text);
                                                    setValue((parseFloat(text) * parseFloat(rate)).toFixed(2));
                                                }}
                                                keyboardType="numeric"
                                            />
                                            <Ionicons name="add-circle-outline" size={24} color="#4CAF50" onPress={() => setQuantity((prev) => (parseInt(prev) + 1).toString())} />
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

                    <TouchableOpacity style={styles.addButton} onPress={addItemToOrder}>
                        <Ionicons name="add" size={24} color="#0a0a0a" />
                        <Text style={styles.addButtonText}>Add to Order</Text>
                    </TouchableOpacity>

                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Order Items</Text>
                        {orderItems.length > 0 ? (
                            <View style={styles.tableContainer}>
                                <Table borderStyle={{ borderWidth: 0 }}>
                                    <Row
                                        data={['Item Name', 'Qty', 'Rate', 'Amount', 'Action']}
                                        style={styles.tableHeader}
                                        textStyle={styles.tableHeaderText}
                                    />
                                    {orderItems.map((item, index) => (
                                        <Row
                                            key={index}
                                            data={[
                                                <Text style={styles.itemNameText} numberOfLines={2} ellipsizeMode="tail">{item.ItemName}</Text>,
                                                <Text style={styles.tableRowText}>{item.Qty.toString()}</Text>,
                                                <Text style={styles.tableRowText}>{item.Rate.toFixed(2)}</Text>,
                                                <Text style={styles.tableRowText}>{item.Amount.toFixed(2)}</Text>,
                                                <TouchableOpacity onPress={() => removeItemFromOrder(index)} style={styles.deleteButton}>
                                                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                                                </TouchableOpacity>
                                            ]}
                                            style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}
                                        />
                                    ))}
                                </Table>
                            </View>
                        ) : (
                            <Text style={styles.noItemsText}>No items added to the order yet.</Text>
                        )}
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Order Summary</Text>
                        <View style={styles.summaryTable}>
                            {/* ... existing summary rows ... */}
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
            </LinearGradient>
        </SafeAreaView>
    );
};


export default CreateOrder;

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
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    headerInfo: {
        flexDirection: 'column',
    },
    headerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#e0e0e0',
        marginLeft: 8,
        marginRight: 4,
    },
    headerValue: {
        fontSize: 16,
        fontWeight: '400',
        color: '#e0e0e0',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#e0e0e0',
        marginBottom: 12,
    },
    pickerContainer: {
        marginBottom: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: '#e0e0e0',
    },
    dropdown: {
        maxHeight: 200,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#e0e0e0',
    },
    selectedInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    selectedInfoText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4CAF50',
        marginLeft: 8,
    },
    itemDetails: {
        marginTop: 12,
    },
    itemName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#e0e0e0',
    },
    itemCode: {
        fontSize: 14,
        color: '#808080',
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
        color: '#808080',
        marginBottom: 4,
    },
    input: {
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        paddingHorizontal: 8,
        fontSize: 16,
        color: '#e0e0e0',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        paddingHorizontal: 8,
    },
    quantityInput: {
        height: 40,
        width: 40,
        textAlign: 'center',
        fontSize: 16,
        color: '#e0e0e0',
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
        color: '#808080',
    },
    itemValueText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#e0e0e0',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
        borderRadius: 25,
        padding: 16,
        marginBottom: 20,
    },
    addButtonText: {
        color: '#0a0a0a',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#4CAF50',
    },
    tableContainer: {
        marginTop: 10,
        marginBottom: 10,
        borderRadius: 10,
        overflow: 'hidden',
    },
    tableHeader: {
        height: 50,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    tableHeaderText: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 14,
        color: '#4CAF50',
    },
    tableRowEven: {
        height: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    tableRowOdd: {
        height: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
    tableRowText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#e0e0e0',
    },
    itemNameText: {
        fontSize: 14,
        color: '#e0e0e0',
        paddingHorizontal: 5,
        flex: 1,
    },
    deleteButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
    },
    noItemsText: {
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 20,
        fontSize: 16,
        color: '#808080',
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 25,
        padding: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: '#0a0a0a',
        fontSize: 16,
        fontWeight: 'bold',
    },
    summaryTable: {
        marginTop: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#e0e0e0',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#e0e0e0',
    },
    totalAmountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    totalAmountLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4CAF50',
    },
    totalAmountValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4CAF50',
    },
});