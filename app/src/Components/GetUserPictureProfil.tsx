import { useState } from 'react';
import { useEffect } from 'react';
import { Image } from 'react-native';
import { host } from '../utils/host';
import * as FileSystem from 'expo-file-system';
import { useAppSelector } from '../store/store';

interface Props {
  id: number;
  type: string;
}

export default function GetUserPictureProfil({ id, type }: Props) {
  const [image, setImage] = useState<string | undefined>(undefined);
  const token = useAppSelector((state) => state.me?.token);

  useEffect(() => {
    if (!token) return console.log('No token');

    const getPicture = async (type: "user" | "channel") => {        
      const audioFileUrl = `http://${host}:3000/profilePicture/${type}/${id}`;
      
      FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}${type}/profilePicture/`, { intermediates: true });
      const fileUri = `${FileSystem.documentDirectory}${type}/profilePicture/${id}.jpg`;
      
      const { uri } = await FileSystem.downloadAsync(audioFileUrl, fileUri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: true
      });

      console.log(uri);
      setImage(uri);

    }

    type == "user" ? getPicture("user") : getPicture("channel");
  }, [])

  return <>
    {image && <Image source={{ uri: image }} style={{ width: "100%", height: "100%", borderRadius:999999 }} />}
  </>
}
