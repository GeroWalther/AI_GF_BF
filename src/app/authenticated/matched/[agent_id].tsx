import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Image, StyleSheet, Text, View, Dimensions, Pressable } from 'react-native';
import { AVATARSBUCKETURL, mainBrandColor } from '~/src/config/config';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '~/src/lib/supabase';

const { width } = Dimensions.get('window');

const fetchAgentbyId = async (agent_id: string) => {
  const { data, error } = await supabase.from('ai_agents').select('*').eq('id', agent_id).single();
  if (error) {
    throw error;
  }
  return data;
};

const FloatingHeart = ({
  startPosition,
  delay = 0,
  swayAmount = 50,
  swayDuration = 2000,
}: {
  startPosition: number;
  delay?: number;
  swayAmount?: number;
  swayDuration?: number;
}) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      scale.value = withSequence(
        withTiming(1, { duration: 300 }),
        withDelay(1000, withTiming(0, { duration: 500 }))
      );
      opacity.value = withSequence(
        withTiming(0.15, { duration: 300 }),
        withDelay(800, withTiming(0, { duration: 700 }))
      );
      translateY.value = withTiming(-300, { duration: 2000 });
      translateX.value = withRepeat(
        withSequence(
          withTiming(startPosition + swayAmount, { duration: swayDuration }),
          withTiming(startPosition - swayAmount, { duration: swayDuration })
        ),
        -1,
        true
      );
    }, delay);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.floatingHeart, animatedStyle]}>
      <Ionicons name="heart" size={120} color="#FF4B6A" />
    </Animated.View>
  );
};

const Matched = () => {
  const { agent_id } = useLocalSearchParams<{ agent_id: string }>();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const titleScale = useSharedValue(0.5);
  const heartScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);
  const [hearts, setHearts] = useState<
    Array<{
      position: number;
      delay: number;
      swayAmount: number;
      swayDuration: number;
    }>
  >([]);
  const nextHeartId = useRef(0);

  const {
    data: agent,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['agent', agent_id],
    queryFn: () => fetchAgentbyId(agent_id),
  });

  const addHearts = useCallback(() => {
    const newHearts = [
      {
        position: Math.random() * 20 - 60, // Far left
        delay: Math.random() * 1200, // Increased delay range 0-1200ms
        swayAmount: 15 + Math.random() * 15,
        swayDuration: 800 + Math.random() * 400,
      },
      {
        position: Math.random() * 20 - 30, // Left
        delay: Math.random() * 1200 + 200, // 200-1400ms
        swayAmount: 15 + Math.random() * 15,
        swayDuration: 800 + Math.random() * 400,
      },
      {
        position: Math.random() * 20, // Center
        delay: Math.random() * 1200 + 400, // 400-1600ms
        swayAmount: 15 + Math.random() * 15,
        swayDuration: 800 + Math.random() * 400,
      },
      {
        position: Math.random() * 20 + 30, // Right
        delay: Math.random() * 1200 + 600, // 600-1800ms
        swayAmount: 15 + Math.random() * 15,
        swayDuration: 800 + Math.random() * 400,
      },
      {
        position: Math.random() * 20 + 60, // Far right
        delay: Math.random() * 1200 + 800, // 800-2000ms
        swayAmount: 15 + Math.random() * 15,
        swayDuration: 800 + Math.random() * 400,
      },
    ];

    setHearts((prev) => [...prev, ...newHearts]);
    nextHeartId.current += 5;

    setTimeout(() => {
      setHearts((prev) => prev.slice(5));
    }, 4000); // Increased timeout to account for longer delays
  }, []);

  useEffect(() => {
    if (agent) {
      scale.value = withSpring(1, { damping: 12 });
      opacity.value = withTiming(1, { duration: 1000 });
      titleScale.value = withSequence(withDelay(400, withSpring(1.2)), withSpring(1));

      const pulseHeart = () => {
        heartScale.value = withSequence(
          withTiming(1.2, { duration: 200 }),
          withTiming(1, { duration: 200 })
        );
      };

      const interval = setInterval(pulseHeart, 1500);
      return () => clearInterval(interval);
    }
  }, [agent]);

  useEffect(() => {
    const interval = setInterval(addHearts, 4500); // Increased interval
    return () => clearInterval(interval);
  }, [addHearts]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const onPressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const onPressOut = () => {
    buttonScale.value = withSpring(1);
  };

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  if (!agent) {
    return <Text>Agent not found</Text>;
  }

  return (
    <View style={styles.container}>
      <BlurView intensity={100} style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
          style={StyleSheet.absoluteFill}
        />
      </BlurView>

      <View style={styles.heartsContainer}>
        {hearts.map((heart, index) => (
          <FloatingHeart
            key={`${index}-${nextHeartId.current}`}
            startPosition={heart.position}
            delay={heart.delay}
            swayAmount={heart.swayAmount}
            swayDuration={heart.swayDuration}
          />
        ))}
      </View>

      <Animated.View style={[styles.content, animatedStyle]}>
        <Animated.View style={[styles.titleContainer, titleStyle]}>
          <Text style={styles.matchText}>It's a Match!</Text>
          <Animated.View style={[styles.heartContainer, heartStyle]}>
            <Ionicons name="heart" size={40} color="#FF4B6A" />
          </Animated.View>
        </Animated.View>

        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={{
              uri: `${AVATARSBUCKETURL}${agent.avatar}`,
            }}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{agent.name}</Text>
            <Text style={styles.bio}>{agent.bio}</Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.buttonContainer}>
        <Animated.View style={[styles.buttonWrapper, buttonAnimatedStyle]}>
          <Pressable
            style={styles.button}
            onPress={() => router.back()}
            onPressIn={onPressIn}
            onPressOut={onPressOut}>
            <LinearGradient colors={['#4A90E2', '#357ABD']} style={styles.gradient}>
              <Ionicons name="arrow-back" size={18} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Swipe More</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, styles.primaryWrapper, buttonAnimatedStyle]}>
          <Pressable
            style={[styles.button, styles.primaryButton]}
            //TODO: push to channel based on id
            onPress={() => router.push(`/authenticated/channel`)}
            onPressIn={onPressIn}
            onPressOut={onPressOut}>
            <LinearGradient
              colors={['#FF6B6B', '#FF4785']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}>
              <Ionicons name="chatbubbles" size={22} color="#fff" style={styles.buttonIcon} />
              <Text style={[styles.buttonText, styles.primaryButtonText]}>Start Chatting</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

export default Matched;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mainBrandColor,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 200,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  matchText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontFamily: 'InterBold',
  },
  heartContainer: {
    marginTop: 20,
  },
  imageContainer: {
    width: width * 0.8,
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    fontFamily: 'InterBold',
  },
  bio: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 50,
    marginTop: -100,
    paddingTop: 20,
    width: '100%',
    backgroundColor: 'transparent',
    gap: 15,
  },
  buttonWrapper: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  primaryWrapper: {
    flex: 1.5,
  },
  button: {
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: 'transparent',
  },
  buttonIcon: {
    marginRight: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'Inter',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  primaryButtonText: {
    fontSize: 16,
  },
  heartsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 1,
  },
  floatingHeart: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: '40%',
  },
});
