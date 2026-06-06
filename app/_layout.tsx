import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { ActivityIndicator, Keyboard, TouchableWithoutFeedback, View } from 'react-native';

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {

    if (isLoading) return;

    const inLogin = segments[0] === 'login' || segments[0] === 'cadastro';

    if (!session && !inLogin) {
      router.replace('/login');
    }
    else if (session && inLogin) {
      router.replace('/(tabs)/profile')
    }
  }, [session, isLoading, segments]);

  if (isLoading) return <ActivityIndicator />

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              <Stack.Screen name="login" options={{ presentation: 'formSheet', title: 'login' }} />
            </Stack>
          </View>
        </TouchableWithoutFeedback>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>

  )

}


export default function RootLayout() {

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
