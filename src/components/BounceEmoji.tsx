import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

/** Soft looping bounce for decorative emojis. */
export function BounceEmoji({
  emoji,
  delay = 0,
  size = 22,
}: {
  emoji: string;
  delay?: number;
  size?: number;
}) {
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(y, {
          toValue: -5,
          duration: 720,
          useNativeDriver: true,
        }),
        Animated.timing(y, {
          toValue: 0,
          duration: 720,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, y]);

  return (
    <Animated.View style={{ transform: [{ translateY: y }] }}>
      <Text style={[styles.emoji, { fontSize: size, lineHeight: size + 4 }]}>{emoji}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  emoji: {
    textAlign: 'center',
  },
});
