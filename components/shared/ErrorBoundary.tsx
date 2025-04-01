import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
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
    // --- Production Error Reporting ---
    // TODO: Integrate with an error reporting service (e.g., Sentry, Bugsnag)
    // Example: ErrorReportingService.logError(error, errorInfo);
    console.error("Uncaught error:", error, errorInfo); // Keep console logging for dev/debugging
    // ---------------------------------
  }

  private handleReload = async () => {
    try {
      // Attempt to reload the app using Expo Updates
      await Updates.reloadAsync();
    } catch (err) {
      console.error("Failed to reload app via Updates:", err);
      Alert.alert(
        "Reload Failed",
        "Could not automatically reload the app. Please close and reopen the app manually."
      );
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops! Something Went Wrong</Text>
          <Text style={styles.message}>
            An unexpected error occurred. We apologize for the inconvenience.
            Please try reloading the application.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.errorDetails} selectable>
              Dev Info: {this.state.error.toString()}
            </Text>
          )}
          <Button title="Reload Application" onPress={this.handleReload} />
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
    backgroundColor: '#f8d7da', 
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#721c24',
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
    fontFamily: 'monospace', 
  },
});

export default ErrorBoundary;
