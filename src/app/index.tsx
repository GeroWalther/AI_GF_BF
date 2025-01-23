import { Redirect } from 'expo-router';

export default function AppEntrypoint() {
  return (
    <>
      <Redirect href="/(protected)" />
    </>
  );
}
