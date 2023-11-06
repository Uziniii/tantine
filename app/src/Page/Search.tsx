import { NavigationProp } from "@react-navigation/native";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Keyboard, Platform } from "react-native";
import debounce from "lodash.debounce";
import { trpc } from "../utils/trpc";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { FText } from "../Components/FText";
import { FontAwesome } from '@expo/vector-icons';
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { useAppDispatch, useAppSelector } from "../store/store";
import { addUsers } from "../store/slices/usersSlice";
import { addChannel } from "../store/slices/channelsSlice";
import { Group, InfoContainer, ProfilePictureContainer, UserContainer } from "./css/user.css";
import { initMessages } from "../store/slices/messagesSlice";
import { Button } from "./css/auth.css";
import { isKeyboard } from "../hooks/isKeyboard";
import { AndroidSearchBar, AndroidSearchBarContainer, Radio, VerticalGroup, Container, ButtonGroup, GroupedButton } from "./css/search.css";
import { addPosition } from "../store/slices/notificationSlice";
import { langData } from "../data/lang/lang";

interface Props {
  navigation: NavigationProp<any>
}

export default function Search({ navigation }: Props) {
  const lang = useAppSelector(state => langData[state.language].search)

  const [search, setSearch] = useState("")
  const [groupMode, setGroupMode] = useState(false)
  const [showTitle, setShowTitle] = useState(true)
  const [isSearchEmpty, setIsSearchEmpty] = useState(true)
  const isKeyboardShow = isKeyboard()
  const [addedUsers, setAddedUsers] = useState<Record<number, boolean>>({})
  const [showList, setShowList] = useState(false)

  const usersSearch = trpc.user.search.useQuery(search, {
    enabled: search.length > 1,
    staleTime: 0,
  })

  const retrieveUsers = trpc.user.retrieve.useMutation()

  const dispatch = useAppDispatch()
  const usersId = useAppSelector(state => Object.keys(state.users))
  const users = useAppSelector(state => state.users)
  
  const retrieveMessages = trpc.channel.message.retrieveMessages.useMutation()

  const createChannel = trpc.channel.create.useMutation({
    async onSuccess(data) {
      let toFetch = []

      for (const id of data.users) {
        if (usersId.includes(id.toString())) continue

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

      dispatch(addPosition(data.id))

      const messages = (await retrieveMessages.mutateAsync({
        channelId: +data.id
      })).map(message => ({
        ...message,
        createdAt: message.createdAt.toString(),
        updatedAt: message.updatedAt.toString(),
      }))

      dispatch(initMessages({
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
        placeholder: lang.search,
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
                placeholder={lang.search}
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
          {lang.search}
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
  
  const userPress = (id: number) => {
    if (groupMode) {
      setAddedUsers(val => ({
        ...val,
        [id]: !val[id]
      }))
      
      if (users[id]) return

      const user = usersSearch.data?.find(user => user.id === id)

      if (!user) return

      return dispatch(addUsers([user]))
    }

    createChannel.mutate(id)
  }

  const onGroupValidate = () => {
    createChannel.mutate(Object.keys(addedUsers).filter(id => addedUsers[+id]).map(id => +id))
  }

  return <Container $pad={!isKeyboardShow && !search ? "110px" : "53px"}>
    {groupMode ? <ButtonGroup>
      <GroupedButton $size={25} onPress={() => setGroupMode(false)}>
        <FText $color="white">{lang.cancel}</FText>
      </GroupedButton>
      <GroupedButton $size={50} onPress={() => setShowList(val => !val)}>
        {showList 
          ? <FText $color="white">{lang.hideList}</FText>
          : <FText $color="white">{lang.showList}</FText>
        }
      </GroupedButton>
      <GroupedButton $size={25} onPress={onGroupValidate}>
        <FText $color="white">{lang.confirm}</FText>
      </GroupedButton>
    </ButtonGroup> : <Button onPress={() => setGroupMode(true)} containerStyle={{ padding: 16 }}>
      <FText $color="white">{lang.createGroup}</FText>
    </Button>}

    {showList ? <FlatList
        style={{
          borderTopWidth: 1,
          borderTopColor: "#ccc",
        }}
        contentInsetAdjustmentBehavior="automatic"
        data={Object.keys(addedUsers).filter(id => addedUsers[+id])}
        renderItem={({ item }) => <UserItem addedUsers={addedUsers} groupMode={groupMode} userPress={userPress} item={users[item]} />}
        keyExtractor={item => item.toString()}
      /> : <FlatList
        style={{
          borderTopWidth: 1,
          borderTopColor: "#ccc",
        }}
        contentInsetAdjustmentBehavior="automatic"
        data={isSearchEmpty && Platform.OS === "android" ? [] : usersSearch.data}
        renderItem={({ item }) => <UserItem addedUsers={addedUsers} groupMode={groupMode} userPress={userPress} item={item} />}
        keyExtractor={item => item.id.toString()}
      />
    }
  </Container>
}

interface IUser {
  id: number,
  name: string,
  surname: string,
  email: string,
}

interface UserItemProps {
  item: IUser,
  userPress: (id: number) => void,
  groupMode: boolean,
  addedUsers: Record<number, boolean>,
}

function UserItem({ item, addedUsers, groupMode, userPress }: UserItemProps) {
  return <UserContainer style={{ justifyContent: "space-between" }} onPress={() => userPress(item.id)}>
    <VerticalGroup>
      <ProfilePictureContainer>
        <FontAwesome name="user" size={24} />
      </ProfilePictureContainer>
      <InfoContainer>
        <Group>
          <FText>{item.surname} </FText>
          <FText>{item.name}</FText>
        </Group>
        <FText>{item.email}</FText>
      </InfoContainer>
    </VerticalGroup>
    {groupMode && <VerticalGroup>
      <Radio style={{
        backgroundColor: addedUsers[item.id] ? "#575bfd" : undefined,
      }}>
        {addedUsers[item.id] && <FontAwesome name="check" color="white" size={16} />}
      </Radio>
    </VerticalGroup>}
  </UserContainer>
}
