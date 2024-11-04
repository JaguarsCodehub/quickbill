import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { VictoryPie } from 'victory-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

export default function SalesScreen() {
    const salesData = [
        { x: "Invoices", y: 45 },
        { x: "Orders", y: 35 },
        { x: "Returns", y: 20 }
    ];

    const recentInvoices = [
        { id: 1, customer: "Customer 1", amount: 1290 },
        { id: 2, customer: "Customer 2", amount: 890 },
        { id: 3, customer: "Customer 3", amount: 2300 },
        { id: 4, customer: "Customer 4", amount: 1100 },
        { id: 5, customer: "Customer 5", amount: 750 },
    ];

    return (
        <ScrollView style={styles.container}>
            <Animated.View entering={FadeInRight.duration(500)}>
                <View style={styles.chartContainer}>
                    <Text style={styles.title}>Sales Summary</Text>
                    <VictoryPie
                        data={salesData}
                        colorScale={["#2E7D32", "#4CAF50", "#81C784"]}
                        height={250}
                    />
                </View>

                <View style={styles.listContainer}>
                    <Text style={styles.title}>Recent Invoices</Text>
                    {recentInvoices.map((invoice) => (
                        <View key={invoice.id} style={styles.invoiceItem}>
                            <Text style={styles.invoiceTitle}>Invoice #{invoice.id}</Text>
                            <Text style={styles.invoiceCustomer}>{invoice.customer}</Text>
                            <Text style={styles.invoiceAmount}>${invoice.amount}</Text>
                        </View>
                    ))}
                </View>
            </Animated.View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8F5E9',
    },
    chartContainer: {
        backgroundColor: 'white',
        margin: 16,
        padding: 16,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    listContainer: {
        backgroundColor: 'white',
        margin: 16,
        padding: 16,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 16,
    },
    invoiceItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingVertical: 12,
    },
    invoiceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    invoiceCustomer: {
        color: '#666',
        marginVertical: 4,
    },
    invoiceAmount: {
        color: '#2E7D32',
        fontWeight: 'bold',
    },
});