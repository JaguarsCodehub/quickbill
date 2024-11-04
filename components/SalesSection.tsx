import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export function SalesSection() {
    return (
        <Animated.View entering={FadeInUp.delay(1800).duration(1000)}>
            <Text style={styles.sectionTitle}>Sales Overview</Text>
            <View style={styles.card}>
                <View style={styles.cardItem}>
                    <Ionicons name="document-text-outline" size={24} color="#5196f4" />
                    <View style={styles.cardItemContent}>
                        <Text style={styles.cardItemTitle}>Invoices</Text>
                        <Text style={styles.cardItemValue}>23</Text>
                    </View>
                </View>
                <View style={styles.cardItem}>
                    <Ionicons name="cart-outline" size={24} color="#4CAF50" />
                    <View style={styles.cardItemContent}>
                        <Text style={styles.cardItemTitle}>Orders</Text>
                        <Text style={styles.cardItemValue}>18</Text>
                    </View>
                </View>
                <View style={styles.cardItem}>
                    <Ionicons name="return-down-back-outline" size={24} color="#FFC107" />
                    <View style={styles.cardItemContent}>
                        <Text style={styles.cardItemTitle}>Returns</Text>
                        <Text style={styles.cardItemValue}>3</Text>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardItemContent: {
        marginLeft: 16,
    },
    cardItemTitle: {
        fontSize: 16,
        color: '#666',
    },
    cardItemValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
});