import React from 'react';
import { View, TouchableOpacity, Text as RNText, StyleSheet, Linking, Platform } from 'react-native';
import { useCanvas } from '../context/CanvasContext';
import { getApiBaseUrl } from '../services/api';

const NavigationControls = () => {
  const { currentLevel, navigateBack, goToRoot, fetchParams } = useCanvas();

  const openLegal = async () => {
    const url = 'https://hromp.com/doodlr/conduct.html';
    try { await Linking.openURL(url); } catch {}
  };

  const openPrivacy = async () => {
    const url = 'https://hromp.com/doodlr/privacy.html';
    try { await Linking.openURL(url); } catch {}
  };

  const openTerms = async () => {
    const url = 'https://hromp.com/doodlr/terms.html';
    try { await Linking.openURL(url); } catch {}
  };

  const reportHere = async () => {
    try {
      const base = getApiBaseUrl();
      const level = currentLevel;
      const x = (fetchParams?.sectionX ?? 0) * 3; // coarse location
      const y = (fetchParams?.sectionY ?? 0) * 3;
      const params = new URLSearchParams({ level: String(level), x: String(x), y: String(y), reason: 'user_report' });
      await fetch(`${base}/report?${params.toString()}`, { method: 'POST' });
      if (Platform.OS === 'web') alert('Reported. Thank you.');
    } catch (e) { if (Platform.OS === 'web') alert('Report failed'); }
  };

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

      <TouchableOpacity style={styles.button} onPress={goToRoot}>
        <RNText style={styles.buttonText}>Home</RNText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={reportHere}>
        <RNText style={styles.buttonText}>Report</RNText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={openPrivacy}>
        <RNText style={styles.buttonText}>Privacy</RNText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={openTerms}>
        <RNText style={styles.buttonText}>Terms</RNText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={openLegal}>
        <RNText style={styles.buttonText}>Conduct</RNText>
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
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    marginVertical: 4,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
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