import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Modal } from 'react-native'
import React, { useState, useCallback, useRef, useMemo } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import BottomSheet from '@gorhom/bottom-sheet'

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  rate: number;
  discount?: number;
  total: number;
}

const CreateSalesOrder = () => {
  const router = useRouter();
  const [orderType, setOrderType] = useState('Retail Order');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [rate, setRate] = useState('100');
  const [quantity, setQuantity] = useState('1');
  const [discount, setDiscount] = useState('');
  const [notes, setNotes] = useState('');
  
  // Bottom sheet refs and snap points
  const itemDetailsSheetRef = useRef<BottomSheet>(null);
  const itemDetailsSnapPoints = useMemo(() => ['5%', '25%', '90%'], []); // Using 5% as minimum

  // Replace itemSelectSheetRef with modal state
  const [isItemSelectModalVisible, setIsItemSelectModalVisible] = useState(false);
  const [isItemDetailsModalVisible, setIsItemDetailsModalVisible] = useState(false);

  // Add new state for bottom sheet visibility
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  // Add new state for order items
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // Add Item button handler
  const handleAddItem = useCallback(() => {
    setIsItemSelectModalVisible(true);
  }, []);

  // Item selection handler
  const handleItemSelect = (item: any) => {
    setSelectedItem(item);
    setRate(item.price.toString());
    setIsItemSelectModalVisible(false);
    setIsItemDetailsModalVisible(true);
  };

  // Add new handler for adding items to the order
  const handleAddItemToOrder = () => {
    if (!selectedItem) return;

    const newItem: OrderItem = {
      id: selectedItem.id,
      name: selectedItem.name,
      price: Number(selectedItem.price),
      quantity: Number(quantity),
      rate: Number(rate),
      discount: discount ? Number(discount) : 0,
      total: Number(rate) * Number(quantity)
    };

    setOrderItems([...orderItems, newItem]);
    setIsItemDetailsModalVisible(false);
    
    // Reset form
    setSelectedItem(null);
    setRate('100');
    setQuantity('1');
    setDiscount('');
  };

  // Add calculation for order total
  const orderTotal = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  }, [orderItems]);

  return (
    <SafeAreaView style={styles.container}>
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

      <ScrollView style={styles.content}>
        {/* Order Number and Date */}
        <View style={styles.row}>
          <Text style={styles.orderNumber}>SO002</Text>
          <TouchableOpacity style={styles.dateButton}>
            <Text style={styles.dateText}>28-Oct-2024</Text>
            <Ionicons name='calendar' size={20} color='#8b949e' />
          </TouchableOpacity>
        </View>

        {/* Customer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Customer</Text>
          <TouchableOpacity style={styles.customerButton}>
            <Text style={styles.customerText}>Demo Customer</Text>
            <Ionicons name='chevron-down' size={20} color='#8b949e' />
          </TouchableOpacity>
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
              onPress={() => setIsItemSelectModalVisible(true)}
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
                <TouchableOpacity>
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
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Amount</Text>
                <Text style={styles.summaryValue}>₹{orderTotal}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>SAVE</Text>
      </TouchableOpacity>

      {/* Replace Item Selection Bottom Sheet with Modal */}
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

            {/* Search bar */}
            {/* <View style={styles.searchContainer}>
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
              />
            </View> */}

            <ScrollView style={styles.modalItemsList}>
              {/* Sample Items */}
              <TouchableOpacity
                style={styles.itemOption}
                onPress={() =>
                  handleItemSelect({
                    id: '1',
                    name: 'Sample Item',
                    price: 100.00,
                  })
                }
              >
                <View>
                    <Text style={styles.itemName}>Sample Item</Text>
                  <Text style={styles.itemPrice}>₹ 100.00</Text>
                </View>
                <Ionicons name='chevron-forward' size={20} color='#8b949e' />
              </TouchableOpacity>
            </ScrollView>
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
                    <Text style={styles.selectedItemText}>{selectedItem?.name}</Text>
                    <Text style={styles.itemPrice}>₹ {selectedItem?.price}</Text>
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
              <TouchableOpacity 
                style={styles.doneNewButton}
                onPress={() => {
                  handleAddItemToOrder();
                  setIsItemSelectModalVisible(true);
                }}
              >
                <Text style={styles.doneNewButtonText}>DONE & NEW</Text>
              </TouchableOpacity>
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
    textDecorationLine: 'underline',
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
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Bottom Sheet Styles
  bottomSheetBackground: {
    backgroundColor: '#161b22',
  },
  handleIndicator: {
    backgroundColor: '#30363d',
  },
  bottomSheetContainer: {
    flex: 1,
    backgroundColor: '#161b22',
  },
  bottomSheetHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c9d1d9',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#58a6ff',
  },
  bottomSheetContent: {
    flex: 1,
  },
//   itemOption: {
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#30363d',
//   },
  itemOptionText: {
    color: '#c9d1d9',
    fontSize: 16,
  },
  searchInput: {
    backgroundColor: '#0d1117',
    color: '#c9d1d9',
    padding: 12,
    margin: 16,
    borderRadius: 6,
  },
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
  },
  searchIcon: {
    marginRight: 8,
  },
//   searchInput: {
//     flex: 1,
//     color: '#c9d1d9',
//     fontSize: 16,
//   },
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
    marginTop: 8,
    paddingTop: 8,
    marginBottom: 0,
  },
  finalTotalLabel: {
    fontWeight: 'bold',
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
});
