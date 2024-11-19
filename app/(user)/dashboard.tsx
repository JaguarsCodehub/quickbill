import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart, LineChart, PieChart } from "react-native-gifted-charts";
import Animated, {
  withTiming,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import AsyncStorage from '@react-native-async-storage/async-storage';


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
  secondary: '#aba0f3', // New secondary color
  gray: '#C5D3E8',
};

const QuickAction = ({ title, icon, onPress, color = COLORS.primary }: {
  title: string;
  icon: string;
  onPress: () => void;
  color?: string;
}) => (
  <TouchableOpacity
    style={styles.quickAction}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon as any} size={24} color={color} />
    </View>
    <Text style={[styles.quickActionTitle, { color }]}>{title}</Text>
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
        colors={isExpanded ? ['#7868e5', '#6354d9'] : ['#FFFFFF', '#FFFFFF']}
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
  const [salesVsPurchases, setSalesVsPurchases] = useState({
    totalSales: 0,
    totalPurchases: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesVsPurchases = async () => {
      setLoading(true);
      try {
        const userId = await AsyncStorage.getItem('UserID');
        const companyId = await AsyncStorage.getItem('CompanyID');
        const prefix = await AsyncStorage.getItem('SelectedYear');

        console.log('Making API request with headers:', {
          'UserID': userId,
          'CompanyID': companyId,
          'Prefix': prefix
        });

        const response = await fetch('https://quickbill-backlend.vercel.app/api/sales-vs-purchases', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'UserID': userId || '',
            'CompanyID': companyId || '',
            'Prefix': prefix || ''
          }
        });

        // Log the raw response
        const rawResponse = await response.text();
        console.log('Raw API Response:', rawResponse);

        // Check if response is ok
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Try to parse the response
        const data = JSON.parse(rawResponse);
        console.log('Parsed Data:', data);

        setSalesVsPurchases(data);
      } catch (error: any) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
        // Set default values in case of error
        setSalesVsPurchases({
          totalSales: 0,
          totalPurchases: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSalesVsPurchases();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Dashboard',
          headerStyle: {
            backgroundColor: COLORS.surface,
          },
          headerTitleStyle: {
            color: COLORS.text,
            fontSize: 20,
            fontWeight: '600',
          },
          headerShadowVisible: false,
          headerTintColor: COLORS.primary,
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                /* handle press */
              }}
            >
              <Ionicons
                name='notifications-outline'
                size={24}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          ),
          headerLeft: () => null,
        }}
      />
      <ScrollView>
        {/* Stats Card */}
        <View style={styles.mainContainer}>
          <Text style={styles.infoTitle}>Manage Your Business</Text>
          <Text style={styles.infoDescription}>
            Efficiently manage your sales, purchases, and products.
          </Text>
          <CollapsibleSection title='Sales'>
            <ActionButton
              title='Sales Order'
              icon='document-text-outline'
              onPress={() => router.push('/(user)/create-order')}
            />
            <ActionButton
              title='Sales Invoice'
              icon='receipt-outline'
              onPress={() => router.push('/(user)/create-sales-invoice')}
            />
            <ActionButton
              title='Sales Return'
              icon='return-up-back-outline'
              onPress={() => router.push('/(user)/create-sales-return')}
            />

          </CollapsibleSection>

          <CollapsibleSection title='Purchase'>
            <ActionButton
              title='Purchase Invoice'
              icon='receipt-outline'
              onPress={() => router.push('/(user)/create-purchase-invoice')}
            />
            <ActionButton
              title='Purchase Return'
              icon='return-down-back-outline'
              onPress={() => router.push('/(user)/create-purchase-return')}
            />
          </CollapsibleSection>

          <CollapsibleSection title='Product'>
            <ActionButton
              title='Add Product'
              icon='add-circle-outline'
              onPress={() => router.push('/')}
            />
            <ActionButton
              title='Product List'
              icon='list-outline'
              onPress={() => router.push('/')}
            />
          </CollapsibleSection>
          <CollapsibleSection title='Account'>
            <ActionButton
              title='Create Receipt'
              icon='add-circle-outline'
              onPress={() => router.push('/(user)/create-receipt')}
            />
            <ActionButton
              title='Create Payment'
              icon='add-circle-outline'
              onPress={() => router.push('/')}
            />
          </CollapsibleSection>
        </View>
        <View style={styles.statsCard}>
          <View style={styles.periodSelector}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <Text style={styles.periodText}>{selectedPeriod}</Text>
              <TouchableOpacity onPress={() => { }}>
                <Text style={styles.viewBills}>View Bills</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Sales</Text>
              <Text style={styles.statAmount}>
                {formatCurrency(salesVsPurchases.totalSales)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Purchases</Text>
              <Text style={styles.statAmount}>
                {formatCurrency(salesVsPurchases.totalPurchases)}
              </Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <PieChart
              data={[
                {
                  value: salesVsPurchases.totalSales,
                  color: COLORS.primary,
                  text: `${(
                    (salesVsPurchases.totalSales /
                      (salesVsPurchases.totalSales +
                        salesVsPurchases.totalPurchases)) *
                    100
                  ).toFixed(0)}%`,
                },
                {
                  value: salesVsPurchases.totalPurchases,
                  color: COLORS.secondary,
                  text: `${(
                    (salesVsPurchases.totalPurchases /
                      (salesVsPurchases.totalSales +
                        salesVsPurchases.totalPurchases)) *
                    100
                  ).toFixed(0)}%`,
                },
              ]}
              donut
              radius={120}
              innerRadius={60}
              innerCircleColor={'#fff'}
              // labelPosition="onBorder"
              showText
              textColor='#000'
              textSize={12}
              showValuesAsLabels={true}
              centerLabelComponent={() => (
                <View style={styles.centerLabel}>
                  <Text style={styles.centerLabelText}>Total</Text>
                  <Text style={styles.centerLabelAmount}>
                    {formatCurrency(
                      salesVsPurchases.totalSales +
                      salesVsPurchases.totalPurchases
                    )}
                  </Text>
                </View>
              )}
            />

            {/* Legend */}
            <View style={styles.legendContainer}>
              <View style={styles.legendRow}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: COLORS.primary },
                  ]}
                />
                <Text style={styles.legendText}>Sales</Text>
                <Text style={styles.legendAmount}>
                  {formatCurrency(salesVsPurchases.totalSales)}
                </Text>
              </View>
              <View style={styles.legendRow}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: COLORS.secondary },
                  ]}
                />
                <Text style={styles.legendText}>Purchases</Text>
                <Text style={styles.legendAmount}>
                  {formatCurrency(salesVsPurchases.totalPurchases)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* New Section Above Quick Actions */}
        <View style={styles.newSection}>
          <Text style={styles.newSectionTitle}>Individual Dashboards</Text>
          <Text style={styles.newSectionContent}>
            This is the content of the new section.
          </Text>
          <View style={styles.navigationButtonsContainer}>
            <TouchableOpacity
              onPress={() => router.push('/(user)/sales')}
              style={styles.navigationButton}
            >
              <Text style={styles.navigationButtonText}>Sales</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(user)/purchase')}
              style={styles.PurchasenavigationButton}
            >
              <Text style={styles.PurchasenavigationButtonText}>Purchases</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.quickActionsHeader}>Quick Actions</Text>
          <View style={styles.quickActionsList}>
            <QuickAction
              title='E-Invoice'
              icon='receipt-outline'
              onPress={() => { }}
              color={COLORS.primary}
            />
            <QuickAction
              title='Print Preview'
              icon='print-outline'
              onPress={() => { }}
              color={COLORS.primary}
            />
            <QuickAction
              title='E-way Bill'
              icon='car-outline'
              onPress={() => { }}
              color={COLORS.primary}
            />
            <QuickAction
              title='Export Data'
              icon='download-outline'
              onPress={() => { }}
              color={COLORS.primary}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statsCard: {
    margin: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(120, 104, 229, 0.2)',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 20,
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  centerLabel: {
    alignItems: 'center',
  },
  centerLabelText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  centerLabelAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  legendContainer: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  quickActionsSection: {
    padding: 16,
    backgroundColor: COLORS.background,
  },
  quickActionsHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  quickActionsList: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${COLORS.primary}15`,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.primary}15`,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: `${COLORS.primary}10`,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  sectionContainer: {
    // marginBottom: 8,
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
    padding: 12,
    margin: 10,
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
    backgroundColor: '#efecff',
    borderRadius: 10,
    gap: 12,
    marginHorizontal: 10,
    marginTop: 16,
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
    marginVertical: 16,
    flexDirection: 'row',
    gap: 12,
  },
  navigationButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  PurchasenavigationButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#433878',
    alignItems: 'center',
    shadowColor: '#433878',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  navigationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  PurchasenavigationButtonText: {
    color: '#FFF',
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
  infoContainer: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    margin: 16,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    // marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: COLORS.primaryDark,
    marginBottom: 16,
    marginTop: -10
  },
});

export default Dashboard;
