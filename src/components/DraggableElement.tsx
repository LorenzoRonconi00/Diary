import React, { useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Linking,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '@/conts/Colors';
import { fontStyle } from '@/styles/fonts';
import { Audio } from 'expo-av';

interface Props {
  element: {
    id: string;
    type: 'text' | 'image' | 'spotify' | 'sticker';
    content: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    rotation?: number;
    zIndex?: number;
    fontSize?: number;
    spotifyData?: {
      trackId: string;
      trackName: string;
      artistName: string;
      albumName: string;
      imageUrl: string;
      previewUrl?: string;
    };
    stickerData?: {
      giphyId: string;
      title: string;
      originalUrl: string;
      smallUrl: string;
    };
  };
  isSelected: boolean;
  isEditMode: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: any) => void;
  onDragToDelete: (id: string, position: { x: number; y: number }, elementSize: { width: number; height: number }) => void;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string) => void;
  canvasSize: { width: number; height: number };
}

const DraggableElement: React.FC<Props> = ({
  element,
  isSelected,
  isEditMode,
  onSelect,
  onUpdate,
  onDragToDelete,
  onDragStart,
  onDragEnd,
  canvasSize,
}) => {
  const translateX = useSharedValue(element.position.x);
  const translateY = useSharedValue(element.position.y);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(element.rotation || 0);
  const width = useSharedValue(element.size.width);
  const height = useSharedValue(element.size.height);

  const isDragging = useSharedValue(false);
  const isScaling = useSharedValue(false);

  const startPosition = useSharedValue({ x: 0, y: 0 });
  const startSize = useSharedValue({ width: 0, height: 0 });
  const startScale = useSharedValue(1);

  const baseFontSize = useSharedValue(element.fontSize || (element.type === 'text' ? 20 : 16));
  const fontSize = useSharedValue(element.fontSize || (element.type === 'text' ? 20 : 16));


  useEffect(() => {
    translateX.value = element.position.x;
    translateY.value = element.position.y;
    width.value = element.size.width;
    height.value = element.size.height;
    rotation.value = element.rotation || 0;

    if (element.type === 'text' && element.fontSize) {
      baseFontSize.value = element.fontSize;
      fontSize.value = element.fontSize;
    }
  }, [element.position.x, element.position.y, element.size.width, element.size.height, element.rotation, element.fontSize]);

  const panGesture = Gesture.Pan()
    .enabled(isEditMode)
    .maxPointers(1)
    .onStart(() => {
      isDragging.value = true;
      isScaling.value = false;
      startPosition.value = { x: translateX.value, y: translateY.value };
      runOnJS(onSelect)(element.id);
      runOnJS(onDragStart)(element.id);
    })
    .onUpdate((event) => {
      if (!isScaling.value) {
        const padding = 20;
        const newX = Math.max(
          -padding,
          Math.min(canvasSize.width - width.value + padding, startPosition.value.x + event.translationX)
        );
        const newY = Math.max(
          -padding,
          Math.min(canvasSize.height - height.value + padding, startPosition.value.y + event.translationY)
        );

        translateX.value = newX;
        translateY.value = newY;
      }
    })
    .onEnd(() => {
      isDragging.value = false;

      const elementSize = { width: width.value, height: height.value };
      const centerPosition = {
        x: translateX.value,
        y: translateY.value
      };

      runOnJS(onDragToDelete)(element.id, centerPosition, elementSize);
      runOnJS(onDragEnd)(element.id);

      runOnJS(onUpdate)(element.id, {
        position: { x: translateX.value, y: translateY.value },
      });
    });

  const openInSpotify = () => {
    const trackId = element.spotifyData?.trackId;
    if (!trackId) return;

    const spotifyUrl = `spotify:track:${trackId}`;
    const webUrl = `https://open.spotify.com/track/${trackId}`;

    Linking.openURL(spotifyUrl).catch(() => {
      Linking.openURL(webUrl);
    });
  };

  const handleSpotifyPress = () => {
    if (isEditMode) return;
    openInSpotify();
  };

  const pinchGesture = Gesture.Pinch()
    .enabled(isEditMode && isSelected)
    .onStart(() => {
      isScaling.value = true;
      isDragging.value = false;
      startSize.value = { width: width.value, height: height.value };
      startScale.value = scale.value;
      runOnJS(onSelect)(element.id);
    })
    .onUpdate((event) => {
      if (!isDragging.value) {
        const newScale = Math.max(0.5, Math.min(3, event.scale));

        if (element.type === 'text') {
          fontSize.value = Math.max(12, Math.min(48, baseFontSize.value * newScale));
        } else {
          const newWidth = Math.max(80, Math.min(canvasSize.width * 0.8, startSize.value.width * newScale));
          const newHeight = Math.max(80, Math.min(canvasSize.height * 0.8, startSize.value.height * newScale));

          width.value = newWidth;
          height.value = newHeight;
        }
      }
    })
    .onEnd(() => {
      isScaling.value = false;

      if (element.type === 'text') {
        baseFontSize.value = fontSize.value;
        runOnJS(onUpdate)(element.id, {
          fontSize: fontSize.value,
        });
      } else {
        runOnJS(onUpdate)(element.id, {
          size: { width: width.value, height: height.value },
        });
      }
    });

  const tapGesture = Gesture.Tap()
    .enabled(true)
    .onStart(() => {
      if (isEditMode) {
        runOnJS(onSelect)(element.id);
      } else if (element.type === 'spotify') {
        console.log('🎵 Spotify tap detected, preview URL:', element.spotifyData?.previewUrl);
        runOnJS(handleSpotifyPress)();
      }
    });

  const composedGesture = element.type === 'spotify' && !isEditMode
    ? Gesture.Race(tapGesture, panGesture)
    : Gesture.Exclusive(
      Gesture.Simultaneous(panGesture, pinchGesture),
      tapGesture
    );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation.value}deg` },
      ],
      width: width.value,
      height: height.value,
      zIndex: element.zIndex || 1,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    if (element.type === 'text') {
      return {
        fontSize: fontSize.value,
      };
    }
    return {};
  });

  const showBorder = isEditMode && isSelected;

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={[
          styles.content,
          showBorder && styles.selected,
          element.type === 'text' && styles.textContent
        ]}>
          {element.type === 'text' ? (
            <View style={styles.textContainer}>
              <Animated.Text
                style={[styles.text, animatedTextStyle]}
                numberOfLines={10}
                adjustsFontSizeToFit={false}
              >
                {element.content}
              </Animated.Text>
            </View>
          ) : element.type === 'spotify' ? (
            <View style={styles.spotifyContainer}>
              <Image
                source={{ uri: element.spotifyData?.imageUrl || element.content }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          ) : element.type === 'sticker' ? (
            <View style={styles.stickerContainer}>
              <Image
                source={{ uri: element.stickerData?.originalUrl || element.content }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          ) : (
            <Image
              source={{ uri: element.content }}
              style={styles.image}
              resizeMode="cover"
            />
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  content: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  textContent: {
    backgroundColor: 'transparent',
  },
  selected: {
    borderWidth: 2,
    borderColor: '#3498db',
    borderStyle: 'dashed',
    shadowColor: '#3498db',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 8,
  },
  textContainer: {
    width: '100%',
    height: '100%',
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  text: {
    ...fontStyle('regular'),
    color: Colors.darkBrown,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  spotifyContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  spotifyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  spotifyIcon: {
    fontSize: 24,
    color: 'white',
  },
  spotifyInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 4,
  },
  spotifyTrack: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  spotifyArtist: {
    color: 'white',
    fontSize: 8,
  },
  stickerContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DraggableElement;