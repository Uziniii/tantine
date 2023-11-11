import { NavigationProp } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { FText } from "../Components/FText";
import { useAppSelector } from "../store/store";
import { Button } from "./css/auth.css";
import { isKeyboard } from "../hooks/isKeyboard";
import { Container, ButtonGroup } from "./css/search.css";
import { langData } from "../data/lang/lang";
import UserSearch from "../Components/Search/UserSearch";
import GroupSearch from "../Components/Search/GroupSearch";
import { SearchInput } from "./CreateGroup";

interface Props {
  navigation: NavigationProp<any>
}

export default function Search({ navigation }: Props) {
  const lang = useAppSelector(state => langData[state.language].search)

  const [search, setSearch] = useState(["", ""])
  const isSearchEmpty = useMemo(() => search.length === 0, [search])

  const debouncedResults = useMemo(() => {
    return debounce(setSearch, 300);
  }, []);

  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  });

  const [filter, setFilter] = useState<"user" | "group">("user")

  const onTextChange = (text: string) => {
    if (filter === "user") setSearch(val => [text, val[1]])
    else setSearch(val => [val[0], text])
  }

  return <Container>
    <SearchInput placeholderTextColor={"white"} onChangeText={onTextChange} value={filter === "user" ? search[0] : search[1]} placeholder={`${lang.search}...`} />
    <ButtonGroup>
      <Button onPress={() => setFilter("user")} $background={filter === "user" ? "red" : "black"}>
        <FText $color="white">Utilisateurs</FText>
      </Button>
      <Button onPress={() => setFilter("group")} $background={filter === "group" ? "red" : "black"}>
        <FText $color="white">Groupe</FText>
      </Button>
    </ButtonGroup>

    {filter === "user" ? <UserSearch isSearchEmpty={isSearchEmpty} search={search[0]}/> : <GroupSearch isSearchEmpty={isSearchEmpty} search={search[1]} />}
  </Container>
}
