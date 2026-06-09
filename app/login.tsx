import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '@/supabase/supabase';
import *  as Linking from "expo-linking"

export default function Login() {

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, "text")

  const [editModalVisible, setEditModalVisible] = useState(false)
  const [inputValue, setInputValue] = useState("");

  const submit = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    if (error) {
      Alert.alert('Erro no login', error.message);
      return;
    }
    else Alert.alert('login bem sucedido');

    router.replace('/groups');
  };

  const toCadastro = () => {
    router.push("/cadastro")
  };


  const submitEdit = async () => {
    console.log("redefinir senha called");
    try {
      const url = Linking.createURL('/');
      const { data, error } = await supabase.auth.resetPasswordForEmail(inputValue, {
        redirectTo: url
      });
      error ?
        Alert.alert("falha na alteração")
        : Alert.alert("senha alterada");
    }
    catch (err) {
      Alert.alert("falha na alteração")
    }
  }

  const styles = StyleSheet.create({
    titulo: {
      fontSize: 26,
      lineHeight: 30,
      marginBottom: "5%",
      marginTop: "20%"
    },
    container: {
      flex: 1,
      alignItems: "center",
      backgroundColor: backgroundColor
    },
    content: {
      alignItems: 'center',
      gap: 16,
      paddingTop: 40,
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
      borderRadius: 5,
      borderWidth: 2,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    recoverPassword: {
      color: "#606060",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 10,
    }

  });

  return (
    <ThemedView style={{
      backgroundColor: backgroundColor,
      flex: 1,
      alignItems: 'center',
      gap: 10,
    }}>

      <Modal
        animationType="slide"
        visible={editModalVisible}
        onRequestClose={() => {
          setEditModalVisible(!editModalVisible);
        }}>
        <ThemedView style={styles.container}>
          <View style={styles.content}>
            <ThemedText style={styles.titulo} >Redefinindo senha</ThemedText>

            <TextInput
              onChangeText={setInputValue}
              placeholder={"digite o seu email para recuperação"}
              placeholderTextColor={textColor}
              style={[styles.input, { color: textColor }]}
              value={inputValue}
            />

            <Pressable
              style={styles.button}
              onPress={() => setEditModalVisible(!editModalVisible)}>
              <ThemedText>Cancelar</ThemedText>
            </Pressable>

            <Pressable
              style={styles.button}
              onPress={async () => {
                await submitEdit();
                setEditModalVisible(!editModalVisible)
              }}>
              <ThemedText>Confirmar</ThemedText>
            </Pressable>

          </View>
        </ThemedView>
      </Modal>

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

      <Pressable onPress={() => { setEditModalVisible(!editModalVisible) }}>
        <Text style={styles.recoverPassword}> esqueci a senha {'\n'} </Text>
      </Pressable>

      <Pressable onPress={submit} style={styles.button}>
        <Text style={{ color: textColor }}> ENVIAR </Text>
      </Pressable>
      <Pressable onPress={toCadastro} style={styles.button}>
        <Text style={{ color: textColor }}> CADASTRE-SE </Text>
      </Pressable>

    </ThemedView>
  );
};
