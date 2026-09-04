import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppNavigator } from './navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  console.log(">>> APP ROOT MOUNTED <<<");
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

