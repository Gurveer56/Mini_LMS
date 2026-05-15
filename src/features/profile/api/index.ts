import { api } from '@lib/api/axios';
import { Platform } from 'react-native';

export const updateAvatar = async (localUri: string) => {
  const formData = new FormData();
  
  const filename = localUri.split('/').pop() || 'avatar.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;

  formData.append('avatar', {
    uri: Platform.OS === 'android' ? localUri : localUri.replace('file://', ''),
    name: filename,
    type,
  } as unknown as Blob);

  const response = await api.patch('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};
