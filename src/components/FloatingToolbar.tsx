import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '@/conts/Colors';
import { fontStyle } from '@/styles/fonts';

interface Props {
  onAddText: (position: { x: number; y: number }) => void;
  onAddImage: (position: { x: number; y: number }) => void;
  onAddSpotify: (position: { x: number; y: number }) => void;
  onAddSticker: (position: { x: number; y: number }) => void;
  canvasSize: { width: number; height: number };
}

const FloatingToolbar: React.FC<Props> = ({ onAddText, onAddImage, onAddSpotify, onAddSticker, canvasSize }) => {
  const [draggedItem, setDraggedItem] = React.useState<'text' | 'image' | 'spotify' | 'sticker' | null>(null);

  const textTranslateX = useSharedValue(0);
  const textTranslateY = useSharedValue(0);
  const imageTranslateX = useSharedValue(0);
  const imageTranslateY = useSharedValue(0);
  const spotifyTranslateX = useSharedValue(0);
  const spotifyTranslateY = useSharedValue(0);
  const stickerTranslateX = useSharedValue(0);
  const stickerTranslateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const handleDragStart = (type: 'text' | 'image' | 'spotify' | 'sticker') => {
    setDraggedItem(type);
    isDragging.value = true;
  };

  const handleDragEnd = (x: number, y: number) => {
    if (draggedItem) {
      const dropX = Math.max(0, Math.min(canvasSize.width - 100, x));
      const dropY = Math.max(0, Math.min(canvasSize.height - 100, y));

      if (draggedItem === 'text') {
        onAddText({ x: dropX, y: dropY });
        textTranslateX.value = 0;
        textTranslateY.value = 0;
      } else if (draggedItem === 'image') {
        onAddImage({ x: dropX, y: dropY });
        imageTranslateX.value = 0;
        imageTranslateY.value = 0;
      } else if (draggedItem === 'spotify') {
        onAddSpotify({ x: dropX, y: dropY });
        spotifyTranslateX.value = 0;
        spotifyTranslateY.value = 0;
      } else if (draggedItem === 'sticker') {
        onAddSticker({ x: dropX, y: dropY });
        stickerTranslateX.value = 0;
        stickerTranslateY.value = 0;
      }
    }

    setDraggedItem(null);
    isDragging.value = false;
  };

  const textButtonGesture = Gesture.Pan()
    .onStart(() => runOnJS(handleDragStart)('text'))
    .onUpdate((event) => {
      textTranslateX.value = event.translationX;
      textTranslateY.value = event.translationY;
    })
    .onEnd((event) => {
      runOnJS(handleDragEnd)(event.absoluteX - 50, event.absoluteY - 100);
      textTranslateX.value = 0;
      textTranslateY.value = 0;
    });

  const imageButtonGesture = Gesture.Pan()
    .onStart(() => runOnJS(handleDragStart)('image'))
    .onUpdate((event) => {
      imageTranslateX.value = event.translationX;
      imageTranslateY.value = event.translationY;
    })
    .onEnd((event) => {
      runOnJS(handleDragEnd)(event.absoluteX - 50, event.absoluteY - 100);
      imageTranslateX.value = 0;
      imageTranslateY.value = 0;
    });

  const spotifyButtonGesture = Gesture.Pan()
    .onStart(() => runOnJS(handleDragStart)('spotify'))
    .onUpdate((event) => {
      spotifyTranslateX.value = event.translationX;
      spotifyTranslateY.value = event.translationY;
    })
    .onEnd((event) => {
      runOnJS(handleDragEnd)(event.absoluteX - 50, event.absoluteY - 100);
      spotifyTranslateX.value = 0;
      spotifyTranslateY.value = 0;
    });

  const textAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: textTranslateX.value },
      { translateY: textTranslateY.value },
    ],
    opacity: isDragging.value && draggedItem === 'text' ? 0.7 : 1,
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: imageTranslateX.value },
      { translateY: imageTranslateY.value },
    ],
    opacity: isDragging.value && draggedItem === 'image' ? 0.7 : 1,
  }));

  const spotifyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: spotifyTranslateX.value },
      { translateY: spotifyTranslateY.value },
    ],
    opacity: isDragging.value && draggedItem === 'spotify' ? 0.7 : 1,
  }));

  const stickerButtonGesture = Gesture.Pan()
    .onStart(() => runOnJS(handleDragStart)('sticker'))
    .onUpdate((event) => {
      stickerTranslateX.value = event.translationX;
      stickerTranslateY.value = event.translationY;
    })
    .onEnd((event) => {
      runOnJS(handleDragEnd)(event.absoluteX - 50, event.absoluteY - 100);
      stickerTranslateX.value = 0;
      stickerTranslateY.value = 0;
    });

  const stickerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: stickerTranslateX.value },
      { translateY: stickerTranslateY.value },
    ],
    opacity: isDragging.value && draggedItem === 'sticker' ? 0.7 : 1,
  }));

  return (
    <View style={styles.container}>

      <View style={styles.buttonContainer}>
        <GestureDetector gesture={textButtonGesture}>
          <View>
            <TouchableOpacity style={[styles.toolButton, styles.textButton]}>
              <Text style={styles.buttonText}>📝</Text>
              <Text style={styles.buttonLabel}>Testo</Text>
            </TouchableOpacity>
          </View>
        </GestureDetector>

        <GestureDetector gesture={imageButtonGesture}>
          <View>
            <TouchableOpacity style={[styles.toolButton, styles.imageButton]}>
              <Text style={styles.buttonText}>📸</Text>
              <Text style={styles.buttonLabel}>Foto</Text>
            </TouchableOpacity>
          </View>
        </GestureDetector>

        <GestureDetector gesture={spotifyButtonGesture}>
          <View>
            <TouchableOpacity style={[styles.toolButton, styles.spotifyButton]}>
              <Text style={styles.buttonText}>🎵</Text>
              <Text style={styles.buttonLabel}>Spotify</Text>
            </TouchableOpacity>
          </View>
        </GestureDetector>

        <GestureDetector gesture={stickerButtonGesture}>
          <View>
            <TouchableOpacity style={[styles.toolButton, styles.stickerButton]}>
              <Text style={styles.buttonText}>🎨</Text>
              <Text style={styles.buttonLabel}>Sticker</Text>
            </TouchableOpacity>
          </View>
        </GestureDetector>

      </View>
      {draggedItem && (
        <Animated.View
          style={[
            styles.ghostElement,
            draggedItem === 'text' ? styles.textButton :
              draggedItem === 'image' ? styles.imageButton :
                draggedItem === 'spotify' ? styles.spotifyButton : styles.stickerButton,
            draggedItem === 'text' ? textAnimatedStyle :
              draggedItem === 'image' ? imageAnimatedStyle :
                draggedItem === 'spotify' ? spotifyAnimatedStyle : stickerAnimatedStyle,
          ]}
        >
          <Text style={styles.ghostText}>
            {draggedItem === 'text' ? '📝' :
              draggedItem === 'image' ? '📸' :
                draggedItem === 'spotify' ? '🎵' : '🎨'}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  toolButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  textButton: {
    backgroundColor: '#3498db',
  },
  imageButton: {
    backgroundColor: '#e67e22',
  },
  buttonText: {
    fontSize: 24,
    marginBottom: 2,
  },
  buttonLabel: {
    fontSize: 10,
    color: 'white',
    ...fontStyle('regular'),
  },
  ghostElement: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: 'rgba(52, 152, 219, 0.7)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  ghostText: {
    fontSize: 20,
    color: 'white',
  },
  spotifyButton: {
    backgroundColor: '#1db954',
  },
  stickerButton: {
    backgroundColor: '#9b59b6',
  },
});

export default FloatingToolbar;