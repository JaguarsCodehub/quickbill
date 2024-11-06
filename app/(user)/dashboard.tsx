import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Href, router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart, LineChart } from "react-native-gifted-charts";
import Animated, {
  withTiming,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

// Update color constants for easy theme management
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
  secondary: '#FFB74D', // New secondary color
};

const QuickActionButton = ({ title, icon, onPress }: { title: string; icon: string; onPress: () => void }) => (
  <TouchableOpacity
    style={styles.quickActionButton}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <LinearGradient
      colors={['#7868e5', '#6354d9']}
      style={styles.quickActionGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Ionicons name={icon as any} size={24} color="#fff" />
      <Text style={styles.quickActionText}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const CollapsibleSection = ({ title, children }: SectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const rotation = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    rotation.value = withTiming(isExpanded ? 0 : 180, { duration: 300 });
  };

  return (
    <MotiView
      style={styles.sectionContainer}
      animate={{ scale: isExpanded ? 1.02 : 1 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <LinearGradient
        colors={isExpanded ? ['#7868e5', '#6354d9'] : ['#FFFFFF', '#F4F6FA']}
        style={styles.sectionGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={toggleExpand}
          activeOpacity={0.7}
        >
          <MotiView
            style={styles.headerContent}
            animate={{ translateX: isExpanded ? 10 : 0 }}
          >
            <View style={[styles.iconBubble, isExpanded && styles.iconBubbleExpanded]}>
              <Ionicons
                name="folder-outline"
                size={24}
                color={isExpanded ? "#fff" : COLORS.primary}
              />
            </View>
            <Text style={[styles.sectionTitle, isExpanded && styles.sectionTitleExpanded]}>
              {title}
            </Text>
          </MotiView>
          <Animated.View style={animatedStyles}>
            <Ionicons
              name="chevron-down-circle"
              size={24}
              color={isExpanded ? "#fff" : COLORS.primary}
            />
          </Animated.View>
        </TouchableOpacity>

        {isExpanded && children}
      </LinearGradient>
    </MotiView>
  );
};

const ActionButton = ({ title, icon, onPress }: { title: string; icon: string; onPress: () => void }) => (
  <MotiView
    from={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{
      type: 'timing',
      duration: 300,
      delay: Math.random() * 200
    }}
  >
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.actionIconContainer}>
        <Ionicons name={icon as any} size={20} color={COLORS.primary} />
      </View>
      <Text style={styles.actionButtonText}>{title}</Text>
    </TouchableOpacity>
  </MotiView>
);

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('This Year');

  const salesData = [
    { value: 5000, label: 'Jan' },
    { value: 8000, label: 'Feb' },
    { value: 6000, label: 'Mar' },
    { value: 12000, label: 'Apr' },
    { value: 9000, label: 'May' },
    { value: 15000, label: 'Jun' },
  ];

  const purchaseData = [
    { value: 4000, label: 'Jan' },
    { value: 7000, label: 'Feb' },
    { value: 5000, label: 'Mar' },
    { value: 10000, label: 'Apr' },
    { value: 8000, label: 'May' },
    { value: 13000, label: 'Jun' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Dashboard",
          headerStyle: {
            backgroundColor: COLORS.surface,
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
              onPress={() => {/* handle press */ }}
            >
              <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {/* handle press */ }}
            >
              <Ionicons name="menu-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView>
        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.periodSelector}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.periodText}>{selectedPeriod}</Text>
              <TouchableOpacity onPress={() => { }}>
                <Text style={styles.viewBills}>View Bills</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Sales</Text>
              <Text style={styles.statAmount}>₹15,000</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Purchases</Text>
              <Text style={styles.statAmount}>₹13,000</Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <BarChart
              data={salesData}
              barWidth={16}
              spacing={24}
              // roundedTop
              // roundedBottom
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: COLORS.textSecondary }}
              xAxisLabelTextStyle={{ color: COLORS.textSecondary }}
              noOfSections={4}
              maxValue={20000}
              height={150}
              width={300}
              barBorderRadius={4}
              frontColor={COLORS.primary}
              gradientColor="rgba(120, 104, 229, 0.2)"
              showGradient
            />
          </View>
        </View>

        {/* New Section Above Quick Actions */}
        <View style={styles.newSection}>
          <Text style={styles.newSectionTitle}>Individual Dashboards</Text>
          <Text style={styles.newSectionContent}>This is the content of the new section.</Text>
          <View style={styles.navigationButtonsContainer}>
            <TouchableOpacity onPress={() => router.push('/(user)/sales')} style={styles.navigationButton}>
              <Text style={styles.navigationButtonText}>Sales</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(user)/purchase')} style={styles.navigationButton}>
              <Text style={styles.navigationButtonText}>Purchases</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionHeaderText}>Quick Actions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.quickActionsRow}>
              <QuickActionButton title="E-way Bill" icon="car" onPress={() => { }} />
              <QuickActionButton title="E-Invoice" icon="document" onPress={() => { }} />
              <QuickActionButton title="Payments" icon="cash" onPress={() => { }} />
              <QuickActionButton title="Online Store" icon="storefront" onPress={() => { }} />
            </View>
          </ScrollView>
        </View>

        <View style={styles.mainContainer}>
          <CollapsibleSection title="Sales">
            <ActionButton
              title="Sales Order"
              icon="document-text-outline"
              onPress={() => router.push('/(user)/create-order')}
            />
            <ActionButton
              title="Sales Invoice"
              icon="receipt-outline"
              onPress={() => router.push('/(user)/create-sales-invoice')}
            />
            <ActionButton
              title="Sales Return"
              icon="return-up-back-outline"
              onPress={() => router.push('/(user)/create-sales-return')}
            />
            <ActionButton
              title="Delivery Challan"
              icon="car-outline"
              onPress={() => router.push('/(user)/create-sales-return')}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Purchase">
            <ActionButton
              title="Purchase Order"
              icon="cart-outline"
              onPress={() => router.push('/(user)/create-order')}
            />
            <ActionButton
              title="Purchase Invoice"
              icon="receipt-outline"
              onPress={() => router.push('/(user)/create-purchase-invoice')}
            />
            <ActionButton
              title="Purchase Return"
              icon="return-down-back-outline"
              onPress={() => router.push('/(user)/create-purchase-return')}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Product">
            <ActionButton
              title="Add Product"
              icon="add-circle-outline"
              onPress={() => router.push('/')}
            />
            <ActionButton
              title="Product List"
              icon="list-outline"
              onPress={() => router.push('/')}
            />
          </CollapsibleSection>
        </View>
      </ScrollView>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'linear-gradient(to bottom, #F8F9FE, #E0E7FF)', // Gradient background
  },
  statsCard: {
    margin: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 20, // Increased border radius
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000", // Shadow for elevation
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5, // Elevation for Android
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  periodText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  viewBills: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  statAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 20,
  },
  chartContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  quickActionsSection: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 16,
  },
  quickActionButton: {
    width: 100,
    height: 100,
    borderRadius: 20,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionGradient: {
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(120, 104, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBubbleExpanded: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  sectionTitleExpanded: {
    color: '#fff',
  },
  childrenContainer: {
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 6,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    // transition: 'background-color 0.3s', // Hover effect
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(120, 104, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 16, // Increased font size
    color: COLORS.text,
    fontWeight: '600', // Bolder text
  },
  mainContainer: {
    padding: 16,
    gap: 8,
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
  navigationButtonsContainer: {
    // flexDirection: 'row',
    // justifyContent: 'space-around',
    marginVertical: 16,
  },
  navigationButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    marginBottom: 10
  },
  navigationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  newSection: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  newSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  newSectionContent: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

export default Dashboard;
