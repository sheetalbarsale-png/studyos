import React from 'react';
import { AppProvider } from './context/AppContext';
import { MobileAppShell } from './components/mobile/MobileAppShell';

export default function App() {
  return (
    <AppProvider>
      <MobileAppShell />
    </AppProvider>
  );
}
