import { colors } from '@theme/colors';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  isLoading?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  isLoading,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const getContainerClass = () => {
    switch (variant) {
      case 'secondary': return 'bg-borderC';
      case 'outline': return 'bg-transparent border border-borderC';
      case 'ghost': return 'bg-transparent';
      default: return 'bg-primary';
    }
  };

  const getTextClass = () => {
    switch (variant) {
      case 'secondary': return 'text-textPrimary';
      case 'outline': return 'text-textPrimary';
      case 'ghost': return 'text-textPrimary';
      default: return 'text-background';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'py-2.5 px-3';
      case 'lg': return 'py-4 px-5';
      default: return 'py-3.5 px-4';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className={`flex-row items-center justify-center rounded-lg ${getSizeClass()} ${getContainerClass()} ${(disabled || isLoading) ? 'opacity-50' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'default' ? colors.background : colors.text} />
      ) : (
        <Text className={`font-semibold text-base ${getTextClass()}`}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};
