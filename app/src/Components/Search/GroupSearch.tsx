import { useNavigation } from "@react-navigation/native";
import { trpc } from "../../utils/trpc";
import { FlatList } from "react-native-gesture-handler";
import { Platform } from "react-native";
import GroupItem from "../GroupItem";

interface Props {
  search: string;
  isSearchEmpty: boolean;
}

export default function GroupSearch({ search, isSearchEmpty }: Props) {
  const navigation = useNavigation<any>()
  const searchedGroups = trpc.channel.group.search.useQuery({
    query: search
  }, {
    enabled: search.length > 1
  })

  const onGroupPress = (id: number) => {
    
  }

  return <>
    <FlatList
      style={{
        borderTopWidth: 1,
        borderTopColor: "#ccc",
        backgroundColor: 'white'
      }}
      contentInsetAdjustmentBehavior="automatic"
      data={isSearchEmpty && Platform.OS === "android" ? [] : searchedGroups.data}
      renderItem={({ item }) => <GroupItem item={item} />}
      keyExtractor={item => item.id.toString()}
    />
  </>;
}
