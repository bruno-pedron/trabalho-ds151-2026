import { useEffect, useState } from 'react';
import { Text, Button, StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { getExpenseById, updateExpense, deleteExpense } from '@/services/expenses';

export default function EditExpenseScreen() {

  const { groupId, expense_id, } = useLocalSearchParams();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

      await deleteExpense(
        String(expense_id)
      );

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

});