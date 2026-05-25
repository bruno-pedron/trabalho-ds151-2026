import { router } from 'expo-router';
import { createClient } from '@supabase/supabase-js';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/supabase/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileScreen() {

  const { session } = useAuth();
  //usuário da authenticação possui tudo em auth.users
  const currentUser = session?.user;

  const logout = async () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que quer sair?',
      [
        {
          text: 'Cancelar',
          onPress: () => {

          },
          style: "cancel"
        },
        {
          text: "Sair",
          onPress: async () => {

            console.log("passoudo return")

            const { error } = await supabase.auth.signOut();

            if (error) {
              Alert.alert('Erro ao sair', error.message);
              return;
            }

            router.replace('/login');
          },
          style: "destructive"
        }
      ]
    )

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
