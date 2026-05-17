import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';


export default function Cadastro() {

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, "text")


  const submit = () => { };

  const styles = StyleSheet.create({
    titulo: {
      fontSize: 26,
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
      <ThemedText style={styles.titulo}>Cadastre - se</ThemedText>
      <TextInput
        placeholder='Nome de Usuário'
        placeholderTextColor={textColor}
        style={styles.input}
      />
      <TextInput
        placeholder='Email'
        placeholderTextColor={textColor}
        style={styles.input}
      />
      <TextInput
        placeholder='Número de Telefone'
        placeholderTextColor={textColor}
        style={styles.input}
      />
      <TextInput
        placeholder='Senha'
        placeholderTextColor={textColor}
        style={styles.input}
      />
      <Pressable onPress={submit} style={styles.button}>
        <Text style={{ color: textColor }}> CADASTRAR </Text>
      </Pressable>

    </ThemedView>
  );
};





