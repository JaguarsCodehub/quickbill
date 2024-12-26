import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { Table, Row } from 'react-native-table-component';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import RippleLoader from '@/components/RippleLoader';
import { COLORS } from '@/constants/Colors';
import GridBackground from '@/components/GridBackground';
import TaxCodePicker from '@/components/TaxCodePicker';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import WebView from 'react-native-webview';
import { PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import { NativeModules } from 'react-native';
const { RNHTMLtoPDF: NativeRNHTMLtoPDF } = NativeModules;
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface Customer {
  CustomerID: number;
  CustomerName: string;
  Code: string;
  GSTIN?: string;
}


interface Item {
  ItemID: number;
  ItemCode: string;
  ItemName: string;
  SalRate: number;
  HSNCode: string;
  GSTTaxCode: string;
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

const requestStoragePermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to storage to save PDF',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Permission error:', err);
      return false;
    }
  }
  return true;
};


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


const CreateSalesReturn = () => {
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
  const [gstTaxCode, setGstTaxCode] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isItemSelectModalVisible, setIsItemSelectModalVisible] = useState(false);
  const [isItemDetailsModalVisible, setIsItemDetailsModalVisible] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState<string>('0');
  const [discountAmount, setDiscountAmount] = useState<string>('0');
  const [itemNotes, setItemNotes] = useState<string>('');
  const [customerCode, setCustomerCode] = useState<string>('');
  const [editedHSNCode, setEditedHSNCode] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchData();
    fetchCompanyDetails();

    // Check if the native module is available
    if (!NativeRNHTMLtoPDF) {
      console.error('RNHTMLtoPDF native module not found');
    }
    requestStoragePermission()
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

      const response = await axios.get('https://quickbill-backlend.vercel.app/return-items', {
        headers: {
          'UserID': userId,
          'CompanyID': companyId,
          'Prefix': prefix,
        }
      });
      setItems(response.data.items);
      setNextSerial(response.data.nextSerial);
      const gstTaxCode = response.data.items.map((item: any) => item.GSTTaxCode);
      // console.log("GST Tax Code:", gstTaxCode)
      setGstTaxCode(gstTaxCode);
      console.log("Response:", response.data.nextSerial)
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
      GSTTaxCode: selectedItem.GSTTaxCode || 'N/A',
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

  const [companyDetails, setCompanyDetails] = useState<any>(null);


  const fetchCompanyDetails = async () => {
    try {
      // const userId = await AsyncStorage.getItem('UserID');
      const companyId = await AsyncStorage.getItem('CompanyID');

      console.log('Fetching company details with:', { companyId }); // Debug log

      const response = await axios.get('https://quickbill-backlend.vercel.app/company-details', {
        headers: {
          // 'UserID': userId,
          'CompanyID': companyId
        }
      });

      console.log('Company details response:', response);

      if (response.data) {
        setCompanyDetails(response.data);
        console.log("Company Data:", response)
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
      // Handle error appropriately
    }
  };



  const handleSubmit = async () => {
    if (!selectedCustomer || orderItems.length === 0) {
      Alert.alert('Error', 'Please select a customer and add at least one item to the order.');
      return;
    }

    setIsSubmitting(true);

    const userId = await AsyncStorage.getItem('UserID');
    const companyId = await AsyncStorage.getItem('CompanyID');
    const prefix = await AsyncStorage.getItem('SelectedYear');
    const asyncCustomerCode = await AsyncStorage.getItem('CustomerCode');

    const invoiceSubmit = {
      customerCode: asyncCustomerCode,
      docNo: nextSerial,
      docDate: currentDate,
      billNo: `SRT/${nextSerial}`,
      billDate: currentDate,
      partyCode: selectedCustomer.Code,
      billAmt: orderSummary.totalAmount,
      totalQty: orderSummary.totalGoodsQty + orderSummary.totalServicesQty,
      netAmt: orderSummary.totalTaxableAmount,
      taxAmt: orderSummary.totalTaxAmount,
      discAmt: orderSummary.totalDiscountAmount,
      mainType: 'SL',
      subType: 'NS',
      type: 'SRT',
      prefix: prefix || '',
      narration: '',
      userId: parseInt(userId || '0'),
      companyId: parseInt(companyId || '0'),
      createdBy: parseInt(userId || '0'),
      modifiedBy: parseInt(userId || '0'),
      partyName: selectedCustomer.CustomerName,
      selection: '',
      productName: '',
      discPer: 0,
      cgst: orderSummary.totalCGSTAmount,
      sgst: orderSummary.totalSGSTAmount,
      igst: orderSummary.totalIGSTAmount,
      utgst: 0,
      rate: 0,
      totalAmt: orderSummary.totalAmount,
      addCode: '',
      status: 'PENDING',
      roundoff: 0,
      extrCharch: 0,
      discountExtra: 0,
      exchargelager: '',
      refVoucherNo: '',
      refVoucherDate: currentDate,
      fileName: '',
      transpoter: '',
      lrNo: '',
      eWayBillNo: '',
      modeofTarn: '',
      dispatch: '',
      noPackage: '',
      eInvRemarks: '',
      placeOfSuply: '',
      items: orderItems.map((item, index) => ({
        srl: nextSerial,
        sNo: '0000' + (index + 1),
        currName: item.HSNCode,
        currRate: 0,
        docDate: currentDate,
        itemCode: item.ItemCode,
        qty: item.Qty,
        rate: item.Rate,
        disc: item.discountPercentage || 0,
        amt: item.Amount,
        partyCode: selectedCustomer.Code,
        storeCode: '',
        mainType: 'SL',
        subType: 'NS',
        type: 'SRT',
        prefix: prefix || '',
        narration: item.notes || '',
        branchCode: '',
        unit: '',
        discAmt: item.discountAmount || 0,
        mrp: item.Rate,
        newRate: item.Rate,
        taxCode: item.GSTTaxCode || '',
        taxAmt: item.TaxAmt,
        cessAmt: 0,
        taxable: item.Taxable,
        barcodeValue: '',
        userId: parseInt(userId || '0'),
        companyId: parseInt(companyId || '0'),
        createdBy: parseInt(userId || '0'),
        modifiedBy: parseInt(userId || '0'),
        cgst: item.TaxAmt / 2,
        sgst: item.TaxAmt / 2,
        igst: 0,
        utgst: 0,
        pnding: item.Qty,
        colours: '',
        s1: '', q1: 0,
        s2: '', q2: 0,
        s3: '', q3: 0,
        s4: '', q4: 0,
        s5: '', q5: 0,
        s6: '', q6: 0,
        s7: '', q7: 0,
        s8: '', q8: 0,
        s9: '', q9: 0
      }))
    };

    try {
      const response = await fetch('https://quickbill-backlend.vercel.app/api/create-return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceSubmit),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create return');
      }

      Alert.alert('Success', 'Return created successfully!');
      // router.push('/invoices');
    } catch (error: any) {
      console.error('Error creating Sales Return:', error);
      Alert.alert('Error', `Failed to create Sales Return. ${error.message}`);
    } finally {
      setIsSubmitting(false);
      // Reset all fields
      setSelectedItem(null);
      setQuantity('1');
      setRate('');
      setValue('');
      setDiscountPercentage('0');
      setDiscountAmount('0');
      setItemNotes('');
      setCustomers([])
      setItems([])
      setOrderItems([])
    }
  };

  const handleAddItem = () => {
    setIsItemSelectModalVisible(true); // Open item selection modal
  };

  const handleItemSelect = (item: Item) => {
    setSelectedItem(item);
    setEditedHSNCode(item.HSNCode || '');
    setRate(item.SalRate.toString());
    setIsItemSelectModalVisible(false);
    setIsItemDetailsModalVisible(true); // Open item details modal
  };

  const handleCustomerSelect = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerCode(customer.Code);
    console.log("Inside Handle Customer Select Customer Code:", customer.Code)
    const customerCode = await AsyncStorage.setItem('CustomerCode', customer.Code);
    const asyncCustomerCode = await AsyncStorage.getItem('CustomerCode');
    console.log("AsyncStorage Customer Code:", asyncCustomerCode)
  };

  const handleAddItemToOrder = () => {
    if (!selectedItem) return;

    const newItem: OrderItem = {
      ...selectedItem,
      HSNCode: editedHSNCode,
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
    setEditedHSNCode('');
  };

  const calculateDiscountAmount = (percentage: string) => {
    const itemValue = parseFloat(value) || 0;
    const discPercent = parseFloat(percentage) || 0;
    return ((itemValue * discPercent) / 100).toFixed(2);
  };


  const prepareInvoiceData = () => {
    return {
      docNo: nextSerial,
      docDate: currentDate,
      customerName: selectedCustomer?.CustomerName || '',
      customerCode: selectedCustomer?.Code || '',
      items: orderItems,
      totalAmount: orderSummary.totalAmount,
      totalTaxAmount: orderSummary.totalTaxAmount,
      totalDiscountAmount: orderSummary.totalDiscountAmount,
    };
  };





  const renderPreviewModal = () => {

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
          <style>
            body { 
              font-family: Arial, sans-serif;
              padding: 20px;
              margin: 0;
              font-size: 12px;
            }
            .logo-header {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 10px;
              text-align: center;
            }
            .logo {
              width: 80px;
              text-align: center;
            }
            .company-name {
              font-size: 16px;
              font-weight: bold;
              text-align: center;
            }
            .company-details {
              text-align: center;
              font-size: 12px;
              margin-bottom: 10px;
              padding-left: 10px;
              padding-right: 10px;
            }
            .company-info {
              margin-left: 10px;
              text-align: center;
            }
            .company-info-2 {
              margin-top: 10px;
              margin-left: 5px;
              text-align: center;
              }
            .company-info-2 span {
              font-weight: bold;
            }
            .company-info-2 span:nth-child(2) {
              font-weight: bold;
              margin-left: 10px;
            }
            .state-info-container {
              display: flex;
              justify-content: space-between;
              border-bottom: 1px solid #000;

            }
            .state-gst {
              margin-right: 10px;
            }
            .invoice-box {
              border: 1px solid #000;
            }
            .invoice-title {
              text-align: center;
              border-bottom: 1px solid #000;
              padding: 5px;
              font-weight: bold;
              background-color: #c6c6c6;
              color: #000;
            }
            .state-info {
              padding: 5px;
            }
            .two-column {
              display: flex;
              border-bottom: 1px solid #000;
            }
            .left-column {
              flex: 1;
              border-right: 1px solid #000;
              padding: 5px;
            }
            .right-column {
              flex: 1;
              padding: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #000;
              padding: 5px;
              text-align: left;
            }
            th {
              background-color: #fff;
            }
            .label {
              font-weight: normal;
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="logo-header">
              <div class="company-name">RAVIVA INFOTECH PVT LTD</div>
            </div>
            
            <div class="company-details">
              ${companyDetails?.Tag7}
            </div>
            <div class="company-details">
              SHOP NO.16,SAI VIHAR CHWAL,DEVIPADA MAIN ROAD MUMBAI 400066 MAHARASHTRA<br>
              Mobile:-7045599660,Email:-ravivainfotech@gmail.com
            </div>

            <div class="company-info">
              <span>MSME No:-${companyDetails?.msme}</span>
              <span>Udyam No:-${companyDetails?.UdyamNo}</span>
            </div>
            
            <div class="company-info-2" style={{marginTop: 10}}>
              <span>GSTIN No:-${companyDetails?.Tag1}</span>
              <span>PAN NO:-${companyDetails?.Tag6}</span>
            </div>

            <div class="invoice-title">TAX INVOICE</div>

            <div class="state-info-container">
              <div class="state-info">
              State : - Maharashtra    State Code : - 27
              </div>

              <div class="state-gst">
                <p style="font-size: 10px;">GST Payable on Reverse Charge:N-A</p>
              </div>
            </div>
            
                  
            

            <div class="two-column">
              <div class="left-column">
                <div>Name     : ${selectedCustomer?.CustomerName}</div>
                <div>Address  : SHOP NO.16,
SAI VIHAR CHWAL,
DEVIPADA MAIN ROAD
MUMBAI 400066 </div>
                <div>GSTIN No.: 27AABCR9876F1Z5</div>
                <div>State    : MAHARASHTRA    State Code : 27</div>
                <div>MSME No  : </div>
                <div>Udyam No : </div>
              </div>
              <div class="right-column">
                <div>Invoice No   : ${nextSerial}</div>
                <div>Invoice Date : ${currentDate}</div>
                <div>Chalin No    : </div>
                <div>Chalin Date  : </div>
                <div>Order No     : </div>
                <div>Order Date   : ${currentDate}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Sr No</th>
                  <th>Name</th>
                  <th>HSN ACS</th>
                  <th style="text-align: right;">Disc(%)</th>
                  <th style="text-align: right;">Qty</th>
                  <th style="text-align: right;">Rate</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${orderItems.map((item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.ItemName}</td>
                    <td>${item.HSNCode || ''}</td>
                    <td style="text-align: right;">${item.discountPercentage || '0'}</td>
                    <td style="text-align: right;">${item.Qty}</td>
                    <td style="text-align: right;">${item.Rate.toFixed(2)}</td>
                    <td style="text-align: right;">${item.Amount.toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr>
                  <td colspan="4">Total</td>
                  <td style="text-align: right;">${orderSummary.totalGoodsQty}</td>
                  <td></td>
                  <td style="text-align: right;">${orderSummary.totalValueAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="6">Less :Discount Amt.</td>
                  <td style="text-align: right;">${orderSummary.totalDiscountAmount.toFixed(2)}</td>
                </tr>

              </tbody>
            </table>

            <div style="display: flex;">
              <div style="flex: 1; padding: 10px;">
              
                <div style="border: 1px solid #000; border-bottom: 1px solid #000; padding: 4px;">
                  <p>Bank    : IDBI Bank Ltd.</p>
                  <p>BRANCH CODE : 0000897</p>
                  <p>Branch  : 0897102000015491</p>
                  <p>RAVIVA INFOTECH</p>
                  <p>IFSC No : Vishnu Shivam</p>
                </div>
                <div style="border: 1px solid #000; padding: 10px; margin-top: 10px;">
                  <p style="font-weight: bold;">Terms & Condition :-</p>
                  <ol style="font-size: 10px; margin: 0; padding-left: 15px;">
                    <li>Payment should be made immediately otherwise interest @24% will be charged.</li>
                    <li>The right of property of goods &amp; services is not transferable until we receive the entire payment against this invoice.</li>
                    <li>Any software found on Hard Disk after invoicing is liability of customer.</li>
                    <li>No refund for any goods &amp; services in this invoice in any condition.</li>
                    <li>No Sale Return in any condition.</li>
                    <li>Subject To</li>
                    <p style="font-size: 10px;">(Certified that the particulars given above are true and correct.)</p>
                  </ol>
                </div>
                
              </div>
              <div style="flex: 1; padding: 10px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td>Taxable Amount</td>
                    <td style="text-align: right;">${orderSummary.totalTaxableAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Add CGST:</td>
                    <td style="text-align: right;">${(orderSummary.totalTaxAmount / 2).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Add SGST:</td>
                    <td style="text-align: right;">${(orderSummary.totalTaxAmount / 2).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Add IGST:</td>
                    <td style="text-align: right;">0.00</td>
                  </tr>
                  <tr>
                    <td>Tax Amount GST:</td>
                    <td style="text-align: right;">${orderSummary.totalTaxAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Total Amount After Tax :</td>
                    <td style="text-align: right;">${orderSummary.totalAmount.toFixed(2)}</td>
                  </tr>
                </table>

                <div style="display: flex; padding: 10px; border: 1px solid #000; justify-content: space-between; margin-top: 10px;">
                  <div style="text-align: center;">
                    <p style="font-size: 8px; margin-top: 30px;">Receivers Signature & Rubber Stamp</p>
                  </div>
                  
                </div>
                
                
                <div style="display: flex; justify-content: space-between; padding: 10px; border: 1px solid #000; margin-top: 20px;">
                <div style="text-align: center;">
                    <p style="font-size: 8px; margin-top: 50px;">(For RAVIVA INFOTECH PVT LTD) (Authorised Signatory)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;


    const downloadPDF = async () => {
      try {
        // Generate the PDF
        const { uri } = await Print.printToFileAsync({
          html: htmlContent,
          base64: false
        });

        console.log('PDF generated at:', uri);

        // Create a filename with timestamp
        const filename = `Invoice_${nextSerial}_${Date.now()}.pdf`;

        // Get the downloads directory
        const downloadDir = FileSystem.documentDirectory + 'Downloads/';
        const pdfPath = downloadDir + filename;

        // Ensure the downloads directory exists
        await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });

        // Copy the file to the downloads directory
        await FileSystem.copyAsync({
          from: uri,
          to: pdfPath
        });

        console.log('PDF saved to:', pdfPath);

        if (Platform.OS === 'android') {
          // Move file to downloads folder (Android only)
          const androidDownloadDir = FileSystem.cacheDirectory + filename;
          await FileSystem.copyAsync({
            from: pdfPath,
            to: androidDownloadDir
          });

          // Share the file
          await Sharing.shareAsync(androidDownloadDir, {
            mimeType: 'application/pdf',
            dialogTitle: 'Save PDF',
            UTI: 'com.adobe.pdf'
          });
        } else {
          // For iOS, just share the file
          await Sharing.shareAsync(pdfPath, {
            mimeType: 'application/pdf',
            dialogTitle: 'Save PDF',
            UTI: 'com.adobe.pdf'
          });
        }

        Alert.alert(
          'Success',
          'PDF has been saved successfully!',
          [{ text: 'OK' }]
        );

      } catch (error) {
        console.error('Error saving PDF:', error);
        Alert.alert(
          'Error',
          'Failed to save PDF. Please try again.',
          [{ text: 'OK' }]
        );
      }
    };

    return (
      <Modal
        visible={showPreview}
        animationType="slide"
        onRequestClose={() => setShowPreview(false)}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.previewHeader}>
            <TouchableOpacity onPress={() => setShowPreview(false)} style={styles.closePreviewButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.previewTitle}>Invoice Preview</Text>
            <TouchableOpacity onPress={downloadPDF} style={styles.downloadButton}>
              <Ionicons name="download" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <WebView
            source={{ html: htmlContent }}
            style={{ flex: 1 }}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </SafeAreaView>
      </Modal>
    );
  };


  if (isLoading) {
    return (
      <LinearGradient colors={['#cfd9df', '#e2ebf0']} style={styles.loadingContainer}>
        <GridBackground />
        <RippleLoader size={24} color={COLORS.primary} />
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
            <Text style={styles.title}>New Sales Return</Text>
            <Ionicons name="cart" size={24} color="#7868e5" />
          </View>

          <View style={styles.card}>
            <View style={styles.headerInfo}>
              <View style={styles.headerItem}>
                <Ionicons name="calendar-outline" size={20} color="#7868e5" />
                <Text style={styles.headerText}>Date:</Text>
                <Text style={styles.headerValue}>{currentDate}</Text>
              </View>

              <View style={styles.headerItem}>
                <Ionicons name="document-text-outline" size={20} color="#7868e5" />
                <Text style={styles.headerText}>No:</Text>
                <Text style={styles.headerValue}>SRT/{nextSerial}</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginHorizontal: 10,
                alignItems: 'center',
              }}
            >
              <Text style={styles.sectionTitle}>Customer</Text>
              <TouchableOpacity onPress={() => router.push('/(user)')}>
                <Ionicons
                  name='add-circle'
                  size={28}
                  color='#000'
                  style={{ marginRight: 10 }}
                />
              </TouchableOpacity>
            </View>
            <SearchablePicker
              items={customers}
              onSelect={handleCustomerSelect}
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
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginHorizontal: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={styles.sectionTitle}>Item</Text>
                <TouchableOpacity onPress={() => router.push('/(user)/add-item')}>
                  <Ionicons
                    name='add-circle'
                    size={28}
                    color='#000'
                    style={{ marginRight: 10 }}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={{ backgroundColor: "#000", borderRadius: 10, padding: 10, display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", }} onPress={handleAddItem}>
                <Text style={{ color: "white", fontSize: 15, fontWeight: "500" }}>Add Item</Text>
                <Ionicons name="add-circle" size={24} color="#FFF" style={{ marginLeft: 5 }} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Return Items</Text>
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
              <Text style={styles.noItemsText}>No items added to the sales return yet.</Text>
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
              <Text style={styles.submitButtonText}>Submit Sales Return</Text>
            )}
          </TouchableOpacity>


          <TouchableOpacity
            style={styles.previewButton}
            onPress={() => setShowPreview(true)}
          >
            <Text style={styles.previewButtonText}>Preview Invoice</Text>
          </TouchableOpacity>

          {renderPreviewModal()}
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
                    <Text style={styles.itemDetailLabel}>HSN Code</Text>
                    <TextInput
                      style={[styles.detailInput, styles.hsnCode]}
                      value={editedHSNCode}
                      onChangeText={setEditedHSNCode}
                      placeholder="Enter HSN Code"
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

                  <View style={styles.gstCodeSection}>
                    <Text style={styles.gstCodeLabel}>GST Tax Code</Text>
                    <TaxCodePicker
                      selectedValue={selectedItem?.GSTTaxCode || ''}
                      onValueChange={(value) => {
                        setSelectedItem(prevItem => prevItem ? {
                          ...prevItem,
                          GSTTaxCode: value
                        } : null);
                      }}
                    />
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
                <Text style={styles.addButtonText}>Add to Sales Return</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};


export default CreateSalesReturn;

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
    fontSize: 14,
    fontWeight: '600',
    color: '#333333', // Darker text
    marginLeft: 8,
    marginRight: 4,
  },
  headerValue: {
    fontSize: 14,
    fontWeight: '400',
    color: '#333333', // Darker text
    // marginLeft: 5
  },
  sectionTitle: {
    fontSize: 16,
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
  gstCodeSection: {
    backgroundColor: '#f0fff0', // Very light green background
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#c8e6c9', // Light green border
    marginTop: 10,
  },
  gstCodeLabel: {
    fontSize: 16,
    color: '#388e3c', // Dark green for label
    fontWeight: '500',
  },
  gstCodeValue: {
    fontSize: 18,
    color: '#2e7d32', // Slightly darker green for value
    fontWeight: '600',
    marginTop: 4,
  },
  hsnCode: {
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E6ED',
    fontFamily: 'monospace',
    color: '#333333',
  },
  printButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  printButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E6ED',
  },
  closePreviewButton: {
    padding: 5,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  downloadButton: {
    padding: 5,
  },
  previewButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  previewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
