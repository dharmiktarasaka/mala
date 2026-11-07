import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface OmSymbolProps {
  size?: number;
  color?: string;
  badgeSize?: number;
}

export const OmSymbol: React.FC<OmSymbolProps> = ({
  size = 28,
  color = Colors.primary,
  badgeSize,
}) => {
  const content = (
    <Text
      style={[
        styles.symbol,
        {
          fontSize: size,
          color,
          lineHeight: size * 1.25,
        },
      ]}
    >
      ॐ
    </Text>
  );

  if (!badgeSize) return content;

  return (
    <View
      style={[
        styles.badge,
        {
          width: badgeSize,
          height: badgeSize,
          borderRadius: badgeSize / 2,
        },
      ]}
    >
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FDBA74',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  symbol: {
    fontWeight: '700',
    textAlign: 'center',
  },
});

