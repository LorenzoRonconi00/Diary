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
  Animated,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LoginScreenNavigationProp } from '../navigation/types';
import { authAPI } from '../services/api';
import { User } from '../types';
import { Colors } from '@/conts/Colors';
import { fontStyle } from '@/styles/fonts';

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
  image: any;
}> = ({ name, image }) => {
  const scaleValue = new Animated.Value(1);

  return (
    <Pressable
      style={styles.userButton}
      onPress={() => handleLogin(name)}
      onPressIn={() => {
        Animated.timing(scaleValue, {
          toValue: 0.96,
          duration: 100,
          useNativeDriver: true,
        }).start();
      }}
      onPressOut={() => {
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }).start();
      }}
      disabled={loading}
    >
      <Animated.View 
        style={[
          name === 'Ilaria' 
            ? {...styles.buttonGradient, backgroundColor: Colors.pink} 
            : {...styles.buttonGradient, backgroundColor: Colors.green},
          { transform: [{ scale: scaleValue }] }
        ]}
      >
        <View style={styles.userAvatar}>
          <Image style={styles.avatarImage} source={image} />
        </View>
        <Text style={styles.buttonText}>Entra come {name}</Text>
      </Animated.View>
    </Pressable>
  );
};

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* TITLE */}
          <Text style={styles.appTitle}>L&apos;hai fatta la fota?</Text>

          {/* POLAROID IMAGE */}
          <Image source={require('../../assets/polaroid.png')} />

          {/* LOGIN BUTTONS */}
          <View style={styles.userSelection}>
            <UserButton
              name="Ilaria"
              image={require('../../assets/ilaria-avatar.png')}
            />
            <UserButton
              name="Lorenzo"
              image={require('../../assets/lorenzo-avatar.png')}
            />
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.textBrown} />
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
    fontSize: 35,
    ...fontStyle('regular'),
    color: '#3A2824',
    textAlign: 'center',
  },
  userSelection: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  userButton: {
    width: '90%',
    borderRadius: 20,
    elevation: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    backgroundColor: 'transparent'
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 20,
    paddingHorizontal: 30,
    gap: 20,
    backgroundColor: Colors.pink,
    borderRadius: 20,
    overflow: 'hidden',
  },
  userAvatar: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  buttonText: {
    fontSize: 25,
    ...fontStyle('regular'),
    color: Colors.textBrown,
  },
  loadingContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 20,
    ...fontStyle('regular'),
    color: Colors.textBrown,
  },
});

export default LoginScreen;