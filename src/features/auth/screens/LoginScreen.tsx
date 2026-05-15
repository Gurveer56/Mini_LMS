import { useAuthStore } from '@features/auth/store/useAuthStore';
import { Button } from '@shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Text } from '@shared/components/ui/text';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import * as React from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { loginUser } from '../api';

export const LoginScreen = () => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const login = useAuthStore((state) => state.login);

  const passwordInputRef = React.useRef<TextInput>(null);

  function onUsernameSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  async function onSubmit() {
    if (!username || !password) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all fields',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginUser({ username, password });

      await login(
        response.data.accessToken,
        response.data.refreshToken,
        response.data.user
      );

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: response.message || 'Welcome back!',
      });

      setUsername('');
      setPassword('');

      router.replace('/(main)/(tabs)/home');
    } catch (error: unknown) {
      const err = error as any;
      let errorMessage = 'Something went wrong';
      const responseData = err.response?.data;

      if (responseData) {
        if (responseData.errors && responseData.errors.length > 0) {
          const firstError = responseData.errors[0];
          const errorKey = Object.keys(firstError)[0];
          errorMessage = firstError[errorKey];
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
      }

      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} className="bg-background">
      <View className="gap-6">
        <Card className="border-border/0 shadow-none">
          <CardHeader>
            <CardTitle className="text-center text-xl">Sign in to your account</CardTitle>
            <CardDescription className="text-center">
              Welcome back! Please sign in to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-6">
            <View className="gap-6">
              <View className="gap-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                  onSubmitEditing={onUsernameSubmitEditing}
                  returnKeyType="next"
                  submitBehavior="submit"
                />
              </View>
              <View className="gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  ref={passwordInputRef}
                  id="password"
                  placeholder="Enter your password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="send"
                  onSubmitEditing={onSubmit}
                />
              </View>
              <Button className="w-full" onPress={onSubmit} disabled={isLoading}>
                <Text>{isLoading ? 'Signing in...' : 'Sign In'}</Text>
              </Button>
            </View>
            <Text className="text-center text-sm">
              Don't have an account?{' '}
              <Text
                className="text-sm underline underline-offset-4"
                onPress={() => router.push('/(auth)/register')}
              >
                Sign up
              </Text>
            </Text>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
});
