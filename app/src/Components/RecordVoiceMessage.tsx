import React, { useState } from 'react';
import { Audio } from 'expo-av';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';


const ContainerButtonRecord = styled(TouchableWithoutFeedback)`
  height: 40px;
  width: 40px;
  background-color:#333541;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50px;
`;

export default function RecordVoiceMessage(): JSX.Element {
  const [recording, setRecording] = useState<Audio.Recording | undefined>();
  const [audioFile, setAudioFile] = useState<string | null>(null);

  async function startRecording() {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      console.log('Recording started');

    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    if (recording) {    
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();

      if (!uri) return

      const formData = new FormData()
      const blob = new Blob([uri], { type: 'audio/m4a' });
      formData.append('audio', blob);
      console.log(blob);
      

      console.log('Recording stopped and stored at', uri);
      setRecording(undefined);
    } else {
      console.log('No recording to stop.');
    }
  }


  return (
    <ContainerButtonRecord onPress={recording ? stopRecording : startRecording}>
      <MaterialIcons name="keyboard-voice" size={24} color="#707179" />
    </ContainerButtonRecord>
  );
}
