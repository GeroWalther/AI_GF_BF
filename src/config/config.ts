export const AVATARSBUCKETURL =
  process.env.EXPO_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/avatars/';

export const mainBrandColor = '#5d0c34'; //'#5d0c34'

// Use ngrok URL for development
export const AI_SERVER_URL = __DEV__
  ? 'https://60d6-84-126-250-212.ngrok-free.app'  // Your ngrok URL
  : 'https://your-production-url.com';
