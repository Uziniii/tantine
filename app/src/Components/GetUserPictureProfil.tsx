import { useState } from 'react';
import { useEffect } from 'react';
import { Image } from 'react-native';
import { host } from '../utils/host';
import * as FileSystem from 'expo-file-system';
import { useAppSelector } from '../store/store';
import styled from 'styled-components/native';
import { FontAwesome } from '@expo/vector-icons';

interface Props {
  id: number;
  type: string;
}

const DefaultProfilePictureContainer = styled.View`
  width: 100%;
  height: 100%;
  border-radius: 999999px;
  display: flex;
  justify-content: center;
  align-items: center;
`

export default function GetUserPictureProfil({ id, type }: Props) {
  const [image, setImage] = useState<string | undefined>(undefined);
  const token = useAppSelector((state) => state.me?.token);

  useEffect(() => {
    if (!token) return console.log('No token');

    const getPicture = async (type: "user" | "channel") => {        
      const audioFileUrl = `http://${host}:3000/profilePicture/${type}/${id}`;
      
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

    type == "user" ? getPicture("user") : getPicture("channel");
  }, [])

  if (image) {
    return (
      <Image
        source={{ uri: image }}
        style={{ flex: 1, aspectRatio: 1, resizeMode: 'cover', width: '100%', height: '100%', borderRadius:999999 }}
      />
    )
  }

  return <DefaultProfilePictureContainer>
    <FontAwesome
      name={type === "user" ? "user" : "group"}
      size={24}
    />
  </DefaultProfilePictureContainer>
}
