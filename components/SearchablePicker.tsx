import React, { useEffect, useState } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchablePickerProps {
  items: any[];
  onSelect: (item: any) => void;
  placeholder: string;
  labelKey: string;
  valueKey: string;
  icon: string;
  selectedItem: any;
  disabled?: boolean;
  value?: string;
}

const SearchablePicker = ({
  items,
  onSelect,
  placeholder,
  labelKey,
  valueKey,
  icon,
  selectedItem
}: {
  items: any[],
  onSelect: (item: any) => void,
  placeholder: string,
  labelKey: string,
  valueKey: string,
  icon: string,
  selectedItem: any
}) => {
  const [query, setQuery] = useState(selectedItem ? selectedItem[labelKey] : '');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setQuery(selectedItem ? selectedItem[labelKey] : '');
  }, [selectedItem]);

  const filteredItems = items.filter((item) =>
    (item[labelKey] && item[labelKey].toString().toLowerCase().includes(query.toLowerCase())) ||
    (item[valueKey] && item[valueKey].toString().toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <View style={styles.pickerContainer}>
      <View style={styles.inputContainer}>
        <Ionicons name={icon as any} size={24} color="#7868e5" style={styles.inputIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="#7868e5"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
        />
      </View>
      {showDropdown && (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item[valueKey]?.toString() || item[labelKey]?.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(item);
                setQuery(item[labelKey]?.toString() || '');
                setShowDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{item[labelKey]} - {item[valueKey]}</Text>
            </TouchableOpacity>
          )}
          style={styles.dropdown}
          nestedScrollEnabled={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 15,
  },

  inputContainerDisabled: {
    opacity: 0.7,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    height: 24,
    padding: 0,
  },
  backdrop: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    bottom: -1000,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 998,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#1f1f3d',
    borderRadius: 12,
    maxHeight: 200,
    zIndex: 999,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  pickerContainer: {
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1', // Light input background
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333333', // Darker text
  },
  dropdown: {
    maxHeight: 200,
    backgroundColor: '#E0E6ED', // Light dropdown background
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D9E6', // Light border
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333333', // Darker text
  },
});

export default SearchablePicker;
