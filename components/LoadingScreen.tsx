import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import GridBackground from './GridBackground';

const LoadingScreen = () => {
    return (
        <View style={styles.container}>
            <GridBackground />
            <View style={styles.background} />
            <ActivityIndicator size="large" color="#00A25B" />
            <Text style={styles.loadingText}>Please wait, loading...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999,
    },
    background: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#f0f0f0',
        zIndex: -1,
    },
    loadingText: {
        marginTop: 20,
        fontSize: 30,
        color: '#000',
        fontFamily: 'MontserratSemibold',
    },
});

export default LoadingScreen;
