// import React from 'react';
// import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// // Register fonts (optional but recommended for matching your design)
// Font.register({
//     family: 'Helvetica',
//     fonts: [
//         { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf' },
//         {
//             src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfB.ttf',
//             fontWeight: 'bold'
//         }
//     ]
// });

// const styles = StyleSheet.create({
//     page: {
//         padding: 30,
//         fontSize: 12,
//     },
//     header: {
//         marginBottom: 20,
//         borderBottom: 1,
//         paddingBottom: 10,
//     },
//     title: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         textAlign: 'center',
//         marginBottom: 10,
//     },
//     row: {
//         flexDirection: 'row',
//         marginBottom: 5,
//     },
//     column: {
//         flex: 1,
//     },
//     label: {
//         fontWeight: 'bold',
//         marginRight: 5,
//     },
//     table: {
//         marginTop: 20,
//     },
//     tableHeader: {
//         flexDirection: 'row',
//         borderBottom: 1,
//         borderTop: 1,
//         padding: 5,
//         backgroundColor: '#f0f0f0',
//     },
//     tableRow: {
//         flexDirection: 'row',
//         borderBottom: '1 solid #eee',
//         padding: 5,
//     },
//     tableCell: {
//         flex: 1,
//         textAlign: 'center',
//     },
//     summary: {
//         marginTop: 20,
//         borderTop: 1,
//         paddingTop: 10,
//     },
// });

// interface InvoicePDFProps {
//     invoiceData: {
//         docNo: string;
//         docDate: string;
//         customerName: string;
//         customerCode: string;
//         items: Array<{
//             ItemName: string;
//             ItemCode: string;
//             HSNCode: string;
//             Qty: number;
//             Rate: number;
//             Value: number;
//             discountAmount: number;
//             Taxable: number;
//             TaxAmt: number;
//             Amount: number;
//         }>;
//         totalAmount: number;
//         totalTaxAmount: number;
//         totalDiscountAmount: number;
//     };
// }

// const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoiceData }) => (
//     <Document>
//         <Page size="A4" style={styles.page}>
//             {/* Header */}
//             <View style={styles.header}>
//                 <Text style={styles.title}>TAX INVOICE</Text>
//                 <View style={styles.row}>
//                     <View style={styles.column}>
//                         <Text>
//                             <Text style={styles.label}>Invoice No:</Text> {invoiceData.docNo}
//                         </Text>
//                         <Text>
//                             <Text style={styles.label}>Date:</Text> {invoiceData.docDate}
//                         </Text>
//                     </View>
//                     <View style={styles.column}>
//                         <Text>
//                             <Text style={styles.label}>Customer:</Text> {invoiceData.customerName}
//                         </Text>
//                         <Text>
//                             <Text style={styles.label}>Customer Code:</Text> {invoiceData.customerCode}
//                         </Text>
//                     </View>
//                 </View>
//             </View>

//             {/* Items Table */}
//             <View style={styles.table}>
//                 <View style={styles.tableHeader}>
//                     <Text style={[styles.tableCell, { flex: 0.5 }]}>Sr.</Text>
//                     <Text style={[styles.tableCell, { flex: 2 }]}>Item</Text>
//                     <Text style={styles.tableCell}>HSN</Text>
//                     <Text style={styles.tableCell}>Qty</Text>
//                     <Text style={styles.tableCell}>Rate</Text>
//                     <Text style={styles.tableCell}>Amount</Text>
//                 </View>

//                 {invoiceData.items.map((item, index) => (
//                     <View key={index} style={styles.tableRow}>
//                         <Text style={[styles.tableCell, { flex: 0.5 }]}>{index + 1}</Text>
//                         <Text style={[styles.tableCell, { flex: 2 }]}>{item.ItemName}</Text>
//                         <Text style={styles.tableCell}>{item.HSNCode}</Text>
//                         <Text style={styles.tableCell}>{item.Qty}</Text>
//                         <Text style={styles.tableCell}>{item.Rate.toFixed(2)}</Text>
//                         <Text style={styles.tableCell}>{item.Amount.toFixed(2)}</Text>
//                     </View>
//                 ))}
//             </View>

//             {/* Summary */}
//             <View style={styles.summary}>
//                 <View style={styles.row}>
//                     <View style={[styles.column, { alignItems: 'flex-end' }]}>
//                         <Text>
//                             <Text style={styles.label}>Sub Total:</Text> ₹{invoiceData.totalAmount.toFixed(2)}
//                         </Text>
//                         <Text>
//                             <Text style={styles.label}>Discount:</Text> ₹{invoiceData.totalDiscountAmount.toFixed(2)}
//                         </Text>
//                         <Text>
//                             <Text style={styles.label}>Tax Amount:</Text> ₹{invoiceData.totalTaxAmount.toFixed(2)}
//                         </Text>
//                         <Text style={{ fontWeight: 'bold', marginTop: 5 }}>
//                             <Text style={styles.label}>Grand Total:</Text> ₹{invoiceData.totalAmount.toFixed(2)}
//                         </Text>
//                     </View>
//                 </View>
//             </View>
//         </Page>
//     </Document>
// );

// export default InvoicePDF;