import { NavigationProp } from "@react-navigation/native";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Keyboard, Platform, TouchableWithoutFeedback, View } from "react-native";
import debounce from "lodash.debounce";
import { trpc } from "../utils/trpc";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { FText } from "../Components/FText";
import styled from "styled-components/native"
import { FontAwesome } from '@expo/vector-icons'; 
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";

interface Props {
  navigation: NavigationProp<any>
}

const UserContainer = styled(TouchableOpacity)`
  display: flex;
  flex-direction: row;
  padding: 10px;
  border-bottom-width: 1px;
  border-bottom-color: #ccc;
`

const InfoContainer = styled.View`
  display: flex;
  flex-direction: column;
`

const ProfilePictureContainer = styled.View`
  margin-right: 10px;
  width: 50px;
  height: 50px;
  border-radius: 50px;
  background-color: #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Group = styled.View`
  flex-direction: row;
  align-items: center;
`

export default function Search({ navigation }: Props) {
  const [showTitle, setShowTitle] = useState(true)
  const [search, setSearch] = useState("")

  const users = trpc.user.search.useQuery(search, {
    enabled: search.length > 1,
    staleTime: 0,
  })

  const createChannel = trpc.channel.create.useMutation({

  })

  const debouncedResults = useMemo(() => {
    return debounce(setSearch, 300);
  }, []);
  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "Rechercher",
        headerTransparent: true,
        onChangeText: ({ nativeEvent: { text } }: { nativeEvent: { text: string } }) => {
          debouncedResults(text)
        },
        onOpen: () => setShowTitle(false),
        onClose: () => setShowTitle(true),
        onSearchButtonPress: () => Keyboard.dismiss(),
      },
      headerTitle: () => {
        if (!showTitle) return <></>

        return <FText
          font={[Montserrat_700Bold, "Montserrat_700Bold"]}
          $size='24px'
        >
          Rechercher
        </FText>
      },
    });
  }, [navigation, showTitle]);
  
  const startChat = (id: number) => {
    createChannel.mutate(id)
  }

  return <TouchableWithoutFeedback onPress={Keyboard.dismiss}> 
    <SafeAreaView style={{ paddingTop: 8, flex: 1 }}>
      <FlatList
        style={{ bottom: Platform.OS === "android" ? 48 : 0 }}
        data={users.data}
        renderItem={({ item }) => {
          return <UserContainer onPress={() => startChat(item.id)}>
            <ProfilePictureContainer>
              <FontAwesome name="user" size={24}/>
            </ProfilePictureContainer>
            <InfoContainer>
              <Group>
                <FText>{item.surname} </FText>
                <FText>{item.name}</FText>
              </Group>
              <FText>{item.email}</FText>
            </InfoContainer>
          </UserContainer>
        }}
        keyExtractor={item => item.id.toString()}
      />
    </SafeAreaView>
  </TouchableWithoutFeedback>
}
