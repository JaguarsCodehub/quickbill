import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import SearchablePicker from '@/components/SearchablePicker';

const CreateSalesChallan = () => {
  const customers = [
    {
      id: '1',
      name: 'John Doe',
      phone: '+1 234-567-8900',
      email: 'john@example.com',
      address: '123 Business Street, City'
    }
    // Add more customer objects as needed
  ];

  const [challanNumber, setChallanNumber] = useState('CH-1');
  const [date, setDate] = useState('24-10-2024');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  // Add new state for modals
  const [isItemSelectModalVisible, setIsItemSelectModalVisible] = useState(false);
  const [isItemDetailsModalVisible, setIsItemDetailsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [rate, setRate] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [discount, setDiscount] = useState('');

  // Sample customer data
  const sampleCustomer = {
    id: '1',
    name: 'John Doe',
    phone: '+1 234-567-8900',
    email: 'john@example.com',
    address: '123 Business Street, City'
  };

  // Sample product data
  const sampleProducts = [
    {
      id: '1',
      name: 'Product A',
      price: 100,
      quantity: 2,
      total: 200
    },
    {
      id: '2',
      name: 'Product B',
      price: 150,
      quantity: 1,
      total: 150
    }
  ];

  const handleSelectCustomer = () => {
    setSelectedCustomer(sampleCustomer);
  };

  const handleAddProducts = () => {
    setSelectedProducts(sampleProducts);
  };

  // Calculate total amount
  const totalAmount = selectedProducts.reduce((sum, product) => sum + product.total, 0);

  // Add handlers for item selection
  const handleAddItem = useCallback(() => {
    setIsProductsLoading(true);
    setIsItemSelectModalVisible(true);
    setIsProductsLoading(false);
  }, []);

  const handleItemSelect = (item: any) => {
    setSelectedItem(item);
    setRate(item.price.toString());
    setIsItemSelectModalVisible(false);
    setIsItemDetailsModalVisible(true);
  };

  const handleAddItemToOrder = () => {
    if (!selectedItem) return;

    const qty = Number(quantity);
    const itemRate = Number(rate);
    const itemValue = qty * itemRate;
    const discountAmount = discount ? (itemValue * Number(discount)) / 100 : 0;
    const total = itemValue - discountAmount;

    const newItem = {
      id: selectedItem.id,
      name: selectedItem.name,
      price: itemRate,
      quantity: qty,
      rate: itemRate,
      discount: Number(discount) || 0,
      total: total
    };

    setSelectedProducts([...selectedProducts, newItem]);
    setIsItemDetailsModalVisible(false);
    
    // Reset form
    setSelectedItem(null);
    setRate('');
    setQuantity('1');
    setDiscount('');
  };

  const handleSave = () => {
    Alert.alert('Feature under development');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Challan</Text>
          <TouchableOpacity style={styles.orderTypeButton}>
            <Text style={styles.orderTypeText}>Sales Challan</Text>
            <Ionicons name='chevron-down' size={20} color='#8b949e' />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Challan Number and Date */}
        <View style={styles.row}>
          <Text style={styles.orderNumber}>Challan No: CH/{challanNumber}</Text>
          <TouchableOpacity style={styles.dateButton}>
            <Text style={styles.dateText}>{date}</Text>
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
            labelKey="name"
            valueKey="id"
            icon="person-outline"
            selectedItem={selectedCustomer}
          />
          {selectedCustomer && (
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedInfoText}>{selectedCustomer.name}</Text>
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
          {selectedProducts.map((item, index) => (
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
          {selectedProducts.length > 0 && (
            <View style={styles.orderSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Items</Text>
                <Text style={styles.summaryValue}>{selectedProducts.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Amount</Text>
                <Text style={styles.summaryValue}>₹{totalAmount.toFixed(2)}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>CREATE CHALLAN</Text>
      </TouchableOpacity>

      {/* Add Item Selection Modal */}
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

            <View style={styles.searchContainer}>
              <Ionicons name='search' size={20} color='#8b949e' style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder='Search products...'
                placeholderTextColor='#8b949e'
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {isProductsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#58a6ff" />
                <Text style={styles.loadingText}>Loading products...</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalItemsList}>
                {sampleProducts.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.itemOption}
                    onPress={() => handleItemSelect(item)}
                  >
                    <View>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>₹ {item.price}</Text>
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
                <Text style={styles.cardTitle}>Selected Item</Text>
                {selectedItem && (
                  <>
                    <Text style={styles.itemName}>{selectedItem.name}</Text>
                    <Text style={styles.stockIndicator}>
                      Available Stock: <Text style={styles.stockCount}>100</Text>
                    </Text>
                  </>
                )}
              </View>

              {/* Pricing Card */}
              <View style={styles.detailsCard}>
                <Text style={styles.cardTitle}>Pricing Details</Text>
                
                <View style={styles.rateContainer}>
                  <Text style={styles.inputLabel}>Rate</Text>
                  <TextInput
                    style={[styles.input, styles.rateInput]}
                    value={rate}
                    onChangeText={setRate}
                    keyboardType="numeric"
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
                      keyboardType="numeric"
                      placeholder="Enter quantity"
                      placeholderTextColor="#8b949e"
                    />
                  </View>
                </View>

                <View style={styles.discountContainer}>
                  <View style={styles.discountInputWrapper}>
                    <Text style={styles.inputLabel}>Discount (%)</Text>
                    <TextInput
                      style={[styles.input]}
                      value={discount}
                      onChangeText={setDiscount}
                      keyboardType="numeric"
                      placeholder="Enter discount"
                      placeholderTextColor="#8b949e"
                    />
                  </View>
                </View>
              </View>

              {/* Total Amount Card */}
              <View style={[styles.detailsCard, styles.totalCard]}>
                <View style={styles.totalRow}>
                  <Text style={styles.summaryLabel}>Sub Total</Text>
                  <Text style={styles.summaryValue}>
                    ₹{((Number(rate) || 0) * (Number(quantity) || 0)).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.summaryLabel}>Discount</Text>
                  <Text style={styles.summaryValue}>
                    ₹{(((Number(rate) || 0) * (Number(quantity) || 0) * (Number(discount) || 0)) / 100).toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.totalRow, styles.finalTotal]}>
                  <Text style={styles.finalTotalLabel}>Total Amount</Text>
                  <Text style={styles.finalTotalAmount}>
                    ₹{(
                      (Number(rate) || 0) * (Number(quantity) || 0) * 
                      (1 - (Number(discount) || 0) / 100)
                    ).toFixed(2)}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.bottomButtons}>
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
};

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
    position: 'relative',
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



export default CreateSalesChallan;
