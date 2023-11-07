import { FontAwesome } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import styled from "styled-components/native";

const CreateGroupContainer = styled(TouchableOpacity)`
  width:70px;
  height:70px;
  background-color:#202E44;
  border-radius: 99999px;
  position:fixed;
  margin: 0 10px 40px 0;
  align-self: flex-end;
  display: flex;
  align-items: center;
  justify-content: center;
  color:white;
`

export default function CreateGroup(){
    return(
        <CreateGroupContainer>
            <FontAwesome name="plus" size={35} color="white" />
        </CreateGroupContainer>
    );
}
