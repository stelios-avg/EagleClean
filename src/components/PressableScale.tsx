import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Light tap feedback — ignored if the device has no Taptic Engine. */
export function tapLight(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
  scaleTo?: number;
  children?: React.ReactNode;
};

/**
 * Shared press treatment: slight scale + haptic so every tap feels the same.
 */
export function PressableScale({
  children,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  style,
  haptic = true,
  scaleTo = 0.97,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const springTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      friction: 7,
      tension: 240,
    }).start();
  };

  const handlePressIn = (event: GestureResponderEvent) => {
    if (!disabled) {
      springTo(scaleTo);
      if (haptic) {
        tapLight();
      }
    }
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    springTo(1);
    onPressOut?.(event);
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      android_ripple={{ color: colors.accentSoft, borderless: false }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, { transform: [{ scale }] }]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
