import { TouchableOpacity } from "react-native-gesture-handler";
import styled from "styled-components/native"
import { AntDesign } from '@expo/vector-icons';
import colorCss from "./color.css";

export const BottomContainer = styled.View`
  position: absolute;
  bottom: 0;
  padding-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Button = styled(TouchableOpacity) <{
  $width?: string;
  $background?: string;
}>`
  width: ${({ $width }) => $width || "100%"};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $background }) => $background || "#2A2F3E"};
  border-radius: 8px;
  padding: 12px 0;
`;

export const InputGroup = styled.View`
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
`;

export const Container = styled.View`
  width: 100%;
  height: 70%;
  margin-top: 40px;
  border-top-right-radius: 20px;
  border-top-left-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Form = styled.View`
  gap: 16px;
  width: 90%;
  display: flex;
  justify-content: flex-start;
`;

const CheckContainer = styled.View`
  width: 35px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${colorCss.gold};
  border-radius: 8px;
`

export const Check = () => {
  return <CheckContainer>
    <AntDesign name="check" size={20} color="black" />
  </CheckContainer>
}

type InputEyeProps = {
  onPress: () => void;
}

export const InputEye = ({ onPress }: InputEyeProps) => <AntDesign onPress={onPress} name="eyeo" size={34} color={colorCss.gold} />;

export const TitleWrapper = styled.View`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const NextButton = styled.TouchableOpacity<{ $width?: string }>`
  width: ${({ $width }) => $width || "100%"};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  background: ${colorCss.gold};
  border-radius: 8px;
  margin-top: 8px;
  padding: 12px;
`;

