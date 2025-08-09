import React, { useState } from 'react';
import { View, TouchableOpacity, Text as RNText, StyleSheet, Linking, Platform, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useCanvas } from '../context/CanvasContext';
import { getApiBaseUrl } from '../services/api';

const NavigationControls = () => {
  const { currentLevel, navigateBack, goToRoot, fetchParams } = useCanvas();

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

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

  const submitReport = async () => {
    try {
      setIsSubmittingReport(true);
      const base = getApiBaseUrl();
      const level = currentLevel;
      const x = (fetchParams?.sectionX ?? 0) * 3;
      const y = (fetchParams?.sectionY ?? 0) * 3;
      const reason = (reportText || '').trim().slice(0, 500) || 'user_report';
      const params = new URLSearchParams({ level: String(level), x: String(x), y: String(y), reason });
      await fetch(`${base}/report?${params.toString()}`, { method: 'POST' });
      setIsReportOpen(false);
      setReportText('');
      if (Platform.OS === 'web') alert('Report submitted. Thank you.');
    } catch (e) {
      if (Platform.OS === 'web') alert('Report failed');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const openReport = () => {
    setReportText('');
    setIsReportOpen(true);
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

      <TouchableOpacity style={styles.button} onPress={openReport}>
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

      <Modal
        visible={isReportOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsReportOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <RNText style={styles.modalTitle}>Report Content</RNText>
            <RNText style={styles.modalSubtitle}>Please describe the content or problem:</RNText>
            <TextInput
              style={styles.textInput}
              placeholder="Describe what you see (required)"
              placeholderTextColor="#888"
              value={reportText}
              onChangeText={setReportText}
              autoFocus
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => setIsReportOpen(false)} disabled={isSubmittingReport}>
                <RNText style={styles.secondaryText}>Cancel</RNText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, !reportText.trim() && styles.disabledButton]}
                onPress={submitReport}
                disabled={!reportText.trim() || isSubmittingReport}
              >
                {isSubmittingReport ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <RNText style={styles.buttonText}>Submit Report</RNText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  secondaryButton: {
    backgroundColor: '#eee',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  secondaryText: {
    color: '#333',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#444',
  },
  textInput: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    color: '#111',
    textAlignVertical: 'top',
    backgroundColor: '#fafafa',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});

export default NavigationControls; 