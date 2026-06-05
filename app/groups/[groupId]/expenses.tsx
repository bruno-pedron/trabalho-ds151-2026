import { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getGroupExpenses } from '@/services/expenses';

export default function GroupExpenses() {

  const { groupId } = useLocalSearchParams<{ groupId: string;}>();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  async function loadExpenses() {

    if (!groupId) {
      return;
    }

    try {

      setLoading(true);
      setErrorMessage('');

      const data =
        await getGroupExpenses(
          String(groupId)
        );

      setExpenses(data || []);

    } catch (err) {

      console.error(err);

      setErrorMessage(
        'Não foi possível carregar as despesas. Verifique sua conexão e tente novamente.'
      );

    } finally {

      setLoading(false);
    }
  }

  function handleExpenseDetails(
        expense_id: string
        ) {
        router.replace({
            pathname:
            '/groups/[groupId]/expenses/[expense_id]',
            params: {
            groupId: String(groupId),
            expense_id: expense_id,
            },
        });
    }

    function handleExpenseNew(
        expense_id: string
        ) {
        router.replace({
            pathname:
            '/groups/[groupId]/expenses/new',
            params: {
            groupId: String(groupId)
            },
        });
    }

  useEffect(() => {

    loadExpenses();

  }, [groupId]);

  if (
    loading &&
    expenses.length === 0
  ) {

    return (
      <SafeAreaView
        style={
          styles.loadingContainer
        }
      >

        <ActivityIndicator
          size="large"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Carregando despesas...
        </Text>

      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >

      <Text style={styles.title}>
        Despesas do Grupo
      </Text>

      <Button
        title="Criar Despesa"
        onPress={() =>
        handleExpenseNew(groupId)
        }
    />

      {
        errorMessage ? (
          <Text
            style={
              styles.errorText
            }
          >
            {errorMessage}
          </Text>
        ) : null
      }

      <FlatList
        style={styles.list}
        data={expenses}
        keyExtractor={(item) =>
          item.id
        }
        onRefresh={loadExpenses}
        refreshing={loading}
        renderItem={({ item }) => (

          <View
            style={
              styles.expenseCard
            }
          >

            <Text
              style={
                styles.expenseDescription
              }
            >
              {item.description}
            </Text>

            <Text
              style={
                styles.expenseAmount
              }
            >
              R$ {Number(
                item.amount
              ).toFixed(2)}
            </Text>

            <Text
              style={
                styles.expenseUser
              }
            >
              Pago por:{' '}
              {item.users?.name ??
                'Usuário'}
            </Text>

            <Text
              style={
                styles.expenseDate
              }
            >
              {new Date(
                item.created_at
              ).toLocaleDateString()}
            </Text>

            <View
              style={
                styles.expenseButtons
              }
            >

              <View
                style={
                  styles.buttonContainer
                }
              >
                <Button
                  title="Detalhes"
                  onPress={() =>
                    handleExpenseDetails(
                      item.id
                    )
                  }
                />
              </View>

            </View>

          </View>

        )}
        ListEmptyComponent={
          !loading ? (
            <Text
              style={
                styles.emptyText
              }
            >
              Nenhuma despesa cadastrada neste grupo.
            </Text>
          ) : null
        }
      />

    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      alignItems: 'center',
      gap: 20,
      padding: 20,
    },

    loadingContainer: {
      flex: 1,
      justifyContent:
        'center',
      alignItems: 'center',
      gap: 20,
    },

    loadingText: {
      fontSize: 18,
    },

    title: {
      fontSize: 24,
      marginTop: 20,
      marginBottom: 20,
    },

    errorText: {
      color: 'red',
      fontSize: 16,
      textAlign: 'center',
      marginTop: 10,
      marginBottom: 10,
    },

    emptyText: {
      textAlign: 'center',
      marginTop: 30,
      fontSize: 16,
      color: '#666',
    },

    list: {
      width: '100%',
      marginTop: 20,
    },

    expenseCard: {
      width: '100%',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      backgroundColor: '#fff',
    },

    expenseDescription: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 6,
    },

    expenseAmount: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 8,
    },

    expenseUser: {
      fontSize: 14,
      color: '#666',
      marginBottom: 4,
    },

    expenseDate: {
      fontSize: 12,
      color: '#888',
      marginBottom: 16,
    },

    expenseButtons: {
      flexDirection: 'row',
      gap: 12,
    },

    buttonContainer: {
      flex: 1,
    },

  });