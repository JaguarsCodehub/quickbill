import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Modal, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import SearchablePicker from '@/components/SearchablePicker'
// import { OrderSubmit, OrderItemSubmit } from './path/to/types'; // Import the types if they are in a separate file

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  rate: number;
  discount?: number;
  total: number;
}

interface Customer {
  CustomerID: number;
  CustomerName: string;
  Code: string;
}

interface Item {
  ItemID: string;
  ItemName: string;
  SalRate: number;
  ItemCode: string;
  // ... other fields from your API
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

const CreateSalesOrder = () => {
  const router = useRouter();
  const [orderType, setOrderType] = useState('Retail Order');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [rate, setRate] = useState('100');
  const [quantity, setQuantity] = useState('1');
  const [discount, setDiscount] = useState('');
  const [nextSerial, setNextSerial] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);




  // Replace itemSelectSheetRef with modal state
  const [isItemSelectModalVisible, setIsItemSelectModalVisible] = useState(false);
  const [isItemDetailsModalVisible, setIsItemDetailsModalVisible] = useState(false);



  // Add new state for order items
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Add new state for products search and loading
  const [searchQuery, setSearchQuery] = useState('');
  const [isProductsLoading, setIsProductsLoading] = useState(false);

  // Add memoized filtered items
  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.ItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ItemCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  // Add useEffect for initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchCustomers(), fetchItems()]);
    } catch (error) {
      console.error('Error fetching data:', error);
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

  // Modify handleAddItem to show loading state
  const handleAddItem = useCallback(async () => {
    setIsProductsLoading(true);
    setIsItemSelectModalVisible(true);
    // If items are not yet loaded, fetch them
    if (items.length === 0) {
      try {
        await fetchItems();
      } catch (error) {
        console.error('Error loading products:', error);
      }
    }
    setIsProductsLoading(false);
  }, [items.length]);

  // Item selection handler
  const handleItemSelect = (item: Item) => {
    setSelectedItem(item);
    // Use SalRate instead of price
    setRate(item.SalRate.toString());
    // Calculate initial value based on quantity and SalRate
    const initialValue = Number(quantity) * item.SalRate;
    setRate(initialValue.toString());
    setIsItemSelectModalVisible(false);
    setIsItemDetailsModalVisible(true);
  };

  // Add new handler for adding items to the order
  const handleAddItemToOrder = () => {
    if (!selectedItem) return;

    const qty = Number(quantity);
    const itemRate = Number(rate) || selectedItem.SalRate;
    const itemValue = qty * itemRate;
    const discountAmount = discount ? (itemValue * Number(discount)) / 100 : 0;
    const taxable = itemValue - discountAmount;
    const taxRate = 0.18; // 18% GST
    const taxAmount = taxable * taxRate;

    const newItem: OrderItem = {
      id: selectedItem.ItemID, // Use ItemID instead of id
      name: selectedItem.ItemName, // Use ItemName instead of name
      price: selectedItem.SalRate, // Use SalRate instead of price
      quantity: qty,
      rate: itemRate,
      discount: Number(discount) || 0,
      total: taxable + taxAmount
    };

    setOrderItems([...orderItems, newItem]);
    setIsItemDetailsModalVisible(false);

    // Reset form
    setSelectedItem(null);
    setRate('');
    setQuantity('1');
    setDiscount('');
  };

  // Add calculation for order total
  const orderTotal = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  }, [orderItems]);

  // Add calculation for order summary
  const calculateOrderSummary = () => {
    return orderItems.reduce((summary, item) => {
      const itemValue = item.quantity * item.rate;
      const discountAmount = (itemValue * (item.discount || 0)) / 100;
      const taxable = itemValue - discountAmount;
      const taxAmount = taxable * 0.18; // 18% GST

      return {
        totalValue: summary.totalValue + itemValue,
        totalDiscount: summary.totalDiscount + discountAmount,
        totalTaxable: summary.totalTaxable + taxable,
        totalTax: summary.totalTax + taxAmount,
        totalAmount: summary.totalAmount + (taxable + taxAmount)
      };
    }, {
      totalValue: 0,
      totalDiscount: 0,
      totalTaxable: 0,
      totalTax: 0,
      totalAmount: 0
    });
  };

  const handleSaveOrder = async () => {
    if (!selectedCustomer || orderItems.length === 0) {
      Alert.alert('Error', 'Please select a customer and add at least one item to the order.');
      return;
    }

    setIsSubmitting(true);
    const userId = await AsyncStorage.getItem('UserID');
    const companyId = await AsyncStorage.getItem('CompanyID');
    const prefix = await AsyncStorage.getItem('SelectedYear');

    const orderSubmit: OrderSubmit = {
      docNo: nextSerial,
      docDate: new Date().toISOString().split('T')[0],
      orderNo: `SOR/${nextSerial}`,
      orderDate: new Date().toISOString().split('T')[0],
      pageNo: '',
      partyCode: selectedCustomer.Code,
      billAmt: orderTotal, // Use the orderTotal calculated earlier
      totalQty: orderItems.reduce((sum, item) => sum + item.quantity, 0),
      netAmt: orderTotal, // Adjust as needed
      taxAmt: orderItems.reduce((sum, item) => sum + item.total * 0.18, 0), // Assuming 18% tax
      discAmt: 0, // Adjust if you have a discount
      mainType: 'SL', // Adjust as needed
      subType: 'RS', // Adjust as needed
      type: 'SOR', // Adjust as needed
      prefix: await AsyncStorage.getItem('SelectedYear') || '',
      narration: '', // Add a narration field if needed
      userId: await AsyncStorage.getItem('UserID') || '',
      companyId: await AsyncStorage.getItem('CompanyID') || '',
      createdBy: await AsyncStorage.getItem('UserID') || '',
      modifiedBy: await AsyncStorage.getItem('UserID') || '',
      partyName: selectedCustomer.CustomerName,
      selection: '', // Add a selection field if needed
      productName: '', // Add a productName field if needed
      discPer: 0, // Calculate discount percentage if needed
      cgst: orderItems.reduce((sum, item) => sum + (item.total * 0.09), 0), // Assuming equal split
      sgst: orderItems.reduce((sum, item) => sum + (item.total * 0.09), 0), // Assuming equal split
      igst: 0, // Adjust if applicable
      utgst: 0, // Add UTGST if needed
      rate: 0, // Add an overall rate if needed
      addCode: '',
      totalAmt: orderTotal,
      items: orderItems.map((item, index) => ({
        srl: nextSerial,
        sNo: '0000' + (index + 1),
        currName: item.name, // Adjust as needed
        currRate: item.rate,
        docDate: new Date().toISOString().split('T')[0],
        itemCode: item.id, // Use the appropriate field
        qty: item.quantity,
        rate: item.rate,
        disc: item.discount || 0,
        amt: item.total,
        partyCode: selectedCustomer.Code,
        storeCode: '', // Add a storeCode if needed
        mainType: 'SL',
        subType: 'RS',
        type: 'SOR',
        prefix: prefix,
        narration: '', // Add a narration if needed
        branchCode: '', // Add a branchCode if needed
        unit: '', // Add a unit if needed
        discAmt: item.discount || 0,
        mrp: item.rate, // Adjust if MRP is different from Rate
        newRate: item.rate,
        taxCode: '', // Add tax code if applicable
        taxAmt: item.total * 0.18, // Assuming 18% tax
        cessAmt: 0, // Add cess amount if applicable
        taxable: item.total, // Adjust as needed
        barcodeValue: '', // Add barcode value if available
        userId: userId,
        companyId: companyId,
        createdBy: userId,
        modifiedBy: userId,
        cgst: item.total * 0.09, // Assuming equal split
        sgst: item.total * 0.09, // Assuming equal split
        igst: 0, // Add IGST if applicable
        utgst: 0, // Add UTGST if applicable
        pnding: item.quantity, // Make sure this field is correctly set
        delivaryDate: new Date().toISOString() // Make sure this field is correctly set
      }))
    };

    try {
      const response = await fetch('https://quickbill-backlend.vercel.app/api/create-order', {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a new function to handle item deletion
  const handleDeleteItem = (itemId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Order</Text>
          <TouchableOpacity style={styles.orderTypeButton}>
            <Text style={styles.orderTypeText}>{orderType}</Text>
            <Ionicons name='chevron-down' size={20} color='#8b949e' />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Order Number and Date */}
        <View style={styles.row}>
          <Text style={styles.orderNumber}>Order No: SOR/{nextSerial}</Text>
          <TouchableOpacity style={styles.dateButton}>
            <Text style={styles.dateText}>28-Oct-2024</Text>
            <Ionicons name='calendar' size={20} color='#8b949e' />
          </TouchableOpacity>
        </View>

        {/* Customer Section */}
        <View style={[styles.section, { zIndex: 100 }]}>
          <Text style={styles.sectionLabel}>Customer</Text>
          <SearchablePicker
            items={customers}
            onSelect={setSelectedCustomer}
            placeholder="Search customers..."
            labelKey="CustomerName"
            valueKey="CustomerID"
            icon="person-outline"
            selectedItem={selectedCustomer}
          />
          {selectedCustomer && (
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedInfoText}>{selectedCustomer.CustomerName}</Text>
            </View>
          )}
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>To Receive</Text>
            <Text style={styles.balanceAmount}>₹ 0</Text>
          </View>
        </View>

        {/* Items Section */}
        <View style={styles.section}>
          <View style={styles.itemsHeader}>
            <Text style={styles.itemsTitle}>Items</Text>
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={handleAddItem}
            >
              <Ionicons name='add' size={20} color='#58a6ff' />
              <Text style={styles.addItemText}>Item</Text>
            </TouchableOpacity>
          </View>

          {/* Display Selected Items */}
          {orderItems.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.orderItemCard}>
              <View style={styles.orderItemHeader}>
                <Text style={styles.orderItemName}>{item.name}</Text>
                <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="#f85149" />
                </TouchableOpacity>
              </View>
              <View style={styles.orderItemDetails}>
                <Text style={styles.orderItemQuantity}>
                  {item.quantity} × ₹{item.rate}
                </Text>
                <Text style={styles.orderItemTotal}>₹{item.total}</Text>
              </View>
            </View>
          ))}

          {/* Order Summary */}
          {orderItems.length > 0 && (
            <View style={styles.orderSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Items</Text>
                <Text style={styles.summaryValue}>{orderItems.length}</Text>
              </View>
              {/* Add detailed summary using calculateOrderSummary */}
              {(() => {
                const summary = calculateOrderSummary();
                return (
                  <>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Total Value</Text>
                      <Text style={styles.summaryValue}>₹{summary.totalValue.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Discount</Text>
                      <Text style={styles.summaryValue}>₹{summary.totalDiscount.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Taxable Amount</Text>
                      <Text style={styles.summaryValue}>₹{summary.totalTaxable.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Tax (18% GST)</Text>
                      <Text style={styles.summaryValue}>₹{summary.totalTax.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.finalTotal]}>
                      <Text style={[styles.summaryLabel, styles.finalTotalLabel]}>Total Amount</Text>
                      <Text style={[styles.summaryValue, styles.finalTotalAmount]}>
                        ₹{summary.totalAmount.toFixed(2)}
                      </Text>
                    </View>
                  </>
                );
              })()}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveOrder}>
        <Text style={styles.saveButtonText}>SAVE</Text>
      </TouchableOpacity>

      {/* Update Item Selection Modal */}
      <Modal
        visible={isItemSelectModalVisible}
        animationType='fade'
        transparent={true}
        onRequestClose={() => setIsItemSelectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Product</Text>
              <TouchableOpacity
                onPress={() => setIsItemSelectModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name='close' size={24} color='#c9d1d9' />
              </TouchableOpacity>
            </View>

            {/* Add Search bar */}
            <View style={styles.searchContainer}>
              <Ionicons
                name='search'
                size={20}
                color='#8b949e'
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder='Search products...'
                placeholderTextColor='#8b949e'
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Show loading indicator or items list */}
            {isProductsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#58a6ff" />
                <Text style={styles.loadingText}>Loading products...</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalItemsList}>
                {filteredItems.map((item) => (
                  <TouchableOpacity
                    key={item.ItemID}
                    style={styles.itemOption}
                    onPress={() => handleItemSelect(item)}
                  >
                    <View>
                      <Text style={styles.itemName}>{item.ItemName}</Text>
                      <Text style={styles.itemCode}>{item.ItemCode}</Text>
                      <Text style={styles.itemPrice}>₹ {item.SalRate}</Text>
                    </View>
                    <Ionicons name='chevron-forward' size={20} color='#8b949e' />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Item Details Modal */}
      <Modal
        visible={isItemDetailsModalVisible}
        animationType='slide'
        transparent={true}
        onRequestClose={() => setIsItemDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.itemDetailsModal]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setIsItemDetailsModalVisible(false)}
                style={styles.modalBackButton}
              >
                <Ionicons name='arrow-back' size={24} color='#c9d1d9' />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Item</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.itemDetailsContent}>
              {/* Item Selection Card */}
              <View style={styles.detailsCard}>
                <Text style={styles.inputLabel}>Selected Item</Text>
                <TouchableOpacity style={styles.itemSelector}>
                  <View>
                    <Text style={styles.selectedItemText}>
                      {selectedItem?.ItemName}
                    </Text>
                    <Text style={styles.itemPrice}>₹ {selectedItem?.SalRate}</Text>
                  </View>
                  <Ionicons name='chevron-down' size={20} color='#8b949e' />
                </TouchableOpacity>
                <Text style={styles.stockIndicator}>
                  Stock Available: <Text style={styles.stockCount}>{selectedItem?.stock} Pcs</Text>
                </Text>
              </View>

              {/* Pricing Card */}
              <View style={styles.detailsCard}>
                <Text style={styles.cardTitle}>Pricing Details</Text>
                <View style={styles.rateContainer}>
                  <Text style={styles.inputLabel}>Rate (₹)</Text>
                  <TextInput
                    style={[styles.input, styles.rateInput]}
                    value={rate}
                    onChangeText={setRate}
                    keyboardType='numeric'
                    placeholder="Enter rate"
                    placeholderTextColor="#8b949e"
                  />
                </View>

                <View style={styles.quantityUnitRow}>
                  <View style={styles.quantityContainer}>
                    <Text style={styles.inputLabel}>Quantity</Text>
                    <TextInput
                      style={[styles.input, styles.quantityInput]}
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType='numeric'
                      placeholder="0"
                      placeholderTextColor="#8b949e"
                    />
                  </View>
                  <View style={styles.unitContainer}>
                    <Text style={styles.inputLabel}>Unit</Text>
                    <View style={[styles.input, styles.unitDisplay]}>
                      <Text style={styles.unitText}>{selectedItem?.unit}</Text>
                    </View>
                  </View>
                </View>
              </View>


              {/* Total Amount Card */}
              <View style={[styles.detailsCard, styles.totalCard]}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal</Text>
                  <Text style={styles.totalAmount}>₹ {Number(rate) * Number(quantity)}.00</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Discount</Text>
                  <Text style={styles.totalAmount}>- ₹ 0.00</Text>
                </View>
                <View style={[styles.totalRow, styles.finalTotal]}>
                  <Text style={[styles.totalLabel, styles.finalTotalLabel]}>Total Amount</Text>
                  <Text style={[styles.totalAmount, styles.finalTotalAmount]}>₹ {Number(rate) * Number(quantity)}.00</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.bottomButtons}>
              {/* <TouchableOpacity 
                style={styles.doneNewButton}
                onPress={() => {
                  handleAddItemToOrder();
                  setIsItemSelectModalVisible(true);
                }}
              >
                <Text style={styles.doneNewButtonText}>DONE & NEW</Text>
              </TouchableOpacity> */}
              <TouchableOpacity
                style={styles.doneButton}
                onPress={handleAddItemToOrder}
              >
                <Text style={styles.doneButtonText}>DONE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default CreateSalesOrder

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
    marginTop: 30,
  },
  header: {
    backgroundColor: '#161b22',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  backButton: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#c9d1d9',
  },
  orderTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  orderTypeText: {
    color: '#8b949e',
    marginRight: 4,
  },
  content: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  orderNumber: {
    color: '#c9d1d9',
    fontSize: 16,
    // textDecorationLine: 'underline',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: '#c9d1d9',
    marginRight: 8,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
    position: 'relative', // Add this
  },
  sectionLabel: {
    color: '#8b949e',
    marginBottom: 8,
  },
  customerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  customerText: {
    color: '#c9d1d9',
    fontSize: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  balanceLabel: {
    color: '#8b949e',
  },
  balanceAmount: {
    color: '#c9d1d9',
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemsTitle: {
    color: '#c9d1d9',
    fontSize: 16,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#58a6ff',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addItemText: {
    color: '#58a6ff',
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: '#58a6ff',
    padding: 16,
    alignItems: 'center',
    margin: 10,
    borderRadius: 10,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  handleIndicator: {
    backgroundColor: '#30363d',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#58a6ff',
  },

  itemOptionText: {
    color: '#c9d1d9',
    fontSize: 16,
  },
  //   searchInput: {
  //     backgroundColor: '#0d1117',
  //     color: '#c9d1d9',
  //     padding: 12,
  //     margin: 16,
  //     borderRadius: 6,
  //   },
  detailsContent: {
    padding: 16,
  },
  inputLabel: {
    color: '#8b949e',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#0d1117',
    color: '#c9d1d9',
    padding: 12,
    borderRadius: 6,
  },
  itemSelector: {
    backgroundColor: '#0d1117',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
  },
  selectedItemText: {
    color: '#c9d1d9',
    fontSize: 16,
  },
  stockText: {
    color: '#8b949e',
    marginTop: 4,
  },
  errorText: {
    color: '#f85149',
    marginTop: 8,
  },
  halfWidth: {
    flex: 1,
  },
  unitText: {
    color: '#8b949e',
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  discountInput: {
    flex: 1,
  },
  discountSeparator: {
    color: '#8b949e',
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  totalLabel: {
    color: '#c9d1d9',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalAmount: {
    color: '#c9d1d9',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomButtons: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#30363d',
  },
  doneNewButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#0d1117',
  },
  doneButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#58a6ff',
    borderRadius: 10,
  },
  doneNewButtonText: {
    color: '#c9d1d9',
    fontSize: 16,
    fontWeight: 'bold',
  },
  doneButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8b949e',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 60, // Add padding for status bar
  },
  modalContent: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    maxHeight: '80%',
    margin: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c9d1d9',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBackButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
    backgroundColor: '#0d1117',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#c9d1d9',
    fontSize: 16,
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#c9d1d9',
    marginTop: 12,
    fontSize: 16,
  },
  itemCode: {
    color: '#8b949e',
    fontSize: 12,
    marginBottom: 2,
  },
  modalItemsList: {
    padding: 16,
  },
  itemOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  itemName: {
    color: '#c9d1d9',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    color: '#58a6ff',
    fontSize: 14,
    marginBottom: 2,
  },
  itemStock: {
    color: '#8b949e',
    fontSize: 12,
  },
  itemDetailsModal: {
    maxHeight: '90%',
  },
  itemDetailsContent: {
    padding: 16,
  },
  detailsCard: {
    backgroundColor: '#0d1117',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#c9d1d9',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  rateContainer: {
    marginBottom: 16,
  },
  rateInput: {
    marginTop: 8,
  },
  quantityUnitRow: {
    flexDirection: 'row',
    gap: 16,
  },
  quantityContainer: {
    flex: 2,
  },
  unitContainer: {
    flex: 1,
  },
  quantityInput: {
    marginTop: 8,
  },
  unitDisplay: {
    marginTop: 8,
    justifyContent: 'center',
  },
  //   discountContainer: {
  //     flexDirection: 'row',
  //     alignItems: 'flex-start',
  //     gap: 12,
  //   },
  discountInputWrapper: {
    flex: 1,
  },
  discountType: {
    color: '#8b949e',
    fontSize: 12,
    marginTop: 4,
  },
  characterCount: {
    color: '#8b949e',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  totalCard: {
    marginBottom: 30,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: '#30363d',
    paddingTop: 8,
    marginTop: 8,
  },
  finalTotalLabel: {
    fontWeight: 'bold',
    color: '#c9d1d9',
  },
  finalTotalAmount: {
    color: '#58a6ff',
    fontWeight: 'bold',
  },
  stockIndicator: {
    color: '#8b949e',
    fontSize: 13,
    marginTop: 8,
  },
  stockCount: {
    color: '#c9d1d9',
    fontWeight: '500',
  },
  //   itemPrice: {
  //     color: '#58a6ff',
  //     fontSize: 14,
  //     marginTop: 2,
  //   },
  // Add these styles to the main styles object
  orderItemCard: {
    backgroundColor: '#0d1117',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  orderItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderItemName: {
    color: '#c9d1d9',
    fontSize: 16,
    fontWeight: '500',
  },
  orderItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItemQuantity: {
    color: '#8b949e',
    fontSize: 14,
  },
  orderItemTotal: {
    color: '#58a6ff',
    fontSize: 15,
    fontWeight: '500',
  },
  orderSummary: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#30363d',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#8b949e',
    fontSize: 15,
  },
  summaryValue: {
    color: '#c9d1d9',
    fontSize: 15,
    fontWeight: '500',
  },
  searchablePickerContainer: {
    marginBottom: 12,
  },
  searchablePickerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262647',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  selectedInfo: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#262647',
    borderRadius: 10,
  },
  selectedInfoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
