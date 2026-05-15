import React from 'react';
import { View, Text } from 'react-native';
import { ToastConfig } from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import { colors } from '@theme/colors';

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <View className="w-[90%] bg-inputBackground p-4 rounded-xl flex-row items-center border border-borderC shadow-md mt-2.5">
      <Feather name="check-circle" size={24} color="#4ade80" />
      <View className="ml-3 flex-1">
        <Text className="text-base font-semibold text-textPrimary">{text1}</Text>
        {text2 && <Text className="text-sm text-textSecondary mt-1">{text2}</Text>}
      </View>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View className="w-[90%] bg-inputBackground p-4 rounded-xl flex-row items-center border border-borderC shadow-md mt-2.5">
      <Feather name="alert-circle" size={24} color={colors.error} />
      <View className="ml-3 flex-1">
        <Text className="text-base font-semibold text-textPrimary">{text1}</Text>
        {text2 && <Text className="text-sm text-textSecondary mt-1">{text2}</Text>}
      </View>
    </View>
  ),
};
