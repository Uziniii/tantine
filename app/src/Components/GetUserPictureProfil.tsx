import { useState } from 'react';
import { useEffect } from 'react';
import { Image, View } from 'react-native';
import { host, port } from '../utils/host';
import * as FileSystem from 'expo-file-system';
import { useAppSelector } from '../store/store';
import styled from 'styled-components/native';
import { FontAwesome } from '@expo/vector-icons';

interface Props {
  id: number;
  type: string;
  size?: number;
}

const DefaultProfilePictureContainer = styled.View`
  width: 100%;
  height: 100%;
  border-radius: 999999px;
  display: flex;
  justify-content: center;
  align-items: center; 
  border-width: 2px;
  border-color: #D4B216;
`

export const getPicture = async (type: "user" | "channel", id: number, token: string, setImage: React.Dispatch<React.SetStateAction<string | undefined>>) => {
  const audioFileUrl = `http://${host}:${port}/profilePicture/${type}/${id}`;

  FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}${type}/profilePicture/`, { intermediates: true });
  const fileUri = `${FileSystem.documentDirectory}${type}/profilePicture/${id}.jpg`;

  const { uri, status } = await FileSystem.downloadAsync(audioFileUrl, fileUri, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: true,
  });

  if (status === 404) {
    return setImage(undefined);
  }

  setImage(uri);
}

export default function GetUserPictureProfil({ id, type, size }: Props) {
  const [image, setImage] = useState<string | undefined>(undefined);
  const token = useAppSelector((state) => state.me?.token);

  useEffect(() => {
    if (!token) return console.log('No token');

    type == "user" ? getPicture("user", id, token, setImage) : getPicture("channel", id, token, setImage);
  }, [])

  if (image) {
    return <Image
      source={{ uri: image }}
      style={{ 
        flex: 1,
        aspectRatio: 1, 
        resizeMode: 'cover',
        width: '100%', 
        height: '100%',
        borderRadius: 999999, 
        borderWidth: 2,
        borderColor: "#D4B216",
      }}
    />
  }

  return <DefaultProfilePictureContainer>
    <FontAwesome
      color={"white"}
      name={type === "user" ? "user" : "group"}
      size={size || 24}
    />
  </DefaultProfilePictureContainer>
}
