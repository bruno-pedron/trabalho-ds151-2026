import { useState, useRef } from 'react';
import { Text, TextInput, StyleSheet, ActivityIndicator, View, TouchableOpacity, Image, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { createExpense, uploadReceiptImage } from '@/services/expenses';

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

  const handleSelecionarGaleria = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true, // Permite cortar a foto
      quality: 0.7, // Reduz um pouco a qualidade para economizar dados
    });

    if (!result.canceled) {
      setFotoUri(result.assets[0].uri);
    }
  };

  const handleRemoverFoto = () => {
    setFotoUri(null);
  };

  if (isCameraOpen) {
    return (
      <View style={styles.container}>
        <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} />
        <View style={styles.cameraOverlay}>
          <TouchableOpacity style={styles.btnCapturar} onPress={handleTirarFoto}>
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.btnText}>Capturar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCancelar} onPress={() => setIsCameraOpen(false)}>
            <Ionicons name="close" size={24} color="#fff" />
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

    const parsedAmount = Number(amount.replace(',', '.').trim());

    if (!description.trim() || !amount.trim()) {
      setErrorMessage('Digite uma descrição e valor para a despesa.');
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('O valor deve ser maior que zero.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      let uploadedReceiptUrl = undefined;

      if (fotoUri) {
        uploadedReceiptUrl = await uploadReceiptImage(fotoUri);
      }

      await createExpense(
        String(groupId),
        session.user.id,
        description.trim(),
        parsedAmount,
        uploadedReceiptUrl,
      );

      router.replace({
        pathname: '/groups/[groupId]/expenses',
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

      <View style={styles.receiptSection}>
        <Text style={styles.label}>Recibo (Opcional)</Text>
        
        {!fotoUri ? (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleAbrirCamera}>
              <Ionicons name="camera-outline" size={24} color="#666" />
              <Text style={styles.secondaryButtonText}>Tirar Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleSelecionarGaleria}>
              <Ionicons name="image-outline" size={24} color="#666" />
              <Text style={styles.secondaryButtonText}>Galeria</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.previewContainer}>
            <TouchableOpacity activeOpacity={0.8} onPress={handleSelecionarGaleria}>
              <Image source={{ uri: fotoUri }} style={styles.previewImage} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeButton} onPress={handleRemoverFoto}>
              <Ionicons name="trash-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {errorMessage ? (
        <Text style={styles.errorText}>
          {errorMessage}
        </Text>
      ) : null}

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
    backgroundColor: '#fff',
  },
  cameraOverlay: { 
    flex: 1, 
    justifyContent: 'space-evenly', 
    paddingBottom: 40, 
    flexDirection: 'row', 
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  btnCapturar: { 
    backgroundColor: '#28a745', 
    padding: 15, 
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnCancelar: { 
    backgroundColor: '#dc3545', 
    padding: 15, 
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnText: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  receiptSection: {
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 14,
  },
  previewContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  previewImage: {
    width: 100,
    height: 140,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#dc3545',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: 10,
  },
  primaryButton: {
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
