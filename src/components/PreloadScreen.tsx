import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { BrandLogo } from './ui';

const HOLD_MS = 1400;
const FADE_MS = 450;

/**
 * In-app preload shown on launch: white screen with the logo gently
 * scaling in, then fading out to reveal the app.
 */
export default function PreloadScreen({ onDone }: { onDone: () => void }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_MS,
        useNativeDriver: true,
      }).start(() => onDone());
    }, HOLD_MS);

    return () => clearTimeout(timer);
  }, [opacity, scale, onDone]);

  return (
    <Animated.View style={[styles.root, { opacity }]}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <BrandLogo chip={false} height={168} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
