/**
 * Main Canvas Screen that combines all canvas components.
 */

import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar, Text } from 'react-native';
import Canvas from '../components/Canvas';
import ColorPalette from '../components/ColorPalette';
import NavigationControls from '../components/NavigationControls';

const CanvasScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Doodlr</Text>
          <Text style={styles.subtitle}>Collaborative Canvas</Text>
        </View>
        
        <Canvas />
        
        <NavigationControls />
        
        <ColorPalette />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
});

export default CanvasScreen; 