import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface AnimatedCardProps {
    title: string;
    value: string;
    icon: string;
    color: string;
    delay: number;
}

export function AnimatedCard({ title, value, icon, color, delay }: AnimatedCardProps) {
    return (
        <Animated.View style={styles.card} entering={FadeInUp.delay(delay).duration(1000)}>
            <Ionicons name={icon as any} size={24} color={color} />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={[styles.cardValue, { color }]}>{value}</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: '48%',
    },
    cardContent: {
        marginLeft: 12,
    },
    cardTitle: {
        fontSize: 14,
        color: '#666',
    },
    cardValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});