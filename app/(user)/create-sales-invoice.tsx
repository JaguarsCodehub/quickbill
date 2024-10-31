import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { Table, Row } from 'react-native-table-component';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';


interface Customer {
  CustomerID: number;
  CustomerName: string;
  Code: string;
}


interface Item {
  ItemID: number;
  ItemCode: string;
  ItemName: string;
  SalRate: number;
  HSNCode: string;
  TaxCode: string;
}

interface OrderItem extends Item {
  UTGSTTaxCode: any;
  IGSTTaxCode: any;
  GSTTaxCode: any;
  TaxCategory: any;
  Qty: number;
  Rate: number;
  Value: number;
  Disc: number;
  Taxable: number;
  TaxAmt: number;
  Amount: number;
  discountPercentage: number;
  discountAmount: number;
  notes: string;
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


const SearchablePicker = ({
  items,
  onSelect,
  placeholder,
  labelKey,
  valueKey,
  icon,
  selectedItem
}: {
  items: any[],
  onSelect: (item: any) => void,
  placeholder: string,
  labelKey: string,
  valueKey: string,
  icon: string,
  selectedItem: any
}) => {
  const [query, setQuery] = useState(selectedItem ? selectedItem[labelKey] : '');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setQuery(selectedItem ? selectedItem[labelKey] : '');
  }, [selectedItem]);

  const filteredItems = items.filter((item) =>
    (item[labelKey] && item[labelKey].toString().toLowerCase().includes(query.toLowerCase())) ||
    (item[valueKey] && item[valueKey].toString().toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <View style={styles.pickerContainer}>
      <View style={styles.inputContainer}>
        <Ionicons name={icon as any} size={24} color="#7868e5" style={styles.inputIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="#7868e5"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
        />
      </View>
      {showDropdown && (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item[valueKey]?.toString() || item[labelKey]?.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(item);
                setQuery(item[labelKey]?.toString() || '');
                setShowDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{item[labelKey]} - {item[valueKey]}</Text>
            </TouchableOpacity>
          )}
          style={styles.dropdown}
          nestedScrollEnabled={true}
        />
      )}
    </View>
  );
};


