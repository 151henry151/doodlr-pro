import React from 'react';
import { View, TouchableOpacity, Text as RNText, StyleSheet } from 'react-native';
import { useCanvas } from '../context/CanvasContext';

const NavigationControls = () => {
  const { currentLevel, navigateBack, goToRoot } = useCanvas();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, currentLevel === 1 && styles.disabledButton]}
        onPress={navigateBack}
        disabled={currentLevel === 1}
      >
        <RNText style={[styles.buttonText, currentLevel === 1 && styles.disabledText]}>
          Back
        </RNText>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={goToRoot}
      >
        <RNText style={styles.buttonText}>Home</RNText>
      </TouchableOpacity>

      <RNText style={styles.levelText}>Level {currentLevel}</RNText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledText: {
    color: '#999',
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default NavigationControls; 