import * as React from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
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
import { registerUser } from '../api';

export const RegisterScreen = () => {
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const passwordInputRef = React.useRef<TextInput>(null);
  const usernameInputRef = React.useRef<TextInput>(null);

  function onUsernameSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  function onEmailSubmitEditing() {
    usernameInputRef.current?.focus();
  }

  async function onSubmit() {
    if (!username || !email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all fields',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await registerUser({
        username,
        email,
        password,
        role: 'USER',
      });

      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: response.message || 'You can now log in.',
      });

      setUsername('');
      setEmail('');
      setPassword('');
      router.push('/(auth)/login');
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
        text1: 'Registration Failed',
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
            <CardTitle className="text-center text-xl">Create your account</CardTitle>
            <CardDescription className="text-center">
              Welcome! Please fill in the details to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-6">
            <View className="gap-6">
              <View className="gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="m@example.com"
                  keyboardType="email-address"
                  autoComplete="email"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  onSubmitEditing={onEmailSubmitEditing}
                  returnKeyType="next"
                  submitBehavior="submit"
                />
              </View>
              <View className="gap-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  ref={usernameInputRef}
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
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="send"
                  onSubmitEditing={onSubmit}
                />
              </View>
              <Button className="w-full" onPress={onSubmit} disabled={isLoading}>
                <Text>{isLoading ? 'Creating account...' : 'Register'}</Text>
              </Button>
            </View>
            <Text className="text-center text-sm">
              Already have an account?{' '}
              <Text
                className="text-sm underline underline-offset-4"
                onPress={() => router.push('/(auth)/login')}
              >
                Sign in
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
