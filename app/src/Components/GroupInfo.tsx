import React, { useState } from 'react';
import styled from 'styled-components/native';
import { FText } from './FText';
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ShowGroupInfo from './ShowGroupInfo';

const ContainerShowGroupInfo = styled.View`
    margin: 50px 30px 0 0;
    position: absolute;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
`;

type GroupInfoProps = {
    type: string;
};

const GroupInfo: React.FC<GroupInfoProps> = ({ type }) => {


    const [showGroupInfo, setShowGroupInfo] = useState<boolean>(false);


    return (
        <>
        <ContainerShowGroupInfo>
            <TouchableOpacity onPress={() => setShowGroupInfo(!showGroupInfo)}>
                <Feather name="more-horizontal" size={27} color="white" />            
            </TouchableOpacity>
        </ContainerShowGroupInfo>
        {showGroupInfo && <ShowGroupInfo type={type} />}
        </>
    );
};

export default GroupInfo;
