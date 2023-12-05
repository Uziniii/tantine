import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components/native';
import { FText } from './FText';
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler'; 


const ShowGroupInfo = styled.View`
    width: 220px;
    padding: 8px;
    margin:90px 60px 0 0;
    z-index: 1;
    position: absolute;
    right: 0;
    background-color: #333541;
    border-top-left-radius:12px;
    border-bottom-left-radius:12px;
    border-bottom-right-radius:12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const Button = styled.TouchableOpacity`
    width: 100%;
    height: 40px;
    border-top-left-radius:12px;
    border-bottom-left-radius:12px;
    border-bottom-right-radius:12px;
    background-color: #333541;
    padding: 7px 5px 7px 10px;
`;

type GroupInfoProps = {
    type: string; 
}

const GroupInfo: React.FC<GroupInfoProps> = ({ type }) => {


    if(type == 'user'){
        console.log('user');
    }

    return (
        type === 'admin' ? (
            <ShowGroupInfo>
                <Button><FText $color='white'>Suprimmer le groupe</FText></Button>
                <Button><FText $color='white'>Inviter</FText></Button>                    
            </ShowGroupInfo>
        ) :
        <ShowGroupInfo>
            <Button><FText $color='white'>Quitter le groupe</FText></Button>          
        </ShowGroupInfo>
    );
}

export default GroupInfo;
