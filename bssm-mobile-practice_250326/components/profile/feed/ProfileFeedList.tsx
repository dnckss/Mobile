import { ReactNode } from 'react';
import { Dimensions, FlatList, StyleSheet } from 'react-native';
import { Post } from '@type/Post';
import { Image } from 'expo-image';
import { resolveImageSource } from '@/utils/image';
import { Grid, Spacing } from '@/constants/theme';
import { ThemedView } from '@components/themed-view';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = Grid.profileColumnCount;
const ITEM_WIDTH =
    (width - (COLUMN_COUNT - 1) * Grid.profileHorizontalGap) / COLUMN_COUNT;
const ITEM_HEIGHT = ITEM_WIDTH * Grid.profileImageRatio;

type ProfileFeedListProps = {
    posts: Post[];
    header?: ReactNode;
};

const LIST_BOTTOM_PADDING = Spacing.xxl;

export default function ProfileFeedList({ posts, header }: ProfileFeedListProps) {
    return (
        <FlatList
            data={posts}
            keyExtractor={item => String(item.id)}
            numColumns={COLUMN_COUNT}
            ListHeaderComponent={header ? <ThemedView>{header}</ThemedView> : null}
            renderItem={({ item, index }) => {
                const isLastInRow = index % COLUMN_COUNT === COLUMN_COUNT - 1;
                return (
                    <Image
                        style={[
                            styles.image,
                            !isLastInRow && styles.imageMarginRight,
                            styles.imageMarginBottom,
                        ]}
                        contentFit='cover'
                        source={resolveImageSource(item.images[0])}
                    />
                );
            }}
            style={styles.list}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        />
    );
}

const styles = StyleSheet.create({
    image: {
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT,
    },
    imageMarginRight: {
        marginRight: Grid.profileHorizontalGap,
    },
    imageMarginBottom: {
        marginBottom: Grid.profileVerticalGap,
    },
    list: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: LIST_BOTTOM_PADDING,
    },
});
