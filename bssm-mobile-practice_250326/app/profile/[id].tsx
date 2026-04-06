import { Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ThemedView } from '@components/themed-view';
import ProfileFeedList from '@components/profile/feed/ProfileFeedList';
import { MOCK_USERS_MAP } from '@/mock/users';
import MOCK_POSTS from '@/mock/posts';
import { ProfileHeader } from '@components/profile/ProfileHeader';
import ContentContainer from '@components/container';
import NavigationTop from '@components/navigation/NavigationTop';

export default function UserProfileScreen() {
    const params = useLocalSearchParams<{ id?: string | string[] }>();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const user = id ? MOCK_USERS_MAP[id] : undefined;
    const posts = id ? MOCK_POSTS.filter(post => post.userId === id) : [];

    if (!id || !user) {
        return (
            <ThemedView style={styles.notFound}>
                <Text style={styles.notFoundText}>유저를 찾을 수 없어요.</Text>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ContentContainer isTopElement={true}>
                <NavigationTop title={user.username} />
            </ContentContainer>
            <ProfileFeedList
                posts={posts}
                header={
                    <ProfileHeader
                        user={user}
                        userAnalytics={{
                            post: posts.length,
                        }}
                    />
                }
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    notFound: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notFoundText: {
        fontSize: 16,
        opacity: 0.5,
    },
});
