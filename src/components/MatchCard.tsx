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
import { mainBrandColor, AVATARSBUCKETURL } from '../config/config';

const screenWidth = Dimensions.get('screen').width;
export const tinderCardWidth = screenWidth * 0.95;

type TinderCard = {
  agent: {
    name: string;
    bio: string;
    traits: string[];
    avatar: string;
  };
  numOfCards: number;
  index: number;
  activeIndex: SharedValue<number>;
  onMatch: (a: boolean) => void;
};

const MatchCard = ({ agent, numOfCards, index, activeIndex, onMatch }: TinderCard) => {
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

        runOnJS(onMatch)(event.velocityX > 0);
      } else {
        translationX.value = withSpring(0);
      }
    });

  return (
    <>
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
            source={{
              uri: `${AVATARSBUCKETURL}${agent.avatar}`,
            }}
          />

          <LinearGradient
            // Background Linear Gradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
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
      <View
        style={{
          position: 'absolute',
          bottom: 80,
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
        }}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 20,
              flexDirection: 'row',
              alignItems: 'center',
            },
          ]}>
          <Text style={{ color: 'rgba(255,0,0,0.6)', fontSize: 24, marginRight: 8 }}>←</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontFamily: 'Inter' }}>
            Swipe left to pass
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            {
              position: 'absolute',
              right: 20,
              flexDirection: 'row',
              alignItems: 'center',
            },
          ]}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontFamily: 'Inter' }}>
            Swipe right to match
          </Text>
          <Text style={{ color: 'rgba(0,255,0,0.6)', fontSize: 24, marginLeft: 8 }}>→</Text>
        </Animated.View>
      </View>
    </>
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
