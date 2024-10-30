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

const TransactionItem = ({ title, onPress }: { title: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.transactionItem} onPress={onPress}>
    <Text style={styles.transactionItemText}>{title}</Text>
    <Ionicons name="add" size={24} color="#8b949e" />
  </TouchableOpacity>
);

const MastersContent = () => (
  <ScrollView>
    <View style={styles.categorySection}>
      <Text style={styles.categoryHeader}>Items</Text>
      <TransactionItem title="Add Item" onPress={() => { }} />
      <TransactionItem title="Item Categories" onPress={() => { }} />
      <TransactionItem title="Item Groups" onPress={() => { }} />
    </View>

    <View style={styles.categorySection}>
      <Text style={styles.categoryHeader}>Parties</Text>
      <TransactionItem title="Add Customer" onPress={() => { }} />
      <TransactionItem title="Add Supplier" onPress={() => { }} />
      <TransactionItem title="Add Employee" onPress={() => { }} />
    </View>
  </ScrollView>
);

const FavouritesContent = () => (
  <ScrollView>
    <View style={styles.categorySection}>
      <Text style={styles.categoryHeader}>Quick Access</Text>
      <TransactionItem title="Add New Sale" onPress={() => { }} />
      <TransactionItem title="Add New Purchase" onPress={() => { }} />
      <TransactionItem title="Recent Transactions" onPress={() => { }} />
    </View>
  </ScrollView>
);

const TransactionsContent = () => (
  <ScrollView>
    <View style={styles.categorySection}>
      <Text style={styles.categoryHeader}>Sales</Text>
      <TransactionItem title="Order" onPress={() => router.push('/create-order' as Href<string>)} />
      <TransactionItem title="Delivery Challan" onPress={() => router.push('/(user)/create-sales-challan')} />
      <TransactionItem title="Sale Invoice" onPress={() => router.push('/(user)/create-sales-invoice' as Href<string>)} />
      <TransactionItem title="Sale Return" onPress={() => router.push('/(user)/create-sales-return' as Href<string>)} />
      <TransactionItem title="Estimate/Quotation" onPress={() => { }} />
    </View>

    <View style={styles.categorySection}>
      <Text style={styles.categoryHeader}>Purchase</Text>
      <TransactionItem title="Purchase Order" onPress={() => { }} />
      <TransactionItem title="Purchase Challan" onPress={() => { }} />
      <TransactionItem title="Purchase Invoice" onPress={() => { }} />
      <TransactionItem title="Purchase Return" onPress={() => { }} />
      <TransactionItem title="Expense" onPress={() => { }} />
    </View>

    <View style={styles.categorySection}>
      <Text style={styles.categoryHeader}>Accounting</Text>
      <TransactionItem title="Payment In" onPress={() => { }} />
      <TransactionItem title="Payment Out" onPress={() => { }} />
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
      <Stack.Screen options={{ headerShown: true }} />

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
    backgroundColor: '#0d1117', // GitHub dark background
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#30363d', // GitHub dark border
    backgroundColor: '#161b22', // GitHub dark secondary background
  },
  tabButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#58a6ff', // GitHub blue
  },
  tabText: {
    color: '#8b949e', // GitHub dark text
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#58a6ff', // GitHub blue
  },
  categorySection: {
    marginTop: 10,
  },
  categoryHeader: {
    fontSize: 16,
    color: '#c9d1d9', // GitHub light text
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#161b22', // GitHub dark secondary background
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d', // GitHub dark border
    backgroundColor: '#0d1117', // GitHub dark background
  },
  transactionItemText: {
    fontSize: 16,
    color: '#c9d1d9', // GitHub light text
  },
});
