import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, FlatList, Modal, KeyboardAvoidingView, TouchableWithoutFeedback, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// import SearchablePicker from '../../components/SearchablePicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchablePicker from '@/components/SearchablePicker';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Customer {
    CustomerID: string;
    CustomerName: string;
    Code: string;
}

interface Bill {
    SRL: string;
    Date: string;
    Prefix: string;
    BillNo: string;
    Amount: number;
    Balance: number;
    ReceivedBill: string;
    MainType: string;
    SubType: string;
    Type: string;
    Sno: number;
}

const CreateReceipt = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modeType, setModeType] = useState<'BANK' | 'CASH' | null>(null);
    const [selectedParty, setSelectedParty] = useState<Customer | null>(null);
    const [customerCode, setCustomerCode] = useState<string>('');
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [amount, setAmount] = useState('');
    const [chequeDate, setChequeDate] = useState(new Date());
    const [refNo, setRefNo] = useState('');
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [cashAccounts, setCashAccounts] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);

    const [showDatePicker, setShowDatePicker] = useState(false);

    const [bills, setBills] = useState<Bill[]>([]);
    const [isLoadingBills, setIsLoadingBills] = useState(false);

    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [adjustedAmount, setAdjustedAmount] = useState('');
    const [adjustedBills, setAdjustedBills] = useState<{
        billNo: string;
        originalAmount: number;
        adjustedAmount: number;
    }[]>([]);

    const fetchCashAccounts = async () => {
        try {
            const userId = await AsyncStorage.getItem('UserID');
            const response = await axios.get('https://quickbill-backlend.vercel.app/api/accounts/cash', {
                headers: {
                    'UserID': userId,
                }
            });
            setCashAccounts(response.data);
        } catch (error) {
            console.error('Error fetching cash accounts:', error);
            Alert.alert('Error', 'Failed to fetch cash accounts.');
        }
    }

    const fetchBankAccounts = async () => {
        try {
            const userId = await AsyncStorage.getItem('UserID');
            const response = await axios.get('https://quickbill-backlend.vercel.app/api/accounts/bank', {
                headers: {
                    'UserID': userId,
                }
            });
            setBankAccounts(response.data);
        } catch (error) {
            console.error('Error fetching bank accounts:', error);
            Alert.alert('Error', 'Failed to fetch bank accounts.');
        }
    }

    const handleModeChange = (mode: 'BANK' | 'CASH') => {
        setModeType(mode);
        if (mode === 'CASH') {
            fetchCashAccounts();
        } else if (mode === 'BANK') {
            fetchBankAccounts();
        }
    };

    // Mock data for accounts
    // const allAccounts = [
    //     { AccountID: '1', AccountName: 'IDBI BANK' },
    //     { AccountID: '2', AccountName: 'HDFC BANK' },
    //     { AccountID: '3', AccountName: 'CASH ON HAND' },
    // ];

    useEffect(() => {
        fetchCustomers();
    }, []);

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
            Alert.alert('Error', 'Failed to fetch customers.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCustomerSelect = async (customer: Customer) => {
        setSelectedParty(customer);
        setCustomerCode(customer.Code);
        console.log("Inside Handle Customer Select Customer Code:", customer.Code)
        const customerCode = await AsyncStorage.setItem('CustomerCode', customer.Code);
        const asyncCustomerCode = await AsyncStorage.getItem('CustomerCode');
        console.log("AsyncStorage Customer Code:", asyncCustomerCode)
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        // Add your submit logic here
        Alert.alert('Partial Submit', 'Feature Under Development!');
        console.log(selectedParty, selectedAccount, amount, chequeDate, refNo);
        setTimeout(() => setIsSubmitting(false), 2000);
    };

    const paymentTypes = [
        { id: '1', name: 'CHEQUE' },
        { id: '2', name: 'UPI' },
        { id: '3', name: 'IMPS' },
        { id: '4', name: 'RTGS' },
        { id: '5', name: 'TRANSFER' },
    ];

    const handleDateChange = (event: any, selectedDate: Date | undefined) => {
        const currentDate = selectedDate || chequeDate;
        setShowDatePicker(false);
        setChequeDate(currentDate);
    };

    const fetchBills = async () => {
        setIsLoadingBills(true);
        try {
            const userId = await AsyncStorage.getItem('UserID');
            const prefix = await AsyncStorage.getItem('SelectedYear');
            const companyId = await AsyncStorage.getItem('CompanyID');
            const customerCode = await AsyncStorage.getItem('CustomerCode');

            // Debug logs
            console.log("Headers being sent:", {
                UserID: userId,
                CompanyID: companyId,
                Code: customerCode,
                Prefix: prefix,
            });

            // Check if all required headers are present
            if (!userId || !companyId || !customerCode || !prefix) {
                Alert.alert('Error', 'Missing required data. Please ensure all fields are filled.');
                return;
            }

            const response = await axios.get('https://quickbill-backlend.vercel.app/api/bills', {
                headers: {
                    'UserID': userId,
                    'CompanyID': companyId,
                    'Code': customerCode,
                    'Prefix': prefix,
                }
            });
            setBills(response.data);
            console.log("Bills:", response.data);
        } catch (error) {
            console.error('Error fetching bills:', error);
            // More detailed error message
            if (axios.isAxiosError(error)) {
                Alert.alert('Error', error.response?.data?.error || 'Failed to fetch bills');
            } else {
                Alert.alert('Error', 'Failed to fetch bills');
            }
        } finally {
            setIsLoadingBills(false);
        }
    };

    const BillCard = ({ item }: { item: Bill }) => (
        <TouchableOpacity
            style={styles.billCard}
            onPress={() => {
                setSelectedBill(item);
                setIsModalVisible(true);
            }}
        >
            <View style={styles.billCardHeader}>
                <View style={styles.billTypeContainer}>
                    <Text style={styles.billType}>{item.Type}</Text>
                </View>
                <View style={styles.statusContainer}>
                    <Text style={styles.statusText}>Pending</Text>
                </View>
            </View>

            <View style={styles.billCardBody}>
                <View style={styles.billInfoRow}>
                    <View style={styles.billInfo}>
                        <Text style={styles.billInfoLabel}>Amount</Text>
                        <Text style={styles.billAmount}>₹{item.Amount.toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2
                        })}</Text>
                    </View>

                    <View style={styles.billInfo}>
                        <Text style={styles.billInfoLabel}>Doc No.</Text>
                        <Text style={styles.billNumber}>#{item.BillNo}</Text>
                    </View>

                    <View style={styles.billInfo}>
                        <Text style={styles.billInfoLabel}>Date</Text>
                        <Text style={styles.billDate}>{item.Date}</Text>
                    </View>
                </View>

                <View style={styles.balanceContainer}>
                    <Text style={styles.balanceLabel}>Balance</Text>
                    <Text style={styles.balanceAmount}>₹{item.Balance.toLocaleString('en-IN', {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2
                    })}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const BillAdjustmentModal = () => {
        if (!selectedBill) return null;

        const handleAdjustment = () => {
            const amount = parseFloat(adjustedAmount);
            if (isNaN(amount) || amount <= 0 || amount > selectedBill.Balance) {
                Alert.alert('Invalid Amount', 'Please enter a valid amount not exceeding the balance.');
                return;
            }

            setAdjustedBills(prev => [...prev, {
                billNo: selectedBill.BillNo,
                originalAmount: selectedBill.Balance,
                adjustedAmount: amount
            }]);

            setIsModalVisible(false);
            setAdjustedAmount('');
            setSelectedBill(null);
        };

        return (
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <TouchableWithoutFeedback>
                    <View style={styles.modalOverlay}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            style={{ flex: 1, justifyContent: 'center' }}
                        >
                            <TouchableWithoutFeedback>
                                <View style={styles.modalContent}>
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>Adjust Bill Amount</Text>
                                        <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                            <Ionicons name="close" size={24} color="#666" />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.modalBody}>
                                        <View style={styles.modalInfo}>
                                            <Text style={styles.modalLabel}>Bill No:</Text>
                                            <Text style={styles.modalValue}>#{selectedBill.BillNo}</Text>
                                        </View>
                                        <View style={styles.modalInfo}>
                                            <Text style={styles.modalLabel}>Balance:</Text>
                                            <Text style={styles.modalValue}>₹{selectedBill.Balance.toLocaleString('en-IN')}</Text>
                                        </View>

                                        <View style={styles.inputContainer}>
                                            <Text style={styles.inputLabel}>Enter Amount</Text>
                                            <TextInput
                                                style={styles.amountInput}
                                                value={adjustedAmount}
                                                onChangeText={setAdjustedAmount}
                                                keyboardType="numeric"
                                                placeholder="Enter amount to adjust"
                                                placeholderTextColor="#999"
                                                autoFocus={true}
                                            />
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.adjustButton}
                                        onPress={handleAdjustment}
                                    >
                                        <Text style={styles.adjustButtonText}>Add Adjustment</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        );
    };

    const BillSummary = () => {
        const totalOutstanding = bills.reduce((sum, bill) => sum + bill.Balance, 0);
        const totalAdjustedAmount = adjustedBills.reduce((sum, bill) => sum + bill.adjustedAmount, 0);
        const remainingAmount = totalOutstanding - totalAdjustedAmount;

        return (
            <View style={styles.summaryContainer}>
                <View style={styles.summaryHeader}>
                    <View>
                        <Text style={styles.summaryTitle}>Bill Summary</Text>
                        <Text style={styles.summaryDate}>
                            {new Date().toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </Text>
                    </View>
                    <View style={styles.summaryBadge}>
                        <Text style={styles.summaryBadgeText}>{bills.length} Bills</Text>
                    </View>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryDetails}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Outstanding</Text>
                        <Text style={styles.summaryValue}>₹{totalOutstanding.toLocaleString('en-IN')}</Text>
                    </View>

                    {adjustedBills.length > 0 && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Adjusted</Text>
                            <Text style={[styles.summaryValue, { color: '#4e41a8' }]}>
                                ₹{totalAdjustedAmount.toLocaleString('en-IN')}
                            </Text>
                        </View>
                    )}

                    <View style={styles.summaryDivider} />

                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>
                            {adjustedBills.length > 0 ? 'Remaining Balance' : 'Total Amount'}
                        </Text>
                        <Text style={styles.totalValue}>
                            ₹{(adjustedBills.length > 0 ? remainingAmount : totalOutstanding).toLocaleString('en-IN')}
                        </Text>
                    </View>
                </View>

                {adjustedBills.length > 0 && (
                    <View style={styles.adjustmentsSection}>
                        <Text style={styles.adjustmentsTitle}>Adjusted Bills</Text>
                        {adjustedBills.map((bill, index) => (
                            <View key={index} style={styles.adjustmentItem}>
                                <Text style={styles.adjustmentBillNo}>#{bill.billNo}</Text>
                                <Text style={styles.adjustmentAmount}>
                                    ₹{bill.adjustedAmount.toLocaleString('en-IN')}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient colors={['#cfd9df', '#e2ebf0']} style={styles.gradient}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={styles.title}>New Receipt</Text>
                        <Ionicons name="receipt-outline" size={24} color="#4e41a8" />
                    </View>

                    {isLoading ? (
                        <ActivityIndicator size="large" color="#4e41a8" />
                    ) : (
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Party Details</Text>
                            <SearchablePicker
                                items={customers}
                                onSelect={handleCustomerSelect}
                                placeholder="Search parties..."
                                labelKey="CustomerName"
                                valueKey="CustomerID"
                                icon="person-outline"
                                selectedItem={selectedParty}
                            />
                            {selectedParty && (
                                <View style={styles.selectedInfo}>
                                    <Ionicons name="checkmark-circle" size={24} color="#00c06c" />
                                    <Text style={styles.selectedInfoText}>
                                        {selectedParty?.CustomerName}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.modeTypeContainer}>
                                <Text style={styles.sectionTitle}>Mode Type</Text>
                                <View style={styles.modeTypeButtons}>
                                    <TouchableOpacity
                                        style={[
                                            styles.modeTypeButton,
                                            modeType === 'BANK' && styles.modeTypeButtonActive
                                        ]}
                                        onPress={() => handleModeChange('BANK')} // Update to use new function
                                    >
                                        <Text style={[
                                            styles.modeTypeButtonText,
                                            modeType === 'BANK' && styles.modeTypeButtonTextActive
                                        ]}>Bank</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.modeTypeButton,
                                            modeType === 'CASH' && styles.modeTypeButtonActive
                                        ]}
                                        onPress={() => handleModeChange('CASH')} // Update to use new function
                                    >
                                        <Text style={[
                                            styles.modeTypeButtonText,
                                            modeType === 'CASH' && styles.modeTypeButtonTextActive
                                        ]}>Cash</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {modeType && (
                                <>
                                    <Text style={styles.sectionTitle}>Account</Text>
                                    <SearchablePicker
                                        items={modeType === 'BANK' ? bankAccounts : cashAccounts}
                                        onSelect={setSelectedAccount}
                                        placeholder="Select account..."
                                        labelKey="CustomerName"
                                        valueKey="CustomerID"
                                        icon="wallet-outline"
                                        selectedItem={selectedAccount}
                                    />

                                    {modeType === 'BANK' && (
                                        <>
                                            <Text style={styles.sectionTitle}>Payment Type</Text>
                                            <SearchablePicker
                                                items={paymentTypes}
                                                onSelect={() => { }}
                                                placeholder="Select payment type..."
                                                labelKey="name"
                                                valueKey="id"
                                                icon="card-outline"
                                                selectedItem={null}
                                            />

                                            {/* <View style={styles.inputSection}>
                                                <Text style={styles.inputLabel}>Reference No.</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    value={refNo}
                                                    onChangeText={setRefNo}
                                                    placeholder="Enter reference number"
                                                    placeholderTextColor="#888888"
                                                />
                                            </View> */}

                                            <View style={styles.inputSection}>
                                                <Text style={styles.inputLabel}>Cheque Date</Text>
                                                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                                                    <Text style={styles.datePickerButtonText}>{chequeDate.toLocaleDateString()}</Text>
                                                </TouchableOpacity>
                                                {showDatePicker && (
                                                    <DateTimePicker
                                                        value={chequeDate}
                                                        mode="date"
                                                        display="default"
                                                        onChange={handleDateChange}
                                                    />
                                                )}
                                            </View>
                                        </>
                                    )}

                                    {/* <View style={styles.inputSection}>
                                        <Text style={styles.inputLabel}>Amount</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={amount}
                                            onChangeText={setAmount}
                                            placeholder="Enter amount"
                                            placeholderTextColor="#888888"
                                            keyboardType="numeric"
                                        />
                                    </View> */}
                                </>
                            )}

                            {selectedParty && (
                                <View style={styles.billsSection}>
                                    <TouchableOpacity
                                        style={styles.viewBillsButton}
                                        onPress={fetchBills}
                                        disabled={isLoadingBills}
                                    >
                                        {isLoadingBills ? (
                                            <ActivityIndicator size="small" color="#FFFFFF" />
                                        ) : (
                                            <>
                                                <Ionicons name="document-text-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                                                <Text style={styles.viewBillsButtonText}>View Outstanding Bills</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>

                                    {bills.length > 0 && (
                                        <View style={styles.billsContainer}>
                                            <View style={styles.billsHeader}>
                                                <Text style={styles.billsHeaderTitle}>Outstanding Bills</Text>
                                                <View style={styles.billsCountBadge}>
                                                    <Text style={styles.billsCount}>{bills.length}</Text>
                                                </View>
                                            </View>

                                            <FlatList
                                                data={bills}
                                                renderItem={({ item }) => <BillCard item={item} />}
                                                keyExtractor={(item) => item.SRL}
                                                contentContainerStyle={styles.billsList}
                                                showsVerticalScrollIndicator={false}
                                            />

                                            <BillSummary />
                                        </View>
                                    )}

                                    <BillAdjustmentModal />
                                </View>
                            )}
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#0a0a0a" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit Receipt</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

export default CreateReceipt;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC',
    },
    gradient: {
        flex: 1,
        padding: 15,
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
        color: '#333333',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333333',
        marginTop: 15,
        marginBottom: 12,
    },
    selectedInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    selectedInfoText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#00c06c',
        marginLeft: 8,
    },
    modeTypeContainer: {
        marginTop: 15,
    },
    modeTypeButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    modeTypeButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f1f1f1',
        alignItems: 'center',
    },
    modeTypeButtonActive: {
        backgroundColor: '#4e41a8',
    },
    modeTypeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666666',
    },
    modeTypeButtonTextActive: {
        color: '#FFFFFF',
    },
    inputSection: {
        marginTop: 15,
    },
    // inputLabel: {
    //     fontSize: 16,
    //     fontWeight: '600',
    //     color: '#333333',
    //     marginBottom: 8,
    // },
    input: {
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333333',
    },
    submitButton: {
        backgroundColor: '#4e41a8',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    datePickerButton: {
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    datePickerButtonText: {
        fontSize: 16,
        color: '#333333',
    },
    billsSection: {
        marginTop: 20,
        marginBottom: 20,
    },
    billsContainer: {
        marginTop: 15,
    },
    billsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    billsHeaderTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
    },
    billsCountBadge: {
        backgroundColor: '#4e41a8',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 8,
    },
    billsCount: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '500',
    },
    billsList: {
        gap: 10,
    },
    billCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e8e8e8',
        marginBottom: 12,
    },
    billCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    billTypeContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 3,
    },
    billType: {
        fontSize: 11,
        fontWeight: '500',
        color: '#666666',
    },
    statusContainer: {
        backgroundColor: '#fff3e0',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 3,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#f57c00',
    },
    billCardBody: {
        gap: 10,
    },
    billInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    billInfo: {
        flex: 1,
    },
    billInfoLabel: {
        fontSize: 13,
        color: '#666666',
        marginBottom: 4,
    },
    billAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
    },
    billNumber: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333333',
    },
    billDate: {
        fontSize: 16,
        color: '#333333',
    },
    balanceContainer: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: 16,
        color: '#666666',
    },
    balanceAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#13b84f',
    },
    viewBillsButton: {
        backgroundColor: '#4e41a8',
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        marginRight: 8,
    },
    viewBillsButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    modalBody: {
        gap: 16,
    },
    modalInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalLabel: {
        fontSize: 14,
        color: '#666',
    },
    modalValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    inputContainer: {
        marginTop: 8,
    },
    inputLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    amountInput: {
        borderWidth: 1,
        borderColor: '#e8e8e8',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
    },
    adjustButton: {
        backgroundColor: '#4e41a8',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    adjustButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    summaryContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#e8e8e8',
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333333',
    },
    summaryDate: {
        fontSize: 14,
        color: '#666666',
        marginTop: 4,
    },
    summaryBadge: {
        backgroundColor: '#4e41a8',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    summaryBadgeText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#e8e8e8',
        marginVertical: 16,
    },
    summaryDetails: {
        gap: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 15,
        color: '#666666',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
    },
    totalRow: {
        marginTop: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#e53e3e',
    },
    adjustmentsSection: {
        marginTop: 20,
        gap: 8,
    },
    adjustmentsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666666',
        marginBottom: 4,
    },
    adjustmentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 10,
        borderRadius: 8,
    },
    adjustmentBillNo: {
        fontSize: 14,
        color: '#666666',
    },
    adjustmentAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4e41a8',
    },
});

