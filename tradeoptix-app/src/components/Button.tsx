import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  variant = 'primary',
  size = 'medium',
  disabled,
  style,
  ...props
}) => {
  const getButtonContent = () => (
    <TouchableOpacity
      style={[
        styles.button,
        styles[size],
        variant === 'outline' && styles.outline,
        variant === 'secondary' && styles.secondary,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? '#007AFF' : '#FFFFFF'}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === 'outline' && styles.outlineText,
            variant === 'secondary' && styles.secondaryText,
            styles[`${size}Text`],
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (variant === 'primary' && !disabled && !loading) {
    return (
      <LinearGradient
        colors={['#007AFF', '#0056CC']}
        style={[styles.button, styles[size], style]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity
          style={styles.gradientButton}
          onPress={onPress}
          disabled={disabled || loading}
          {...props}
        >
          <Text style={[styles.buttonText, styles[`${size}Text`]]}>{title}</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return getButtonContent();
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
  },
  gradientButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Sizes
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 56,
  },
  // Text sizes
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  // Variants
  secondary: {
    backgroundColor: '#F2F2F7',
  },
  secondaryText: {
    color: '#007AFF',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  outlineText: {
    color: '#007AFF',
  },
  disabled: {
    backgroundColor: '#C7C7CC',
    borderColor: '#C7C7CC',
  },
});