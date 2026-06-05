import { useState, useRef } from 'react';
import { Text, TextInput, Button, StyleSheet, ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { createExpense } from '@/services/expenses';

export default function NewExpenseScreen() {

  const { groupId } = useLocalSearchParams();
  const { session } = useAuth();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  const cameraRef = useRef<any>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const handleAbrirCamera = async () => {
    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if (!permission.granted) return;
    }
    setIsCameraOpen(true);
  };

  const handleTirarFoto = async () => {
    if (cameraRef.current) {
      const fotoData = await cameraRef.current.takePictureAsync();
      setFotoUri(fotoData.uri);
      setIsCameraOpen(false);
    }
  };

  if (isCameraOpen) {
    return (
      <View style={styles.container}>
        <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} />
        <View style={styles.cameraOverlay}>
          <TouchableOpacity style={styles.btnCapturar} onPress={handleTirarFoto}>
            <Text style={styles.btnText}>Capturar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCancelar} onPress={() => setIsCameraOpen(false)}>
            <Text style={styles.btnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  async function handleCreateExpense() {

    if (!groupId) {
      setErrorMessage('Grupo inválido.');
      return;
    }

    if (!session?.user?.id) {
      setErrorMessage('Usuário não autenticado.');
      return;
    }

    if (!description.trim() || !amount.trim()) {
      setErrorMessage('Digite uma descrição e valor para a despesa.');
      return;
    }

    if (Number(amount) <= 0) {

      setErrorMessage('O valor deve ser maior que zero.');
      return;
    }

    try {

      setLoading(true);

      setErrorMessage('');

      await createExpense(
        String(groupId),
        session.user.id,
        description.trim(),
        Number(amount),
        fotoUri || undefined,
      );

      router.replace({
        pathname:
          '/groups/[groupId]/expenses',

        params: {
          groupId: String(groupId)
        },
      });

    } catch (err) {

      console.error(err);

      setErrorMessage('Não foi possível criar a despesa. Verifique sua conexão e tente novamente.');

    } finally {

      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.title}>
        Nova Despesa
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Descrição"
        value={description}
        onChangeText={setDescription}
      />

      <TextInput
        style={styles.input}
        placeholder="Valor"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Button
        title="Adicionar Foto Recibo"
        onPress={
          handleAbrirCamera
        }
      />

      {
        errorMessage ? (
          <Text style={styles.errorText}>
            {errorMessage}
          </Text>
        ) : null
      }

      {
        loading
          ? (
            <ActivityIndicator size="small" />
          )
          : (
            <Button
              title="Salvar Despesa"
              onPress={
                handleCreateExpense
              }
            />
          )
      }

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    gap: 20,
  },

  cameraOverlay: { flex: 1, justifyContent: 'space-evenly', paddingBottom: 40, flexDirection: 'row', alignItems: 'flex-end' },
  btnCapturar: { backgroundColor: '#28a745', padding: 15, borderRadius: 30 },
  btnCancelar: { backgroundColor: '#dc3545', padding: 15, borderRadius: 30 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },

  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },

});