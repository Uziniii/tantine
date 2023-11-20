import { FText } from './FText';
import styled from "styled-components/native";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";

interface TitleSubAuthProps {
    title: string;
    sub: string;
}


const Container = styled.View`
  margin:70px 0 0 0;
  padding: 0 10px 0 20px;
  display:flex;
  gap:10px;
  top: 0;
`

const TitleSubAuth: React.FC<TitleSubAuthProps> = ({ title, sub }) => {
    return(
        <Container>
            <FText $size="23px" $color="white" font={[Montserrat_700Bold, "Montserrat_700Bold"]}>{title}</FText>
            <FText $size="18px" $color="white">{sub}</FText>
        </Container>
    );
}

export default TitleSubAuth;
