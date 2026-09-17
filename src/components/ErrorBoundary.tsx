import { Component, type ErrorInfo, type ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

type Props = { children: ReactNode };
type State = { error: Error | null; stack: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, stack: "" };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Aynera crash:", error.message, info.componentStack);
    this.setState({ stack: info.componentStack ?? "" });
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.hint}>
          Scroll down and screenshot this — it tells us exactly what broke:
        </Text>
        <ScrollView style={styles.box}>
          <Text style={styles.body}>{this.state.error.message}</Text>
          <Text style={styles.stack}>{this.state.stack}</Text>
          <Text style={styles.stack}>{this.state.error.stack}</Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.brandPrimaryPressed,
    padding: 24,
    paddingTop: 64,
  },
  title: {
    color: colors.accentPrimary,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  hint: {
    color: colors.onDark70,
    fontSize: 13,
    marginBottom: 12,
  },
  box: {
    flex: 1,
  },
  body: {
    color: colors.textOnPrimary,
    fontSize: 15,
    marginBottom: 16,
  },
  stack: {
    color: colors.onDark70,
    fontSize: 11,
  },
});
