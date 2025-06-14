import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
}

const HomeScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = route.params;

  const handleLogout = () => {
    // Torna alla schermata di login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Ciao, {user.name}! 👋</Text>
        <Text style={styles.subtitle}>Benvenuto nel nostro diario</Text>
        
        {/* Qui andrà la copertina del diario */}
        <View style={styles.diaryPlaceholder}>
          <Text style={styles.diaryText}>📔</Text>
          <Text style={styles.diaryTitle}>Il Nostro Diario</Text>
        </View>
        
        {/* Bottone Logout */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffecd2',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 10,
  },
  diaryPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diaryText: {
    fontSize: 80,
    marginBottom: 20,
  },
  diaryTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default HomeScreen;