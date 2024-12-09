import { SText, TitleText } from './FText';
import { Platform, StyleProp, View, ViewBase, ViewStyle } from 'react-native';
import styled from "styled-components/native";
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import colorCss from '../Page/css/color.css';

interface TitleSubAuthProps {
  title: string;
  sub: string;
  step?: string;
  style?: StyleProp<ViewStyle>;
  onGoBack?: () => void;
}

const Container = styled.View`
  margin: ${Platform.OS === 'android' ? '30px 0 0 0' : '50px 0 0 0'};
  padding: 0 30px 70px 0;
  display: flex;
  gap: 10px;
  top: 0;
`

const TitleSubAuth: React.FC<TitleSubAuthProps> = ({ title, sub, step, style, onGoBack }) => {
  const navigation = useNavigation()

  const onGoBackPress = () => {
    console.log("ezaeaz");

    if (onGoBack) {
      return onGoBack()
    }

    navigation.goBack()
  }

  return <Container style={style}>
    <View style={{ flexDirection: "row", gap: 8 }}>
      <FontAwesome onPress={onGoBackPress} size={20} color={"#8E8E8F"} name='arrow-left' />
      <SText $color={colorCss.gold}>{step}</SText>
    </View>
    <TitleText $size={Platform.OS === 'android' ? '21px' : '23px'} $color="white">{title}</TitleText>
    <SText $size={Platform.OS === 'android' ? '15px' : '16px'} $color="white">{sub}</SText>
  </Container>
}

export default TitleSubAuth;
