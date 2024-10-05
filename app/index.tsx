import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import UserForm from '@/components/UserForm'

const index = () => {
    return (
        <View>
            <View style={{ marginTop: 60 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>Welcome to Quickbill</Text>
                <Text style={{ fontSize: 16, textAlign: 'center' }}>Please login to continue</Text>
                <UserForm />
            </View>
        </View>
    )
}

export default index

const styles = StyleSheet.create({})