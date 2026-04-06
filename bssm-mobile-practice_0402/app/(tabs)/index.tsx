import { View, ActivityIndicator } from 'react-native';
import NavigationTop from '@components/navigation/NavigationTop';
import ContentContainer from '@components/container';
import { FeedList } from '@components/feed/FeedList';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@components/themed-view';
import { useFeedStore } from '@/store/feed-store';
import { useEffect } from 'react';

export default function HomeScreen() {
    const { posts, loading, fetchFeed, loadMore } = useFeedStore();

    useEffect(() => {
        fetchFeed();
        // zustand 스토어 액션은 참조가 안정적이므로 마운트 시 1회만 실행
    }, []);

    return (    
        <ThemedView style={{ flex: 1 }}>
            <ContentContainer isTopElement={true}>
                <NavigationTop
                    title='MyFeed'
                    icon={'layers'}
                    rightButtons={
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 15,
                            }}
                        >
                            <Ionicons
                                name='add-outline'
                                size={24}
                                color='#262626'
                            />
                        </View>
                    }
                />
            </ContentContainer>

            {loading && posts.length === 0 ? (
                <ActivityIndicator style={{ flex: 1 }} />
            ) : (
                <FeedList posts={posts} onEndReached={loadMore} />
            )}
        </ThemedView>
    );
}
