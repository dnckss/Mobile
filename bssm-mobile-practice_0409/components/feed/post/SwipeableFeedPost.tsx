import { Ionicons } from '@expo/vector-icons';
import { Post } from '@type/Post';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { FeedPost } from './FeedPost';

const DELETE_AREA_WIDTH = 80;
const DELETE_THRESHOLD = -60;

function SwipeableFeedPost({
    post,
    onDelete,
}: {
    post: Post;
    onDelete: (id: string) => void;
}) {
    const [cardHeight, setCardHeight] = useState(0);

    const translateX = useSharedValue(0);
    const cardScale = useSharedValue(1);

    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate(e => {
            translateX.value = Math.min(0, Math.max(-DELETE_AREA_WIDTH, e.translationX));
        })
        .onEnd(() => {
            if (translateX.value < DELETE_THRESHOLD) {
                translateX.value = withSpring(-DELETE_AREA_WIDTH, { damping: 15 });
            } else {
                translateX.value = withSpring(0);
            }
        });

    const longPressGesture = Gesture.LongPress()
        .minDuration(400)
        .onStart(() => {
            cardScale.value = withSpring(0.96);
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        })
        .onFinalize(() => {
            cardScale.value = withSpring(1);
        });

    const composedGesture = Gesture.Race(longPressGesture, panGesture);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { scale: cardScale.value },
        ],
    }));

    const handleDeletePress = () => {
        translateX.value = withSpring(0);
        onDelete(post.id);
    };

    const handleLayout = (e: LayoutChangeEvent) => {
        setCardHeight(e.nativeEvent.layout.height);
    };

    return (
        <View style={styles.container}>
            {cardHeight > 0 && (
                <View style={[styles.deleteArea, { height: cardHeight }]}>
                    <TouchableOpacity
                        onPress={handleDeletePress}
                        style={styles.deleteButton}
                    >
                        <Ionicons name='trash-outline' size={24} color='white' />
                    </TouchableOpacity>
                </View>
            )}

            <GestureDetector gesture={composedGesture}>
                <Animated.View style={animatedStyle} onLayout={handleLayout}>
                    <FeedPost post={post} />
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    deleteArea: {
        position: 'absolute',
        right: 0,
        top: 0,
        width: DELETE_AREA_WIDTH,
        backgroundColor: '#ED4956',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
    },
    deleteButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
});

export { SwipeableFeedPost };
