import { Platform } from 'react-native';
import { FText } from '../../Components/FText';
import { NavigationProp } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { langData } from '../../data/lang/lang';
import TitleSubAuth from '../../Components/TitleSubAuth';
import styled from "styled-components/native";
import { Image } from 'expo-image';
import { useAssets } from 'expo-asset';
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';

interface Props {
  navigation: NavigationProp<any>;
}

const Button = styled(TouchableOpacity)`
  width:350px;
  align-self: center;
  border-radius:8px;
  height:45px;
  margin:10px;
  display:flex;
  align-items: center;
  justify-content: center;
  background-color:#333541;
`

const ContainerButton = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  margin:0 0 70px 0;
  margin:${Platform.OS === 'android' ? '0 0 20px 0' : '0 0 70px 0' };
`;

export default function Welcome({ navigation }: Props) {
  const lang = useAppSelector(state => {
    return {
      register: langData[state.language].auth.register,
      login: langData[state.language].auth.login,
      ...langData[state.language].welcome,
    }
  })
  const [assets, error] = useAssets([require('./avatar.png')]);

  return <>
    <TitleSubAuth title={lang.title} sub={lang.sub} />
    {assets ? 
      <Image
        style={{
          alignSelf: 'center',
          height: 450,
          width: 450,
          marginTop:20,
          // backgroundColor: '#0553',
        }}
        source={assets[0] as any}
      />
    : null}

    <ContainerButton>
      <Button onPress={() => navigation.navigate("login")}>
        <FText $color='white' font={[Montserrat_700Bold, "Montserrat_700Bold"]}>{lang.login}</FText>
      </Button>

      <Button onPress={() => navigation.navigate("register")}>
        <FText $color='white' font={[Montserrat_700Bold, "Montserrat_700Bold"]}>{lang.register}</FText>
      </Button>
    </ContainerButton>
    </>
}
