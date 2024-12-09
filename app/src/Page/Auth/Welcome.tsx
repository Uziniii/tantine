import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { MTitleText, SText, TitleText } from '../../Components/FText';
import { NavigationProp } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { langData } from '../../data/lang/lang';
import TitleSubAuth from '../../Components/TitleSubAuth';
import styled from "styled-components/native";
import { Image } from 'expo-image';
import { BigGoldGradient } from '../css/gradient.css';
import color from "../css/color.css"
import { AntDesign } from '@expo/vector-icons';
import { TitleWrapper } from '../css/auth.css';

const avatar = require("../../../assets/ethman.png");

interface Props {
  navigation: NavigationProp<any>;
}

const Button = styled(TouchableOpacity)`
  flex-direction: row;
  width: 350px;
  align-self: center;
  border-radius: 8px;
  height: 55px;
  margin: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${color.primaryBg};
  border: 2px solid ${color.gold};
`

const ContainerButton = styled.View`
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  margin: ${Platform.OS === 'android' ? '0 0 20px 0' : '0 0 70px 0'};
`;

const RightView = styled.View`
  position: absolute;
  right: 16px;
`

export default function Welcome({ navigation }: Props) {
  const lang = useAppSelector(state => {
    return {
      register: langData[state.language].auth.register,
      login: langData[state.language].auth.login,
      ...langData[state.language].welcome,
    }
  })

  return <BigGoldGradient colors={[]} style={{ flex: 1, justifyContent: "flex-start" }}>
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "position"}
      style={{ justifyContent: "space-between", height: "100%" }}
    >
      <View>
        <TitleSubAuth title={lang.title} sub={lang.sub} />
        <Image
          style={{
            alignSelf: 'center',
            height: 350,
            width: 350,
            marginTop: 20,
          }}
          source={avatar}
        />
      </View>
      <ContainerButton>
        <Button onPress={() => navigation.navigate("login")}>
          <MTitleText $color='white'>{lang.login}</MTitleText>
          <RightView>
            <AntDesign size={24} color="white" name='arrowright' />
          </RightView>
        </Button>

        <Button onPress={() => navigation.navigate("register")}>
          <MTitleText $color='white'>{lang.register}</MTitleText>
          <RightView>
            <AntDesign size={24} color="white" name='arrowright' />
          </RightView>
        </Button>
      </ContainerButton>
    </KeyboardAvoidingView>
  </BigGoldGradient>
}
