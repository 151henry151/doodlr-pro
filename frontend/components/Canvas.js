/**
 * Canvas component for rendering the hierarchical canvas grid.
 */

import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { useCanvas } from '../context/CanvasContext';

const { width, height } = Dimensions.get('window');
const CANVAS_SIZE = Math.min(width, height) * 0.8;
const SQUARE_SIZE = CANVAS_SIZE / 3;

const Canvas = () => {
  const { canvas, level, zoomToSquare, paintSquare, loading, error } = useCanvas();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading canvas...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </View>
    );
  }

  if (!canvas || !canvas.squares) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No canvas data available</Text>
        </View>
      </View>
    );
  }

  const handleSquarePress = (square) => {
    if (level === 4) {
      // At the deepest level, paint the square
      paintSquare(square.position.x, square.position.y);
    } else if (square.is_zoomable) {
      // Zoom into the square
      zoomToSquare(square.position.x, square.position.y);
    }
  };

  const renderSquare = (square, index) => {
    const backgroundColor = square.color || '#FFFFFF';
    const borderColor = square.is_zoomable ? '#007AFF' : '#CCCCCC';
    const borderWidth = square.is_zoomable ? 2 : 1;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.square,
          {
            backgroundColor,
            borderColor,
            borderWidth,
          },
        ]}
        onPress={() => handleSquarePress(square)}
        activeOpacity={0.7}
      >
        {square.is_zoomable && level < 4 && (
          <View style={styles.zoomIndicator}>
            <Text style={styles.zoomText}>+</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.canvas}>
        {canvas.squares.map((square, index) => renderSquare(square, index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  square: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666666',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
  },
});

export default Canvas; 