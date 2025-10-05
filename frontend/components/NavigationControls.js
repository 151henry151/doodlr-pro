import React, { useState } from 'react';
import { View, TouchableOpacity, Text as RNText, StyleSheet, Linking, Platform, Modal, TextInput, ActivityIndicator, ToastAndroid } from 'react-native';
import { useCanvas } from '../context/CanvasContext';
import { getApiBaseUrl } from '../services/api';

const NavigationControls = () => {
  const { currentLevel, navigateBack, goToRoot, fetchParams, drawingMode, toggleDrawingMode, isDrawableLevel } = useCanvas();

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState('info');
  const [bannerVisible, setBannerVisible] = useState(false);

  const showBanner = (message, type = 'info') => {
    setBannerMessage(message);
    setBannerType(type);
    setBannerVisible(true);
    setTimeout(() => setBannerVisible(false), 2500);
  };

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
      if (Platform.OS === 'android') {
        ToastAndroid.show('Report submitted. Thank you.', ToastAndroid.SHORT);
      } else if (Platform.OS === 'web') {
        alert('Report submitted. Thank you.');
      } else {
        showBanner('Report submitted. Thank you.', 'success');
      }
    } catch (e) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Report failed', ToastAndroid.SHORT);
      } else if (Platform.OS === 'web') {
        alert('Report failed');
      } else {
        showBanner('Report failed', 'error');
      }
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
      <View style={styles.controlsRow}>
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

        {isDrawableLevel() && (
          <TouchableOpacity 
            style={[styles.button, drawingMode && styles.activeButton]} 
            onPress={toggleDrawingMode}
          >
            <RNText style={[styles.buttonText, drawingMode && styles.activeText]}>
              {drawingMode ? 'Drawing' : 'Draw'}
            </RNText>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.button} onPress={openReport}>
          <RNText style={styles.buttonText}>Report</RNText>
        </TouchableOpacity>
      </View>

      <RNText style={styles.levelText}>Level {currentLevel}</RNText>

      {bannerVisible && Platform.OS !== 'android' && (
        <View
          style={[
            styles.feedbackBanner,
            { backgroundColor: bannerType === 'success' ? '#2e7d32' : bannerType === 'error' ? '#c62828' : '#424242' },
          ]}
        >
          <RNText style={styles.feedbackText}>{bannerMessage}</RNText>
        </View>
      )}

      <View style={styles.footerLinks}>
        <RNText style={styles.linkText} accessibilityRole="link" onPress={openPrivacy}>Privacy</RNText>
        <RNText style={styles.separator}> · </RNText>
        <RNText style={styles.linkText} accessibilityRole="link" onPress={openTerms}>Terms</RNText>
        <RNText style={styles.separator}> · </RNText>
        <RNText style={styles.linkText} accessibilityRole="link" onPress={openLegal}>Conduct</RNText>
      </View>

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
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
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
  activeButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeText: {
    color: '#fff',
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
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  footerLinks: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  separator: {
    color: '#999',
    fontSize: 13,
    marginHorizontal: 6,
  },
  feedbackBanner: {
    width: '100%',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  feedbackText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
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