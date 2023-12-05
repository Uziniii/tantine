import React, { useState } from 'react';
import { Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons'; 
import ky from 'ky';
import { host } from '../utils/host';

const UploadPicture = styled.TouchableOpacity`
  width: 200px;
  height: 200px;
  border-radius: 99999px;
  border: 2px solid #D4B216;
  align-self: center;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContainerUplaodPicture = styled.View`
	align-self: center;
`;

interface Props {
  image: string | undefined;
  setImage: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export default function UploadPictureProfil({ setImage,  image }: Props): JSX.Element {
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) { 
      setImage(result.assets[0].uri);
    }
	};

  return (
		<ContainerUplaodPicture>
			<MaterialIcons name="add-to-photos" size={24} color="white" />
			<UploadPicture onPress={pickImage}>
      	{image && <Image source={{ uri: image }} style={{ width: 200, height: 200, borderRadius:999999 }} />}
    	</UploadPicture>
		</ContainerUplaodPicture>
  );
}
