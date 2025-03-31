import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import * as Updates from 'expo-updates';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can log the error to an error reporting service here
    // For now, we'll just log it to the console
    console.error("Uncaught error:", error, errorInfo);
    // Optionally, you could send this to an analytics service or your own logging endpoint
  }

  private handleReload = () => {
    // Attempt to reload the app using Expo Updates
    Updates.reloadAsync().catch(err => {
      console.error("Failed to reload app:", err);
      // Fallback or further action if reload fails
    });
  };

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops! Something went wrong.</Text>
          <Text style={styles.message}>
            An unexpected error occurred. Please try restarting the app.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.errorDetails}>
              Error: {this.state.error.toString()}
            </Text>
          )}
          <Button title="Try to Reload App" onPress={this.handleReload} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8d7da', // Light red background for error indication
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#721c24', // Dark red text
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#721c24',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorDetails: {
    fontSize: 12,
    color: '#721c24',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'monospace', // Use monospace for error details if available
  },
});

export default ErrorBoundary;
