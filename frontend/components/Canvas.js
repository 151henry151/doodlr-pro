import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text as RNText } from 'react-native';
import { useCanvas } from '../context/CanvasContext';

const Canvas = () => {
  const {
    currentLevel,
    currentSection,
    canvasData,
    selectedColor,
    navigationHistory,
    paintPixel,
    zoomToSection,
    loading,
    fetchParams,
  } = useCanvas();

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

  const getGridSize = () => {
    return 3; // Always 3x3 grid for all levels
  };

  const getSectionSize = () => {
    const screenWidth = 350; // Approximate screen width
    const gridSize = getGridSize();
    return screenWidth / gridSize;
  };

  const getPerSectionPixelCount = () => {
    if (currentLevel === 1) return 81;
    if (currentLevel === 2) return 27;
    if (currentLevel === 3) return 27;
    if (currentLevel === 4) return 9;
    if (currentLevel === 5) return 3;
    return 1; // L6
  };

  // True underlying pixel span per section at each level (matches backend model)
  const getSectionPixelSpan = () => {
    if (currentLevel === 1) return 243; // Level 1 section is 243x243 pixels
    if (currentLevel === 2) return 81;  // Level 2 section is 81x81 pixels
    if (currentLevel === 3) return 27;  // Level 3 section is 27x27 pixels
    if (currentLevel === 4) return 9;   // Level 4 section is 9x9 pixels
    if (currentLevel === 5) return 3;   // Level 5 section is 3x3 pixels
    return 1;                           // Level 6 is a single pixel
  };

  const getPixelSize = () => {
    const sectionSize = getSectionSize();
    const perEdge = getPerSectionPixelCount();
    return sectionSize / perEdge;
  };

  const renderSection = (section) => {
    const sectionSize = getSectionSize();
    
    if (currentLevel === 6) {
      const pixelSize = getPixelSize();
      const globalX = (fetchParams?.sectionX ?? 0) * 3 + section.x;
      const globalY = (fetchParams?.sectionY ?? 0) * 3 + section.y;
      const paintedPixel = section.pixels && section.pixels.length > 0 ? section.pixels[0] : null;
      const color = paintedPixel ? paintedPixel.color : null;

      return (
        <View
          key={`${section.x}-${section.y}`}
          style={[
            styles.section,
            { width: sectionSize, height: sectionSize },
          ]}
        >
          <TouchableOpacity
            testID={`l6-pixel-${section.x}-${section.y}`}
            style={[
              styles.pixel,
              {
                width: pixelSize,
                height: pixelSize,
                backgroundColor: color ? colorMap[color] : '#f0f0f0',
              },
            ]}
            onPress={() => paintPixel(globalX, globalY, selectedColor)}
          />
        </View>
      );
    } else {
      // Levels 1..5: Render only painted pixels by aggregating to the visible grid
      const sectionPixelSpan = getSectionPixelSpan();
      const visiblePerEdge = getPerSectionPixelCount();
      const groupSize = Math.max(1, Math.floor(sectionPixelSpan / visiblePerEdge)); // e.g., 243->81 groups of 3
      const pixelSize = getPixelSize();

      // Build a map of relative cells -> color (last one wins)
      const occupied = new Map();
      for (const p of section.pixels || []) {
        // Compute local coordinates within this section's true pixel span
        const localX = ((p.x % sectionPixelSpan) + sectionPixelSpan) % sectionPixelSpan;
        const localY = ((p.y % sectionPixelSpan) + sectionPixelSpan) % sectionPixelSpan;
        const rx = Math.floor(localX / groupSize);
        const ry = Math.floor(localY / groupSize);
        occupied.set(`${rx}-${ry}`, p.color);
      }

      return (
        <TouchableOpacity
          key={`${section.x}-${section.y}`}
          testID={`section-${currentLevel}-${section.x}-${section.y}`}
          style={[
            styles.section,
            {
              width: sectionSize,
              height: sectionSize,
              borderWidth: 0.5,
              borderColor: 'rgba(0,0,0,0.35)',
              borderStyle: 'dotted',
            },
          ]}
          onPress={() => zoomToSection(section.x, section.y)}
        >
          <View style={styles.pixelGrid}>
            {Array.from(occupied.entries()).map(([key, color]) => {
              const [rx, ry] = key.split('-').map(Number);
              return (
                <View
                  key={key}
                  style={[
                    styles.pixel,
                    {
                      width: pixelSize,
                      height: pixelSize,
                      backgroundColor: color ? colorMap[color] : '#f0f0f0',
                      position: 'absolute',
                      left: rx * pixelSize,
                      top: ry * pixelSize,
                    },
                  ]}
                />
              );
            })}
          </View>
        </TouchableOpacity>
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <RNText style={styles.loadingText}>Loading canvas...</RNText>
      </View>
    );
  }

  const renderGrid = () => {
    const gridSize = getGridSize();
    const sections = [];
    
    for (let row = 0; row < gridSize; row++) {
      const rowSections = [];
      for (let col = 0; col < gridSize; col++) {
        const section = canvasData.find(s => s.x === col && s.y === row);
        if (section) {
          rowSections.push(renderSection(section));
        }
      }
      sections.push(
        <View key={`row-${row}`} style={styles.row}>
          {rowSections}
        </View>
      );
    }
    
    return sections;
  };

  return (
    <View style={styles.container}>
      <View style={styles.canvas}>
        {renderGrid()}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    flexDirection: 'column',
    borderWidth: 2,
    borderColor: '#bdbdbd'
  },
  row: {
    flexDirection: 'row',
  },
  section: {
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pixelGrid: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  pixel: {
    borderWidth: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },

});

export default Canvas; 