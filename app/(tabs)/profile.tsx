import { router } from 'expo-router';
import { createClient } from '@supabase/supabase-js';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE!;

const supabase = createClient(supabaseUrl, supabaseKey);

export default function ProfileScreen() {
  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert('Erro ao sair', error.message);
      return;
    }

    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text>Perfil</Text>
        <Pressable onPress={logout} style={styles.button}>
          <Text style={styles.buttonText}>Sair</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 40,
  },
  button: {
    backgroundColor: '#dddddd',
    borderColor: '#888888',
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#111111',
  },
});
