import { useRouter, Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  TextInput,
  ScrollView,
} from 'react-native';

import { mainBrandColor, personalityTraits } from '../../config/config';
import { supabase } from '../../lib/supabase';

// Add this type definition
type UserPreferences = {
  preferredGender: 'female' | 'male';
  preferredPersonalityTraits: string[];
};

export default function Onboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [nickname, setNickname] = useState('');
  const [aiGender, setAiGender] = useState<'female' | 'male'>('female');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);

  const steps = [
    {
      title: 'Welcome to AI GF',
      description: 'Your personal AI companion for meaningful conversations',
      question: 'What is your Nickname?',
      image: require('../../../assets/onboarding1.jpeg'),
      input: (
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
          placeholder="Enter your nickname"
          placeholderTextColor="rgba(255,255,255,0.7)"
        />
      ),
    },
    {
      title: 'Chat Naturally',
      description: 'Have engaging conversations with our advanced AI',
      question: 'Would you like to have a female or male AI companion?',
      image:
        aiGender === 'female'
          ? require('../../../assets/onboardin2.jpeg')
          : require('../../../assets/onboarding2M.jpeg'),
      input: (
        <View style={styles.genderButtons}>
          <TouchableOpacity
            style={[styles.genderButton, aiGender === 'female' && styles.selectedGender]}
            onPress={() => setAiGender('female')}>
            <Text style={styles.genderButtonText}>Female</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderButton, aiGender === 'male' && styles.selectedGender]}
            onPress={() => setAiGender('male')}>
            <Text style={styles.genderButtonText}>Male</Text>
          </TouchableOpacity>
        </View>
      ),
    },
    {
      title: 'Finally',
      description: 'Ready to begin your journey?',
      question: 'Select personality traits you prefer (up to 6):',
      image:
        aiGender === 'female'
          ? require('../../../assets/onboarding3.jpeg')
          : require('../../../assets/onboarding3M.jpeg'),
      input: (
        <ScrollView style={styles.traitsContainer}>
          {Object.entries(personalityTraits).map(([category, traits]) => (
            <View key={category} style={styles.traitCategory}>
              <Text style={styles.categoryTitle}>{category.toUpperCase()}</Text>
              <View style={styles.traitsGrid}>
                {traits.map((trait) => (
                  <TouchableOpacity
                    key={trait}
                    style={[
                      styles.traitButton,
                      selectedTraits.includes(trait) && styles.selectedTrait,
                    ]}
                    onPress={() => {
                      if (selectedTraits.includes(trait)) {
                        setSelectedTraits(selectedTraits.filter((t) => t !== trait));
                      } else if (selectedTraits.length < 6) {
                        setSelectedTraits([...selectedTraits, trait]);
                      }
                    }}>
                    <Text style={styles.traitButtonText}>{trait}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      ),
    },
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error('No user found');

        // Create preferences object
        const preferences: UserPreferences = {
          preferredGender: aiGender,
          preferredPersonalityTraits: selectedTraits,
        };

        // Update profiles table
        const { error } = await supabase
          .from('profiles')
          .update({
            username: nickname,
            preferences,
            onboarding_completed: true,
          })
          .eq('id', user.id);

        if (error) throw error;

        // Navigate to main app
        router.replace('/authenticated');
      } catch (error) {
        console.error('Error saving preferences:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <ImageBackground source={steps[currentStep].image} style={styles.container} resizeMode="cover">
      <StatusBar barStyle="light-content" />
      <Stack.Screen
        options={{
          headerShown: false,
          statusBarStyle: 'light',
          statusBarTranslucent: true,
        }}
      />
      <SafeAreaView style={styles.overlay}>
        {currentStep > 0 && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.buttonText}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{steps[currentStep].title}</Text>
          <Text style={styles.description}>{steps[currentStep].description}</Text>
          <Text style={styles.question}>{steps[currentStep].question}</Text>
          {steps[currentStep].input}
        </View>

        <View style={styles.footer}>
          <View style={styles.paginationDots}>
            {steps.map((_, index) => (
              <View key={index} style={[styles.dot, index === currentStep && styles.activeDot]} />
            ))}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={handleNext}
              style={[
                styles.button,
                currentStep === 0 && !nickname && styles.buttonDisabled,
                currentStep > 0 && styles.buttonWithBack,
              ]}
              disabled={currentStep === 0 && !nickname}>
              <Text style={styles.buttonText}>
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingTop: StatusBar.currentHeight || 0,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    marginTop: 100,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    color: '#fff',
    paddingHorizontal: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    width: '100%',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: mainBrandColor,
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  question: {
    fontSize: 20,
    color: '#fff',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  input: {
    width: '80%',
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  genderButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  genderButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    minWidth: 100,
  },
  selectedGender: {
    backgroundColor: mainBrandColor,
  },
  genderButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  traitsContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
  },
  traitCategory: {
    marginBottom: 20,
  },
  categoryTitle: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  traitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  traitButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    minWidth: 100,
  },
  selectedTrait: {
    backgroundColor: mainBrandColor,
  },
  traitButtonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  backButton: {
    position: 'absolute',
    top: 90,
    left: 20,
    padding: 20,
    paddingBottom: 15,
    borderRadius: 35,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  buttonWithBack: {
    flex: 2,
  },
});
