import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Define TypeScript interfaces
interface SalesData {
    SalesID: number;
    DocNo: string;
    DocDate: string;
    BillAmt: number;
    NetAmt: number;
    TaxAmt: number;
    PartyName: string;
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

const TransactionList: React.FC<{ transactions: SalesData[] }> = ({ transactions }) => {
    const [showAll, setShowAll] = React.useState(false);

    // Function to truncate PartyName
    const truncateName = (name: string, length: number) => {
        return name.length > length ? `${name.substring(0, length)}...` : name;
    };

    // Get the transactions to display
    const displayedTransactions = showAll ? transactions : transactions.slice(0, 5);

    return (
        <View style={styles.transactionsCard}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Latest Transactions</Text>
                <TouchableOpacity onPress={() => setShowAll(!showAll)}>
                    <Text style={styles.seeAllButton}>{showAll ? 'Show Less' : 'View All'}</Text>
                </TouchableOpacity>
            </View>

            {displayedTransactions.map((transaction, index) => (
                <View key={index} style={styles.transactionItem}>
                    <View style={styles.transactionLeft}>
                        <View style={styles.transactionIcon}>
                            <Ionicons name="cash" size={24} color="#fff" />
                        </View>
                        <View style={styles.transactionDetails}>
                            <Text style={styles.transactionTitle}>
                                {truncateName(transaction.PartyName ? transaction.PartyName : 'Demo Customer', 15)}
                            </Text>
                            <Text style={styles.transactionDate}>
                                {new Date(transaction.DocDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(transaction.DocDate).toLocaleDateString()}
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
                </View>
            ))}
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

            const response = await fetch('http://192.168.1.11:3000/api/total-sales', {
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
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.loadingText}>Loading sales data...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Sales Dashboard</Text>
                <Text style={styles.headerSubtitle}>An easy way to manage sales with care and precision.</Text>
            </View>

            <PerformanceView salesData={salesData.recentTransactions} />
            <TransactionList transactions={salesData.recentTransactions} />
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
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        marginTop: 20,
    },
    header: {
        padding: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    headerSubtitle: {
        fontSize: 14,
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
    },
    statAmount: {
        fontSize: 24,
        fontWeight: 'bold',
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
        fontWeight: 'bold',
        color: COLORS.text,
    },
    seeAllButton: {
        color: COLORS.primary,
        fontWeight: '500',
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
        fontWeight: '600',
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
        fontWeight: '600',
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
        fontWeight: '500',
        color: '#FFF', // For completed
    },
    performanceCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        margin: 10,
        elevation: 2,
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
        fontWeight: 'bold',
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
        fontWeight: '500',
    },
    guideCard: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
    },
    guideTitle: {
        fontSize: 16,
        fontWeight: 'bold',
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
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.textSecondary,
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
});