import React from 'react';
import { LandingPage } from '@/components/LandingPage';
import { View, Text } from 'react-native';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, errorMessage: string}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { 
      hasError: false,
      errorMessage: ''
    };
  }

  static getDerivedStateFromError(error: any) {
    // Capture error message to display to the user
    const errorMessage = error?.message || 'Unknown error occurred';
    return { hasError: true, errorMessage };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Enhanced error logging with more details
    console.log('[ErrorBoundary] Error caught:', error);
    console.log('[ErrorBoundary] Error message:', error?.message);
    console.log('[ErrorBoundary] Error stack:', error?.stack);
    console.log('[ErrorBoundary] Error info:', errorInfo);
    
    // Log if it's the setCursor error we're trying to fix
    const isCursorError = error?.message?.includes('setCursor') || 
                           error?.toString()?.includes('setCursor');
    if (isCursorError) {
      console.log('[ErrorBoundary] DETECTED setCursor ERROR');
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10, textAlign: 'center' }}>
            Something went wrong.
          </Text>
          <Text style={{ fontSize: 14, color: 'red', textAlign: 'center' }}>
            {this.state.errorMessage}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function HomeScreen() {
  return (
    <ErrorBoundary>
      <LandingPage />
    </ErrorBoundary>
  );
}
