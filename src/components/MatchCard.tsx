import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import Animated, {
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { mainBrandColor } from '../consts/colors';

const screenWidth = Dimensions.get('screen').width;
export const tinderCardWidth = screenWidth * 0.95;

type TinderCard = {
  agent: {
    image: string;
    name: string;
    bio: string;
    traits: string[];
  };
  numOfCards: number;
  index: number;
  activeIndex: SharedValue<number>;
  onResponse: (a: boolean) => void;
};

const MatchCard = ({ agent, numOfCards, index, activeIndex, onResponse }: TinderCard) => {
  const translationX = useSharedValue(0);

  const animatedCard = useAnimatedStyle(() => ({
    opacity: interpolate(activeIndex.value, [index - 1, index, index + 1], [1 - 1 / 5, 1, 1]),
    transform: [
      {
        scale: interpolate(activeIndex.value, [index - 1, index, index + 1], [0.95, 1, 1]),
      },
      {
        translateY: interpolate(activeIndex.value, [index - 1, index, index + 1], [-30, 0, 0]),
      },
      {
        translateX: translationX.value,
      },
      {
        rotateZ: `${interpolate(
          translationX.value,
          [-screenWidth / 2, 0, screenWidth / 2],
          [-15, 0, 15]
        )}deg`,
      },
    ],
  }));

  const gesture = Gesture.Pan()
    .onChange((event) => {
      translationX.value = event.translationX;

      activeIndex.value = interpolate(Math.abs(translationX.value), [0, 500], [index, index + 0.8]);
    })
    .onEnd((event) => {
      if (Math.abs(event.velocityX) > 400) {
        translationX.value = withSpring(Math.sign(event.velocityX) * 900, {
          velocity: event.velocityX,
        });
        activeIndex.value = withSpring(index + 1);

        runOnJS(onResponse)(event.velocityX > 0);
      } else {
        translationX.value = withSpring(0);
      }
    });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.card,
          animatedCard,
          {
            zIndex: numOfCards - index,
          },
        ]}>
        <Image
          style={[StyleSheet.absoluteFillObject, styles.image]}
          source={{ uri: agent.image }}
        />

        <LinearGradient
          // Background Linear Gradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={[StyleSheet.absoluteFillObject, styles.overlay]}
        />

        <View style={styles.footer}>
          <Text style={styles.name}>{agent.name}</Text>
          <Text style={styles.bio}>{agent.bio}</Text>
          <View style={styles.traitsContainer}>
            {agent.traits?.map((trait, index) => (
              <View key={index} style={styles.traitBubble}>
                <Text style={styles.traitText}>{trait.trim()}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: mainBrandColor,
    width: tinderCardWidth,
    // height: tinderCardWidth * 1.67,
    aspectRatio: 1 / 1.67,
    borderRadius: 15,
    justifyContent: 'flex-end',

    position: 'absolute',

    // shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
  },
  image: {
    borderRadius: 15,
  },
  overlay: {
    top: '50%',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  footer: {
    padding: 10,
  },
  name: {
    fontSize: 24,
    color: 'white',
    fontFamily: 'InterBold',
  },
  bio: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Inter',
    marginVertical: 4,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  traitBubble: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  traitText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter',
  },
});

export default MatchCard;
