import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
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

  const getPixelSize = () => {
    const sectionSize = getSectionSize();
    
    if (currentLevel === 1) {
      return sectionSize / 27;
    } else if (currentLevel === 2) {
      return sectionSize / 9;
    } else if (currentLevel === 3) {
      return sectionSize / 3;
    } else {
      // Level 4: one pixel per section -> pixel fills the section
      return sectionSize;
    }
  };

  const renderSection = (section) => {
    const sectionSize = getSectionSize();
    
    if (currentLevel === 4) {
      // Level 4: each section represents exactly ONE global pixel.
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
            testID={`l4-pixel-${section.x}-${section.y}`}
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
      // Levels 1, 2, 3: Navigation levels (clickable sections with blue borders)
      const pixelsInSection = [];
      
      if (currentLevel === 1) {
        const baseX = section.x * 27;
        const baseY = section.y * 27;
        for (let y = 0; y < 27; y++) {
          for (let x = 0; x < 27; x++) {
            const pixelX = baseX + x;
            const pixelY = baseY + y;
            const paintedPixel = section.pixels.find(p => p.x === pixelX && p.y === pixelY);
            const color = paintedPixel ? paintedPixel.color : null;
            pixelsInSection.push({ x: pixelX, y: pixelY, color, relativeX: x, relativeY: y });
          }
        }
      } else if (currentLevel === 2) {
        const baseX = section.x * 9;
        const baseY = section.y * 9;
        for (let y = 0; y < 9; y++) {
          for (let x = 0; x < 9; x++) {
            const pixelX = baseX + x;
            const pixelY = baseY + y;
            const paintedPixel = section.pixels.find(p => p.x === pixelX && p.y === pixelY);
            const color = paintedPixel ? paintedPixel.color : null;
            pixelsInSection.push({ x: pixelX, y: pixelY, color, relativeX: x, relativeY: y });
          }
        }
      } else {
        // Level 3: Render 9 pixels (3x3) within each section using local modulo mapping
        for (let y = 0; y < 3; y++) {
          for (let x = 0; x < 3; x++) {
            const paintedPixel = section.pixels.find(p => (p.x % 3) === x && (p.y % 3) === y);
            const color = paintedPixel ? paintedPixel.color : null;
            pixelsInSection.push({ x, y, color, relativeX: x, relativeY: y });
          }
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
        <Text style={styles.loadingText}>Loading canvas...</Text>
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
    borderWidth: 0.5,
    borderColor: '#ddd',
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