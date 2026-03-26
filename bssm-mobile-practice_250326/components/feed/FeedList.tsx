import { FlatList, StyleSheet } from 'react-native';
import { Post } from '@type/Post';
import { FeedPost } from './post/FeedPost';
import { ThemedView } from '@components/themed-view';

function FeedList({ posts }: { posts: Post[] }) {
    return (
        <FlatList
            data={posts}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => <FeedPost post={item} />}
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            ListEmptyComponent={<ThemedView style={styles.empty} />}
            showsVerticalScrollIndicator={false}
        />
    );
}

const LIST_BOTTOM_PADDING = 20;

const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: { paddingBottom: LIST_BOTTOM_PADDING },
    empty: { height: 1 },
});

export { FeedList };
