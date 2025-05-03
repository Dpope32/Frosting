import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Button, Alert, ScrollView, Platform } from 'react-native';
import * as Updates from 'expo-updates';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error | null;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: undefined
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({ errorInfo });
    
    // Log error to console
    console.error("Uncaught error:", error);
    
    // Call optional error handler
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        console.error("Error in error handler:", handlerError);
      }
    }

    // Log additional component stack information
    if (errorInfo.componentStack) {
      console.error("Component stack:", errorInfo.componentStack);
    }
  }

  private handleReload = async () => {
    try {
      await Updates.reloadAsync();
    } catch (err) {
      console.error("Failed to reload app via Updates:", err);
      
      // Try to restart the JS engine if reload fails
      if (Platform.OS === 'web') {
        window.location.reload();
      } else {
        Alert.alert(
          "Reload Failed",
          "Could not automatically reload the app. Please close and reopen the app manually."
        );
      }
    }
  };

  private getErrorDetails = (): string => {
    try {
      const { error, errorInfo } = this.state;
      
      if (!error) return "Unknown error occurred";
      
      let details = '';
      
      // Safely extract error message
      const errorMessage = typeof error.message === 'string' ? error.message : 
                          (error.toString && typeof error.toString === 'function') ? 
                          error.toString() : 'Error object could not be converted to string';
      
      details += errorMessage;
      
      // Add stack trace if available
      if (error.stack && typeof error.stack === 'string') {
        details += `\n\nStack: ${error.stack.split('\n').slice(0, 3).join('\n')}`;
      }
      
      // Add component stack if available
      if (errorInfo?.componentStack) {
        const componentLines = errorInfo.componentStack
          .split('\n')
          .filter(line => line.trim())
          .slice(0, 3);
        
        if (componentLines.length > 0) {
          details += `\n\nComponent: ${componentLines.join('\n')}`;
        }
      }
      
      return details;
    } catch (detailsError) {
      console.error("Error generating error details:", detailsError);
      return "Could not generate error details safely";
    }
  };

  public render() {
    const { hasError } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <Text style={styles.title}>Oops! Something Went Wrong</Text>
            <Text style={styles.message}>
              An unexpected error occurred. We apologize for the inconvenience.
              Please try reloading the application.
            </Text>
            <View style={styles.errorContainer}>
              <Text style={styles.errorDetails} selectable>
                {this.getErrorDetails()}
              </Text>
            </View>
            <View style={styles.buttonContainer}>
              <Button title="Reload Application" onPress={this.handleReload} />
            </View>
          </View>
        </ScrollView>
      );
    }

    // When there's no error, render children normally
    return children;
  }
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8d7da',
    minHeight: '100%',
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
  errorContainer: {
    width: '100%',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    marginBottom: 20,
    maxHeight: 300,
  },
  errorDetails: {
    fontSize: 12,
    color: '#721c24',
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'System',
    letterSpacing: -0.5,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 250,
    marginTop: 20,
  }
});

export default ErrorBoundary;
