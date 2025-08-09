import React from 'react';
import { CanvasProvider } from './context/CanvasContext';
import CanvasScreen from './screens/CanvasScreen';

export default function App() {
  return (
    <CanvasProvider>
      <CanvasScreen />
    </CanvasProvider>
  );
}
