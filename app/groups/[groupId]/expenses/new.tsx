import { useState } from 'react';
import { Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
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
        undefined,
      );

      router.back();

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