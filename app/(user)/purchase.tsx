import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Touchable, Modal } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Icon } from 'lucide-react-native';

// Define TypeScript interfaces
interface PurchaseData {
  PurchaseID: number;
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
  purchaseData: PurchaseData[];
}

// First, add this interface for the modal state
interface SelectedTransaction extends PurchaseData {
  // Add any additional fields you want to show in the modal
}

const TransactionList: React.FC<{ transactions: PurchaseData[] }> = ({ transactions }) => {
  const [showAll, setShowAll] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] = React.useState<SelectedTransaction | null>(null);
  const [modalVisible, setModalVisible] = React.useState(false);

  // Function to truncate PartyName
  const truncateName = (name: string, length: number) => {
    return name.length > length ? `${name.substring(0, length)}...` : name;
  };

  // Get the transactions to display
  const displayedTransactions = showAll ? transactions : transactions.slice(0, 5);

  const handleTransactionPress = (transaction: PurchaseData) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const TransactionDetailsModal = () => {
    const isCompleted = selectedTransaction?.Status === 'Completed';

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

            {/* Status Info Bar */}
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
                label='Reference ID'
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
                onPress={() => {
                  /* Handle print */
                }}
              >
                <Ionicons
                  name='print-outline'
                  size={20}
                  color='#FFF'
                  style={styles.buttonIcon}
                />
                <Text style={styles.primaryButtonText}>Print Invoice</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.transactionsCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Latest Purchases</Text>
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
                {truncateName(transaction.PartyName ? transaction.PartyName : 'Demo Customer', 15)}
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

const PerformanceView: React.FC<PerformanceViewProps> = ({ purchaseData }) => {
  if (!purchaseData || purchaseData.length === 0) {
    return <Text style={styles.noDataText}>No data available</Text>;
  }

  const totalAmount = purchaseData.reduce((sum, item) => sum + (item.BillAmt || 0), 0);
  const totalNetAmount = purchaseData.reduce((sum, item) => sum + (item.NetAmt || 0), 0);
  const totalTaxAmount = purchaseData.reduce((sum, item) => sum + (item.TaxAmt || 0), 0);

  const totalOverall = totalAmount + totalNetAmount + totalTaxAmount;

  const billPercentage = totalOverall > 0 ? (totalAmount / totalOverall) * 100 : 0;
  const netPercentage = totalOverall > 0 ? (totalNetAmount / totalOverall) * 100 : 0;
  const taxPercentage = totalOverall > 0 ? (totalTaxAmount / totalOverall) * 100 : 0;

  const pieData: ChartData[] = [
    {
      value: totalAmount,
      color: COLORS.primary,
      text: `${billPercentage.toFixed(0)}%`,
      label: 'Bill Amount',
    },
    {
      value: totalNetAmount,
      color: COLORS.secondary,
      text: `${netPercentage.toFixed(0)}%`,
      label: 'Net Amount',
    },
    {
      value: totalTaxAmount,
      color: COLORS.tertiary,
      text: `${taxPercentage.toFixed(0)}%`,
      label: 'Tax Amount',
    },
  ];

  return (
    <View style={styles.performanceCard}>
      <Text style={styles.cardTitle}>Total Purchase Data</Text>

      <View style={styles.chartWrapper}>
        <PieChart
          data={pieData}
          donut
          showText
          textColor="white"
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
        <Text style={styles.guideTitle}>Level up your purchase management to the next level.</Text>
        <Text style={styles.guideSubtitle}>An easy way to manage purchases with care and precision.</Text>
        <TouchableOpacity style={styles.updateButton}>
          <Text style={styles.updateButtonText}>Update to Quickbill Pro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Add this new component after your TransactionList component
const QuickActionsGrid = () => {
  const actions = [
    { id: 1, title: 'Purchase Invoice', icon: 'receipt-outline' },
    { id: 2, title: 'Purchase Return', icon: 'return-down-back-outline' },
    { id: 3, title: 'Purchase Order', icon: 'cart-outline' },
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
            style={styles.actionButton}
            onPress={() => {/* handle action */ }}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name={action.icon as any} size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function PurchaseScreen() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [purchaseData, setPurchaseData] = React.useState<{
    totalAmount: number;
    recentTransactions: PurchaseData[];
  }>({
    totalAmount: 0,
    recentTransactions: []
  });

  React.useEffect(() => {
    fetchPurchaseData();
  }, []);

  const fetchPurchaseData = async () => {
    try {
      setIsLoading(true);
      const userId = await AsyncStorage.getItem('UserID');
      const companyId = await AsyncStorage.getItem('CompanyID');
      const prefix = await AsyncStorage.getItem('SelectedYear');

      const response = await fetch('https://quickbill-backlend.vercel.app/api/total-purchases', {
        headers: {
          'UserID': userId || '',
          'CompanyID': companyId || '',
          'Prefix': prefix || ''
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: PurchaseData[] = await response.json();
      const totalAmount = data.reduce((sum, invoice) => sum + (invoice.BillAmt || 0), 0);

      setPurchaseData({
        totalAmount,
        recentTransactions: data
      });
    } catch (error) {
      console.error('Error fetching purchase data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading purchase data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Purchases',
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTitleStyle: {
            color: COLORS.text,
            fontSize: 20,
            fontWeight: '600',
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
          <Text style={styles.headerTitle}>Purchase Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Check your purchase performance and manage your purchases with
            ease.
          </Text>
          {/* <TouchableOpacity style={{
                        width: 40,
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginHorizontal: 8,
                        borderRadius: 20,
                        backgroundColor: '#000',
                    }}>
                        <Ionicons name="add" size={24} color={COLORS.background} />
                    </TouchableOpacity> */}
        </View>
      </View>

      <QuickActionsGrid />

      <PerformanceView purchaseData={purchaseData.recentTransactions} />

      <View
        style={{
          margin: 10,
          padding: 20,
          backgroundColor: COLORS.surface,
          borderRadius: 16,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        }}
      >
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 20, fontWeight: '600' }}>
            New Purchase Invoice
          </Text>
          <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>
            Create a new purchase invoice for your customer.
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#000',
              padding: 12,
              borderRadius: 8,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontWeight: '600',
                textAlign: 'center',
                fontSize: 16,
              }}
            >
              Create Invoice
            </Text>
            <Ionicons name='add' size={24} color='#fff' />
          </TouchableOpacity>
        </View>
      </View>
      <TransactionList transactions={purchaseData.recentTransactions} />
    </ScrollView>
  );
}

const COLORS = {
  primary: '#1E2A5E',
  primaryDark: '#6354d9',
  background: '#F8F9FE',
  surface: '#FFFFFF',
  surfaceLight: '#F4F6FA',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E5E7EB',
  success: '#7868e5',
  error: '#FF5252',
  secondary: '#55679C',
  tertiary: '#7C93C3',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    // marginTop: 4,
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  transactionRight: {
    alignItems: 'flex-end',
    maxWidth: 100, // Set a max width to prevent overflow
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
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  performanceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    margin: 10,
    marginTop: 20,
    elevation: 2,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    marginVertical: 20,
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
    color: '#000', // Center label color
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
  quickActionsWrapper: {
    padding: 20,
    backgroundColor: COLORS.surfaceLight,
    margin: 10,
    borderRadius: 16,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 3,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionButton: {
    width: '30%', // Approximately 3 buttons per row with spacing
    alignItems: 'center',
    gap: 8,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
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
    fontWeight: '600',
    color: COLORS.text,
  },
  infoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
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
    fontWeight: '500',
    color: COLORS.text,
    maxWidth: '60%',
    textAlign: 'right',
  },
  dottedSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  separatorLine: {
    color: '#DDE1E6',
    letterSpacing: 2,
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
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  quickActionBtn: {  // Changed from actionButton
    width: '30%',
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {  // Changed from actionIconContainer
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {  // Changed from actionText
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
  },
});

// ... existing code ...