const CreateSalesInvoice = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [nextSerial, setNextSerial] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [rate, setRate] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isItemSelectModalVisible, setIsItemSelectModalVisible] = useState(false);
  const [isItemDetailsModalVisible, setIsItemDetailsModalVisible] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState<string>('0');
  const [discountAmount, setDiscountAmount] = useState<string>('0');
  const [itemNotes, setItemNotes] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);


  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchCustomers(), fetchItems()]);
      setCurrentDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error fetching data:', error);
      // You might want to show an error message to the user here
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

  const calculateItemValues = () => {
    if (!selectedItem) return null;

    const qty = parseFloat(quantity) || 0;
    const itemRate = parseFloat(rate) || parseFloat(selectedItem.SalRate.toString()) || 0;
    const itemValue = parseFloat(value) || (qty * itemRate);
    const discPercent = parseFloat(discountPercentage) || 0;
    const discAmount = parseFloat(discountAmount) || 0;
    const taxable = itemValue - discAmount;
    const taxRate = 0.18; // Assuming 18% tax
    const taxAmount = taxable * taxRate;
    const totalAmount = taxable + taxAmount;

    return {
      Qty: qty.toFixed(2),
      Rate: itemRate.toFixed(2),
      Value: itemValue.toFixed(2),
      'Disc(%)': discPercent.toFixed(2),
      'Disc(₹)': discAmount.toFixed(2),
      Taxable: taxable.toFixed(2),
      TaxCode: selectedItem.TaxCode || 'N/A',
      TaxAmt: taxAmount.toFixed(2),
      Amount: totalAmount.toFixed(2),
    };
  };


  const itemValues = calculateItemValues();

  const updateRate = (newRate: string) => {
    setRate(newRate);
    if (selectedItem) {
      const qty = parseFloat(quantity) || 0;
      const itemRate = parseFloat(newRate) || 0;
      setValue((qty * itemRate).toFixed(2));
    }
  };

  const updateValue = (newValue: string) => {
    setValue(newValue);
    if (selectedItem) {
      const qty = parseFloat(quantity) || 0;
      if (qty !== 0) {
        setRate((parseFloat(newValue) / qty).toFixed(2));
      }
    }
  };

  const addItemToOrder = () => {
    if (!selectedItem) return;

    const newItem: OrderItem = {
      ...selectedItem,
      Qty: parseFloat(quantity),
      Rate: parseFloat(rate),
      Value: parseFloat(value),
      Disc: 0, // You may want to add a discount input field
      Taxable: parseFloat(itemValues?.Taxable || '0'),
      TaxAmt: parseFloat(itemValues?.TaxAmt || '0'),
      Amount: parseFloat(itemValues?.Amount || '0'),
      UTGSTTaxCode: undefined,
      IGSTTaxCode: undefined,
      GSTTaxCode: undefined,
      TaxCategory: undefined,
      discountPercentage: 0,
      discountAmount: 0,
      notes: '',
    };

    setOrderItems([...orderItems, newItem]);


    // Reset item selection
    setSelectedItem(null);
    setQuantity('1');
    setRate('');
    setValue('');
    // setItems([])
  };

  const removeItemFromOrder = (index: number) => {
    const newOrderItems = [...orderItems];
    newOrderItems.splice(index, 1);
    setOrderItems(newOrderItems);
  };

  const calculateOrderSummary = () => {
    let totalValueAmount = 0;
    let totalDiscountAmount = 0;
    let totalTaxableAmount = 0;
    let totalCGSTAmount = 0;
    let totalSGSTAmount = 0;
    let totalIGSTAmount = 0;
    let totalTaxAmount = 0;
    let totalAmount = 0;
    let totalGoodsQty = 0;
    let totalServicesQty = 0;

    const itemBreakdown = orderItems.map(item => {
      const itemCGST = item.TaxAmt / 2;
      const itemSGST = item.TaxAmt / 2;
      const itemIGST = 0;

      totalValueAmount += item.Value;
      totalDiscountAmount += item.discountAmount;
      totalTaxableAmount += item.Taxable;
      totalCGSTAmount += itemCGST;
      totalSGSTAmount += itemSGST;
      totalTaxAmount += item.TaxAmt;
      totalAmount += item.Amount;
      totalGoodsQty += item.Qty;

      return {
        name: item.ItemName,
        qty: item.Qty,
        rate: item.Rate,
        value: item.Value,
        discountPercentage: item.discountPercentage,
        discountAmount: item.discountAmount,
        taxable: item.Taxable,
        taxAmt: item.TaxAmt,
        cgst: itemCGST,
        sgst: itemSGST,
        igst: itemIGST,
        amount: item.Amount
      };
    });

    return {
      itemBreakdown,
      totalValueAmount,
      totalDiscountAmount,
      totalTaxableAmount,
      totalCGSTAmount,
      totalSGSTAmount,
      totalIGSTAmount,
      totalTaxAmount,
      totalAmount,
      totalGoodsQty,
      totalServicesQty
    };
  };

  const orderSummary = calculateOrderSummary();

  const handleSubmit = async () => {
    if (!selectedCustomer || orderItems.length === 0) {
      Alert.alert('Error', 'Please select a customer and add at least one item to the order.');
      return;
    }

    setIsSubmitting(true);

    console.log('Order summary:', orderSummary);
    const userId = await AsyncStorage.getItem('UserID');
    const companyId = await AsyncStorage.getItem('CompanyID');
    const prefix = await AsyncStorage.getItem('SelectedYear');

    const orderSubmit: OrderSubmit = {
      docNo: nextSerial,
      docDate: currentDate,
      orderNo: `SOR/${nextSerial}`,
      orderDate: currentDate,
      pageNo: '',
      partyCode: selectedCustomer.Code,
      billAmt: orderSummary.totalAmount,
      totalQty: orderSummary.totalGoodsQty + orderSummary.totalServicesQty,
      netAmt: orderSummary.totalTaxableAmount,
      taxAmt: orderSummary.totalTaxAmount,
      discAmt: orderSummary.totalDiscountAmount,
      mainType: 'SL', // Adjust as needed
      subType: 'RS', // Adjust as needed
      type: 'SAL', // Adjust as needed
      prefix: await AsyncStorage.getItem('SelectedYear') || '',
      narration: '', // Add a narration field if needed
      userId: userId || '',
      companyId: companyId || '',
      createdBy: userId || '',
      modifiedBy: userId || '',
      partyName: selectedCustomer.CustomerName,
      selection: '', // Add a selection field if needed
      productName: '', // Add a productName field if needed
      discPer: 0, // Calculate discount percentage if needed
      cgst: orderSummary.totalCGSTAmount,
      sgst: orderSummary.totalSGSTAmount,
      igst: orderSummary.totalIGSTAmount,
      utgst: 0, // Add UTGST if needed
      rate: 0, // Add an overall rate if needed
      addCode: '',
      totalAmt: orderSummary.totalAmount,
      items: orderItems.map((item, index) => ({
        srl: nextSerial,
        sNo: '0000' + (index + 1),
        currName: item.HSNCode, // Adjust as needed
        currRate: 0, // Adjust as needed
        docDate: currentDate,
        itemCode: item.ItemCode,
        qty: item.Qty,
        rate: item.Rate,
        disc: item.Disc,
        amt: item.Amount,
        partyCode: selectedCustomer.Code,
        storeCode: '', // Add a storeCode if needed
        mainType: 'SL',
        subType: 'RS',
        type: 'SAL',
        prefix: prefix || '',
        narration: item.notes || '', // Add the item's note here
        branchCode: '', // Add a branchCode if needed
        unit: '', // Add a unit if needed
        discAmt: item.Disc,
        mrp: item.Rate, // Adjust if MRP is different from Rate
        newRate: item.Rate,
        taxCode: item.TaxCode || '',
        taxAmt: item.TaxAmt,
        cessAmt: 0, // Add cess amount if applicable
        taxable: item.Taxable,
        barcodeValue: '', // Add barcode value if available
        userId: userId || '',
        companyId: companyId || '',
        createdBy: userId || '',
        modifiedBy: userId || '',
        cgst: item.TaxAmt / 2, // Assuming equal split between CGST and SGST
        sgst: item.TaxAmt / 2,
        igst: 0, // Add IGST if applicable
        utgst: 0, // Add UTGST if applicable
        pnding: item.Qty, // Make sure this field is correctly set
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

  const handleAddItem = () => {
    setIsItemSelectModalVisible(true); // Open item selection modal
  };

  const handleItemSelect = (item: Item) => {
    setSelectedItem(item);
    setRate(item.SalRate.toString());
    setIsItemSelectModalVisible(false);
    setIsItemDetailsModalVisible(true); // Open item details modal
  };

  const handleAddItemToOrder = () => {
    if (!selectedItem) return;

    const newItem: OrderItem = {
      ...selectedItem,
      Qty: parseFloat(quantity),
      Rate: parseFloat(rate),
      Value: parseFloat(value),
      Disc: parseFloat(discountPercentage) || 0,
      Taxable: parseFloat(itemValues?.Taxable || '0'),
      TaxAmt: parseFloat(itemValues?.TaxAmt || '0'),
      Amount: parseFloat(itemValues?.Amount || '0'),
      UTGSTTaxCode: undefined,
      IGSTTaxCode: undefined,
      GSTTaxCode: undefined,
      TaxCategory: undefined,
      discountPercentage: parseFloat(discountPercentage) || 0,
      discountAmount: parseFloat(discountAmount) || 0,
      notes: itemNotes || '',
    };

    setOrderItems([...orderItems, newItem]);
    setIsItemDetailsModalVisible(false);

    // Reset all fields
    setSelectedItem(null);
    setQuantity('1');
    setRate('');
    setValue('');
    setDiscountPercentage('0');
    setDiscountAmount('0');
    setItemNotes('');
  };

  const calculateDiscountAmount = (percentage: string) => {
    const itemValue = parseFloat(value) || 0;
    const discPercent = parseFloat(percentage) || 0;
    return ((itemValue * discPercent) / 100).toFixed(2);
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#cfd9df', '#e2ebf0']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7868e5" />
        <Text style={styles.loadingText}>Loading order data...</Text>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#cfd9df', '#e2ebf0']} style={styles.gradient}>
        <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>New Invoice</Text>
            <Ionicons name="cart" size={24} color="#7868e5" />
          </View>

          <View style={styles.card}>
            <View style={styles.headerInfo}>
              <View style={styles.headerItem}>
                <Ionicons name="calendar-outline" size={24} color="#7868e5" />
                <Text style={styles.headerText}>Date:</Text>
                <Text style={styles.headerValue}>{currentDate}</Text>
              </View>

              <View style={styles.headerItem}>
                <Ionicons name="document-text-outline" size={24} color="#7868e5" />
                <Text style={styles.headerText}>No:</Text>
                <Text style={styles.headerValue}>SOR/{nextSerial}</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Customer</Text>
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
                <Ionicons name="checkmark-circle" size={24} color="#00c06c" />
                <Text style={styles.selectedInfoText}>{selectedCustomer.CustomerName}</Text>
              </View>
            )}

            <View style={{ marginTop: 10 }}>
              <Text style={styles.sectionTitle}>Item</Text>
              <TouchableOpacity style={{ backgroundColor: "#000", borderRadius: 10, padding: 10, display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", }} onPress={handleAddItem}>
                <Text style={{ color: "white", fontSize: 15, fontWeight: "500" }}>Add Item</Text>
                <Ionicons name="add-circle" size={24} color="#FFF" style={{ marginLeft: 5 }} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Order Items</Text>
              {orderItems.length > 0 && (
                <View style={styles.orderTotal}>
                  <Text style={styles.orderTotalText}>
                    Total: ₹{orderSummary.totalAmount.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>

            {orderItems.length > 0 ? (
              <View style={styles.orderItemsList}>
                {orderItems.map((item, index) => (
                  <View key={index} style={styles.orderItemCard}>
                    <View style={styles.orderItemHeader}>
                      <View style={styles.orderItemMain}>
                        <View style={styles.orderItemTitleRow}>
                          <Text style={styles.orderItemName}>{item.ItemName}</Text>
                          <TouchableOpacity
                            onPress={() => removeItemFromOrder(index)}
                            style={styles.removeButton}
                          >
                            <Ionicons name="close-circle" size={24} color="#FF3B30" />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.itemCode}>Itemcode: {item.ItemCode}</Text>
                      </View>
                    </View>

                    <View style={styles.orderDetailsGrid}>
                      <View style={styles.detailRow}>
                        <View style={styles.detailCol}>
                          <Text style={styles.detailLabel}>Quantity</Text>
                          <Text style={styles.detailValue}>{item.Qty} pcs</Text>
                        </View>
                        <View style={styles.detailCol}>
                          <Text style={styles.detailLabel}>Rate</Text>
                          <Text style={styles.detailValue}>₹{item.Rate.toFixed(2)}</Text>
                        </View>
                        <View style={styles.detailCol}>
                          <Text style={styles.detailLabel}>Value</Text>
                          <Text style={styles.detailValue}>₹{item.Value.toFixed(2)}</Text>
                        </View>
                      </View>

                      {(item.discountPercentage > 0 || item.discountAmount > 0) && (
                        <View style={styles.discountRow}>
                          <View style={styles.detailCol}>
                            <Text style={styles.detailLabel}>Discount</Text>
                            <Text style={styles.discountValue}>
                              {item.discountPercentage}% (₹{item.discountAmount.toFixed(2)})
                            </Text>
                          </View>
                          <View style={styles.detailCol}>
                            <Text style={styles.detailLabel}>After Discount</Text>
                            <Text style={styles.detailValue}>₹{item.Taxable.toFixed(2)}</Text>
                          </View>
                        </View>
                      )}

                      <View style={styles.taxRow}>
                        <View style={styles.detailCol}>
                          <Text style={styles.detailLabel}>Tax</Text>
                          <Text style={styles.detailValue}>₹{item.TaxAmt.toFixed(2)}</Text>
                        </View>
                        <View style={styles.detailCol}>
                          <Text style={styles.detailLabel}>Net Amount</Text>
                          <Text style={styles.netAmountValue}>₹{item.Amount.toFixed(2)}</Text>
                        </View>
                      </View>

                      {item.notes && (
                        <View style={styles.notesContainer}>
                          <Ionicons name="document-text-outline" size={16} color="#666666" />
                          <Text style={styles.notesText}>{item.notes}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}

                <View style={styles.orderSummaryFooter}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Sub Total:</Text>
                    <Text style={styles.summaryValue}>₹{orderSummary.totalValueAmount.toFixed(2)}</Text>
                  </View>
                  {orderSummary.totalDiscountAmount > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Total Discount:</Text>
                      <Text style={styles.discountValue}>-₹{orderSummary.totalDiscountAmount.toFixed(2)}</Text>
                    </View>
                  )}
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Tax:</Text>
                    <Text style={styles.summaryValue}>₹{orderSummary.totalTaxAmount.toFixed(2)}</Text>
                  </View>
                  <View style={[styles.summaryRow, styles.netAmountRow]}>
                    <Text style={styles.netAmountLabel}>Net Amount:</Text>
                    <Text style={styles.netAmountTotal}>₹{orderSummary.totalAmount.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <Text style={styles.noItemsText}>No items added to the order yet.</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#0a0a0a" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Order</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>

      {/* Item Selection Modal */}
      <Modal
        visible={isItemSelectModalVisible}
        animationType='fade'
        transparent={true}
        onRequestClose={() => setIsItemSelectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Product</Text>
                <Text style={styles.modalDescription}>Choose a product to add to your order</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsItemSelectModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name='close' size={24} color='#333333' />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <SearchablePicker
                items={items}
                onSelect={handleItemSelect}
                placeholder="Search items..."
                labelKey="ItemName"
                valueKey="ItemCode"
                icon="cube-outline"
                selectedItem={selectedItem}
              />
            </View>
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
        <View style={styles.itemModalOverlay}>
          <View style={[styles.itemModalContent, { width: '90%', maxHeight: '80%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Item Details</Text>
                <TouchableOpacity onPress={() => setIsItemDetailsModalVisible(false)}>
                  <Ionicons name='close' size={24} color='#c9d1d9' />
                </TouchableOpacity>
              </View>

              {selectedItem && (
                <View style={styles.itemDetailsContainer}>
                  <Text style={styles.itemDetailLabel}>Selected Item</Text>
                  <Text style={styles.itemDetailValue}>{selectedItem.ItemName}</Text>

                  <View style={styles.detailSection}>
                    <Text style={styles.itemDetailLabel}>Stock</Text>
                    <Text style={styles.stockValue}>0 Pcs</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.itemDetailLabel}>Rate</Text>
                    <TextInput
                      style={styles.detailInput}
                      value={rate}
                      onChangeText={updateRate}
                      keyboardType="numeric"
                      placeholder="Enter rate"
                      placeholderTextColor="#888888"
                    />
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.itemDetailLabel}>Quantity</Text>
                    <TextInput
                      style={styles.detailInput}
                      value={quantity}
                      onChangeText={(text) => {
                        setQuantity(text);
                        setValue((parseFloat(text) * parseFloat(rate)).toFixed(2));
                      }}
                      keyboardType="numeric"
                      placeholder="Enter quantity"
                      placeholderTextColor="#888888"
                    />
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.itemDetailLabel}>Discount</Text>
                    <View style={styles.discountContainer}>
                      <TextInput
                        style={[styles.detailInput, { flex: 1 }]}
                        value={discountPercentage}
                        onChangeText={(text) => {
                          setDiscountPercentage(text);
                          setDiscountAmount(calculateDiscountAmount(text));
                        }}
                        keyboardType="numeric"
                        placeholder="%"
                        placeholderTextColor="#888888"
                      />
                      <Text style={styles.discountSeparator}>|</Text>
                      <TextInput
                        style={[styles.detailInput, { flex: 1 }]}
                        value={discountAmount}
                        onChangeText={setDiscountAmount}
                        keyboardType="numeric"
                        placeholder="₹"
                        placeholderTextColor="#888888"
                        editable={false}
                      />
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.itemDetailLabel}>Notes</Text>
                    <TextInput
                      style={styles.notesInput}
                      value={itemNotes}
                      onChangeText={setItemNotes}
                      placeholder="Add notes"
                      placeholderTextColor="#888888"
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={styles.totalSection}>
                    <Text style={styles.totalLabel}>Item Total</Text>
                    <Text style={styles.totalValue}>₹ {itemValues?.Amount || '0.00'}</Text>
                  </View>
                </View>
              )}

              <TouchableOpacity onPress={handleAddItemToOrder} style={styles.addButton}>
                <Text style={styles.addButtonText}>Add to Order</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};


export default CreateSalesInvoice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC', // Light background
  },
  gradient: {
    flex: 1,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333', // Darker text color for light theme
  },
  card: {
    backgroundColor: '#FFFFFF', // Light card background
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: "space-between"
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333', // Darker text
    marginLeft: 8,
    marginRight: 4,
  },
  headerValue: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333333', // Darker text
    // marginLeft: 5
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333', // Darker text
    marginTop: 8,
    marginBottom: 12
  },
  pickerContainer: {
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1', // Light input background
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333333', // Darker text
  },
  dropdown: {
    maxHeight: 200,
    backgroundColor: '#E0E6ED', // Light dropdown background
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D9E6', // Light border
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333333', // Darker text
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 8,
  },
  selectedInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00c06c', // Blue accent
    marginLeft: 8,
  },
  itemDetails: {
    marginTop: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF', // White text
  },
  itemCode: {
    fontSize: 14,
    color: '#888888', // Grey text
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  boxinputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 14,
    color: '#888888', // Grey text
    marginBottom: 4,
  },
  input: {
    height: 40,
    backgroundColor: '#1C1C1E', // Dark input background
    borderRadius: 10,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#FFFFFF', // White text
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E', // Dark input background
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  quantityInput: {
    height: 40,
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    color: '#FFFFFF', // White text
  },
  itemValuesContainer: {
    marginTop: 16,
  },
  itemValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemValueLabel: {
    fontSize: 14,
    color: '#888888', // Grey text
  },
  itemValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF', // White text
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7868e5', // Purple button
    borderRadius: 10,
    padding: 16,
    marginTop: 20,
  },
  addButtonText: {
    color: '#FFFFFF', // White text
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7868e5', // Green text
  },
  tableContainer: {
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E6ED',
  },
  tableHeader: {
    height: 50,
    backgroundColor: '#F5F5F5',
  },
  tableHeaderText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333333',
  },
  tableRowEven: {
    height: 60,
    backgroundColor: '#FFFFFF',
  },
  tableRowOdd: {
    height: 60,
    backgroundColor: '#F9FAFB',
  },
  tableRowText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#333333',
  },
  itemNameText: {
    fontSize: 14,
    color: '#333333',
    paddingHorizontal: 5,
    flex: 1,
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  noItemsText: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    fontSize: 16,
    color: '#888888', // Grey text
  },
  submitButton: {
    backgroundColor: '#4d37e3', // Purple button
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#8FBC8F', // Disabled button color
  },
  submitButtonText: {
    color: '#FFFFFF', // White text
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryTable: {
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#888888', // White text
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888888', // White text
  },
  totalAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333', // Dark border
  },
  totalAmountLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#616161', // Green text
  },
  totalAmountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#616161', // Green text
  },
  itemSummaryGrid: {
    gap: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#404040',
  },
  // summaryRow: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   gap: 20,
  // },
  summaryCol: {
    flex: 1,
  },
  // summaryLabel: {
  //   fontSize: 14,
  //   color: '#888888',
  //   marginBottom: 4,
  // },
  // summaryValue: {
  //   fontSize: 16,
  //   color: '#FFFFFF',
  //   fontWeight: '500',
  // },
  itemTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#404040',
  },
  itemTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#616161',
  },
  itemTotalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7868e5',
  },
  orderTotalCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 15,
    padding: 20,
    marginTop: 25,
    gap: 12,
  },
  orderTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotalLabel: {
    fontSize: 16,
    color: '#919191',
  },
  orderTotalValue: {
    fontSize: 16,
    color: '#919191',
    fontWeight: '500',
  },
  finalTotal: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#404040',
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  finalTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7868e5',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
  },
  itemModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E6ED',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
    marginTop: -8,
    marginRight: -8,
  },
  modalBody: {
    padding: 20,
  },
  itemDetailsContainer: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
  },
  selectedItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E88E5',
  },
  itemDetailLabel: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  itemDetailValue: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '600',
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E0E6ED',
  },
  stockValue: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500',
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  discountSeparator: {
    color: '#666666',
    fontSize: 20,
    marginHorizontal: 10,
  },
  notesInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E0E6ED',
    height: 100,
    textAlignVertical: 'top',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E6ED',
  },
  // addButton: {
  //   backgroundColor: '#1E88E5',
  //   borderRadius: 10,
  //   padding: 16,
  //   alignItems: 'center',
  //   marginTop: 16,
  // },
  // addButtonText: {
  //   color: '#FFFFFF',
  //   fontSize: 16,
  //   fontWeight: 'bold',
  // },
  readOnlyInput: {
    backgroundColor: '#F0F0F0',
    color: '#1E88E5',
  },
  summaryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    // paddingBottom: 15,
    // borderBottomWidth: 1,
    // borderBottomColor: '#404040',
  },

  summaryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7868e5',
    marginLeft: 10,
  },

  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  itemNumberBadge: {
    backgroundColor: '#7868e5',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  itemNumberText: {
    color: '#e2ebf0',
    fontSize: 14,
    fontWeight: 'bold',
  },

  itemSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2ebf0',
  },

  orderSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 20,
  },

  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#404040',
  },

  separatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7868e5',
    marginHorizontal: 10,
  },

  itemSummaryName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },

  orderItemsList: {
    gap: 12,
  },
  orderItemCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E6ED',
  },
  orderItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderItemMain: {
    flex: 1,
    marginRight: 12,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  orderItemQuantity: {
    fontSize: 14,
    color: '#666666',
  },
  removeButton: {
    padding: 4,
  },
  orderItemFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItemAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7868e5',
  },
  discountText: {
    fontSize: 14,
    color: '#00c06c',
    fontWeight: "600"
  },
  // noItemsText: {
  //   textAlign: 'center',
  //   marginTop: 20,
  //   marginBottom: 20,
  //   fontSize: 16,
  //   color: '#888888',
  //   fontStyle: 'italic',
  // },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E6ED',
    gap: 6,
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    // fontStyle: 'italic',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  orderTotal: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  orderTotalText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  orderItemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  // itemCode: {
  //   fontSize: 14,
  //   color: '#666666',
  //   marginTop: 2,
  // },
  orderDetailsGrid: {
    marginTop: 12,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E6ED',
  },
  discountValue: {
    fontSize: 16,
    color: '#00c06c',
    fontWeight: '500',
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E6ED',
  },
  netAmountValue: {
    fontSize: 16,
    color: '#7868e5',
    fontWeight: '600',
  },
  orderSummaryFooter: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#1a1a1a', // Changed to dark background
    borderRadius: 12,
    gap: 12,
  },
  // summaryRow: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  // },
  // summaryLabel: {
  //   fontSize: 16,
  //   color: '#a3a3a3', // Changed to lighter gray
  // },
  // summaryValue: {
  //   fontSize: 16,
  //   color: '#ffffff', // Changed to white
  //   fontWeight: '500',
  // },
  // discountValue: {
  //   fontSize: 16,
  //   color: '#00c06c', // Kept the green color for discount
  //   fontWeight: '500',
  // },
  netAmountRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333', // Changed to darker border
  },
  netAmountLabel: {
    fontSize: 18,
    color: '#ffffff', // Changed to white
    fontWeight: '600',
  },
  netAmountTotal: {
    fontSize: 20,
    color: '#7868e5', // Kept the purple accent
    fontWeight: '700',
  },
});
