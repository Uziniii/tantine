import { FontAwesome } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import styled from "styled-components/native";

const CreateGroupContainer = styled(TouchableOpacity)`
  width:55px;
  height:55px;
  background-color:white;
  border-radius: 99999px;
  position:fixed;
  margin: 0 10px 70px 0;
  align-self: flex-end;
  display: flex;
  align-items: center;
  justify-content: center;
  color:white;
`

export default function CreateGroup(){
    return(
        <CreateGroupContainer>
            <FontAwesome name="plus" size={30} color="#1B202D" />
        </CreateGroupContainer>
    );
}
