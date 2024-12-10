import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export function WaveBackground() {
  return (
    <View style={styles.waveContainer}>
      <Svg width={Dimensions.get('window').width} height="107" viewBox="0 0 443 107" fill="none" style={styles.wawe}>
        <Path d="M107.215 0.579486C81.5309 3.2924 22.4453 9.57278 0 14.8189V107H443V14.8189C416.795 10.0724 357.353 0.579486 336.68 0.579486C316.007 0.579486 294.377 -1.66898 279.457 36.5525C277.927 41.0492 271.09 54.5011 254.782 67.2796C250 71.0268 234.698 74.774 219.778 71.7762C212.763 70.3667 200.727 69.528 179.61 36.5525C176.167 31.1761 171.576 19.1655 157.804 9.57278C150.918 5.32595 132.9 -2.13343 107.215 0.579486Z" fill="#484857" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  waveContainer: {
    position: 'absolute',
    bottom: -10,
    width: '100%',
    zIndex: 1
  },
  wave: {
    position: 'absolute',
  },
});

