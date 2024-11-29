import { Picker } from '@react-native-picker/picker'
import React from 'react'
import { View, StyleSheet } from 'react-native'

const TaxCodes = [
    { label: 'UTGST 5%', value: 'UTGST5' },
    { label: 'UTGST 28%', value: 'UTGST28' },
    { label: 'UTGST 18%', value: 'UTGST18' },
    { label: 'UTGST 12%', value: 'UTGST12' },
    { label: 'UTGST 3%', value: 'UTGST3' },
    { label: 'UTGST 2%', value: 'UTGST2' },
    { label: 'UTGST 0%', value: 'UTGST0' },
    { label: 'IGST 5%', value: 'IGST5' },
    { label: 'IGST 28%', value: 'IGST28' },
    { label: 'IGST 18%', value: 'IGST18' },
    { label: 'IGST 12%', value: 'IGST12' },
    { label: 'IGST 3%', value: 'IGST3' },
    { label: 'IGST 2%', value: 'IGST2' },
    { label: 'IGST 0%', value: 'IGST0' },
    { label: 'GST 5%', value: 'GST5' },
    { label: 'GST 28%', value: 'GST28' },
    { label: 'GST 18%', value: 'GST18' },
    { label: 'GST 12%', value: 'GST12' },
    { label: 'GST 3%', value: 'GST3' },
    { label: 'GST 2%', value: 'GST2' },
    { label: 'GST 0%', value: 'GST0' },
]

interface TaxCodePickerProps {
    selectedValue: string;
    onValueChange: (itemValue: string) => void;
}

const TaxCodePicker: React.FC<TaxCodePickerProps> = ({ selectedValue, onValueChange }) => {
    return (
        <View style={styles.pickerContainer}>
            <Picker
                selectedValue={selectedValue}
                onValueChange={onValueChange}
                style={styles.picker}
            >
                {TaxCodes.map((taxCode) => (
                    <Picker.Item
                        key={taxCode.value}
                        label={taxCode.label}
                        value={taxCode.value}
                        style={styles.pickerItem}
                    />
                ))}
            </Picker>
        </View>
    )
}

const styles = StyleSheet.create({
    pickerContainer: {
        marginTop: 5,
        borderRadius: 8,
        backgroundColor: '#f0fff0',
        borderWidth: 1,
        borderColor: '#c8e6c9',
        overflow: 'hidden'
    },
    picker: {
        height: 50,
        width: '100%',
    },
    pickerItem: {
        fontSize: 16,
        color: '#333333',
    }
});

export default TaxCodePicker
