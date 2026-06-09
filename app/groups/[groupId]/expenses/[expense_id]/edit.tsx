import { useEffect, useRef, useState } from 'react';
import { Text, Button, StyleSheet, TextInput, ActivityIndicator, Alert, View, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import {
  getExpenseById,
  updateExpense,
  updateExpenseReceipt,
  deleteExpense,
  uploadReceiptImage,
  deleteReceiptImage,
  getReceiptSignedUrl,
} from '@/services/expenses';

export default function EditExpenseScreen() {

  const { groupId, expense_id, } = useLocalSearchParams();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currentReceiptPath, setCurrentReceiptPath] = useState<string | null>(null);
  const [receiptPreviewUri, setReceiptPreviewUri] = useState<string | null>(null);
  const [newFotoUri, setNewFotoUri] = useState<string | null>(null);
  const [wantsRemoveReceipt, setWantsRemoveReceipt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

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
      setNewFotoUri(fotoData.uri);
      setReceiptPreviewUri(fotoData.uri);
      setWantsRemoveReceipt(false);
      setIsCameraOpen(false);
    }
  };

  const handleSelecionarGaleria = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setNewFotoUri(result.assets[0].uri);
      setReceiptPreviewUri(result.assets[0].uri);
      setWantsRemoveReceipt(false);
    }
  };

  const handleRemoverRecibo = () => {
    setNewFotoUri(null);
    setReceiptPreviewUri(null);
    setWantsRemoveReceipt(true);
  };

  async function loadExpense() {

    if (!expense_id) {
      return;
    }

    try {

      setLoading(true);
      setErrorMessage('');

      const expense =
        await getExpenseById(
          String(expense_id)
        );

      setDescription(
        expense.description ?? ''
      );

      setAmount(
        String(expense.amount ?? '')
      );

      if (expense.receipt_url) {
        setCurrentReceiptPath(expense.receipt_url);
        const signedUrl = expense.receipt_url.startsWith('http')
          ? expense.receipt_url
          : await getReceiptSignedUrl(expense.receipt_url);
        setReceiptPreviewUri(signedUrl);
      }

    } catch (err) {

      console.error(err);

      setErrorMessage(
        'Não foi possível carregar a despesa.'
      );

    } finally {

      setLoading(false);
    }
  }

  async function handleSave() {

    if (!description.trim() || !amount.trim()) {

      setErrorMessage(
        'Preencha todos os campos.'
      );

      return;
    }

    try {

      setLoading(true);

      setErrorMessage('');

      await updateExpense(
        String(expense_id),
        description.trim(),
        Number(amount)
      );

      if (newFotoUri) {
        if (currentReceiptPath && !currentReceiptPath.startsWith('http')) {
          try {
            await deleteReceiptImage(currentReceiptPath);
          } catch (_) { }
        }
        const uploadedPath = await uploadReceiptImage(newFotoUri);
        await updateExpenseReceipt(String(expense_id), uploadedPath);
      } else if (wantsRemoveReceipt && currentReceiptPath) {
        if (!currentReceiptPath.startsWith('http')) {
          try {
            await deleteReceiptImage(currentReceiptPath);
          } catch (_) { }
        }
        await updateExpenseReceipt(String(expense_id), null);
      }

      router.replace({
        pathname:
          '/groups/[groupId]/expenses/[expense_id]',
        params: {
          groupId: String(groupId),
          expense_id: String(expense_id),
        },
      });

    } catch (err) {

      console.error(err);

      setErrorMessage(
        'Não foi possível salvar as alterações.'
      );

    } finally {

      setLoading(false);
    }
  }

  function handleDelete() {

    Alert.alert(
      'Excluir despesa',
      'Deseja realmente excluir esta despesa?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  }

  async function confirmDelete() {

    try {

      setLoading(true);
      setErrorMessage('');

      if (currentReceiptPath && !currentReceiptPath.startsWith('http')) {
        try {
          await deleteReceiptImage(currentReceiptPath);
        } catch (_) { }
      }

      await deleteExpense(
        String(expense_id)
      );

      router.replace({
        pathname:
          '/groups/[groupId]/expenses',
        params: {
          groupId: String(groupId),
        },
      });

    } catch (err) {

      console.error(err);

      setErrorMessage(
        'Não foi possível excluir a despesa.'
      );

    } finally {

      setLoading(false);
    }
  }

  function handleBack() {

    router.replace({
    pathname:
      '/groups/[groupId]/expenses/[expense_id]',

    params: {
      groupId: String(groupId),
      expense_id: String(expense_id),
    },
  });
  }

  useEffect(() => {

    loadExpense();

  }, []);

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

  if (loading && !description) {

    return (
      <SafeAreaView
        style={styles.loadingContainer}
      >

        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Carregando despesa...
        </Text>

      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Editar Despesa',
          headerBackTitle: 'Voltar',
        }}
      />
      <Text style={styles.title}>
        Editar Despesa
      </Text>

      {errorMessage ? (
        <Text style={styles.errorText}>
          {errorMessage}
        </Text>
      ) : null}

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
        
        {!receiptPreviewUri ? (
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
              <Image
                source={{ uri: receiptPreviewUri }}
                style={styles.previewImage}
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
              />
              {imageLoading ? (
                <View style={styles.imageLoadingOverlay}>
                  <ActivityIndicator size="small" />
                  <Text style={styles.imageLoadingText}>Carregando recibo...</Text>
                </View>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeButton} onPress={handleRemoverRecibo}>
              <Ionicons name="trash-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {
        loading
          ? (
            <ActivityIndicator />
          )
          : (
            <>
              <Button
                title="Salvar Alterações"
                onPress={handleSave}
              />

              <Button
                title="Excluir Despesa"
                color="red"
                onPress={handleDelete}
              />

              <Button
                title="Voltar"
                onPress={handleBack}
                />
            </>
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },

  loadingText: {
    fontSize: 18,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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

  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: 140,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  imageLoadingText: {
    fontSize: 12,
    color: '#666',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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

});