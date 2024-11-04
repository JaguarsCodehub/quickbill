import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Href, router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TabButton = ({ title, active, onPress }: { title: string; active: boolean; onPress: () => void }) => (
  <TouchableOpacity
    style={[styles.tabButton, active && styles.activeTab]}
    onPress={onPress}
  >
    <Text style={[styles.tabText, active && styles.activeTabText]}>{title}</Text>
  </TouchableOpacity>
);

const TransactionItem = ({ title, onPress, icon = "add" }: { title: string; onPress: () => void; icon?: string }) => (
  <TouchableOpacity style={styles.transactionItem} onPress={onPress}>
    <View style={styles.transactionItemLeft}>
      <Ionicons name={icon as any} size={24} color="#2e7d32" style={styles.itemIcon} />
      <Text style={styles.transactionItemText}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color="#8b949e" />
  </TouchableOpacity>
);

const MastersContent = () => (
  <ScrollView>
    <View style={styles.categorySection}>
      <Text style={styles.categoryHeader}>Items</Text>
      <TransactionItem title="Add Item" icon="cube" onPress={() => { }} />
      <TransactionItem title="Item Categories" icon="list" onPress={() => { }} />
      <TransactionItem title="Item Groups" icon="layers" onPress={() => { }} />
    </View>

    <View style={styles.categorySection}>
      <Text style={styles.categoryHeader}>Parties</Text>
      <TransactionItem title="Add Customer" icon="person-add" onPress={() => { }} />
      <TransactionItem title="Add Supplier" icon="business" onPress={() => { }} />
      <TransactionItem title="Add Employee" icon="people" onPress={() => { }} />
    </View>
  </ScrollView>
);

const FavouritesContent = () => (
  <ScrollView>
    <View style={styles.categorySection}>
      <Text style={styles.categoryHeader}>Quick Access</Text>
      <TransactionItem title="Add New Sale" icon="cart" onPress={() => { }} />
      <TransactionItem title="Add New Purchase" icon="bag-handle" onPress={() => { }} />
      <TransactionItem title="Recent Transactions" icon="time" onPress={() => { }} />
    </View>
  </ScrollView>
);

const TransactionsContent = () => (
  <ScrollView>
    <View style={styles.categorySection}>
      <Text style={styles.categoryHeader}>Sales</Text>
      <TransactionItem title="Order" icon="receipt" onPress={() => router.push('/create-order' as Href<string>)} />
      <TransactionItem title="Delivery Challan" icon="document-text" onPress={() => router.push('/(user)/create-sales-challan')} />
      <TransactionItem title="Sale Invoice" icon="cash" onPress={() => router.push('/(user)/create-sales-invoice' as Href<string>)} />
      <TransactionItem title="Sale Return" icon="return-up-back" onPress={() => router.push('/(user)/create-sales-return' as Href<string>)} />
      <TransactionItem title="Estimate/Quotation" icon="calculator" onPress={() => { }} />
    </View>

    <View style={styles.categorySection}>
      <Text style={styles.categoryHeader}>Purchase</Text>
      <TransactionItem title="Purchase Invoice" icon="cash" onPress={() => router.push('/(user)/create-purchase-invoice' as Href<string>)} />
      <TransactionItem title="Purchase Return" icon="return-up-back" onPress={() => router.push('/(user)/create-purchase-return' as Href<string>)} />
      <TransactionItem title="Purchase Order" icon="cart" onPress={() => { }} />
      <TransactionItem title="Purchase Challan" icon="document-text" onPress={() => { }} />
      <TransactionItem title="Expense" icon="wallet" onPress={() => { }} />
    </View>

    <View style={styles.categorySection}>
      <Text style={styles.categoryHeader}>Accounting</Text>
      <TransactionItem title="Payment In" icon="arrow-down" onPress={() => { }} />
      <TransactionItem title="Payment Out" icon="arrow-up" onPress={() => { }} />
    </View>
  </ScrollView>
);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('TRANSACTIONS');

  const handleTabPress = (tab: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'FAVOURITES':
        return <FavouritesContent />;
      case 'MASTERS':
        return <MastersContent />;
      case 'TRANSACTIONS':
      default:
        return <TransactionsContent />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Dashboard" }} />

      <View style={styles.tabContainer}>
        <TabButton
          title="FAVOURITES"
          active={activeTab === 'FAVOURITES'}
          onPress={() => handleTabPress('FAVOURITES')}
        />
        <TabButton
          title="MASTERS"
          active={activeTab === 'MASTERS'}
          onPress={() => handleTabPress('MASTERS')}
        />
        <TabButton
          title="TRANSACTIONS"
          active={activeTab === 'TRANSACTIONS'}
          onPress={() => handleTabPress('TRANSACTIONS')}
        />
      </View>

      {renderContent()}
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Light background
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0', // Light border
    backgroundColor: '#f5f5f5', // Light secondary background
  },
  tabButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2e7d32', // Dark green
  },
  tabText: {
    color: '#757575', // Grey text
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2e7d32', // Dark green
  },
  categorySection: {
    marginTop: 10,
  },
  categoryHeader: {
    fontSize: 16,
    color: '#424242', // Dark grey text
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5', // Light secondary background
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  transactionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: 12,
  },
  transactionItemText: {
    fontSize: 16,
    color: '#424242',
  },
});
