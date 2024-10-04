import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import UserForm from '@/components/UserForm'

const index = () => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Login</Text>
            <UserForm />
        </View>
    )
}

export default index

const styles = StyleSheet.create({})