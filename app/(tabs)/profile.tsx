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
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (loggingOut) return;
    (
      async () => {
        const { data, error } = await supabase.from('users')
          .select('*')
          .eq('id', currentUser?.id)
          .single();

        if (error) console.error("erro ao buscar: ", error.message)

        console.log(data);
        setUsuario(data);
      })();
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
            setLoggingOut(true);

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
        <ThemedText style={styles.titulo}>Perfil</ThemedText>
        <ThemedText> Dados do usuário </ThemedText>
        <ThemedText> nome de usuario: {usuario ? usuario.name : "carregando..."} </ThemedText>
        <ThemedText> email: {currentUser ? currentUser.email : "carregando..."} </ThemedText>
        <Pressable onPress={logout} style={styles.button}>
          <Text >Sair</Text>
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
  titulo: {
    fontSize: 26,
    lineHeight: 30,
    marginBottom: "5%",
    marginTop: "20%"
  },
  content: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 40,
  },
  button: {
    borderColor: "#2020aa",
    backgroundColor: "#8099ff",
    borderRadius: 5,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
