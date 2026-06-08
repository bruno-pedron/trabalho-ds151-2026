import { useEffect, useState } from 'react';
import { Text, View, Button, StyleSheet, ActivityIndicator, Image, Modal, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getExpenseById, getReceiptSignedUrl } from '@/services/expenses';
import { ThemedText } from '@/components/themed-text';

export default function ExpenseDetailsScreen() {

  const { groupId, expense_id } = useLocalSearchParams();
  const [expense, setExpense] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  async function loadExpense() {

    if (!expense_id) {
      return;
    }

    try {

      setLoading(true);
      setErrorMessage('');

      const data =
        await getExpenseById(
          String(expense_id)
        );

      setExpense(data);

      if (data.receipt_url) {
        setImageLoading(true);
        const signedUrl = data.receipt_url.startsWith('http')
          ? data.receipt_url
          : await getReceiptSignedUrl(data.receipt_url);

        setReceiptUri(signedUrl);
      } else {
        setReceiptUri(null);
        setImageLoading(false);
      }

    } catch (err) {

      console.error(err);

      setErrorMessage(
        'Não foi possível carregar os detalhes da despesa.'
      );

    } finally {

      setLoading(false);
    }
  }

  function handleEditExpense() {

    router.replace({
      pathname:
        '/groups/[groupId]/expenses/[expense_id]/edit',

      params: {
        groupId: String(groupId),
        expense_id: String(expense_id),
      },
    });
  }

  function handleBack() {

    router.replace({
      pathname:
        '/groups/[groupId]/expenses',

      params: {
        groupId: String(groupId)
      },
    });
  }

  useEffect(() => {

    loadExpense();

  }, [expense_id]);

  if (loading) {

    return (
      <SafeAreaView
        style={styles.loadingContainer}
      >

        <ActivityIndicator size="large" />

        <ThemedText>
          Carregando despesa...
        </ThemedText>

      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >

      <ThemedText style={styles.title}>
        Detalhes da Despesa
      </ThemedText>

      {
        errorMessage ? (
          <ThemedText style={styles.errorText}>
            {errorMessage}
          </ThemedText>
        ) : null
      }

      {
        expense && (

          <View style={styles.card}>

            <ThemedText style={styles.label}>
              Descrição
            </ThemedText>

            <ThemedText style={styles.value}>
              {expense.description}
            </ThemedText>

            <ThemedText style={styles.label}>
              Valor
            </ThemedText>

            <ThemedText style={styles.value}>
              R$ {
                Number(
                  expense.amount
                ).toFixed(2)
              }
            </ThemedText>

            <ThemedText style={styles.label}>
              Pago por
            </ThemedText>

            <ThemedText style={styles.value}>
              {
                expense.users?.name ??
                'Usuário'
              }
            </ThemedText>

            <ThemedText style={styles.label}>
              Data
            </ThemedText>

            <ThemedText style={styles.value}>
              {
                new Date(
                  expense.created_at
                ).toLocaleDateString()
              }
            </ThemedText>

            <ThemedText style={styles.label}>
              Recibo
            </ThemedText>

            {receiptUri ? (
              <Pressable onPress={() => setIsReceiptOpen(true)} style={styles.receiptPreviewWrap}>
                <Image
                  source={{ uri: receiptUri }}
                  style={styles.receiptImage}
                  onLoadStart={() => setImageLoading(true)}
                  onLoadEnd={() => setImageLoading(false)}
                />

                {imageLoading ? (
                  <View style={styles.imageLoadingOverlay}>
                    <ActivityIndicator size="small" />
                    <ThemedText style={styles.imageLoadingText}>
                      Carregando recibo...
                    </ThemedText>
                  </View>
                ) : null}
              </Pressable>
            ) : (
              <ThemedText style={styles.value}>
                Nenhum recibo anexado
              </ThemedText>
            )}

          </View>
        )
      }

      <View style={styles.buttonContainer}>
        <Button
          title="Editar"
          onPress={
            handleEditExpense
          }
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Voltar"
          onPress={
            handleBack
          }
        />
      </View>

      <Modal
        visible={isReceiptOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsReceiptOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setIsReceiptOpen(false)}>
          <View style={styles.modalContent}>
            {receiptUri ? (
              <Image source={{ uri: receiptUri }} style={styles.fullScreenImage} resizeMode="contain" />
            ) : null}
          </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },

  value: {
    fontSize: 18,
    marginBottom: 8,
  },

  errorText: {
    color: 'red',
    textAlign: 'center',
  },

  buttonContainer: {
    marginTop: 8,
  },

  receiptImage: {
    width: 140,
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  receiptPreviewWrap: {
    position: 'relative',
    alignSelf: 'flex-start',
  },

  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 140,
    height: 200,
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

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },

  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  fullScreenImage: {
    width: '100%',
    height: '100%',
  },

});
