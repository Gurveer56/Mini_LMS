import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@shared/components/ui/card';

export const HomeScreen = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <ScrollView contentContainerStyle={styles.container} className="bg-background">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-foreground">Welcome back,</Text>
        <Text className="text-xl text-primary font-semibold">{user?.username}!</Text>
      </View>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>Your activity at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-muted-foreground text-sm">Role</Text>
              <Text className="text-foreground text-lg font-bold">{user?.role}</Text>
            </View>
            <View>
              <Text className="text-muted-foreground text-sm">Status</Text>
              <Text className="text-green-500 text-lg font-bold">Active</Text>
            </View>
          </View>
        </CardContent>
      </Card>

      <View className="gap-4">
        <Text className="text-xl font-bold text-foreground px-1">Your Overview</Text>
        <Card>
          <CardContent className="py-6">
            <Text className="text-foreground text-center">No recent notifications.</Text>
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
    paddingTop: 60,
  },
});
