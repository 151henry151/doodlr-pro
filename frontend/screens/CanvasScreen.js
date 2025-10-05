import React from 'react';
import { View, StyleSheet } from 'react-native';
import Canvas from '../components/Canvas';
import ColorPalette from '../components/ColorPalette';
import NavigationControls from '../components/NavigationControls';
import { useCanvas } from '../context/CanvasContext';

const CanvasScreen = () => {
  const { currentLevel, drawingMode } = useCanvas();

  return (
    <View style={styles.container}>
      <Canvas />
      {(currentLevel === 6 || (currentLevel >= 4 && currentLevel <= 5 && drawingMode)) && <ColorPalette />}
      <NavigationControls />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default CanvasScreen; 