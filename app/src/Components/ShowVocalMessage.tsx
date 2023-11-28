import { useState } from 'react';
import { Audio, AVPlaybackStatusSuccess, InterruptionModeAndroid } from 'expo-av';
import styled from 'styled-components/native';
import { host } from '../utils/host';
import { DimensionValue, TouchableOpacity } from 'react-native';
import { FText } from './FText';
import * as FileSystem from 'expo-file-system';
import { useAppSelector } from '../store/store';

const Container = styled.View`
  width: 100%;
  align-items: center;
  margin-top: 20px;
`;

const ButtonPlay = styled(TouchableOpacity)`
  width: 100px;
  height: 50px;
  background-color: #3498db;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
`;

const ProgressBarContainer = styled.View`
  width: 80%;
  height: 10px;
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

export default function ShowVocalMessage ({ channelId, audioFile }: ShowRecordVoiceMessageProps){
  const [voiceMessage, setVoiceMessage] = useState<Audio.Sound | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<AVPlaybackStatusSuccess | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const token = useAppSelector((state) => state.me?.token);

  const loadSound = async () => {
    const soundObject = new Audio.Sound();
    const audioFileUrl = `http://${host}:3000/audioMessage/${channelId}/${audioFile}`;

    if (!token) return console.log('No token');

    try {
      const fileExtension = '.m4a';
      FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}${channelId}`, { intermediates: true });
      const fileUri = `${FileSystem.documentDirectory}${channelId}/${audioFile}`;
      
      console.log(audioFileUrl);
      
      const { uri } = await FileSystem.downloadAsync(audioFileUrl, fileUri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: true
      });
      console.log('File downloaded to:', uri);

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        // staysActiveInBackground: false,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: false,
      })
      await soundObject.loadAsync({
        uri,
        // @ts-ignore
        mimeType: 'audio/x-m4a' 
      });

      soundObject.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPlaybackStatus(status); // Mise à jour du statut de lecture
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
  }

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
        <FText>Play</FText>
      </ButtonPlay>
      <ProgressBarContainer>
        <ProgressBar style={{ width: getProgressBarWidth() }} />
      </ProgressBarContainer>
    </Container>
  );
}
