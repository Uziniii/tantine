import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, View } from "react-native";
import { useAppDispatch, useAppSelector } from "../store/store";
import { TitleText } from "../Components/FText";
import { Group } from "./css/lookup.css";
import { FontAwesome } from "@expo/vector-icons"
import SettingsButton from "../Components/SettingsButton";
import { langData } from "../data/lang/lang";
import { NavigationProp } from "@react-navigation/native";
import styled from 'styled-components/native';
import { getPicture } from "../Components/GetUserPictureProfil";
import UploadPictureProfil from "../Components/UploadPictureProfil";
import { useEffect, useState } from "react";
import ky from "ky";
import { host, port } from "../utils/host";
import { GrayGradientFull } from "./css/gradient.css";
import { TabContentContainer } from "./ChannelList";

interface Props {
  navigation: NavigationProp<any>
}

const ContainerTitle = styled.View`
  padding: 10px 0 20px 15px;
`;

const Container = styled.View`
  height: 100%;
  background-color: #333541;
  border-top-right-radius: 50px;
  border-top-left-radius: 50px;
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  bottom: 0;
  padding: 20px 10px 0 10px;
`

const ContainerPictureProfil = styled.View`
  width: 200px;
  height: 200px;
  border-radius: 99999px;
`

export default function Settings({ navigation }: Props) {
  const dispatch = useAppDispatch()
  const me = useAppSelector(state => state.me)
  const lang = useAppSelector(state => langData[state.language].settings)

  const [image, setImage] = useState<string | undefined>()

  useEffect(() => {
    if (!me?.id || !me?.token) return

    getPicture("user", me.id, me.token, setImage)
  }, [])

  if (!me) return null

  const onImageChange = async (uri: string) => {
    const extension = uri.split(".").pop()

    const formData = new FormData()
    formData.append('audio', {
      uri,
      type: `image/${extension}`,
      name: `image.${extension}`,
    } as any);

    await ky.post(`http://${host}:${port}/profilePicture/`, {
      headers: {
        Authorization: `Bearer ${me.token}`,
      },
      body: formData,
      keepalive: true,
      cache: 'no-cache',
    })

    setImage(uri)
  }

  return <GrayGradientFull colors={[""]}>
    <TabContentContainer>
      <ContainerPictureProfil>
        <UploadPictureProfil setImage={onImageChange} image={image} />
      </ContainerPictureProfil>
      <Group>
        <TitleText $size="24px" $color="white">{me.surname} {me.name}</TitleText>
        <TitleText $size="16px" $color="white">{me.email}</TitleText>
      </Group>
      <Button color={"red"} title="Déconnexion" onPress={() => {
        dispatch({ type: "RESET" })
        AsyncStorage.removeItem("token")
      }} />
      <SettingsButton text={lang.language} onPress={() => navigation.navigate("chooseLanguage")} />
    </TabContentContainer>
  </GrayGradientFull>
}
