export const AVATARSBUCKETURL =
  process.env.EXPO_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/avatars/';

export const mainBrandColor = '#5d0c34'; //'#5d0c34'

// Use ngrok URL for development
export const AI_SERVER_URL = __DEV__
  ? 'https://6aa9-84-126-250-212.ngrok-free.app'
  : 'https://your-production-url.com';


  export const personalityTraits = {
    // Based on MBTI cognitive functions
    extroverted: ['Outgoing', 'Energetic', 'Enthusiastic', 'Social', 'Expressive', 'Talkative'],
    introverted: ['Thoughtful', 'Reflective', 'Calm', 'Deep', 'Reserved', 'Introspective'],
    sensing: ['Practical', 'Detail-oriented', 'Realistic', 'Traditional', 'Organized', 'Observant'],
    intuitive: [
      'Creative',
      'Imaginative',
      'Innovative',
      'Philosophical',
      'Visionary',
      'Abstract-thinking',
    ],
    thinking: ['Logical', 'Analytical', 'Objective', 'Rational', 'Strategic', 'Critical-thinker'],
    feeling: [
      'Empathetic',
      'Compassionate',
      'Harmonious',
      'Value-driven',
      'Caring',
      'Emotionally-aware',
    ],
    judging: ['Structured', 'Planned', 'Decisive', 'Systematic', 'Goal-oriented', 'Organized'],
    perceiving: ['Flexible', 'Spontaneous', 'Adaptable', 'Open-ended', 'Exploratory', 'Curious'],
  };