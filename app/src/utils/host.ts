import Constants from 'expo-constants';

const { manifest2 } = Constants;

export const host =
  manifest2 !== null
    ? manifest2?.extra?.expoGo?.debuggerHost?.split(":").shift()
    : process.env.IP;
