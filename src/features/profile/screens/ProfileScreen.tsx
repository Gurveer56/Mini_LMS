import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { Button } from '@shared/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@shared/components/ui/card';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { updateAvatar } from '../api';
import { Feather } from '@expo/vector-icons';

export const ProfileScreen = () => {
  const { user, logout, updateUser } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Permission Required',
        text2: 'Sorry, we need camera roll permissions to make this work!',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      handleUploadAvatar(result.assets[0].uri);
    }
  };

  const handleUploadAvatar = async (uri: string) => {
    setIsUploading(true);
    try {
      const response = await updateAvatar(uri);
      
      // Update the user state with the new avatar
      if (response.data && response.data.avatar) {
         await updateUser({ avatar: response.data.avatar });
      }

      Toast.show({
        type: 'success',
        text1: 'Avatar Updated',
        text2: 'Your profile picture has been updated successfully.',
      });
    } catch (error: unknown) {
      const err = error as any;
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: err.response?.data?.message || 'Something went wrong while uploading.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} className="bg-background">
      <View className="items-center mb-8">
        <TouchableOpacity 
          onPress={handlePickAvatar} 
          disabled={isUploading}
          activeOpacity={0.8}
          className="relative mb-4"
        >
          <View className="w-24 h-24 rounded-full bg-muted items-center justify-center border-2 border-primary overflow-hidden">
             {user?.avatar?.url ? (
                <Image source={{ uri: user.avatar.url }} className="w-full h-full" />
             ) : (
                <Text className="text-2xl font-bold text-foreground">
                    {user?.username?.charAt(0).toUpperCase()}
                </Text>
             )}
          </View>
          
          <View className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center border-2 border-background">
             {isUploading ? (
                <ActivityIndicator size="small" color="#09090b" />
             ) : (
                <Feather name="camera" size={14} color="#09090b" />
             )}
          </View>
        </TouchableOpacity>
        
        <Text className="text-2xl font-bold text-foreground">{user?.username}</Text>
        <Text className="text-muted-foreground">{user?.email}</Text>
      </View>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="gap-4">
          <View className="flex-row justify-between border-b border-border pb-2">
            <Text className="text-muted-foreground">User ID</Text>
            <Text className="text-foreground font-medium">{user?._id?.substring(0, 8)}...</Text>
          </View>
          <View className="flex-row justify-between border-b border-border pb-2">
            <Text className="text-muted-foreground">Role</Text>
            <Text className="text-foreground font-medium">{user?.role}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Verified</Text>
            <Text className={user?.isEmailVerified ? "text-green-500" : "text-errorC"}>
                {user?.isEmailVerified ? "Yes" : "No"}
            </Text>
          </View>
        </CardContent>
      </Card>

      <Button variant="destructive" className="w-full" onPress={handleLogout}>
        <Text>Logout</Text>
      </Button>
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
