/**
 * Navigation Controls component for canvas navigation.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useCanvas } from '../context/CanvasContext';

const NavigationControls = () => {
  const { level, goBack, goToRoot, navigationHistory } = useCanvas();

  const canGoBack = navigationHistory.length > 0;
  const canGoToRoot = level > 1;

  return (
    <View style={styles.container}>
      <View style={styles.levelIndicator}>
        <Text style={styles.levelText}>Level {level}</Text>
        <Text style={styles.levelDescription}>
          {level === 1 && 'Main Canvas'}
          {level === 2 && 'Second Level'}
          {level === 3 && 'Third Level'}
          {level === 4 && 'Paint Level'}
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.backButton,
            !canGoBack && styles.disabledButton,
          ]}
          onPress={goBack}
          disabled={!canGoBack}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.buttonText,
            !canGoBack && styles.disabledButtonText,
          ]}>
            ← Back
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.button,
            styles.rootButton,
            !canGoToRoot && styles.disabledButton,
          ]}
          onPress={goToRoot}
          disabled={!canGoToRoot}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.buttonText,
            !canGoToRoot && styles.disabledButtonText,
          ]}>
            🏠 Root
          </Text>
        </TouchableOpacity>
      </View>
      
      {level === 4 && (
        <View style={styles.paintInfo}>
          <Text style={styles.paintInfoText}>
            🎨 You can now paint squares!
          </Text>
        </View>
      )}
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
  levelIndicator: {
    alignItems: 'center',
    marginBottom: 16,
  },
  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  levelDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  backButton: {
    backgroundColor: '#FF9500',
  },
  rootButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#999999',
  },
  paintInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 6,
    alignItems: 'center',
  },
  paintInfoText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
});

export default NavigationControls; 