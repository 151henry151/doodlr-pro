import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useCanvas } from '../context/CanvasContext';

const ColorPalette = () => {
  const { colors, selectedColor, selectColor } = useCanvas();

  const colorMap = {
    red: '#FF0000',
    green: '#00FF00',
    blue: '#0000FF',
    yellow: '#FFFF00',
    cyan: '#00FFFF',
    magenta: '#FF00FF',
    white: '#FFFFFF',
    black: '#000000',
    gray: '#808080',
    orange: '#FFA500',
    purple: '#800080',
    pink: '#FFC0CB',
    brown: '#A52A2A',
    teal: '#008080',
  };

  return (
    <View style={styles.container}>
      {colors.map((color) => (
        <TouchableOpacity
          key={color}
          onPress={() => selectColor(color)}
          testID={`color-${color}`}
          style={[
            styles.colorButton,
            { backgroundColor: colorMap[color] },
            selectedColor === color && styles.selectedColor,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  colorButton: {
    width: 30,
    height: 30,
    margin: 5,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  selectedColor: {
    borderColor: '#007AFF',
    borderWidth: 3,
  },
});

export default ColorPalette; 