import { useState } from 'react';
import { Audio, AVPlaybackStatusSuccess, InterruptionModeAndroid } from 'expo-av';
import styled from 'styled-components/native';
import { host } from '../utils/host';
import { DimensionValue, TouchableOpacity } from 'react-native';
import { FText } from './FText';
import * as FileSystem from 'expo-file-system';
import { useAppSelector } from '../store/store';
import { Entypo } from '@expo/vector-icons'; 
import { AntDesign } from '@expo/vector-icons'; 

const Container = styled.View`
  width: 80%;
  padding: 0 20px 0 20px;
  align-items: center;
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
`;

const ButtonPlay = styled(TouchableOpacity)`
  background-color: #3498db;
  align-self: center;
  border-radius: 8px;
`;

const ProgressBarContainer = styled.View`
  width: 80%;
  height: 10px;
  display: flex;
  background-color: #ddd;
  margin-top: 20px;
`;

const ProgressBar = styled.View`
  height: 100%;
  background-color: #3498db;
`;

interface ShowRecordVoiceMessageProps {
  channelId: string;
  audioFile: string;
}

export default function ShowVocalMessage({ channelId, audioFile }: ShowRecordVoiceMessageProps) {
  const [voiceMessage, setVoiceMessage] = useState<Audio.Sound | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<AVPlaybackStatusSuccess | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const token = useAppSelector((state) => state.me?.token);

  const loadSound = async () => {
    const soundObject = new Audio.Sound();
    const audioFileUrl = `http://${host}:3000/audioMessage/${channelId}/${audioFile}`;

    if (!token) return console.log('No token');

    try {
      FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}${channelId}`, { intermediates: true });
      const fileUri = `${FileSystem.documentDirectory}${channelId}/${audioFile}`;
      
      const { uri } = await FileSystem.downloadAsync(audioFileUrl, fileUri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: true
      });

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: false,
      });
      
      await soundObject.loadAsync({
        uri,
        mimeType: 'audio/x-m4a' 
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
    if (voiceMessage && !isPlaying) {
      setIsPlaying(true);
      await voiceMessage.playFromPositionAsync(0);
      setIsPlaying(false);
      return;
    }

    await loadSound();
  };

  const getProgressBarWidth = (): DimensionValue => {
    if (playbackStatus && playbackStatus.durationMillis && playbackStatus.positionMillis) {
      const progress = (playbackStatus.positionMillis / playbackStatus.durationMillis) * 100;
      return `${progress}%`;
    }
    return '0%';
  };

  return (
    <Container>
      <ButtonPlay onPress={handlePlay}>
        {isPlaying ? <AntDesign name="pause" size={24} color="black" /> : <Entypo name="controller-play" size={24} color="black" />}
      </ButtonPlay>
      <ProgressBarContainer>
        <ProgressBar style={{ width: getProgressBarWidth() }} />
      </ProgressBarContainer>
    </Container>
  );
}
