import React, { useRef, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Icon } from 'lucide-react-native';
import GridBackground from '@/components/GridBackground';
import RippleLoader from '@/components/RippleLoader';
import WebView from "react-native-webview";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import axios from 'axios';

// Define TypeScript interfaces
interface SalesData {
    SalesID: number;
    DocNo: string;
    DocDate: string;
    BillAmt: number;
    NetAmt: number;
    TaxAmt: number;
    PartyName: string;
    PartyCode: string;
    Status?: 'Completed' | 'Pending';
}

interface ChartData {
    value: number;
    color: string;
    text: string;
    label: string;
}

interface PerformanceViewProps {
    salesData: SalesData[];
}

// First, add this interface for the modal state
interface SelectedTransaction extends SalesData {
    // Add any additional fields you want to show in the modal
}

const TransactionList: React.FC<{ transactions: SalesData[] }> = ({ transactions }) => {
    const [showAll, setShowAll] = React.useState(false);
    const [selectedTransaction, setSelectedTransaction] = React.useState<SelectedTransaction | null>(null);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [invoiceData, setInvoiceData] = useState<any>(null);

    // Function to truncate PartyName
    const truncateName = (name: string, length: number) => {
        return name.length > length ? `${name.substring(0, length)}...` : name;
    };

    // Get the transactions to display
    const displayedTransactions = showAll ? transactions : transactions.slice(0, 5);

    const handleTransactionPress = async (transaction: SalesData) => {

        try {

            const userId = await AsyncStorage.getItem('UserID');
            const prefix = await AsyncStorage.getItem('SelectedYear');
            // Make the API call to the /sales-invoice endpoint
            const response = await axios.get('http://192.168.1.9:3000/api/sales-invoice', {
                headers: {
                    UserID: userId, // Pass UserID
                    DocNo: transaction.DocNo,
                    SRL: transaction.DocNo, // Replace with actual value
                    Type: 'SAL', // Replace with actual value
                    Prefix: prefix, // Replace with actual value
                    PartyCode: transaction.PartyCode, // Replace with actual value
                },
            });
            setInvoiceData(response.data[0]); // Set the fetched invoice data
            // console.log("Sales Invoice Data:", response.data)

        } catch (error) {
            console.error('Error fetching invoice data:', error);
        }

        setSelectedTransaction(transaction);
        setModalVisible(true);
    };

    console.log("Invoice Data from state:", invoiceData)

    const TransactionDetailsModal = () => {

        const webViewRef = useRef(null);
        const isCompleted = selectedTransaction?.Status === 'Completed';
        const generateHTMLContent = () => {
            return `
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                    th { background-color: #f4f4f4; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .total { text-align: right; font-weight: bold; margin-top: 20px; }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <h1>RAVIVA INFOTECH PVT LTD</h1>
                    <p>SHOP NO.16, SAI VIHAR CHWAL, DEVIPADA MAIN ROAD, MUMBAI 400066</p>
                    <p>Mobile: 7045599660, Email: ravivainfotech@gmail.com</p>
                  </div>
                  <h2>Invoice Details</h2>
                  <p><strong>Invoice No:</strong> ${selectedTransaction?.DocNo}</p>
                  <p><strong>Invoice Date:</strong> ${selectedTransaction?.DocDate}</p>
                  <p><strong>Party Name:</strong> ${selectedTransaction?.PartyName}</p>
                  <p><strong>Party Name:</strong> ${invoiceData?.ItemName}</p>
                  <table>
                    <thead>
                      <tr>
                        <th>Sr No</th>
                        <th>Name</th>
                        <th>HSN</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                  </table>
                  <p class="total">Total Amount: ₹${selectedTransaction?.BillAmt.toFixed(2)}</p>
                </body>
              </html>
            `;
        };

        const printPDF = async () => {
            try {



                const htmlContent = generateHTMLContent();

                // Generate the PDF using expo-print
                const { uri } = await Print.printToFileAsync({ html: htmlContent });

                // Save to FileSystem and Share
                const pdfUri = `${FileSystem.documentDirectory}invoice.pdf`;
                await FileSystem.moveAsync({ from: uri, to: pdfUri });

                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(pdfUri);
                } else {
                    console.log("Sharing is not available on this device");
                }
            } catch (error) {
                console.error("Error generating PDF:", error);
            }
        };

        return (
            <Modal
                animationType='fade'
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Transaction Details</Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons
                                    name='close'
                                    size={20}
                                    color={COLORS.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>

                        <View
                            style={[
                                styles.infoBar,
                                isCompleted ? styles.infoBarSuccess : styles.infoBarPending,
                            ]}
                        >
                            <Ionicons
                                name={isCompleted ? 'checkmark-circle' : 'warning'}
                                size={20}
                                color={isCompleted ? '#0F672E' : '#946300'}
                            />
                            <Text
                                style={[
                                    styles.infoBarText,
                                    isCompleted
                                        ? styles.infoBarTextSuccess
                                        : styles.infoBarTextPending,
                                ]}
                            >
                                {isCompleted
                                    ? 'Transaction completed successfully!'
                                    : 'Payment not confirmed yet'}
                            </Text>
                        </View>

                        {/* Amount Section */}
                        <View style={styles.amountSection}>
                            <View style={styles.amountIcon}>
                                <Ionicons
                                    name='receipt-outline'
                                    size={24}
                                    color={COLORS.primary}
                                />
                            </View>
                            <View style={styles.amountDetails}>
                                <Text style={styles.amountLabel}>Amount</Text>
                                <Text style={styles.amountValue}>
                                    ₹{selectedTransaction?.BillAmt.toLocaleString('en-IN')}
                                </Text>
                            </View>
                        </View>

                        {/* Transaction Info Card */}
                        <View style={styles.infoCard}>
                            <InfoRow
                                label='Party Name'
                                value={selectedTransaction?.PartyName || '-'}
                            />
                            <InfoRow
                                label='Item Name'
                                value={invoiceData?.ItemName || '-'}
                            />
                            <InfoRow
                                label='Document No'
                                value={selectedTransaction?.DocNo || '-'}
                            />
                            <InfoRow
                                label='Net Amount'
                                value={`₹${selectedTransaction?.NetAmt.toLocaleString(
                                    'en-IN'
                                )}`}
                            />
                            <InfoRow
                                label='Tax Amount'
                                value={`₹${selectedTransaction?.TaxAmt.toLocaleString(
                                    'en-IN'
                                )}`}
                            />

                            {/* Dotted Separator */}
                            <View style={styles.dottedSeparator}>
                                <Text style={styles.separatorLine}>
                                    - - - - - - - - - - - - - - - - - - - - - - - - -
                                </Text>
                            </View>

                            <InfoRow
                                label='Created on'
                                value={new Date(
                                    selectedTransaction?.DocDate || ''
                                ).toLocaleString()}
                            />
                            <InfoRow
                                label='Bill No'
                                value={selectedTransaction?.DocNo || '-'}
                            />
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalActionBtn, styles.secondaryButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.secondaryButtonText}>Close</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalActionBtn, styles.primaryButton]}
                                onPress={printPDF}
                            >
                                <Ionicons
                                    name='print-outline'
                                    size={20}
                                    color='#FFF'
                                    style={styles.buttonIcon}
                                />
                                <Text style={styles.primaryButtonText}>Print Invoice</Text>
                                <WebView
                                    ref={webViewRef}
                                    originWhitelist={["*"]}
                                    source={{ html: generateHTMLContent() }}
                                    style={{ display: "none" }} // Hide WebView
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    const InfoRow = ({ label, value, isStatus = false }: {
        label: string;
        value: string;
        isStatus?: boolean;
    }) => (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            {isStatus ? (
                <View style={[
                    styles.statusBadge,
                    value === 'Completed' ? styles.statusCompleted : styles.statusPending
                ]}>
                    <Text style={[
                        styles.statusText,
                        value === 'Completed' ? styles.statusCompletedText : styles.statusPendingText
                    ]}>{value}</Text>
                </View>
            ) : (
                <Text style={styles.infoValue}>{value}</Text>
            )}
        </View>
    );

    return (
        <View style={styles.transactionsCard}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Latest Transactions</Text>
                <TouchableOpacity onPress={() => setShowAll(!showAll)}>
                    <Text style={styles.seeAllButton}>{showAll ? 'Show Less' : 'View All'}</Text>
                </TouchableOpacity>
            </View>

            {displayedTransactions.map((transaction, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.transactionItem}
                    onPress={() => handleTransactionPress(transaction)}
                >
                    <View style={styles.transactionLeft}>
                        <View style={styles.transactionIcon}>
                            <Ionicons name="cash" size={24} color="#fff" />
                        </View>
                        <View style={styles.transactionDetails}>
                            <Text style={styles.transactionTitle}>
                                {truncateName(transaction.PartyName ? transaction.PartyName : 'Dummy Person', 15)}
                            </Text>
                            <Text style={styles.transactionDate}>
                                {transaction.DocNo} - {new Date(transaction.DocDate).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.transactionRight}>
                        <Text style={styles.transactionAmount}>
                            ₹{transaction.BillAmt.toLocaleString('en-IN')}
                        </Text>
                        <View style={[
                            styles.transactionStatus,
                            transaction.Status === 'Completed' ? styles.statusCompleted : styles.statusPending
                        ]}>
                            <Text style={styles.statusText}>{transaction.Status || 'Pending'}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}

            <TransactionDetailsModal />
        </View>
    );
};

