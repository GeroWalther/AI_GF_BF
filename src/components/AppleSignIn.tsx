import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { supabase } from '~/src/lib/supabase';

export default function AppleSignIn() {
  if (Platform.OS !== 'ios') return null;

  const signInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Got credentials, now sign in with Supabase
      if (credential.identityToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });

        if (error) throw error;
      }
    } catch (error) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        // Handle user canceling the sign-in flow
        console.log('User canceled Apple Sign in');
      } else {
        // Handle other errors
        console.error('Error signing in with Apple:', error);
      }
    }
  };

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={5}
      style={{ width: '100%', height: 50 }}
      onPress={signInWithApple}
    />
  );
}
