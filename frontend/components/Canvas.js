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
    console.log('Square pressed:', square);
    console.log('Current level:', level);
    
    if (level === 4) {
      // At the deepest level, paint the square
      console.log('Painting square at level 4');
      paintSquare(square.position.x, square.position.y);
    } else if (square.is_zoomable) {
      // Zoom into the square
      console.log('Zooming to square:', square.position.x, square.position.y);
      zoomToSquare(square.position.x, square.position.y);
    } else {
      console.log('Square is not zoomable');
    }
  };

  const renderSquare = (square, index) => {
    const backgroundColor = square.color || '#FFFFFF';
    const borderColor = square.is_zoomable ? '#007AFF' : '#CCCCCC';
    const borderWidth = square.is_zoomable ? 2 : 1;

    return (
      <TouchableOpacity
        key={`square-${square.position.x}-${square.position.y}`}
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

  // Debug information
  console.log(`Canvas: ${canvas.squares.length} squares, Level: ${level}`);

  return (
    <View style={styles.container}>
      <View style={styles.canvas}>
        {/* Create explicit 3x3 grid */}
        <View style={styles.row}>
          {canvas.squares.filter(s => s.position.y === 0).map((square, index) => renderSquare(square, index))}
        </View>
        <View style={styles.row}>
          {canvas.squares.filter(s => s.position.y === 1).map((square, index) => renderSquare(square, index + 3))}
        </View>
        <View style={styles.row}>
          {canvas.squares.filter(s => s.position.y === 2).map((square, index) => renderSquare(square, index + 6))}
        </View>
      </View>
      {/* Debug info */}
      <Text style={styles.debugText}>
        Squares: {canvas.squares.length}, Level: {level}
      </Text>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  row: {
    flexDirection: 'row',
    height: SQUARE_SIZE,
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
  debugText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
  },
});

export default Canvas; 