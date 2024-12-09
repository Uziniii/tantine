import { NavigationProp } from "@react-navigation/native";
import { useState } from "react";
import { Dimensions, View } from "react-native";
import styled from "styled-components/native";
import { TitleText } from "../Components/FText";
import { trpc } from "../utils/trpc";
import GroupItem from "../Components/GroupItem";
import ChannelItem from "../Components/ChannelItem";
import { useAppSelector } from "../store/store";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";

const width = Dimensions.get('window').width;

interface Props {
  navigation: NavigationProp<any>
}

const TabWrapper = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 50px;
`

const TabContainer = styled.View`
  width: 90%;
  height: 100%;
  background-color: #333541;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  border-radius: 9999px;
`

const Tab = styled.Pressable<{ $selected: boolean }>`
  width: ${(width / 2 - width * 0.05) - 8}px;
  height: 80%;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.$selected ? "#6969e7" : "transparent"};
`

export default function GroupRecommandation({ navigation }: Props) {
  const [tab, setTab] = useState(false);

  const me = useAppSelector(state => state.me)

  const onTabPress = () => {
    setTab(val => !val)
  }

  const groups = trpc.channel.group.findNearestGroup.useQuery(undefined)
  // console.log(groups);

  return <View>
    <TabWrapper>
      <TabContainer>
        <Tab onPress={onTabPress} $selected={tab === false}>
          <TitleText $color="white">
            Recommandations
          </TitleText>
        </Tab>
        <Tab onPress={onTabPress} $selected={tab}>
          <TitleText $color="white">
            Tendances
          </TitleText>
        </Tab>
      </TabContainer>
    </TabWrapper>
    <FlatList
      data={groups.data}
      renderItem={({ item }) => {
        console.log(item.users);

        if (item?.id === undefined) return null;

        return (
          <TouchableOpacity>
            <ChannelItem item={{ ...item, type: "group", users: [...Array(parseInt(item.users))] }} me={me} />
          </TouchableOpacity>
        );
      }}
      keyExtractor={(item) => item.id.toString()}
    />
  </View>
}
