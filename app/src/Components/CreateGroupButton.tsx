import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native-gesture-handler";
import styled from "styled-components/native";

const CreateGroupContainer = styled(TouchableOpacity)`
  width:70px;
  height:70px;
  background-color:#202E44;
  border-radius: 30px;
  position:fixed;
  margin: 0 10px 40px 0;
  align-self: flex-end;
  display: flex;
  align-items: center;
  justify-content: center;
  color:white;
`

export default function CreateGroupButton() {
  const navigation = useNavigation<any>();

  const onPress = () => {
    navigation.navigate("createGroup");
  }

  return (
    <CreateGroupContainer onPress={onPress}>
      <FontAwesome name="plus" size={35} color="white" />
    </CreateGroupContainer>
  );
}
