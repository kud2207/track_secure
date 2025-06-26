import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';

export default function AuthLayout() {
  return (
    <PaperProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </PaperProvider>
  );
}
