import { router } from 'expo-router';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '@/supabase/supabase';
import { useAuth } from '@/hooks/useAuth';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useEffect, useRef, useState } from 'react';
import { Tables } from '@/database.types';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Ionicons } from '@react-native-vector-icons/ionicons'
export default function ProfileScreen() {

  const textColor = useThemeColor({}, "text")

  const { session } = useAuth();
  //usuário da authenticação possui tudo em auth.users
  const currentUser = session?.user;

  const [usuario, setUsuario] = useState(null as Tables<'users'> | null)
  const [loggingOut, setLoggingOut] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false)

  const [inputValue, setInputValue] = useState("");
  const [inputType, setInputType] = useState("");

  useEffect(() => {
    if (loggingOut) return;
    getUsers();
  }, [currentUser])

  const getUsers = async () => {
    const { data, error } = await supabase.from('users')
      .select('*')
      .eq('id', currentUser?.id)
      .single();

    if (error) console.error("erro ao buscar: ", error.message)

    console.log(data);
    setUsuario(data);
  }

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


  const changeName = () => {
    setInputType("nome");
    setInputValue(usuario?.name as string)
    setEditModalVisible(!editModalVisible);
  }
  const changeEmail = () => {
    setInputType("email");
    setInputValue(currentUser?.email as string)
    setEditModalVisible(!editModalVisible);
  }

  const submitEdit = async () => {
    if (inputType === "nome") {
      console.log("changeName submitEdit Called");
      try {
        const { data, error } = await supabase.from('users').update({
          name: inputValue
        })
          .eq('id', currentUser?.id);
        error ? Alert.alert("falha na alteração", error.message) :
          Alert.alert("nome alterado");
        getUsers();
      }
      catch (err) {
        Alert.alert("falha na alteração");
      }
    }
    else if (inputType === "email") {
      console.log("changeEmail submitEdit Called");
      try {
        const { data, error } = await supabase.auth.updateUser({
          email: inputValue
        });
        error ? Alert.alert("falha na alteração", error.message) :
          Alert.alert("nome alterado");
      }
      catch (err) {
        Alert.alert("falha na alteração")
      }
    }
  }

  return (
    <ThemedView style={styles.container}>

      <Modal
        animationType="slide"
        visible={editModalVisible}
        onRequestClose={() => {
          setEditModalVisible(!editModalVisible);
        }}>
        <ThemedView style={styles.container}>
          <View style={styles.content}>
            <ThemedText style={styles.titulo} >Alterando {inputType}</ThemedText>

            <TextInput
              onChangeText={setInputValue}
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


      <View style={styles.content}>
        <ThemedText style={styles.titulo}>Perfil</ThemedText>
        <ThemedText> Dados do usuário </ThemedText>

        <View style={{ flexDirection: "row" }}>
          <ThemedText> nome de usuario: {usuario ? usuario.name : "carregando..."} </ThemedText>
          <Pressable onPress={changeName} disabled={usuario === null}>
            <Ionicons name="pencil" color={textColor} size={20} />
          </Pressable>
        </View>


        <View style={{ flexDirection: "row" }}>
          <ThemedText> email: {currentUser ? currentUser.email : "carregando..."} </ThemedText>
          <Pressable onPress={changeEmail} disabled={usuario === null}>
            <Ionicons name="pencil" color={textColor} size={20} />
          </Pressable>
        </View>

        <Pressable onPress={logout} style={styles.button}>
          <Text>Sair</Text>
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
  input: {
    borderColor: "#ffffff",
    borderWidth: 2,
    borderRadius: 5,
    width: 300,
    paddingVertical: 10,
    textAlign: "center",
    marginBottom: "5%"
  },
}
);
