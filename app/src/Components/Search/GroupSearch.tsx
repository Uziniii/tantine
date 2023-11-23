import { useNavigation } from "@react-navigation/native";
import { trpc } from "../../utils/trpc";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
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
  const joinGroup = trpc.channel.group.join.useMutation()

  const onGroupPress = async (id: number) => {
    await joinGroup.mutateAsync(id)

    navigation.navigate("channel", {
      id: id.toString()
    })
  }

  return <>
    <FlatList
      style={{
        
        backgroundColor: '#24252D'
      }}
      contentInsetAdjustmentBehavior="automatic"
      data={isSearchEmpty && Platform.OS === "android" ? [] : searchedGroups.data}
      renderItem={({ item }) => <TouchableOpacity onPress={() => onGroupPress(item.id)}>
        <GroupItem item={item} />
      </TouchableOpacity>}
      keyExtractor={item => item.id.toString()}
    />
  </>;
}
