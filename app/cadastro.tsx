import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { supabase } from '@/supabase/supabase';

export default function Cadastro() {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, "text")

  const submit = async () => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        data: {
          name: name.trim()
        },
      },
    });

    if (error) {
      Alert.alert('Erro no cadastro', error.message);
      return;
    }

    Alert.alert('Cadastro realizado', 'Agora voce pode fazer login.');
    router.replace('/login');
  };

  const styles = StyleSheet.create({
    titulo: {
      fontSize: 26,
      lineHeight: 30,
      marginBottom: "5%",
      marginTop: "20%"
    },
    input: {
      color: textColor,
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
      <ThemedText style={styles.titulo}>Cadastre - se</ThemedText>
      <TextInput
        onChangeText={setName}
        placeholder='Nome de Usuario'
        placeholderTextColor={textColor}
        style={styles.input}
        value={name}
      />
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
        <Text style={{ color: textColor }}> CADASTRAR </Text>
      </Pressable>
    </ThemedView>
  );
};





