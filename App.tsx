import 'react-native-gesture-handler';

import React, { useState, useEffect, JSX } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { View, Text, ActivityIndicator } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import DiaryScreen from './src/screens/DiaryScreen';
import EditorScreen from './src/screens/EditorScreen';
import { RootStackParamList } from './src/types';
import AlbumDetailScreen from './src/screens/AlbumDetailScreen';

const Stack = createStackNavigator<RootStackParamList>();

// Componente di loading per i font
const FontLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'HelloValentica': require('./assets/fonts/Hello Valentica.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Errore nel caricamento dei font:', error);
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={{ marginTop: 10 }}>Caricamento font...</Text>
      </View>
    );
  }

  return <>{children}</>;
};

export default function App(): JSX.Element {
  return (
    <FontLoader>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AlbumDetail" component={AlbumDetailScreen} />
          <Stack.Screen name="Diary" component={DiaryScreen} />
          <Stack.Screen name="Editor" component={EditorScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </FontLoader>
  );
}