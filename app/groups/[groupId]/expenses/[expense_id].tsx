import { useEffect, useState } from 'react';
import { Text, View, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getExpenseById } from '@/services/expenses';

export default function ExpenseDetailsScreen() {

  const {group_id, expense_id} = useLocalSearchParams();
  const [expense, setExpense] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

    console.log(
      'Editar despesa:',
      expense_id
    );

    //implementar issue #41
  }

  function handleDeleteExpense() {

    console.log(
      'Excluir despesa:',
      expense_id
    );

    //implementar issue #41
  }

  function handleBack() {

    router.back();
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

        <Text>
          Carregando despesa...
        </Text>

      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >

      <Text style={styles.title}>
        Detalhes da Despesa
      </Text>

      {
        errorMessage ? (
          <Text style={styles.errorText}>
            {errorMessage}
          </Text>
        ) : null
      }

      {
        expense && (

          <View style={styles.card}>

            <Text style={styles.label}>
              Descrição
            </Text>

            <Text style={styles.value}>
              {expense.description}
            </Text>

            <Text style={styles.label}>
              Valor
            </Text>

            <Text style={styles.value}>
              R$ {
                Number(
                  expense.amount
                ).toFixed(2)
              }
            </Text>

            <Text style={styles.label}>
              Pago por
            </Text>

            <Text style={styles.value}>
              {
                expense.users?.name ??
                'Usuário'
              }
            </Text>

            <Text style={styles.label}>
              Data
            </Text>

            <Text style={styles.value}>
              {
                new Date(
                  expense.created_at
                ).toLocaleDateString()
              }
            </Text>

            <Text style={styles.label}>
              Recibo
            </Text>

            <Text style={styles.value}>
              {
                expense.receipt_url
                  ? 'Recibo disponível'
                  : 'Nenhum recibo anexado'
              }
            </Text>

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
          title="Excluir"
          onPress={
            handleDeleteExpense
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

});