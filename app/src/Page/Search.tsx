import { NavigationProp } from "@react-navigation/native";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Keyboard, Platform, View } from "react-native";
import debounce from "lodash.debounce";
import { trpc } from "../utils/trpc";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { FText } from "../Components/FText";
import styled from "styled-components/native"
import { FontAwesome } from '@expo/vector-icons'; 
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { useAppDispatch, useAppSelector } from "../store/store";
import { addUsers } from "../store/slices/usersSlice";
import { addChannel } from "../store/slices/channelsSlice";
import { Group, InfoContainer, ProfilePictureContainer, UserContainer } from "./css/user.css";
import { init } from "../store/slices/messagesSlice";

interface Props {
  navigation: NavigationProp<any>
}

const AndroidSearchBar = styled.TextInput`
  font-size: 18px;
  max-width: 70%;
  width: 70%;
  border-bottom-color: #ccc;
  border-bottom-width: 1px;
`

const AndroidSearchBarContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: start;
  width: 100%;
`

export default function Search({ navigation }: Props) {
  const [showTitle, setShowTitle] = useState(true)
  const [search, setSearch] = useState("")
  const [isSearchEmpty, setIsSearchEmpty] = useState(true)

  const usersSearch = trpc.user.search.useQuery(search, {
    enabled: search.length > 1,
    staleTime: 0,
  })

  const retrieveUsers = trpc.user.retrieve.useMutation()

  const dispatch = useAppDispatch()
  const users = useAppSelector(state => Object.keys(state.users))
  
  const retrieveMessages = trpc.channel.retrieveMessages.useMutation()

  const createChannel = trpc.channel.create.useMutation({
    async onSuccess(data) {
      let toFetch = []

      for (const id of data.users) {
        if (users.includes(id.toString())) continue

        toFetch.push(+id)
      }

      if (toFetch.length > 0) {
        let fetchedUsers = await retrieveUsers.mutateAsync(toFetch)

        dispatch(addUsers(fetchedUsers))
      }

      if (data.type === "group") {
        dispatch(addChannel({
          id: data.id,
          type: data.type,
          users: data.users,
          title: data.title,
          description: data.description,
          authorId: data.authorId,
        }))
      } else {
        dispatch(addChannel({
          id: data.id,
          type: data.type,
          users: data.users,
        }))
      }

      const messages = (await retrieveMessages.mutateAsync({
        channelId: +data.id
      })).map(message => ({
        ...message,
        createdAt: message.createdAt.toString(),
        updatedAt: message.updatedAt.toString(),
      }))

      dispatch(init({
        channelId: data.id,
        messages: messages,
      }))

      navigation.navigate("chat", {
        id: data.id
      })
    },
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
      headerSearchBarOptions: Platform.OS === "ios" ? {
        placeholder: "Rechercher",
        onChangeText: ({ nativeEvent: { text } }: { nativeEvent: { text: string } }) => {
          debouncedResults(text)
        },
        onOpen: () => setShowTitle(false),
        onClose: () => setShowTitle(true),
        onSearchButtonPress: () => Keyboard.dismiss(),
      }: undefined,
      headerTitle: () => {
        if (!showTitle) {
          if (Platform.OS === "android") {
            return <AndroidSearchBarContainer>
              <AndroidSearchBar
                autoFocus={true}
                placeholder="Rechercher"
                onChangeText={text => {
                  debouncedResults(text)
                  setIsSearchEmpty(text === "")
                }}
                onEndEditing={() => {
                  if (isSearchEmpty) setShowTitle(true)
                }}
              />
            </AndroidSearchBarContainer>
          }

          return <></>
        }
        
        return <FText
          font={[Montserrat_700Bold, "Montserrat_700Bold"]}
          $size='24px'
        >
          Rechercher
        </FText>
      },
      headerRight: Platform.OS === "android" ? () => {
        if (!showTitle) return <></>

        return <TouchableOpacity onPress={() => setShowTitle(false)}>
          <FontAwesome name="search" size={24}/>
        </TouchableOpacity>
      } : undefined,
    });
  }, [navigation, showTitle, isSearchEmpty]);
  
  const startChat = (id: number) => {
    createChannel.mutate(id)
  }

  return <FlatList
    contentInsetAdjustmentBehavior="automatic"
    data={isSearchEmpty && Platform.OS === "android" ? [] : usersSearch.data}
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
}
