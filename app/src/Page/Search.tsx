import { NavigationProp } from "@react-navigation/native";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Keyboard, Platform } from "react-native";
import debounce from "lodash.debounce";
import { TouchableOpacity } from "react-native-gesture-handler";
import { FText } from "../Components/FText";
import { FontAwesome } from '@expo/vector-icons';
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { useAppSelector } from "../store/store";
import { Button } from "./css/auth.css";
import { isKeyboard } from "../hooks/isKeyboard";
import { AndroidSearchBar, AndroidSearchBarContainer, Container, ButtonGroup } from "./css/search.css";
import { langData } from "../data/lang/lang";
import UserSearch from "../Components/Search/UserSearch";
import GroupSearch from "../Components/Search/GroupSearch";

interface Props {
  navigation: NavigationProp<any>
}

export default function Search({ navigation }: Props) {
  const lang = useAppSelector(state => langData[state.language].search)

  const [search, setSearch] = useState("")
  const [showTitle, setShowTitle] = useState(true)
  const [isSearchEmpty, setIsSearchEmpty] = useState(true)
  const isKeyboardShow = isKeyboard()

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
  
  const [filter, setFilter] = useState<"user" | "group">("user")

  return <Container $pad={!isKeyboardShow && !search ? "110px" : "53px"}>
    <ButtonGroup>
      <Button onPress={() => setFilter("user")} $background={filter === "user" ? "red" : "black"}>
        <FText $color="white">Utilisateurs</FText>
      </Button>
      <Button onPress={() => setFilter("group")} $background={filter === "group" ? "red" : "black"}>
        <FText $color="white">Groupe</FText>
      </Button>
    </ButtonGroup>

    {filter === "user" ? <UserSearch isSearchEmpty={isSearchEmpty} search={search}/> : <GroupSearch search={search} />}
  </Container>
}
