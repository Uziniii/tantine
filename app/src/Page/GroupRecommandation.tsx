import { NavigationProp } from "@react-navigation/native";
import { useState } from "react";
import { Dimensions, View } from "react-native";
import styled from "styled-components/native";
import { MTitleText, TitleText } from "../Components/FText";
import { trpc } from "../utils/trpc";
import GroupItem from "../Components/GroupItem";
import ChannelItem from "../Components/ChannelItem";
import { useAppSelector } from "../store/store";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { TabContentContainer } from "./ChannelList";
import { GrayGradientFull } from "./css/gradient.css";
import colorCss from "./css/color.css";
import { langData } from "../data/lang/lang";

const width = Dimensions.get('window').width;

interface Props {
  navigation: NavigationProp<any>
}

const TabWrapper = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100px;
`

const ContainerTitle = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  gap: 20px;
  align-items: center;
  padding: 20px 0px 20px 0px;
  border-color: ${colorCss.lightGray};
  border-bottom-width: 1px;
`;

const TabContainer = styled.View`
  width: 90%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
`

const Tab = styled.Pressable<{ $selected: boolean }>`
  width: ${(width / 2 - width * 0.08) - 8}px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.$selected ? colorCss.gold : "#25252D"};
  border: ${(props) => props.$selected ? "" : `1px ${colorCss.gold}`};
`

export default function GroupRecommandation({ navigation }: Props) {
  const [tab, setTab] = useState(false);

  const lang = useAppSelector((state) => langData[state.language].groupTab);
  const me = useAppSelector(state => state.me)

  const onTabPress = () => {
    setTab(val => !val)
  }

  const groups = trpc.channel.group.findNearestGroup.useQuery(undefined)

  return <GrayGradientFull colors={[""]}>
    <TabContentContainer>
      <ContainerTitle>
        <TabContainer>
          <Tab onPress={onTabPress} $selected={tab === false}>
            <MTitleText $color="white" $size="14">
              {lang.recommandations}
            </MTitleText>
          </Tab>
          <Tab onPress={onTabPress} $selected={tab}>
            <MTitleText $color="white" $size="14">
              {lang.trend}
            </MTitleText>
          </Tab>
        </TabContainer>
      </ContainerTitle>
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
    </TabContentContainer>
  </GrayGradientFull >
}
