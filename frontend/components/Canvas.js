import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text as RNText, useWindowDimensions } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useCanvas } from '../context/CanvasContext';
import { canvasAPI, getApiBaseUrl } from '../services/api';

const Canvas = () => {
  const {
    currentLevel,
    canvasData,
    selectedColor,
    paintPixel,
    zoomToSection,
    loading,
    fetchParams,
  } = useCanvas();

  const { width: winWidth, height: winHeight } = useWindowDimensions();

  const getGridSize = () => 3;

  // True underlying pixel span per section at each level (matches backend model)
  const getSectionPixelSpan = () => {
    if (currentLevel === 1) return 243;
    if (currentLevel === 2) return 81;
    if (currentLevel === 3) return 27;
    if (currentLevel === 4) return 9;
    if (currentLevel === 5) return 3;
    return 1;
  };

  // Fit canvas to viewport: leave breathable padding for chrome/controls
  const horizontalPadding = 40; // px
  const verticalPadding = 220;  // px (header + footer controls area)
  const availableWidth = Math.max(160, winWidth - horizontalPadding);
  const availableHeight = Math.max(160, winHeight - verticalPadding);
  const CANVAS_PX = Math.max(160, Math.min(availableWidth, availableHeight));

  const getSectionSize = () => CANVAS_PX / getGridSize();
  const getPixelUnit = () => getSectionSize() / getSectionPixelSpan();

  // SVG rendering for L1..L5 with realtime refresh
  const [svgMarkup, setSvgMarkup] = useState('');
  const refreshPendingRef = useRef(false);
  const lastRefreshTsRef = useRef(0);

  const fetchAndSetSvg = async () => {
    if (!(currentLevel >= 1 && currentLevel <= 5)) return;
    try {
      const { sectionX, sectionY } = fetchParams || {};
      const svg = await canvasAPI.getRenderedSvg(currentLevel, sectionX, sectionY);
      setSvgMarkup(svg);
      lastRefreshTsRef.current = Date.now();
    } catch {}
  };

  useEffect(() => {
    fetchAndSetSvg();
  }, [currentLevel, fetchParams]);

  useEffect(() => {
    if (!(currentLevel >= 1 && currentLevel <= 5)) return;
    const base = getApiBaseUrl().replace(/^http/, 'ws');
    const ws = new WebSocket(`${base.replace(/\/$/, '')}/ws`);

    ws.onmessage = () => {
      const now = Date.now();
      const elapsed = now - lastRefreshTsRef.current;
      if (elapsed >= 1000) {
        fetchAndSetSvg();
      } else if (!refreshPendingRef.current) {
        refreshPendingRef.current = true;
        setTimeout(() => {
          refreshPendingRef.current = false;
          fetchAndSetSvg();
        }, 1000 - elapsed);
      }
    };
    return () => ws.close();
  }, [currentLevel, fetchParams]);

  const renderSection = (section) => {
    const sectionSize = getSectionSize();

    if (currentLevel === 6) {
      const pixelUnit = getPixelUnit();
      const globalX = (fetchParams?.sectionX ?? 0) * 3 + section.x;
      const globalY = (fetchParams?.sectionY ?? 0) * 3 + section.y;
      const paintedPixel = section.pixels && section.pixels.length > 0 ? section.pixels[0] : null;
      const color = paintedPixel ? paintedPixel.color : null;

      return (
        <View key={`${section.x}-${section.y}`} style={[styles.section, { width: sectionSize, height: sectionSize }]}>
          <TouchableOpacity
            testID={`l6-pixel-${section.x}-${section.y}`}
            style={[styles.pixel, { width: pixelUnit, height: pixelUnit, backgroundColor: color ?? '#f0f0f0' }]}
            onPress={() => paintPixel(globalX, globalY, selectedColor)}
          />
        </View>
      );
    }

    // For L1..L5 sections are interacted via overlay; actual image comes from unified SVG
    return (
      <TouchableOpacity
        key={`${section.x}-${section.y}`}
        testID={`section-${currentLevel}-${section.x}-${section.y}`}
        style={[styles.section, { width: sectionSize, height: sectionSize }]}
        onPress={() => zoomToSection(section.x, section.y)}
      />
    );
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
        const section = canvasData.find((s) => s.x === col && s.y === row);
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
        {currentLevel >= 1 && currentLevel <= 5 ? (
          <View style={{ width: CANVAS_PX, height: CANVAS_PX }}>
            {svgMarkup ? <SvgXml xml={svgMarkup} width={CANVAS_PX} height={CANVAS_PX} /> : null}
            <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
              {renderGrid()}
            </View>
          </View>
        ) : (
          <View style={{ width: CANVAS_PX, height: CANVAS_PX }}>{renderGrid()}</View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  canvas: { flexDirection: 'column', borderWidth: 2, borderColor: '#bdbdbd' },
  row: { flexDirection: 'row' },
  section: { borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.0)' },
  pixel: { borderWidth: 0 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: '#666' },
});

export default Canvas; 