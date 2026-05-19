import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE!;

const supabase = createClient(supabaseUrl, supabaseKey);

export default function Login() {

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, "text")

  const submit = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    if (error) {
      Alert.alert('Erro no login', error.message);
      return;
    }

    router.replace('/' as never);
  };

  const toCadastro = () => {
    router.push("/cadastro")
  };

  const styles = StyleSheet.create({
    titulo: {
      fontSize: 26,
      lineHeight: 30,
      marginBottom: "5%",
      marginTop: "20%"
    },
    input: {
      borderColor: "#ffffff",
      borderWidth: 2,
      borderRadius: 5,
      width: "60%",
      textAlign: "center",
      marginBottom: "5%"
    },
    button: {
      borderColor: "#2020aa",
      backgroundColor: "#8099ff",
      borderWidth: 2,
      borderRadius: 5,
      width: "30%",
      height: "5%",
      alignItems: "center",
      justifyContent: "center"

    }

  });

  return (
    <ThemedView style={{
      backgroundColor: backgroundColor,
      flex: 1,
      alignItems: 'center',
      gap: 10,
    }}>
      <ThemedText style={styles.titulo}>faça login para continuar</ThemedText>
      <TextInput
        autoCapitalize='none'
        keyboardType='email-address'
        onChangeText={setEmail}
        placeholder='Email'
        placeholderTextColor={textColor}
        style={styles.input}
        value={email}
      />
      <TextInput
        onChangeText={setSenha}
        placeholder='Senha'
        placeholderTextColor={textColor}
        secureTextEntry
        style={styles.input}
        value={senha}
      />
      <Pressable onPress={submit} style={styles.button}>
        <Text style={{ color: textColor }}> ENVIAR </Text>
      </Pressable>
      <Pressable onPress={toCadastro} style={styles.button}>
        <Text style={{ color: textColor }}> CADASTRE-SE </Text>
      </Pressable>

    </ThemedView>
  );
};





