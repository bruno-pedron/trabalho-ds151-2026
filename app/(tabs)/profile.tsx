import { router } from 'expo-router';
import { createClient } from '@supabase/supabase-js';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/supabase/supabase';
import { useAuth } from '@/hooks/useAuth';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useEffect, useState } from 'react';
import { Database, Tables } from '@/database.types';

export default function ProfileScreen() {

  const { session } = useAuth();
  //usuário da authenticação possui tudo em auth.users
  const currentUser = session?.user;

  const [usuario, setUsuario] = useState(null as Tables<'users'> | null)

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("users")
        .select("*")
        .eq("id", currentUser?.id)
        .single();
      setUsuario(data)
    })
  }, [currentUser])

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, "text")

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
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText>Perfil</ThemedText>
        <ThemedText>
          Dados do usuário:
          {usuario ? usuario.name : ""}
        </ThemedText>
        <Pressable onPress={logout} style={styles.button}>
          <Text style={{ color: textColor }}>Sair</Text>
        </Pressable>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center"
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
});
