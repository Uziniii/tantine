import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Animated, Easing, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { AntDesign } from '@expo/vector-icons'; 

const { width } = Dimensions.get('window');

const cardWidth = width - 120;
const cardOffset = cardWidth + 60;

const ContainerChoice = styled.View`
  width: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
`;

const Carousel = () => {
  const translateX = useRef(new Animated.Value(0)).current;
  const initialNames = ['Alice', 'Bob', 'Charlie', 'David', 'Emma', 'Alice', 'Bob', 'Charlie', 'David', 'Emma'];
  const names = useRef([...Array(5)].flatMap(() => initialNames)).current;

  const animateCarousel = () => {
    const duration = 2500;

    const easingFast = Easing.bezier(0.25, 0.1, 0.25, 1);
    const easingSlow = Easing.bezier(0.42, 0, 1, 1);

    Animated.loop(
      Animated.timing(translateX, {
        toValue: -(cardOffset / 1.2) * (names.length / 2),
        duration: duration,
        easing: easingFast,
        useNativeDriver: true,
      }),
      { iterations: 1 },
    ).start();
  };

  useEffect(() => {
    animateCarousel();

    return () => {
      translateX.removeAllListeners();
    };
  }, []);

  const animatedStyles = {
    transform: [{ translateX }],
  };

  const displayNames = () => {
    return names.map((name, index) => (
      <TouchableOpacity key={index}>
        <View style={styles.card}>
          <Text>{name}</Text>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <ContainerChoice><AntDesign name="caretdown" size={24} color="black" /></ContainerChoice>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Animated.View style={[styles.cardsContainer, animatedStyles, { width: cardOffset * names.length }]}>
          {displayNames()}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    marginBottom: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#24252D',
  },
  cardsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    width: cardWidth,
    height: 200,
    marginHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 10,
  },
});

export default Carousel;
