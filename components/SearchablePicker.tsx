import React, { useState } from 'react';
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
}

const SearchablePicker = ({
  items,
  onSelect,
  placeholder,
  labelKey,
  valueKey,
  icon,
  selectedItem
}: SearchablePickerProps) => {
  const [query, setQuery] = useState(selectedItem ? selectedItem[labelKey] : '');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredItems = items.filter((item) =>
    item[labelKey].toLowerCase().includes(query.toLowerCase())
  );

  // Add touch handler for the background
  const handleBackgroundPress = () => {
    setShowDropdown(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name={icon as any} size={24} color="#7868e5" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#808080"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
        />
      </View>
      {showDropdown && (
        <>
          <TouchableOpacity 
            style={styles.backdrop} 
            onPress={handleBackgroundPress} 
            activeOpacity={1}
          />
          <View style={styles.dropdownContainer}>
            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item[valueKey].toString()}
              style={styles.dropdown}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    onSelect(item);
                    setQuery(item[labelKey]);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownText}>{item[labelKey]}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262647',
    borderRadius: 10,
    paddingHorizontal: 12,
    zIndex: 1,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    color: '#FFFFFF',
    fontSize: 16,
  },
  backdrop: {
    position: 'absolute',
    top: 45,
    left: -20, // Extend beyond the container
    right: -20,
    bottom: -1000, // Large enough to cover the screen
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 998,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: '#262647',
    borderRadius: 10,
    maxHeight: 200, // Set a fixed maximum height
    zIndex: 999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdown: {
    flex: 1,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  dropdownText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default SearchablePicker;
