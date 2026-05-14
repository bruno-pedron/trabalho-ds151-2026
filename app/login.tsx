import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme.web';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Button, Pressable, StyleSheet, Text, TextInput } from 'react-native';


export default function Login() {

  const backgroundColor = useThemeColor({}, 'background');
  const colorScheme = useColorScheme() ?? 'light';
  const textColor = useThemeColor({}, "text")


  const submit = function() { };

  const styles = StyleSheet.create({
    titulo: {
      fontSize: 26,
      marginBottom: "5%"
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
      marginTop: "20%"
    }}>
      <ThemedText style={styles.titulo}>faça login para continuar</ThemedText>
      <TextInput
        placeholder='Usuario'
        placeholderTextColor='#ffffff'
        style={styles.input}
      />
      <TextInput
        placeholder='Senha'
        placeholderTextColor='#ffffff'
        style={styles.input}
      />
      <Pressable onPress={submit} style={styles.button}>
        <Text style={{ color: textColor }}> ENVIAR </Text>
      </Pressable>
      <Pressable onPress={submit} style={styles.button}>
        <Text style={{ color: textColor }}> CADASTRE-SE </Text>
      </Pressable>

    </ThemedView>
  );
};





