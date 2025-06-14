import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LoginScreenNavigationProp } from '../navigation/types';
import { authAPI } from '../services/api';
import { User } from '../types';

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (name: 'Ilaria' | 'Lorenzo'): Promise<void> => {
    setLoading(true);
    try {
      const response = await authAPI.login(name);
      const { success, user } = response.data;

      if (success) {
        navigation.navigate('Home', { user });
      } else {
        Alert.alert('Errore', 'Login fallito');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Errore', 'Impossibile connettersi al server');
    } finally {
      setLoading(false);
    }
  };

  const UserButton: React.FC<{
    name: 'Ilaria' | 'Lorenzo';
    emoji: string;
    colors: readonly [string, string];
  }> = ({ name, emoji, colors }) => (
    <TouchableOpacity
      style={styles.userButton}
      onPress={() => handleLogin(name)}
      disabled={loading}
    >
      <LinearGradient colors={colors} style={styles.buttonGradient}>
        <View style={styles.userAvatar}>
          <Text style={styles.avatarEmoji}>{emoji}</Text>
        </View>
        <Text style={styles.buttonText}>Accedi come {name}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.appTitle}>L&apos;hai fatta la fota?</Text>
          <Image source={require('../../assets/polaroid.png')} />

          <View style={styles.userSelection}>
            <UserButton
              name="Ilaria"
              emoji="👩🏻"
              colors={['#ff9a9e', '#fecfef'] as const}
            />
            <UserButton
              name="Lorenzo"
              emoji="👨🏻"
              colors={['#a8edea', '#fed6e3'] as const}
            />
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Accesso in corso...</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C0A08B'
  },
  gradient: {
    flex: 1,
    paddingVertical: '10%',
    paddingHorizontal: '10%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 25,
    fontFamily: 'HelloValentica',
    fontWeight: '500',
    color: '#3A2824',
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 60,
    textAlign: 'center',
  },
  userSelection: {
    width: '100%',
    gap: 20,
  },
  userButton: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30,
    gap: 15,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  loadingContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
  },
});

export default LoginScreen;