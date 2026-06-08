import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { ActivityIndicator, Keyboard, TouchableWithoutFeedback, View } from 'react-native';
import * as Linking from 'expo-linking'
import { supabase } from '@/supabase/supabase';

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const url = Linking.useURL();

  useEffect(() => {
    if (url) {
      handleLink(url);
    }
  }, [url]);

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

  async function handleLink(url: string) {
    const { queryParams } = Linking.parse(url)

    if (queryParams?.error_description) {
      console.error("Erro no link de redefinir senha", queryParams.error_description);
      return;
    }

    const parts = url.split('#');
    if (parts.length > 1) {
      const hash = parts[1]
      const params = Object.fromEntries(new URLSearchParams(hash).entries())

      const accessToken = params.access_token;
      const refreshToken = params.refresh_token;

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!error) router.replace('/(tabs)/profile');
      }


    }
  }

  if (isLoading) return <ActivityIndicator />

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <SafeAreaView style={{ flex: 1 }}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              <Stack.Screen name="login" options={{ presentation: 'formSheet', title: 'login' }} />
            </Stack>
          </SafeAreaView>
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
