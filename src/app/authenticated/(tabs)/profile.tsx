import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import React, { useEffect, useState } from 'react';

import { supabase } from '~/src/lib/supabase';
import { mainBrandColor, personalityTraits } from '~/src/config/config';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '~/src/ctx/AuthProvider';

type UserPreferences = {
  preferredGender: 'female' | 'male';
  preferredPersonalityTraits: string[];
};

const Profile = () => {
  const { session } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [preferredGender, setPreferredGender] = useState<'female' | 'male'>('female');
  const [nickname, setNickname] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('preferences, username')
        .eq('id', session?.user?.id)
        .single();

      if (error) throw error;

      if (data?.preferences) {
        setPreferences(data.preferences);
        setSelectedTraits(data.preferences.preferredPersonalityTraits);
        setPreferredGender(data.preferences.preferredGender);
      }
      if (data?.username) {
        setNickname(data.username);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const savePreferences = async () => {
    try {
      setIsSaving(true);
      const newPreferences: UserPreferences = {
        preferredGender,
        preferredPersonalityTraits: selectedTraits,
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          preferences: newPreferences,
          username: nickname,
        })
        .eq('id', session?.user?.id);

      if (error) throw error;
      setPreferences(newPreferences);

      // Show success message
      setShowSuccess(true);
      // Hide after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleTrait = (trait: string) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter((t) => t !== trait));
    } else if (selectedTraits.length < 8) {
      setSelectedTraits([...selectedTraits, trait]);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="exit-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ position: 'absolute', top: 100, right: 20 }}>
          <Text>Log out</Text>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.email}>{session?.user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nickname</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="Enter your nickname"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Gender</Text>
          <View style={styles.genderButtons}>
            <TouchableOpacity
              style={[styles.genderButton, preferredGender === 'female' && styles.selectedGender]}
              onPress={() => setPreferredGender('female')}>
              <Text
                style={[
                  styles.genderButtonText,
                  preferredGender === 'female' && styles.selectedGenderText,
                ]}>
                Female
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, preferredGender === 'male' && styles.selectedGender]}
              onPress={() => setPreferredGender('male')}>
              <Text
                style={[
                  styles.genderButtonText,
                  preferredGender === 'male' && styles.selectedGenderText,
                ]}>
                Male
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Preferred Personality Traits ({selectedTraits.length}/8)
          </Text>
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
                    onPress={() => toggleTrait(trait)}>
                    <Text
                      style={[
                        styles.traitButtonText,
                        selectedTraits.includes(trait) && styles.selectedTraitText,
                      ]}>
                      {trait}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.savingButton]}
          onPress={savePreferences}
          disabled={isSaving}>
          <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save Preferences'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {showSuccess && (
        <View style={styles.successMessage}>
          <Text style={styles.successText}>✓ Preferences saved successfully!</Text>
        </View>
      )}
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: mainBrandColor,
    marginBottom: 10,
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: mainBrandColor,
    marginBottom: 12,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  selectedGender: {
    backgroundColor: mainBrandColor,
  },
  selectedGenderText: {
    color: '#fff',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  traitCategory: {
    marginBottom: 5,
  },
  categoryTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  traitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  traitButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
  },
  selectedTrait: {
    backgroundColor: mainBrandColor,
  },
  selectedTraitText: {
    color: '#fff',
  },
  traitButtonText: {
    fontSize: 14,
    color: '#333',
  },
  saveButton: {
    backgroundColor: mainBrandColor,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 0,
    marginBottom: 100,
  },
  savingButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signOutButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: mainBrandColor,
    padding: 12,
    borderRadius: 25,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    color: '#333',
    fontSize: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  successMessage: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 2,
  },
  successText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
