import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text as RNText, useWindowDimensions } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useCanvas } from '../context/CanvasContext';
import { canvasAPI, getApiBaseUrl } from '../services/api';

const Canvas = () => {
  const {
    currentLevel,
    canvasData,
    selectedColor,
    paintPixel,
    refreshCanvasAfterDrag,
    zoomToSection,
    loading,
    fetchParams,
    drawingMode,
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

  // Check if current level supports drawing mode toggle (levels 4-5)
  const isDrawableLevel = () => currentLevel >= 4 && currentLevel <= 5;
  
  // Check if we should show drawing interface (drawable level + drawing mode enabled)
  const shouldShowDrawing = () => isDrawableLevel() && drawingMode;

  // Convert touch coordinates to global pixel coordinates (matching TouchableOpacity logic)
  const getPixelCoordinates = (touchX, touchY) => {
    const pixelUnit = getPixelUnit();
    const pixelsPerSection = getSectionPixelSpan();
    
    // Calculate which section the touch is in
    const sectionX = Math.floor(touchX / getSectionSize());
    const sectionY = Math.floor(touchY / getSectionSize());
    
    // Calculate local pixel coordinates within the section
    const localX = Math.floor((touchX % getSectionSize()) / pixelUnit);
    const localY = Math.floor((touchY % getSectionSize()) / pixelUnit);
    
    // Calculate global coordinates using the same logic as TouchableOpacity
    const parentSectionX = fetchParams?.sectionX ?? 0;
    const parentSectionY = fetchParams?.sectionY ?? 0;
    
    let baseX, baseY;
    if (currentLevel === 5) {
      baseX = parentSectionX * 9;
      baseY = parentSectionY * 9;
    } else if (currentLevel === 4) {
      baseX = parentSectionX * 27;
      baseY = parentSectionY * 27;
    } else {
      baseX = parentSectionX * pixelsPerSection;
      baseY = parentSectionY * pixelsPerSection;
    }
    
    const globalX = baseX + sectionX * pixelsPerSection + localX;
    const globalY = baseY + sectionY * pixelsPerSection + localY;
    
    return { globalX, globalY, sectionX, sectionY, localX, localY };
  };

  // Handle pixel drawing with drag support
  const handlePixelDraw = async (touchX, touchY) => {
    if (!shouldShowDrawing()) return;
    
    const { globalX, globalY } = getPixelCoordinates(touchX, touchY);
    const pixelKey = `${globalX},${globalY}`;
    
    // Prevent drawing the same pixel multiple times in a drag
    if (lastDrawnPixel === pixelKey) return;
    
    setLastDrawnPixel(pixelKey);
    console.log(`🎨 Drag painting: globalX=${globalX}, globalY=${globalY}`);
    
    // Add to painted pixels for real-time feedback
    setPaintedPixels(prev => new Set([...prev, pixelKey]));
    
    // Paint to backend (no immediate refresh)
    await paintPixel(globalX, globalY, selectedColor, false);
  };

  // Gesture handlers for drag-to-paint
  const onGestureEvent = (event) => {
    if (!shouldShowDrawing()) return;
    
    const { x, y } = event.nativeEvent;
    
    // For fast drags, interpolate between last position and current position
    if (lastDrawnPixel && isDrawing) {
      const lastCoords = lastDrawnPixel.split(',').map(Number);
      const currentCoords = getPixelCoordinates(x, y);
      
      // Interpolate to fill gaps in fast drags
      const dx = currentCoords.globalX - lastCoords[0];
      const dy = currentCoords.globalY - lastCoords[1];
      const steps = Math.max(Math.abs(dx), Math.abs(dy));
      
      if (steps > 1) {
        // Fill in the gaps
        for (let i = 1; i <= steps; i++) {
          const interpolatedX = lastCoords[0] + Math.round((dx * i) / steps);
          const interpolatedY = lastCoords[1] + Math.round((dy * i) / steps);
          const pixelKey = `${interpolatedX},${interpolatedY}`;
          
          if (!paintedPixels.has(pixelKey)) {
            setPaintedPixels(prev => new Set([...prev, pixelKey]));
            paintPixel(interpolatedX, interpolatedY, selectedColor, false);
          }
        }
      }
    }
    
    handlePixelDraw(x, y);
  };

  const onHandlerStateChange = async (event) => {
    if (event.nativeEvent.state === State.BEGAN) {
      setIsDrawing(true);
      setLastDrawnPixel(null);
      setPaintedPixels(new Set()); // Clear painted pixels for new drag
    } else if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
      setIsDrawing(false);
      setLastDrawnPixel(null);
      // Refresh canvas after drag ends to show all painted pixels
      console.log('🎨 Drag ended, refreshing canvas...');
      await refreshCanvasAfterDrag();
      setPaintedPixels(new Set()); // Clear painted pixels after refresh
    }
  };

  // SVG rendering for L1..L5 with realtime refresh
  const [svgMarkup, setSvgMarkup] = useState('');
  const refreshPendingRef = useRef(false);
  const lastRefreshTsRef = useRef(0);
  
  // Drawing state for drag functionality
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastDrawnPixel, setLastDrawnPixel] = useState(null);
  const [paintedPixels, setPaintedPixels] = useState(new Set()); // Track painted pixels for real-time feedback

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

    // Level 6: Original drawing logic (9 individual pixels)
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

    // Levels 4-5: Show individual pixels when in drawing mode
    if (shouldShowDrawing()) {
      const pixelUnit = getPixelUnit();
      const pixels = [];
      const pixelsPerSection = getSectionPixelSpan();
      
      // Debug logging
      console.log(`Drawing mode: Level ${currentLevel}, Section (${section.x}, ${section.y}), fetchParams:`, fetchParams);
      console.log(`Section pixels:`, section.pixels);
      if (section.pixels && section.pixels.length > 0) {
        console.log(`Actual pixel coordinates:`, section.pixels.map(p => `(${p.x}, ${p.y})`));
      }
      
      // Create a grid of all possible pixels in this section
      for (let py = 0; py < pixelsPerSection; py++) {
        for (let px = 0; px < pixelsPerSection; px++) {
          // Calculate global coordinates correctly based on backend logic
          // For level 5: start_x = section_x * LEVEL4_SECTION_SIZE (9)
          //              subsection_x = start_x + x * LEVEL5_SECTION_SIZE (3)
          // For level 4: start_x = section_x * LEVEL3_SECTION_SIZE (27)  
          //              subsection_x = start_x + x * LEVEL4_SECTION_SIZE (9)
          
          const parentSectionX = fetchParams?.sectionX ?? 0;
          const parentSectionY = fetchParams?.sectionY ?? 0;
          
          let baseX, baseY;
          if (currentLevel === 5) {
            // Level 5: start_x = section_x * 9 (from backend logic)
            baseX = parentSectionX * 9;
            baseY = parentSectionY * 9;
          } else if (currentLevel === 4) {
            // Level 4: start_x = section_x * 27 (from backend logic)
            baseX = parentSectionX * 27;
            baseY = parentSectionY * 27;
          } else {
            // Fallback
            baseX = parentSectionX * pixelsPerSection;
            baseY = parentSectionY * pixelsPerSection;
          }
          
          const globalX = baseX + section.x * pixelsPerSection + px;
          const globalY = baseY + section.y * pixelsPerSection + py;
          
          // Debug: Check coordinate calculation
          if (px === 0 && py === 0) {
            console.log(`Section (${section.x}, ${section.y}): baseX=${baseX}, baseY=${baseY}, globalX=${globalX}, globalY=${globalY}`);
          }
          
          // Find if this pixel is already painted (from backend or real-time)
          const paintedPixel = section.pixels?.find(p => p.x === globalX && p.y === globalY);
          const pixelKey = `${globalX},${globalY}`;
          const isRealTimePainted = paintedPixels.has(pixelKey);
          
          let color = null;
          // Real-time painted pixels take priority over backend pixels during drawing
          if (isRealTimePainted) {
            color = selectedColor; // Show real-time painted pixels
          } else if (paintedPixel) {
            color = paintedPixel.color; // Show backend pixels when not being painted
          }
          
          // Debug: Check if we're looking for the right coordinates
          if (section.pixels && section.pixels.length > 0 && (globalX === 128 || globalX === 126 || globalX === 124)) {
            console.log(`Looking for pixel at (${globalX}, ${globalY}) in section (${section.x}, ${section.y})`);
            console.log(`Available pixels in this section:`, section.pixels.map(p => `(${p.x}, ${p.y})`));
          }
          

          // Debug: Log when creating TouchableOpacity
          if (px === 0 && py === 0) {
            console.log(`Creating TouchableOpacity for section (${section.x}, ${section.y}) with globalX=${globalX}, globalY=${globalY}`);
          }
          
          // During drag, render as simple View to avoid TouchableOpacity interference
          if (isDrawing) {
            pixels.push(
              <View
                key={`pixel-${px}-${py}`}
                testID={`pixel-${currentLevel}-${globalX}-${globalY}`}
                style={[
                  styles.pixel, 
                  { 
                    width: pixelUnit, 
                    height: pixelUnit, 
                    backgroundColor: color ?? '#f0f0f0',
                    position: 'absolute',
                    left: px * pixelUnit,
                    top: py * pixelUnit,
                  }
                ]}
              />
            );
          } else {
            pixels.push(
              <TouchableOpacity
                key={`pixel-${px}-${py}`}
                testID={`pixel-${currentLevel}-${globalX}-${globalY}`}
                style={[
                  styles.pixel, 
                  { 
                    width: pixelUnit, 
                    height: pixelUnit, 
                    backgroundColor: color ?? '#f0f0f0',
                    position: 'absolute',
                    left: px * pixelUnit,
                    top: py * pixelUnit,
                  }
                ]}
                onPress={() => {
                  console.log(`🎯 UI Click: globalX=${globalX}, globalY=${globalY}, section=(${section.x}, ${section.y}), px=${px}, py=${py}`);
                  console.log(`🎯 Calculated coordinates: baseX=${baseX}, baseY=${baseY}, pixelsPerSection=${pixelsPerSection}`);
                  console.log(`🎯 Final calculation: baseX + section.x * pixelsPerSection + px = ${baseX} + ${section.x} * ${pixelsPerSection} + ${px} = ${globalX}`);
                  
                  // Add to painted pixels for real-time feedback
                  const pixelKey = `${globalX},${globalY}`;
                  setPaintedPixels(prev => new Set([...prev, pixelKey]));
                  
                  paintPixel(globalX, globalY, selectedColor);
                }}
              />
            );
          }
        }
      }

      return (
        <View key={`${section.x}-${section.y}`} style={[styles.section, { width: sectionSize, height: sectionSize }]}>
          {pixels}
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
        {currentLevel === 6 ? (
          <View style={{ width: CANVAS_PX, height: CANVAS_PX }}>{renderGrid()}</View>
        ) : shouldShowDrawing() ? (
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
            minDist={0}
          >
            <View style={{ width: CANVAS_PX, height: CANVAS_PX }}>
              {renderGrid()}
            </View>
          </PanGestureHandler>
        ) : currentLevel >= 1 && currentLevel <= 5 ? (
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