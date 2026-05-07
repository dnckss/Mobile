import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type FeedErrorProps = {
    message: string;
    onRetry: () => void;
};

function FeedError({ message, onRetry }: FeedErrorProps) {
    return (
        <ThemedView style={styles.container}>
            <ThemedText type='subtitle'>피드를 불러오지 못했어요</ThemedText>
            <ThemedText type='default' style={styles.message}>
                {message}
            </ThemedText>
            <TouchableOpacity
                onPress={onRetry}
                style={styles.retry}
                hitSlop={8}
            >
                <ThemedText type='defaultSemiBold' style={styles.retryText}>
                    다시 시도
                </ThemedText>
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 8,
    },
    message: {
        opacity: 0.7,
        textAlign: 'center',
    },
    retry: {
        marginTop: 16,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: '#0a7ea4',
    },
    retryText: {
        color: '#fff',
    },
});

export { FeedError };
