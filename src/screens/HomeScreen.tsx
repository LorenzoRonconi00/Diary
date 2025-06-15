import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList, Todo, Album } from '../types';
import { Colors } from '@/conts/Colors';
import { fontStyle } from '@/styles/fonts';
import { todosAPI, albumsAPI } from '../services/api';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
}

const HomeScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = route.params;

  // Todo state
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [todoText, setTodoText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTodos, setLoadingTodos] = useState(true);

  // Album state
  const [albums, setAlbums] = useState<Album[]>([]);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [albumName, setAlbumName] = useState('');
  const [albumCoverImage, setAlbumCoverImage] = useState<string | null>(null);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [loadingAlbumCreation, setLoadingAlbumCreation] = useState(false);

  // ✨ NUOVO: Profile popup state
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  // Todo functions
  const loadTodos = async () => {
    try {
      setLoadingTodos(true);
      const response = await todosAPI.getAll();
      setTodos(response.data);
    } catch (error) {
      console.error('Errore nel caricamento todos:', error);
      Alert.alert('Errore', 'Impossibile caricare i promemoria');
    } finally {
      setLoadingTodos(false);
    }
  };

  const addTodo = async () => {
    if (!todoText.trim()) {
      Alert.alert('Errore', 'Inserisci un testo per il promemoria');
      return;
    }

    try {
      setLoading(true);
      const response = await todosAPI.create({
        author: user.name,
        text: todoText.trim()
      });

      setTodos(prev => [response.data, ...prev]);
      setTodoText('');
      setShowTodoModal(false);

    } catch (error) {
      console.error('Errore creazione todo:', error);
      Alert.alert('Errore', 'Impossibile creare il promemoria');
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (todoId: string) => {
    try {
      const response = await todosAPI.toggle(todoId);
      setTodos(prev => prev.map(todo =>
        todo._id === todoId ? response.data : todo
      ));
    } catch (error) {
      console.error('Errore toggle todo:', error);
      Alert.alert('Errore', 'Impossibile aggiornare il promemoria');
    }
  };

  const deleteTodo = async (todoId: string) => {
    Alert.alert(
      'Elimina Promemoria',
      'Sei sicuro di voler eliminare questo promemoria?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              await todosAPI.delete(todoId);
              setTodos(prev => prev.filter(todo => todo._id !== todoId));
            } catch (error) {
              console.error('Errore eliminazione todo:', error);
              Alert.alert('Errore', 'Impossibile eliminare il promemoria');
            }
          }
        }
      ]
    );
  };

  // Album functions
  const loadAlbums = async () => {
    try {
      setLoadingAlbums(true);
      const response = await albumsAPI.getAll();
      setAlbums(response.data);
    } catch (error) {
      console.error('Errore nel caricamento album:', error);
      Alert.alert('Errore', 'Impossibile caricare gli album');
    } finally {
      setLoadingAlbums(false);
    }
  };

  const pickAlbumImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permesso richiesto', 'È necessario il permesso per accedere alle foto');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Quadrato per stile polaroid
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setAlbumCoverImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      console.error('Errore selezione immagine:', error);
      Alert.alert('Errore', 'Impossibile selezionare l\'immagine');
    }
  };

  const addAlbum = async () => {
    if (!albumName.trim()) {
      Alert.alert('Errore', 'Inserisci un nome per l\'album');
      return;
    }

    if (!albumCoverImage) {
      Alert.alert('Errore', 'Seleziona un\'immagine di copertina');
      return;
    }

    try {
      setLoadingAlbumCreation(true);
      const response = await albumsAPI.create({
        name: albumName.trim(),
        coverImage: albumCoverImage
      });

      setAlbums(prev => [response.data, ...prev]);
      setAlbumName('');
      setAlbumCoverImage(null);
      setShowAlbumModal(false);

    } catch (error) {
      console.error('Errore creazione album:', error);
      Alert.alert('Errore', 'Impossibile creare l\'album');
    } finally {
      setLoadingAlbumCreation(false);
    }
  };

  const deleteAlbum = async (albumId: string) => {
    Alert.alert(
      'Elimina Album',
      'Sei sicuro di voler eliminare questo album? Verranno eliminate anche tutte le sue pagine.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              await albumsAPI.delete(albumId);
              setAlbums(prev => prev.filter(album => album._id !== albumId));
            } catch (error) {
              console.error('Errore eliminazione album:', error);
              Alert.alert('Errore', 'Impossibile eliminare l\'album');
            }
          }
        }
      ]
    );
  };

  // Carica tutti i dati all'avvio
  useEffect(() => {
    loadTodos();
    loadAlbums();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* TITLE ROW */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>Ciao, {user.name}! {user.name === 'Ilaria' ? '🌻' : '🧸'}</Text>
          {/* ✨ MODIFICATO: OnPress apre popup profilo */}
          <TouchableOpacity
            style={styles.profileAvatar}
            onPress={() => setShowProfileModal(true)}
          >
            <Image
              source={user.name === 'Ilaria' ? require('../../assets/ilaria-avatar.png') : require('../../assets/lorenzo-avatar.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* TODO */}
        <View style={styles.todoContainer}>
          <View style={styles.addTodoRow}>
            <Text style={styles.addTodoText}>I tuoi promemoria</Text>
            <TouchableOpacity
              style={styles.addTodoButton}
              onPress={() => setShowTodoModal(true)}
            >
              <Text style={styles.addTodoButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.todoBox}>
            {loadingTodos ? (
              <ActivityIndicator size="large" color={Colors.darkBrown} />
            ) : todos.length === 0 ? (
              <Text style={styles.noTodosText}>Nessun promemoria ancora</Text>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {todos.map((todo) => (
                  <TouchableOpacity
                    key={todo._id}
                    style={[styles.todoItem, todo.completed && styles.todoItemCompleted]}
                    onPress={() => toggleTodo(todo._id)}
                    onLongPress={() => deleteTodo(todo._id)}
                  >
                    <View style={styles.todoContent}>
                      <Image
                        source={todo.author === 'Ilaria' ? require('../../assets/ilaria-avatar.png') : require('../../assets/lorenzo-avatar.png')}
                        style={styles.todoAvatar}
                        resizeMode="contain"
                      />
                      <Text style={[styles.todoItemText, todo.completed && styles.todoItemTextCompleted]}>
                        {todo.text}
                      </Text>
                      <Text style={styles.todoCheck}>
                        {todo.completed ? '✅' : '⭕'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Scotch image nell'angolo in basso a sinistra */}
            <Image
              source={require('../../assets/scotch.png')}
              style={styles.scotchImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* ALBUMS - ✨ RIMOSSO il bottone logout da qui */}
        <View style={styles.albumContainer}>
          <View style={styles.addAlbumRow}>
            <Text style={styles.addAlbumText}>Gli album</Text>
            <TouchableOpacity
              style={styles.addAlbumButton}
              onPress={() => setShowAlbumModal(true)}
            >
              <Text style={styles.addAlbumButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.albumBox}>
            {loadingAlbums ? (
              <ActivityIndicator size="large" color={Colors.darkBrown} />
            ) : albums.length === 0 ? (
              <Text style={styles.noAlbumsText}>Nessun album ancora</Text>
            ) : (
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.albumScrollContainer}
              >
                {albums.map((album) => (
                  <TouchableOpacity
                    key={album._id}
                    style={styles.albumItem}
                    onPress={() => {
                      navigation.navigate('AlbumDetail', { user, album });
                    }}
                    onLongPress={() => deleteAlbum(album._id)}
                  >
                    {/* Album background */}
                    <Image
                      source={require('../../assets/album.png')}
                      style={styles.albumBackground}
                      resizeMode="contain"
                    />

                    {/* Polaroid con immagine e nome */}
                    <View style={styles.polaroidContainer}>
                      <View style={styles.polaroid}>
                        <Image
                          source={{ uri: album.coverImage }}
                          style={styles.polaroidImage}
                          resizeMode="cover"
                        />
                        <Text style={styles.polaroidText}>{album.name}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </View>

      {/* ✨ NUOVO: Modal profilo con bottone logout */}
      <Modal
        visible={showProfileModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <TouchableOpacity
          style={styles.profileModalOverlay}
          activeOpacity={1}
          onPress={() => setShowProfileModal(false)}
        >
          <View style={styles.profileModalContent}>
            <View style={styles.profileInfo}>
              <Image
                source={user.name === 'Ilaria' ? require('../../assets/ilaria-avatar.png') : require('../../assets/lorenzo-avatar.png')}
                style={styles.profileModalAvatar}
                resizeMode="contain"
              />
              <Text style={styles.profileModalName}>{user.name}</Text>
            </View>

            <View style={styles.profileActions}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => {
                  setShowProfileModal(false);
                  setTimeout(handleLogout, 300); // Piccolo delay per animazione
                }}
              >
                <Text style={styles.logoutIcon}>👋</Text>
                <Text style={styles.logoutText}>Esci</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal per aggiungere todo */}
      <Modal
        visible={showTodoModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTodoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuovo Promemoria</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Scrivi il tuo promemoria..."
              value={todoText}
              onChangeText={setTodoText}
              multiline={true}
              maxLength={500}
              autoFocus={true}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowTodoModal(false);
                  setTodoText('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Annulla</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={addTodo}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.modalButtonTextSave}>Salva</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal per aggiungere album */}
      <Modal
        visible={showAlbumModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAlbumModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuovo Album</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nome dell'album..."
              value={albumName}
              onChangeText={setAlbumName}
              maxLength={100}
              autoFocus={true}
            />

            {/* Selezione immagine */}
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={pickAlbumImage}
            >
              {albumCoverImage ? (
                <Image
                  source={{ uri: albumCoverImage }}
                  style={styles.selectedImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>📸</Text>
                  <Text style={styles.imagePlaceholderSubtext}>Tocca per selezionare</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowAlbumModal(false);
                  setAlbumName('');
                  setAlbumCoverImage(null);
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Annulla</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={addAlbum}
                disabled={loadingAlbumCreation}
              >
                {loadingAlbumCreation ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.modalButtonTextSave}>Crea Album</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBrown,
  },
  content: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    gap: 10,
  },
  titleRow: {
    flex: 0.1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    ...fontStyle('regular'),
    color: Colors.textBrown,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.55,
    shadowRadius: 4,
    // ✨ AGGIUNTO: Effetti per indicare che è cliccabile
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  todoContainer: {
    flex: 1,
    marginVertical: 20,
    paddingTop: 20,
    flexDirection: 'column',
    gap: 20,
  },
  addTodoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addTodoText: {
    fontSize: 28,
    ...fontStyle('regular'),
    color: Colors.darkBrown,
  },
  addTodoButton: {
    backgroundColor: Colors.darkBrown,
    borderRadius: 100,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.55,
    shadowRadius: 4,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTodoButtonText: {
    color: Colors.white,
    fontSize: 30,
    textAlign: 'center',
    lineHeight: 40,
    textAlignVertical: 'center',
  },
  todoBox: {
    flex: 1,
    backgroundColor: Colors.cream,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'column',
    position: 'relative',
  },
  noTodosText: {
    textAlign: 'center',
    color: Colors.darkBrown,
    fontSize: 16,
    ...fontStyle('regular'),
    marginTop: 50,
  },
  todoItem: {
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  todoItemCompleted: {
    opacity: 0.6,
    backgroundColor: '#f0f0f0',
  },
  todoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  todoAvatar: {
    width: 30,
    height: 30,
  },
  todoItemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.darkBrown,
    ...fontStyle('regular'),
  },
  todoItemTextCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textBrown,
  },
  todoCheck: {
    fontSize: 18,
  },
  scotchImage: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 40,
    height: 40,
    opacity: 0.7,
    zIndex: 1,
  },
  albumContainer: {
    flex: 1,
    marginVertical: 20,
    flexDirection: 'column',
    gap: 20,
  },
  addAlbumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addAlbumText: {
    fontSize: 28,
    ...fontStyle('regular'),
    color: Colors.darkBrown,
  },
  addAlbumButton: {
    backgroundColor: Colors.darkBrown,
    borderRadius: 100,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.55,
    shadowRadius: 4,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAlbumButtonText: {
    color: Colors.white,
    fontSize: 30,
    textAlign: 'center',
    lineHeight: 40,
    textAlignVertical: 'center',
  },
  albumBox: {
    flex: 1,
    backgroundColor: Colors.cream,
    padding: 15,
    borderRadius: 10,
    minHeight: 200,
  },
  noAlbumsText: {
    textAlign: 'center',
    color: Colors.darkBrown,
    fontSize: 16,
    ...fontStyle('regular'),
    marginTop: 50,
  },
  albumScrollContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  albumItem: {
    width: 150,
    height: 180,
    marginRight: 15,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  polaroidContainer: {
    position: 'absolute',
    top: '20%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  polaroid: {
    backgroundColor: Colors.white,
    padding: 8,
    borderRadius: 4,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ rotate: '-5deg' }],
  },
  polaroidImage: {
    width: 80,
    height: 80,
    borderRadius: 2,
    backgroundColor: Colors.lightBrown,
  },
  polaroidText: {
    marginTop: 8,
    fontSize: 12,
    ...fontStyle('regular'),
    color: Colors.darkBrown,
    textAlign: 'center',
    maxWidth: 80,
  },

  // ✨ NUOVO: Stili per il popup profilo
  profileModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 30,
  },
  profileModalContent: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 20,
    minWidth: 200,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileModalAvatar: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  profileModalName: {
    fontSize: 20,
    ...fontStyle('regular'),
    color: Colors.darkBrown,
    marginBottom: 5,
  },
  profileActions: {
    borderTopWidth: 1,
    borderTopColor: Colors.lightBrown,
    paddingTop: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.darkBrown,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  logoutIcon: {
    fontSize: 18,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    ...fontStyle('regular'),
  },

  // Modal styles esistenti
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    ...fontStyle('regular'),
    color: Colors.darkBrown,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.lightBrown,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    ...fontStyle('regular'),
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: Colors.lightBrown,
  },
  modalButtonSave: {
    backgroundColor: Colors.darkBrown,
  },
  modalButtonTextCancel: {
    color: Colors.darkBrown,
    fontSize: 16,
    ...fontStyle('regular'),
  },
  modalButtonTextSave: {
    color: Colors.white,
    fontSize: 16,
    ...fontStyle('regular'),
  },
  // Album modal specific styles
  imagePickerButton: {
    width: '100%',
    height: 150,
    borderWidth: 2,
    borderColor: Colors.lightBrown,
    borderStyle: 'dashed',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightBrown + '20',
  },
  imagePlaceholderText: {
    fontSize: 40,
    marginBottom: 10,
  },
  imagePlaceholderSubtext: {
    fontSize: 14,
    color: Colors.darkBrown,
    ...fontStyle('regular'),
  },
});

export default HomeScreen;