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
    // Number of micro-cells rendered per section edge at each level
    // L1: 81, L2: 27, L3: 27, L4: 9, L5: 3
    if (currentLevel === 1) return 81;
    if (currentLevel === 2) return 27;
    if (currentLevel === 3) return 27;
    if (currentLevel === 4) return 9;
    if (currentLevel === 5) return 3;
    return 1; // L6
  };

  const getModuloForLevel = () => {
    // Modulo used to place painted pixels within a section at each level (except L6)
    if (currentLevel === 1) return 81;
    if (currentLevel === 2) return 27;
    if (currentLevel === 3) return 27;
    if (currentLevel === 4) return 9;
    if (currentLevel === 5) return 3;
    return 1;
  };

  const getPixelSize = () => {
    const sectionSize = getSectionSize();
    const perEdge = getPerSectionPixelCount();
    return sectionSize / perEdge;
  };

  const renderSection = (section) => {
    const sectionSize = getSectionSize();
    
    if (currentLevel === 6) {
      // Level 6: each section represents exactly ONE global pixel.
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
      // Levels 1..5: Navigation levels (clickable sections with blue borders)
      const pixelsInSection = [];
      const perEdge = getPerSectionPixelCount();
      const modulo = getModuloForLevel();

      for (let y = 0; y < perEdge; y++) {
        for (let x = 0; x < perEdge; x++) {
          const paintedPixel = section.pixels.find(p => (p.x % modulo) === x && (p.y % modulo) === y);
          const color = paintedPixel ? paintedPixel.color : null;
          pixelsInSection.push({ x, y, color, relativeX: x, relativeY: y });
        }
      }
      
      console.log(`Level ${currentLevel}, Section (${section.x}, ${section.y}): ${pixelsInSection.length} pixels`);
      
      const pixelSize = getPixelSize();
      
      return (
        <TouchableOpacity
          key={`${section.x}-${section.y}`}
          testID={`section-${currentLevel}-${section.x}-${section.y}`}
          style={[
            styles.section,
            {
              width: sectionSize,
              height: sectionSize,
              borderWidth: 2,
              borderColor: '#007AFF',
            },
          ]}
          onPress={() => zoomToSection(section.x, section.y)}
        >
          <View style={styles.pixelGrid}>
            {pixelsInSection.map((pixel) => (
              <View
                key={`${pixel.relativeX}-${pixel.relativeY}`}
                style={[
                  styles.pixel,
                  {
                    width: pixelSize,
                    height: pixelSize,
                    backgroundColor: pixel.color ? colorMap[pixel.color] : '#f0f0f0',
                    position: 'absolute',
                    left: pixel.relativeX * pixelSize,
                    top: pixel.relativeY * pixelSize,
                  },
                ]}
              />
            ))}
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
  },
  row: {
    flexDirection: 'row',
  },
  section: {
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pixelGrid: {
    width: '100%',
    height: '100%',
    position: 'relative',
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