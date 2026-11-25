import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Platform, useWindowDimensions } from 'react-native';
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Rect,
  Polygon,
  Line,
  Ellipse,
  Circle,
  G,
} from 'react-native-svg';

export const WireframeBackground: React.FC = () => {
  const { width, height } = useWindowDimensions();

  // Floating animations for geometric elements
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;
  const floatAnim4 = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    // Cube 1 (Top-Left) float loop
    const float1 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: -14,
          duration: 3400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(floatAnim1, {
          toValue: 8,
          duration: 3600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );

    // Ring 1 (Top-Right) float loop
    const float2 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 16,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(floatAnim2, {
          toValue: -10,
          duration: 3800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );

    // Cube 2 (Right-Center) float loop
    const float3 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim3, {
          toValue: -16,
          duration: 4400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(floatAnim3, {
          toValue: 6,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );

    // Ring 2 (Bottom-Left) float loop
    const float4 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim4, {
          toValue: 12,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(floatAnim4, {
          toValue: -8,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );

    // Subtle background aura pulse
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );

    float1.start();
    float2.start();
    float3.start();
    float4.start();
    pulse.start();

    return () => {
      float1.stop();
      float2.stop();
      float3.stop();
      float4.stop();
      pulse.stop();
    };
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Base Dark Canvas with Deep Slate Gradients */}
      <Svg style={StyleSheet.absoluteFillObject} width="100%" height="100%">
        <Defs>
          {/* Emerald Glow Aura in Center/Upper area */}
          <RadialGradient id="emeraldAura" cx="45%" cy="30%" rx="65%" ry="50%" fx="45%" fy="30%">
            <Stop offset="0%" stopColor="#10B981" stopOpacity="0.14" />
            <Stop offset="40%" stopColor="#059669" stopOpacity="0.07" />
            <Stop offset="100%" stopColor="#070A12" stopOpacity="0" />
          </RadialGradient>

          {/* Warm Sacred Amber Subtle Aura on Lower Right */}
          <RadialGradient id="sacredAura" cx="75%" cy="65%" rx="55%" ry="45%" fx="75%" fy="65%">
            <Stop offset="0%" stopColor="#F59E0B" stopOpacity="0.08" />
            <Stop offset="50%" stopColor="#D97706" stopOpacity="0.03" />
            <Stop offset="100%" stopColor="#070A12" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Base dark fill */}
        <Rect x="0" y="0" width="100%" height="100%" fill="#070A12" />

        {/* Radial aura overlays */}
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#emeraldAura)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#sacredAura)" />

        {/* Subtle Sacred Geometric Grid Dots */}
        <G opacity="0.18">
          {[...Array(8)].map((_, r) =>
            [...Array(14)].map((_, c) => (
              <Circle
                key={`dot-${r}-${c}`}
                cx={`${(c + 1) * 7}%`}
                cy={`${(r + 1) * 12}%`}
                r="1"
                fill="#4ADE80"
              />
            ))
          )}
        </G>
      </Svg>

      {/* ================= 3D WIREFRAME CUBE 1 (TOP-LEFT) ================= */}
      <Animated.View
        style={[
          styles.floatingContainer,
          styles.cubeTopLeft,
          { transform: [{ translateY: floatAnim1 }] },
        ]}
      >
        <Svg width={90} height={90} viewBox="0 0 100 100">
          {/* Wireframe Isometric Cube:
              Outer Vertices:
              Top: (50, 10)
              Top Right: (86, 30)
              Bottom Right: (86, 70)
              Bottom: (50, 90)
              Bottom Left: (14, 70)
              Top Left: (14, 30)
              Center Front: (50, 50)
          */}
          {/* Faces with luminous subtle lime fill */}
          <Polygon
            points="50,10 86,30 50,50 14,30"
            fill="#4ADE80"
            fillOpacity="0.08"
            stroke="#4ADE80"
            strokeWidth="1.6"
            strokeOpacity="0.8"
          />
          <Polygon
            points="14,30 50,50 50,90 14,70"
            fill="#4ADE80"
            fillOpacity="0.04"
            stroke="#4ADE80"
            strokeWidth="1.6"
            strokeOpacity="0.75"
          />
          <Polygon
            points="50,50 86,30 86,70 50,90"
            fill="#4ADE80"
            fillOpacity="0.06"
            stroke="#4ADE80"
            strokeWidth="1.6"
            strokeOpacity="0.85"
          />

          {/* Translucent internal back wireframe lines (3D see-through effect) */}
          <Line
            x1="50"
            y1="10"
            x2="50"
            y2="50"
            stroke="#4ADE80"
            strokeWidth="1.2"
            strokeOpacity="0.5"
            strokeDasharray="3,3"
          />
          <Line
            x1="50"
            y1="50"
            x2="50"
            y2="90"
            stroke="#4ADE80"
            strokeWidth="1.6"
            strokeOpacity="0.9"
          />
        </Svg>
      </Animated.View>

      {/* ================= WIREFRAME ELLIPSE RING 1 (TOP-RIGHT) ================= */}
      <Animated.View
        style={[
          styles.floatingContainer,
          styles.ringTopRight,
          { transform: [{ translateY: floatAnim2 }] },
        ]}
      >
        <Svg width={110} height={70} viewBox="0 0 110 70">
          <G transform="rotate(-18 55 35)">
            {/* Outer concentric ring */}
            <Ellipse
              cx="55"
              cy="35"
              rx="46"
              ry="16"
              fill="none"
              stroke="#4ADE80"
              strokeWidth="1.4"
              strokeOpacity="0.7"
            />
            {/* Inner concentric ring */}
            <Ellipse
              cx="55"
              cy="35"
              rx="38"
              ry="11"
              fill="none"
              stroke="#22C55E"
              strokeWidth="1"
              strokeOpacity="0.45"
            />
          </G>
        </Svg>
      </Animated.View>

      {/* ================= 3D WIREFRAME CUBE 2 (RIGHT-CENTER) ================= */}
      <Animated.View
        style={[
          styles.floatingContainer,
          styles.cubeRightCenter,
          { transform: [{ translateY: floatAnim3 }] },
        ]}
      >
        <Svg width={72} height={72} viewBox="0 0 100 100">
          <G transform="rotate(12 50 50)">
            <Polygon
              points="50,14 82,32 50,50 18,32"
              fill="#4ADE80"
              fillOpacity="0.09"
              stroke="#4ADE80"
              strokeWidth="1.5"
              strokeOpacity="0.8"
            />
            <Polygon
              points="18,32 50,50 50,86 18,68"
              fill="#4ADE80"
              fillOpacity="0.04"
              stroke="#4ADE80"
              strokeWidth="1.5"
              strokeOpacity="0.7"
            />
            <Polygon
              points="50,50 82,32 82,68 50,86"
              fill="#4ADE80"
              fillOpacity="0.06"
              stroke="#4ADE80"
              strokeWidth="1.5"
              strokeOpacity="0.8"
            />
            <Line
              x1="50"
              y1="50"
              x2="50"
              y2="86"
              stroke="#4ADE80"
              strokeWidth="1.5"
              strokeOpacity="0.85"
            />
          </G>
        </Svg>
      </Animated.View>

      {/* ================= WIREFRAME ELLIPSE RING 2 (BOTTOM-LEFT) ================= */}
      <Animated.View
        style={[
          styles.floatingContainer,
          styles.ringBottomLeft,
          { transform: [{ translateY: floatAnim4 }] },
        ]}
      >
        <Svg width={90} height={55} viewBox="0 0 90 55">
          <G transform="rotate(22 45 27)">
            <Ellipse
              cx="45"
              cy="27"
              rx="36"
              ry="13"
              fill="none"
              stroke="#4ADE80"
              strokeWidth="1.3"
              strokeOpacity="0.65"
            />
            <Ellipse
              cx="45"
              cy="27"
              rx="28"
              ry="8"
              fill="none"
              stroke="#22C55E"
              strokeWidth="0.9"
              strokeOpacity="0.35"
            />
          </G>
        </Svg>
      </Animated.View>

      {/* ================= FLOATING SPARKLE GLOWS ================= */}
      <Animated.View
        style={[
          styles.floatingContainer,
          styles.sparkle1,
          { opacity: pulseAnim },
        ]}
      >
        <Svg width={20} height={20} viewBox="0 0 20 20">
          <Circle cx="10" cy="10" r="2.5" fill="#4ADE80" />
          <Circle cx="10" cy="10" r="5.5" fill="#4ADE80" fillOpacity="0.25" />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingContainer,
          styles.sparkle2,
          { opacity: pulseAnim },
        ]}
      >
        <Svg width={20} height={20} viewBox="0 0 20 20">
          <Circle cx="10" cy="10" r="2" fill="#F59E0B" />
          <Circle cx="10" cy="10" r="5" fill="#F59E0B" fillOpacity="0.2" />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    pointerEvents: 'none' as any,
  },
  cubeTopLeft: {
    top: 50,
    left: '4%',
    opacity: 0.85,
  },
  ringTopRight: {
    top: 70,
    right: '6%',
    opacity: 0.8,
  },
  cubeRightCenter: {
    top: '46%',
    right: '3%',
    opacity: 0.85,
  },
  ringBottomLeft: {
    bottom: 80,
    left: '6%',
    opacity: 0.75,
  },
  sparkle1: {
    top: '28%',
    left: '22%',
  },
  sparkle2: {
    bottom: '22%',
    right: '18%',
  },
});
