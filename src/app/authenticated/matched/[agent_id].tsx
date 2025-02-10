import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View, Dimensions, Pressable } from 'react-native';
import { AVATARSBUCKETURL, mainBrandColor } from '~/src/config/config';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
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

const Matched = () => {
  const { agent_id } = useLocalSearchParams<{ agent_id: string }>();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const titleScale = useSharedValue(0.5);
  const heartScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  const {
    data: agent,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['agent', agent_id],
    queryFn: () => fetchAgentbyId(agent_id),
  });

  useEffect(() => {
    if (agent) {
      scale.value = withSpring(1, { damping: 12 });
      opacity.value = withTiming(1, { duration: 1000 });
      titleScale.value = withSequence(withDelay(400, withSpring(1.2)), withSpring(1));

      // Pulsing heart animation
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
});
