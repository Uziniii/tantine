import { Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import styled from 'styled-components/native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons'; 

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

const EditContainer = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 99999px;
  background-color: #D4B216;
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`

interface Props {
  image: string | undefined;
  setImage: (uri: string) => void;
}

export default function UploadPictureProfil({ setImage,  image }: Props): JSX.Element {
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      // quality: 1,
      exif: false,
    });

    if (!result.canceled) { 
      setImage(result.assets[0].uri);
    }
	};

  return (
		<ContainerUplaodPicture>
			<UploadPicture onPress={pickImage}>
        {image ? <Image 
          source={{ uri: image }} 
          style={{ 
            width: 200, 
            height: 200, 
            borderRadius: 999999,
            borderWidth: 2,
            borderColor: "#D4B216",
          }} 
        /> : <FontAwesome
          name="user"
          size={74}
          color={"white"}
        />}
      </UploadPicture>
      <EditContainer>
        <MaterialIcons name="add-to-photos" size={24} color="white" />
      </EditContainer>
		</ContainerUplaodPicture>
  );
}
