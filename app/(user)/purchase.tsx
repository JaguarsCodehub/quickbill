import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { VictoryBar, VictoryChart, VictoryTheme } from 'victory-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';

export default function PurchaseScreen() {
    const purchaseData = [
        { quarter: "Q1", amount: 13000 },
        { quarter: "Q2", amount: 16500 },
        { quarter: "Q3", amount: 14250 },
        { quarter: "Q4", amount: 19000 },
    ];

    const recentPurchases = [
        { id: 1, supplier: "Supplier 1", amount: 2450 },
        { id: 2, supplier: "Supplier 2", amount: 1890 },
        { id: 3, supplier: "Supplier 3", amount: 3200 },
        { id: 4, supplier: "Supplier 4", amount: 1500 },
        { id: 5, supplier: "Supplier 5", amount: 2100 },
    ];

    return (
        <ScrollView style={styles.container}>
            <Animated.View entering={FadeInLeft.duration(500)}>
                <View style={styles.chartContainer}>
                    <Text style={styles.title}>Purchase Overview</Text>
                    <VictoryChart theme={VictoryTheme.material}>
                        <VictoryBar
                            data={purchaseData}
                            x="quarter"
                            y="amount"
                            style={{ data: { fill: "#2E7D32" } }}
                        />
                    </VictoryChart>
                </View>

                <View style={styles.listContainer}>
                    <Text style={styles.title}>Recent Purchase Orders</Text>
                    {recentPurchases.map((purchase) => (
                        <View key={purchase.id} style={styles.purchaseItem}>
                            <Text style={styles.purchaseTitle}>PO #{purchase.id}</Text>
                            <Text style={styles.purchaseSupplier}>{purchase.supplier}</Text>
                            <Text style={styles.purchaseAmount}>${purchase.amount}</Text>
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
    purchaseItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingVertical: 12,
    },
    purchaseTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    purchaseSupplier: {
        color: '#666',
        marginVertical: 4,
    },
    purchaseAmount: {
        color: '#2E7D32',
        fontWeight: 'bold',
    },
});