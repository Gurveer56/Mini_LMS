import React from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@shared/components/Button';

export const WelcomeScreen = () => {
  return (
    <View className="flex-1 bg-background justify-between p-6">
      <View className="flex-1 justify-center items-center">
        <Text className="text-4xl font-bold text-primary mb-3">HOE App</Text>
        <Text className="text-base text-textSecondary text-center leading-6">Welcome! Please log in or create a new account to continue.</Text>
      </View>
      <View className="gap-3 mb-8">
        <Button 
          variant="default" 
          onPress={() => router.push('/(auth)/login')}
          className="w-full"
        >
          Login
        </Button>
        <Button 
          variant="secondary" 
          onPress={() => router.push('/(auth)/register')}
          className="w-full"
        >
          Sign Up
        </Button>
      </View>
    </View>
  );
};
