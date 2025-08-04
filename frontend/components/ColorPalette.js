/**
 * Color Palette component for selecting colors to paint with.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useCanvas } from '../context/CanvasContext';

const ColorPalette = () => {
  const { colors, selectedColor, setSelectedColor, level } = useCanvas();

  // Default colors if API hasn't loaded yet
  const defaultColors = [
    { name: 'RED', value: '#FF0000' },
    { name: 'GREEN', value: '#00FF00' },
    { name: 'BLUE', value: '#0000FF' },
    { name: 'YELLOW', value: '#FFFF00' },
    { name: 'CYAN', value: '#00FFFF' },
    { name: 'MAGENTA', value: '#FF00FF' },
    { name: 'WHITE', value: '#FFFFFF' },
    { name: 'BLACK', value: '#000000' },
    { name: 'GRAY', value: '#808080' },
    { name: 'ORANGE', value: '#FFA500' },
    { name: 'PURPLE', value: '#800080' },
    { name: 'PINK', value: '#FFC0CB' },
    { name: 'BROWN', value: '#A52A2A' },
    { name: 'LIME', value: '#00FF00' },
    { name: 'TEAL', value: '#008080' },
  ];

  const colorList = colors.length > 0 ? colors : defaultColors;

  const handleColorSelect = (color) => {
    setSelectedColor(color.value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Color Palette</Text>
      <Text style={styles.subtitle}>
        {level === 4 ? 'Tap a square to paint it' : 'Zoom in to level 4 to paint'}
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.paletteContainer}
      >
        {colorList.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.colorButton,
              {
                backgroundColor: color.value,
                borderColor: selectedColor === color.value ? '#007AFF' : '#CCCCCC',
                borderWidth: selectedColor === color.value ? 3 : 1,
              },
            ]}
            onPress={() => handleColorSelect(color)}
            activeOpacity={0.7}
          >
            {selectedColor === color.value && (
              <View style={styles.selectedIndicator}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.selectedColorContainer}>
        <Text style={styles.selectedColorLabel}>Selected:</Text>
        <View 
          style={[
            styles.selectedColorPreview,
            { backgroundColor: selectedColor }
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  paletteContainer: {
    paddingVertical: 8,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  selectedIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectedColorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  selectedColorLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  selectedColorPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#CCCCCC',
  },
});

export default ColorPalette; 