import { NavigationProp } from "@react-navigation/native"
import styled from "styled-components/native"

interface Props {
  navigation: NavigationProp<any>
}

const Wrapper = styled.View`
  height: 100%;
  background-color: white;
`

const TextInput = styled.TextInput`
  width:95%;
  height:6%;
  padding:0 0 0 20px;
  margin: 20px 0 0 0;
  border-radius:9999px;
  background-color: red;
  align-self: center;
`


export default function CreateGroup ({ navigation }: Props) {
  
  
  return <Wrapper>
    <TextInput placeholder="Rechercher..." />
  </Wrapper>
}
