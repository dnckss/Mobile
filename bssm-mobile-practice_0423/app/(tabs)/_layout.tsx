import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

function TabFallback() {
    return (
        <ThemedView style={styles.fallback}>
            <ThemedText type='subtitle'>탭 화면에 문제가 발생했어요.</ThemedText>
            <ThemedText type='default' style={styles.fallbackBody}>
                앱을 재시작해 주세요.
            </ThemedText>
        </ThemedView>
    );
}

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <ErrorBoundary fallback={<TabFallback />}>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                    headerShown: false,
                    tabBarButton: HapticTab,
                }}
            >
                <Tabs.Screen
                    name='index'
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color }) => (
                            <IconSymbol
                                size={28}
                                name='house.fill'
                                color={color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name='profile'
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ color }) => (
                            <Ionicons
                                name='person-circle-outline'
                                size={26}
                                color={color}
                            />
                        ),
                    }}
                />
            </Tabs>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    fallback: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 8,
    },
    fallbackBody: {
        opacity: 0.7,
        textAlign: 'center',
    },
});
