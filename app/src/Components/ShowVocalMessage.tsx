import React, { useState, useEffect, useRef } from 'react';
import { Audio, AVPlaybackStatus, InterruptionModeAndroid } from 'expo-av';
import styled from 'styled-components/native';
import { TouchableOpacity, Animated } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { host, port } from '../utils/host';
import { useAppSelector } from '../store/store';
import { Entypo } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';

const Container = styled.View`
  width: 80%;
  padding: 0 20px 0 20px;
  gap: 20px;
  align-items: center;
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
`;

const ButtonPlay = styled(TouchableOpacity)`
  border-radius: 8px;
`;

const ProgressBarContainer = styled.View`
  width: 80%;
  height: 10px;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  margin: 0 0 7px 0;
  gap: 2px;
`;

const ProgressBarUnit = styled.View`
  height: ${({ height }: { height: number }) => `${height}px`};
  width: 5px;
  border-radius: 8px;
`;

interface ShowRecordVoiceMessageProps {
  channelId: string;
  audioFile: string;
}

export default function ShowVocalMessage({ channelId, audioFile }: ShowRecordVoiceMessageProps) {
  const [voiceMessage, setVoiceMessage] = useState<Audio.Sound | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<AVPlaybackStatus | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playedUnits, setPlayedUnits] = useState<number>(0);
  const token = useAppSelector((state) => state.me?.token);

  const progressBarWidth = useRef(new Animated.Value(0)).current;

  const loadSound = async () => {
    const soundObject = new Audio.Sound();
    const audioFileUrl = `http://${host}:${port}/audioMessage/${channelId}/${audioFile}`;

    if (!token) return console.log('No token');

    try {
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}${channelId}`, { intermediates: true });
      const fileUri = `${FileSystem.documentDirectory}${channelId}/${audioFile}`;

      const { uri } = await FileSystem.downloadAsync(audioFileUrl, fileUri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: true,
      });

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: false,
      });

      await soundObject.loadAsync({
        uri,
        mimeType: 'audio/x-m4a',
      });

      soundObject.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPlaybackStatus(status);
        }
      });

      await soundObject.playAsync();
      setVoiceMessage(soundObject);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handlePlay = async () => {
    if (!voiceMessage) {
      await loadSound();
      setIsPlaying(true);
    }
    if (!isPlaying) {
      setIsPlaying(true);
      await voiceMessage.playAsync();
    } else {
      setIsPlaying(false);
      await voiceMessage.pauseAsync();
    }
  };

  const renderProgressBarUnits = () => {
    const units: JSX.Element[] = [];
    for (let i = 0; i < 20; i++) {
      const height = Math.floor(Math.random() * 15) + 5;
      units.push(
        <ProgressBarUnit
          key={i}
          height={height}
          style={{
            backgroundColor: i < playedUnits ? '#3498db' : '#000',
            opacity: i < playedUnits ? 1 : 0.3,
          }}
        />
      );
    }
    return units;
  };

  useEffect(() => {
    if (playbackStatus && playbackStatus.positionMillis !== undefined && playbackStatus.durationMillis !== undefined) {
      const progress = (playbackStatus.positionMillis / playbackStatus.durationMillis) * 100;
      const units = Math.floor((progress / 100) * 20);
      Animated.timing(progressBarWidth, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start();
      setPlayedUnits(units);
    }
  }, [playbackStatus]);

  return (
    <Container>
      <ButtonPlay onPress={handlePlay}>
        {isPlaying ? (
          <AntDesign name="pause" size={30} color="black" />
        ) : (
          <Entypo name="controller-play" size={30} color="black" />
        )}
      </ButtonPlay>
      <ProgressBarContainer>{renderProgressBarUnits()}</ProgressBarContainer>
    </Container>
  );
}