const PerformanceView: React.FC<PerformanceViewProps> = ({ salesData }) => {
    if (!salesData || salesData.length === 0) {
        return <Text style={styles.noDataText}>No data available</Text>;
    }

    const totalAmount = salesData.reduce((sum, item) => sum + (item.BillAmt || 0), 0);
    const totalNetAmount = salesData.reduce((sum, item) => sum + (item.NetAmt || 0), 0);
    const totalTaxAmount = salesData.reduce((sum, item) => sum + (item.TaxAmt || 0), 0);

    // Calculate total for percentage calculation
    const totalOverall = totalAmount + totalNetAmount + totalTaxAmount;

    // Calculate percentages based on totalOverall
    const billPercentage = totalOverall > 0 ? (totalAmount / totalOverall) * 100 : 0;
    const netPercentage = totalOverall > 0 ? (totalNetAmount / totalOverall) * 100 : 0;
    const taxPercentage = totalOverall > 0 ? (totalTaxAmount / totalOverall) * 100 : 0;

    const pieData: ChartData[] = [
        {
            value: totalAmount,
            color: COLORS.primary,
            text: `${billPercentage.toFixed(0)}%`,
            label: 'Bill Amount'
        },
        {
            value: totalNetAmount,
            color: COLORS.secondary,
            text: `${netPercentage.toFixed(0)}%`,
            label: 'Net Amount'
        },
        {
            value: totalTaxAmount,
            color: COLORS.background,
            text: `${taxPercentage.toFixed(0)}%`,
            label: 'Tax Amount'
        },
    ];

    return (
        <View style={styles.performanceCard}>
            <Text style={styles.cardTitle}>Total Sales Performance</Text>

            <View style={styles.chartWrapper}>
                <PieChart
                    data={pieData}
                    donut
                    showText
                    textColor="black"
                    radius={140}
                    innerRadius={60}
                    textSize={12}
                    focusOnPress
                    animationDuration={1000}
                    centerLabelComponent={() => (
                        <View style={styles.centerLabel}>
                            <Text style={styles.centerLabelText}>Total</Text>
                            <Text style={styles.centerLabelAmount}>
                                ₹{totalAmount.toLocaleString('en-IN')}
                            </Text>
                        </View>
                    )}
                />
            </View>

            <View style={styles.legendContainer}>
                {pieData.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                        <Text style={styles.legendText}>{item.label}</Text>
                        <Text style={styles.legendValue}>₹{item.value.toLocaleString('en-IN')}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.guideCard}>
                <Text style={styles.guideTitle}>Level up your sales managing to the next level.</Text>
                <Text style={styles.guideSubtitle}>An easy way to manage sales with care and precision.</Text>
                <TouchableOpacity style={styles.updateButton}>
                    <Text style={styles.updateButtonText}>Update to Quickbill Pro</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const QuickActionsGrid = () => {
    const actions = [
        { id: 1, title: 'Sales Invoice', icon: 'receipt-outline' },
        { id: 2, title: 'Sales Return', icon: 'return-down-back-outline' },
        { id: 3, title: 'Sales Order', icon: 'cart-outline' },
        { id: 4, title: 'Check Status', icon: 'checkmark-circle-outline' },
        { id: 5, title: 'Run Analysis', icon: 'analytics-outline' },
        { id: 6, title: 'View Reports', icon: 'document-text-outline' },
    ];

    return (
        <View style={styles.quickActionsWrapper}>
            <Text style={styles.quickActionsTitle}>What would you like to do?</Text>
            <View style={styles.quickActionsGrid}>
                {actions.map((action) => (
                    <TouchableOpacity
                        key={action.id}
                        style={styles.quickAction}
                        onPress={() => {/* handle action */ }}
                    >
                        <View style={styles.quickActionIcon}>
                            <Ionicons name={action.icon as any} size={24} color={COLORS.primary} />
                        </View>
                        <Text style={styles.quickActionText}>{action.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default function SalesScreen() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [salesData, setSalesData] = React.useState<{
        totalAmount: number;
        recentTransactions: SalesData[];
    }>({
        totalAmount: 0,
        recentTransactions: []
    });

    React.useEffect(() => {
        fetchSalesData();
    }, []);

    const fetchSalesData = async () => {
        try {
            setIsLoading(true);
            const userId = await AsyncStorage.getItem('UserID');
            const companyId = await AsyncStorage.getItem('CompanyID');
            const prefix = await AsyncStorage.getItem('SelectedYear');

            const response = await fetch('https://quickbill-backlend.vercel.app/api/total-sales', {
                headers: {
                    'UserID': userId || '',
                    'CompanyID': companyId || '',
                    'Prefix': prefix || ''
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data: SalesData[] = await response.json();
            // console.log("All Data:", data)
            const totalAmount = data.reduce((sum, invoice) => sum + (invoice.BillAmt || 0), 0);

            setSalesData({
                totalAmount,
                recentTransactions: data
            });
        } catch (error) {
            console.error('Error fetching sales data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <GridBackground />
                <RippleLoader size={24} color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading sales data...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <GridBackground />
            <Stack.Screen
                options={{
                    title: 'Sales',
                    headerStyle: {
                        backgroundColor: COLORS.background,
                    },
                    headerTitleStyle: {
                        color: COLORS.text,
                        fontSize: 20,
                        fontFamily: 'MontserratBold',
                    },
                    headerShadowVisible: false, // removes the bottom border
                    headerTintColor: COLORS.primary, // for back button and other icons
                    headerRight: () => (
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => {
                                /* handle press */
                            }}
                        >
                            <Ionicons
                                name='notifications'
                                size={24}
                                color={COLORS.primary}
                            />
                        </TouchableOpacity>
                    ),
                    headerLeft: () => null,
                }}
            />
            <View style={styles.header}>
                <View style={{ gap: 10 }}>
                    <Text style={styles.headerTitle}>Sales Dashboard</Text>
                    <Text style={styles.headerSubtitle}>
                        Check your sales performance and manage your sales with
                        ease.
                    </Text>

                </View>
            </View>

            <PerformanceView salesData={salesData.recentTransactions} />
            <TransactionList transactions={salesData.recentTransactions} />
            <QuickActionsGrid />
        </ScrollView>
    );
}

const COLORS = {
    primary: '#7868e5',
    primaryDark: '#6354d9',
    background: '#F8F9FE',
    surface: '#FFFFFF',
    surfaceLight: '#F4F6FA',
    text: '#1A1A1A',
    textSecondary: '#666666',
    border: '#E5E7EB',
    success: '#7868e5',
    error: '#FF5252',
    secondary: '#aba0f3',
    green: '#4CAF50',
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        marginBottom: 60,
    },
    header: {
        paddingHorizontal: 20,
        marginTop: 20
    },
    headerButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(120, 104, 229, 0.1)',
    },
    headerTitle: {
        fontSize: 28,
        fontFamily: 'MontserratBold',
        color: COLORS.text,
    },
    headerSubtitle: {
        fontSize: 16,
        fontFamily: 'MontserratRegular',
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 10,
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statTitle: {
        fontSize: 16,
        color: '#666',
        fontFamily: 'MontserratRegular',
    },
    statAmount: {
        fontSize: 24,
        fontFamily: 'MontserratBold',
        marginVertical: 10,
    },
    growthIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    growthText: {
        fontSize: 12,
        color: '#4CAF50',
        marginLeft: 4,
    },
    negativeGrowth: {
        color: '#F44336',
    },
    transactionsCard: {
        backgroundColor: COLORS.surface,
        margin: 10,
        borderRadius: 16,
        padding: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontFamily: 'MontserratBold',
        color: COLORS.text,
    },
    seeAllButton: {
        color: COLORS.primary,
        fontFamily: 'MontserratSemibold',
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: COLORS.surfaceLight,
        marginBottom: 10,
        paddingHorizontal: 16,
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    transactionIcon: {
        width: 40,
        height: 40,
        backgroundColor: COLORS.secondary,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    transactionCurrency: {
        fontSize: 18,
        color: '#fff',
    },
    transactionDetails: {
        marginLeft: 8,
    },
    transactionTitle: {
        fontSize: 16,
        fontFamily: 'MontserratSemibold',
        color: COLORS.text,
    },
    transactionDate: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    transactionRight: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontSize: 16,
        fontFamily: 'MontserratSemibold',
        color: COLORS.text,
    },
    transactionStatus: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginTop: 4,
    },
    statusCompleted: {
        backgroundColor: '#E8F5E9',
    },
    statusPending: {
        backgroundColor: COLORS.secondary,
    },
    statusText: {
        fontSize: 8,
        fontFamily: 'MontserratSemibold',
        color: '#FFF', // For completed
    },
    performanceCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        margin: 10,
        elevation: 2,
        marginTop: 30
    },
    chartContainer: {
        alignItems: 'center',
        marginVertical: 20,
        height: 200, // Add explicit height
    },
    centerLabel: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerLabelText: {
        fontSize: 14,
        color: '#666',
    },
    centerLabelAmount: {
        fontSize: 18,
        fontFamily: 'MontserratBold',
    },
    legendContainer: {
        marginTop: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        flex: 1,
        color: '#666',
    },
    legendValue: {
        fontFamily: 'MontserratSemibold',
    },
    guideCard: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
    },
    guideTitle: {
        fontSize: 16,
        fontFamily: 'MontserratBold',
        marginBottom: 8,
    },
    guideSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    updateButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    updateButtonText: {
        color: 'white',
        fontFamily: 'MontserratSemibold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.primary,
        fontFamily: 'MontserratBold',
        fontSize: 24,
    },
    chartWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
        marginVertical: 20,
    },
    noDataText: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        marginVertical: 20,
    },
    quickActionsWrapper: {
        padding: 20,
        backgroundColor: COLORS.surface,
        margin: 10,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    quickActionsTitle: {
        fontSize: 18,
        fontFamily: 'MontserratBold',
        color: COLORS.text,
        marginBottom: 20,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
    },
    quickAction: {
        width: '30%',
        alignItems: 'center',
        gap: 8,
    },
    quickActionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: `${COLORS.primary}10`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickActionText: {
        fontSize: 12,
        color: COLORS.text,
        textAlign: 'center',
        fontFamily: 'MontserratSemibold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'MontserratSemibold',
        color: COLORS.text,
    },
    amountSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    amountIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: `${COLORS.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    amountDetails: {
        flex: 1,
    },
    amountLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    amountValue: {
        fontSize: 24,
        fontFamily: 'MontserratBold',
        color: COLORS.text,
    },
    infoList: {
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        padding: 16,
        gap: 16,
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: '#71767A',
    },
    infoValue: {
        fontSize: 14,
        fontFamily: 'MontserratSemibold',
        color: COLORS.text,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    // statusCompleted: {
    //     backgroundColor: '#E8F5E9',
    // },
    // statusPending: {
    //     backgroundColor: '#FFF3E0',
    // },
    // statusText: {
    //     fontSize: 12,
    //     fontWeight: '500',
    // },
    statusCompletedText: {
        color: '#2E7D32',
    },
    statusPendingText: {
        color: '#ED6C02',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    modalActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 8,
        gap: 8,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
    },
    secondaryButton: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#DDE1E6',
    },
    buttonIcon: {
        marginRight: 4,
    },
    primaryButtonText: {
        color: '#FFF',
        fontSize: 15,
        fontFamily: 'MontserratSemibold',
    },
    secondaryButtonText: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: '600',
    },
    infoBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        gap: 8,
    },
    infoBarSuccess: {
        backgroundColor: '#E7F3EE',
    },
    infoBarPending: {
        backgroundColor: '#FFF4E5',
    },
    infoBarText: {
        fontSize: 14,
        fontWeight: '500',
    },
    infoBarTextSuccess: {
        color: '#0F672E',
    },
    infoBarTextPending: {
        color: '#946300',
    },
    infoCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
    },
    dottedSeparator: {
        alignItems: 'center',
        marginVertical: 16,
    },
    separatorLine: {
        color: '#DDE1E6',
        letterSpacing: 2,
    },
});