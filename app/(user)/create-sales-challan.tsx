import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const CreateSalesChallan = () => {
  const [challanNumber, setChallanNumber] = useState('CH-1');
  const [date, setDate] = useState('24-10-2024');

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#1a1a1a', '#0a0a0a']} style={styles.gradient}>
        <ScrollView>
          <View style={styles.header}>
            <TouchableOpacity>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Create Challan</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity>
                <Ionicons name="play" size={24} color="#FF0000" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="camera-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* <TouchableOpacity style={styles.addCompanyCard}>
            <LinearGradient
              colors={['#3C3C3C', '#2C2C2C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addCompanyGradient}
            >
              <View style={styles.addCompanyContent}>
                <View>
                  <Text style={styles.addCompanyTitle}>+ Add</Text>
                  <Text style={styles.addCompanySubtitle}>Company Details</Text>
                </View>
                <View style={styles.addCompanyImagePlaceholder}>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity> */}

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Challan #</Text>
              <TouchableOpacity>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.cardValue}>{challanNumber}</Text>
            <Text style={styles.cardDate}>{date}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Customer</Text>
              <Ionicons name="information-circle-outline" size={24} color="#7868e5" />
            </View>
            <TouchableOpacity style={styles.selectButton}>
              <Ionicons name="add-circle-outline" size={24} color="#7868e5" />
              <Text style={styles.selectButtonText}>Select Customer</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Products</Text>
              <Ionicons name="information-circle-outline" size={24} color="#7868e5" />
            </View>
            <TouchableOpacity style={styles.selectButton}>
              <Ionicons name="add-circle-outline" size={24} color="#7868e5" />
              <Text style={styles.selectButtonText}>Add Products</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.customFieldsButton}>
            <LinearGradient
              colors={['#4A4A4A', '#3A3A3A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.customFieldsGradient}
            >
              <View style={styles.customFieldsContent}>
                <View>
                  <Text style={styles.customFieldsTitle}>Add Custom Fields</Text>
                  <Text style={styles.customFieldsSubtitle}>Personalize to perfectly suit your style.</Text>
                </View>
                <Ionicons name="headset-outline" size={24} color="#7868e5" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.optionalText}>Optional</Text>

          <View style={styles.optionalFields}>
            <TouchableOpacity style={styles.optionalField}>
              <Ionicons name="car-outline" size={24} color="#7868e5" />
              <Text style={styles.optionalFieldText}>Select Dispatch Address</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionalField}>
              <Ionicons name="cash-outline" size={24} color="#7868e5" />
              <Text style={styles.optionalFieldText}>Cash</Text>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionalField}>
              <Ionicons name="pencil-outline" size={24} color="#7868e5" />
              <Text style={styles.optionalFieldText}>Select Signature</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionalField}>
              <Ionicons name="document-text-outline" size={24} color="#7868e5" />
              <Text style={styles.optionalFieldText}>Add Reference</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionalField}>
              <Ionicons name="create-outline" size={24} color="#7868e5" />
              <Text style={styles.optionalFieldText}>Add Notes</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.totalAmount}>
            <Text style={styles.totalAmountText}>Total Amount</Text>
            <Text style={styles.totalAmountValue}>₹0.00</Text>
          </View>

          <TouchableOpacity style={styles.createButton}>
            <Text style={styles.createButtonText}>Create</Text>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  gradient: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerIcons: {
    flexDirection: 'row',
    width: 60,
    justifyContent: 'space-between',
  },
  addCompanyCard: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  addCompanyGradient: {
    padding: 20,
  },
  addCompanyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addCompanyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7868e5',
  },
  addCompanySubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addCompanyImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#4A4A4A',
    borderRadius: 10,
  },
  card: {
    backgroundColor: '#2C2C2C',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  editText: {
    color: '#7868e5',
    fontSize: 16,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 5,
  },
  cardDate: {
    fontSize: 16,
    color: '#888888',
    marginTop: 5,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  selectButtonText: {
    color: '#7868e5',
    fontSize: 16,
    marginLeft: 10,
  },
  customFieldsButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  customFieldsGradient: {
    padding: 20,
  },
  customFieldsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customFieldsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  customFieldsSubtitle: {
    fontSize: 14,
    color: '#888888',
    marginTop: 5,
  },
  optionalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  optionalFields: {
    backgroundColor: '#2C2C2C',
    borderRadius: 15,
    padding: 10,
  },
  optionalField: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3C3C3C',
  },
  optionalFieldText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
  },
  changeText: {
    color: '#7868e5',
    fontSize: 16,
  },
  totalAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  totalAmountText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  totalAmountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  createButton: {
    backgroundColor: '#7868e5',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
});

export default CreateSalesChallan;
