import React, { useState } from 'react';
import { View, TextInput, Text, TextInputProps, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@theme/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, secureTextEntry, className, ...props }) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };

  return (
    <View className="mb-4 w-full">
      {label && <Text className="text-textPrimary text-sm font-semibold mb-1.5">{label}</Text>}
      <View className={`flex-row items-center bg-inputBackground border rounded-lg ${error ? 'border-errorC' : 'border-borderC'}`}>
        <TextInput
          className="flex-1 px-3 py-3.5 text-base text-textPrimary"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isSecure}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={toggleSecureEntry} className="p-3" activeOpacity={0.7}>
            <Feather name={isSecure ? "eye-off" : "eye"} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-errorC text-xs mt-1">{error}</Text>}
    </View>
  );
};
