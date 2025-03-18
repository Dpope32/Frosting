import React from 'react';
import { LandingPage } from '@/components/LandingPage';
import { View, Text } from 'react-native';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.log('[ErrorBoundary] Error caught:', error);
    console.log('[ErrorBoundary] Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Something went wrong.</Text>
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
