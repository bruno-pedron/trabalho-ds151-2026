import { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getGroupExpenses, getUserExpenses } from '@/services/expenses';
import { useAuth } from '@/hooks/useAuth';
import { Tables } from '@/database.types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function GroupExpenses() {

  const { session } = useAuth();
  const userId = session?.user.id;

  const [expenses, setExpenses] = useState<Tables<'expenses'>[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  async function loadExpenses() {

    if (!userId) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      const data = await getUserExpenses(String(userId));
      setExpenses(data || []);

    } catch (err) {
      console.error(err);
      setErrorMessage('Não foi possível carregar as despesas. Verifique sua conexão e tente novamente.');

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, [userId]);

  if (
    loading &&
    expenses.length === 0
  ) {

    return (
      <SafeAreaView style={styles.loadingContainer} >
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText} >
          Carregando despesas...
        </ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} >

      <ThemedText style={styles.title}>
        Suas despesas
      </ThemedText>


      {errorMessage ? (
        <ThemedText style={styles.errorText} >
          {errorMessage}
        </ThemedText>
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

          <ThemedView style={styles.expenseCard} >

            <ThemedText style={styles.expenseDescription} >
              {item.description}
            </ThemedText>

            <ThemedText style={styles.expenseAmount} >
              R$ {Number(item.amount).toFixed(2)}
            </ThemedText>

            <ThemedText style={styles.expenseDate} >
              {new Date(item.created_at).toLocaleDateString()}
            </ThemedText>
          </ThemedView>

        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText} >
              Nenhuma despesa paga até o momento
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
      opacity: 0.6,
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
    expenseDate: {
      fontSize: 12,
      opacity: 0.5,
      marginBottom: 16,
    },
  });
