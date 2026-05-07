import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type ErrorBoundaryProps = {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, info: ErrorInfo) => void;
};

type ErrorBoundaryState = {
    hasError: boolean;
    error?: Error;
};

export class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary]', error, info);
        this.props.onError?.(error, info);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;
            return <DefaultFallback error={this.state.error} />;
        }

        return this.props.children;
    }
}

function DefaultFallback({ error }: { error?: Error }) {
    const code = error?.message?.slice(0, 24) ?? 'UNKNOWN';

    return (
        <ThemedView style={styles.container}>
            <View style={styles.content}>
                <ThemedText type="title">문제가 발생했어요</ThemedText>
                <ThemedText type="default" style={styles.message}>
                    잠시 후 다시 시도해주세요.
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.code}>
                    code: {code}
                </ThemedText>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        alignItems: 'center',
        gap: 8,
    },
    message: {
        opacity: 0.7,
    },
    code: {
        marginTop: 12,
        opacity: 0.5,
    },
});
