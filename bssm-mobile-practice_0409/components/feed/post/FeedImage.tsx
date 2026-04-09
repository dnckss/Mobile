import { Image, ImageLoadEventData } from 'expo-image';
import { Dimensions, ImageSourcePropType, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_SCALE = 3;

export default function FeedImage({
    image,
    onDoubleTap,
}: {
    image: ImageSourcePropType;
    onDoubleTap?: () => void;
}) {
    const [imageHeight, setImageHeight] = useState(SCREEN_WIDTH);

    // 실습 2-1: scale, savedScale 선언
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    // 실습 3-1: heartOpacity, heartScale 선언
    const heartOpacity = useSharedValue(0);
    const heartScale = useSharedValue(0);

    // 실습 2-2: pinchGesture 정의
    const pinchGesture = Gesture.Pinch()
        .onUpdate(e => {
            scale.value = Math.min(
                MAX_SCALE,
                Math.max(1, savedScale.value * e.scale),
            );
        })
        .onEnd(() => {
            savedScale.value = scale.value;
            if (scale.value < 1) {
                scale.value = withSpring(1);
                savedScale.value = 1;
            }
        });

    // 실습 3-2: doubleTapGesture 정의
    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onStart(() => {
            // 하트 애니메이션
            heartOpacity.value = 1;
            heartScale.value = withSequence(
                withSpring(1.2, { damping: 6, stiffness: 300 }),
                withSpring(1, { damping: 8 }),
                withTiming(1, { duration: 300 }),
                withTiming(0, { duration: 200 }),
            );
            heartOpacity.value = withSequence(
                withTiming(1, { duration: 0 }),
                withTiming(1, { duration: 600 }),
                withTiming(0, { duration: 200 }),
            );
            // runOnJS로 JS 함수 호출
            if (onDoubleTap) {
                runOnJS(onDoubleTap)();
            }
        });

    // 실습 3-3: Gesture.Simultaneous로 합성
    const composedGesture = Gesture.Simultaneous(
        pinchGesture,
        doubleTapGesture,
    );

    // 실습 2-3: imageAnimatedStyle 정의
    const imageAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    // 실습 3-4: heartAnimatedStyle 정의
    const heartAnimatedStyle = useAnimatedStyle(() => ({
        opacity: heartOpacity.value,
        transform: [{ scale: heartScale.value }],
    }));

    const handleImageLoad = (e: ImageLoadEventData) => {
        const { width, height } = e.source;
        const ratio = height / width;
        setImageHeight(SCREEN_WIDTH * ratio);
    };

    return (
        // 실습 2-4: GestureDetector + Animated.View 감싸기
        <GestureDetector gesture={composedGesture}>
            <Animated.View>
                <Animated.View style={imageAnimatedStyle}>
                    <Image
                        source={image}
                        style={{ width: SCREEN_WIDTH, height: imageHeight }}
                        onLoad={handleImageLoad}
                    />
                </Animated.View>
                {/* 실습 3-5: 하트 오버레이 */}
                <Animated.View
                    style={[styles.heartOverlay, heartAnimatedStyle]}
                    pointerEvents='none'
                >
                    <Ionicons name='heart' size={80} color='white' />
                </Animated.View>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    heartOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
