import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Href, router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DropdownSection = ({ title, items, icon, color }: { title: string; items: { name: string; route: string; icon: string }[]; icon: string; color: string }) => {
  const [expanded, setExpanded] = useState(false);
  const animationHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [expanded]);

  const toggleExpand = () => {
    setExpanded(!expanded);
    Animated.timing(animationHeight, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const height = animationHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.ceil(items.length / 2) * 110], // Adjusted for new card height
  });

  return (
    <View style={styles.dropdownContainer}>
      <LinearGradient
        colors={['#3C3C3C', '#7868e5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.dropdownHeader}
      >
        <TouchableOpacity
          style={styles.dropdownHeaderContent}
          onPress={toggleExpand}
        >
          <View style={styles.dropdownTitleContainer}>
            <View style={[styles.dropdownIcon, { backgroundColor: color }]}>
              <Ionicons name={icon as any} size={20} color='white' />
            </View>
            <Text style={styles.dropdownTitle}>{title}</Text>
          </View>
          <Animated.View
            style={{
              transform: [
                {
                  rotate: animationHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
              ],
            }}
          >
            <Ionicons name='chevron-down' size={24} color='white' />
          </Animated.View>
        </TouchableOpacity>
      </LinearGradient>
      <Animated.View style={[styles.dropdownContent, { maxHeight: height }]}>
        <View style={styles.cardContainer}>
          {items.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => router.push(item.route as Href<string>)}
            >
              <LinearGradient
                colors={['#4A4A4A', '#3A3A3A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name={item.icon as any} size={24} color='#7868e5' />
                </View>
                <Text style={styles.cardText}>{item.name}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const Dashboard = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.businessName}>Accounts on your fingertips</Text>
          <Text style={styles.swipe}>EN</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>This Year ▼</Text>
            <Text style={styles.viewBills}>View Bills</Text>
          </View>
          <View style={styles.summaryContent}>
            <View>
              <Text style={styles.summaryLabel}>Sales</Text>
              <Text style={styles.summaryAmount}>₹0.00</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Purchases</Text>
              <Text style={styles.summaryAmount}>₹0.00</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionGrid}>
          {[
            { name: 'Invoice', icon: 'document-text-outline' },
            { name: 'Purchase', icon: 'cart-outline' },
            { name: 'Quotation', icon: 'document-outline' },
            { name: 'Delivery Challan', icon: 'car-outline' },
            { name: 'Credit Note', icon: 'arrow-up-outline' },
            { name: 'Purchase Order', icon: 'cube-outline' },
            { name: 'Expenses', icon: 'wallet-outline' },
            { name: 'Pro Forma Invoice', icon: 'calculator-outline' },
          ].map((item, index) => (
            <TouchableOpacity key={index} style={styles.actionItem}>
              <View style={styles.actionIconContainer}>
                <Ionicons name={item.icon as any} size={24} color='#7868e5' />
              </View>
              <Text style={styles.actionText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <DropdownSection
          title='Sales'
          items={[
            { name: 'Order', route: '/create-order', icon: 'cart' },
            { name: 'Challan', route: '/create-sales-challan', icon: 'document-text' },
            { name: 'Invoice', route: '/create-sales-invoice', icon: 'receipt' },
            { name: 'Return', route: '/return', icon: 'return-down-back' },
          ]}
          icon='bar-chart'
          color='#7868e5'
        />
        <DropdownSection
          title='Product'
          items={[
            { name: 'Item 1', route: '/product/item1', icon: 'cube' },
            { name: 'Item 2', route: '/product/item2', icon: 'cube-outline' },
          ]}
          icon='cube'
          color='#7868e5'
        />
        <DropdownSection
          title='Purchase'
          items={[
            { name: 'Order', route: '/purchase/order', icon: 'cart' },
            { name: 'Invoice', route: '/purchase/invoice', icon: 'receipt' },
          ]}
          icon='cart'
          color='#7868e5'
        />
        <DropdownSection
          title='Receipt/Payment'
          items={[
            { name: 'Receipt', route: '/receipt', icon: 'cash' },
            { name: 'Payment', route: '/payment', icon: 'card' },
          ]}
          icon='cash'
          color='#7868e5'
        />

        <Text style={styles.quickAccessTitle}>Quick Access</Text>
        <View style={styles.quickAccessGrid}>
          {[
            { name: 'E-way Bill', icon: 'car-outline', color: '#FFA500' },
            {
              name: 'E-Invoice',
              icon: 'document-text-outline',
              color: '#FF4500',
            },
            {
              name: 'Payments Timeline',
              icon: 'cash-outline',
              color: '#32CD32',
            },
            {
              name: 'Online Store',
              icon: 'storefront-outline',
              color: '#FFD700',
            },
          ].map((item, index) => (
            <TouchableOpacity key={index} style={styles.quickAccessItem}>
              <Ionicons name={item.icon as any} size={24} color={item.color} />
              <Text style={styles.quickAccessText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Existing DropdownSections */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    paddingTop: 50,
  },
  dropdownContainer: {
    margin: 16,
    backgroundColor: '#2C2C2C',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownHeader: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  dropdownHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  dropdownTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdownContent: {
    overflow: 'hidden',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 8,
  },
  card: {
    width: '48%',
    marginBottom: 16,
  },
  cardGradient: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  cardIcon: {
    backgroundColor: 'rgba(120, 104, 229, 0.1)',
    borderRadius: 20,
    padding: 8,
    marginBottom: 8,
  },
  cardText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E1E1E',
  },
  businessName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  swipe: {
    color: 'white',
    fontSize: 18,
  },
  summaryCard: {
    backgroundColor: '#2C2C2C',
    margin: 16,
    borderRadius: 8,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  viewBills: {
    color: '#7868e5',
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: '#888',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  createButton: {
    backgroundColor: '#7868e5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#2C2C2C',
    margin: 16,
    borderRadius: 8,
  },
  actionItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3C3C3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    textAlign: 'center',
    fontSize: 12,
    color: 'white',
  },
  quickAccessTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 16,
    color: 'white',
  },
  quickAccessGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#2C2C2C',
    margin: 16,
    borderRadius: 8,
  },
  quickAccessItem: {
    alignItems: 'center',
  },
  quickAccessText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
    color: 'white',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingVertical: 8,
    backgroundColor: '#1E1E1E',
  },
  bottomNavItem: {
    alignItems: 'center',
  },
  bottomNavText: {
    fontSize: 12,
    color: '#888',
  },
  activeBottomNavText: {
    color: '#4A90E2',
  },
  dropdownTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
});
