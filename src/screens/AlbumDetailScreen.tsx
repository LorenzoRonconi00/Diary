import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Image,
    TextInput,
    Alert,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList, AlbumPage, PageContent } from '../types';
import { Colors } from '@/conts/Colors';
import { fontStyle } from '@/styles/fonts';
import { albumsAPI } from '../services/api';

type AlbumDetailNavigationProp = StackNavigationProp<RootStackParamList, 'AlbumDetail'>;
type AlbumDetailRouteProp = RouteProp<RootStackParamList, 'AlbumDetail'>;

interface Props {
    navigation: AlbumDetailNavigationProp;
    route: AlbumDetailRouteProp;
}

const { width: screenWidth } = Dimensions.get('window');

const AlbumDetailScreen: React.FC<Props> = ({ navigation, route }) => {
    const { user, album } = route.params;

    // State
    const [pages, setPages] = useState<AlbumPage[]>([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Edit mode state
    const [editingContents, setEditingContents] = useState<PageContent[]>([]);
    const [newTextContent, setNewTextContent] = useState('');

    const currentPage = pages[currentPageIndex];

    // Load album pages
    const loadPages = async () => {
        try {
            setLoading(true);
            const response = await albumsAPI.getPages(album._id);

            if (response.data.length === 0) {
                // Se non ci sono pagine, crea la prima pagina vuota
                await createEmptyPage();
            } else {
                setPages(response.data);
            }
        } catch (error) {
            console.error('Errore caricamento pagine:', error);
            Alert.alert('Errore', 'Impossibile caricare le pagine dell\'album');
        } finally {
            setLoading(false);
        }
    };

    // Create empty page
    const createEmptyPage = async () => {
        try {
            const response = await albumsAPI.createPage(album._id, []);
            setPages([response.data]);
        } catch (error) {
            console.error('Errore creazione pagina:', error);
            Alert.alert('Errore', 'Impossibile creare la pagina');
        }
    };

    // Navigation functions
    const goToPreviousPage = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(currentPageIndex - 1);
            exitEditMode();
        }
    };

    const goToNextPage = () => {
        if (currentPageIndex < pages.length - 1) {
            setCurrentPageIndex(currentPageIndex + 1);
            exitEditMode();
        }
    };

    // Edit mode functions
    const enterEditMode = () => {
        setIsEditMode(true);
        setEditingContents([...(currentPage?.contents || [])]);
    };

    const exitEditMode = () => {
        setIsEditMode(false);
        setEditingContents([]);
        setNewTextContent('');
    };

    // Add text content
    const addTextContent = () => {
        if (!newTextContent.trim()) {
            Alert.alert('Errore', 'Inserisci del testo');
            return;
        }

        const newContent: PageContent = {
            type: 'text',
            content: newTextContent.trim(),
            position: { x: 50, y: editingContents.length * 100 + 50 }
        };

        setEditingContents(prev => [...prev, newContent]);
        setNewTextContent('');
    };

    // Add image content
    const addImageContent = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert('Permesso richiesto', 'È necessario il permesso per accedere alle foto');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled && result.assets[0].base64) {
                const newContent: PageContent = {
                    type: 'image',
                    content: `data:image/jpeg;base64,${result.assets[0].base64}`,
                    position: { x: 50, y: editingContents.length * 100 + 50 }
                };

                setEditingContents(prev => [...prev, newContent]);
            }
        } catch (error) {
            console.error('Errore selezione immagine:', error);
            Alert.alert('Errore', 'Impossibile selezionare l\'immagine');
        }
    };

    // Remove content
    const removeContent = (index: number) => {
        setEditingContents(prev => prev.filter((_, i) => i !== index));
    };

    // Save page
    const savePage = async () => {
        if (!currentPage) return;

        try {
            setSaving(true);

            // Update current page
            await albumsAPI.updatePage(album._id, currentPage._id, editingContents);

            // Update local state
            const updatedPages = [...pages];
            updatedPages[currentPageIndex] = {
                ...currentPage,
                contents: editingContents
            };
            setPages(updatedPages);

            // Se la pagina aveva contenuto vuoto ed ora ne ha, crea una nuova pagina
            if (currentPage.contents.length === 0 && editingContents.length > 0) {
                if (currentPageIndex === pages.length - 1) {
                    const newPageResponse = await albumsAPI.createPage(album._id, []);
                    setPages(prev => [...prev, newPageResponse.data]);
                }
            }

            exitEditMode();
            Alert.alert('Successo', 'Pagina salvata!');

        } catch (error) {
            console.error('Errore salvataggio:', error);
            Alert.alert('Errore', 'Impossibile salvare la pagina');
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        loadPages();
    }, []);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.darkBrown} />
                    <Text style={styles.loadingText}>Caricamento album...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <SafeAreaView style={styles.container}>
                {/* Header - rimane uguale */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>← Indietro</Text>
                    </TouchableOpacity>

                    <Text style={styles.albumTitle}>{album.name}</Text>

                    {isEditMode ? (
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={savePage}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text style={styles.saveButtonText}>Salva</Text>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.headerSpacer} />
                    )}
                </View>

                {/* Page Content */}
                <View style={styles.pageContainer}>
                    {isEditMode ? (
                        // Edit Mode
                        <TouchableWithoutFeedback onPress={dismissKeyboard}>
                            <View style={styles.editContainer}>
                                <ScrollView style={styles.editContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                                    <Text style={styles.editTitle}>Modifica Pagina {currentPageIndex + 1}</Text>

                                    {/* Current contents */}
                                    {editingContents.map((content, index) => (
                                        <View key={index} style={styles.contentItem}>
                                            {content.type === 'text' ? (
                                                <Text style={styles.contentText}>{content.content}</Text>
                                            ) : (
                                                <Image source={{ uri: content.content }} style={styles.contentImage} />
                                            )}
                                            <TouchableOpacity
                                                style={styles.removeButton}
                                                onPress={() => removeContent(index)}
                                            >
                                                <Text style={styles.removeButtonText}>✕</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}

                                    {/* Add content section */}
                                    <View style={styles.addContentSection}>
                                        <Text style={styles.addContentTitle}>Aggiungi contenuto:</Text>

                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Scrivi del testo..."
                                            value={newTextContent}
                                            onChangeText={setNewTextContent}
                                            multiline
                                            onSubmitEditing={dismissKeyboard}
                                        />

                                        <View style={styles.addButtonsRow}>
                                            <TouchableOpacity style={styles.addButton} onPress={addTextContent}>
                                                <Text style={styles.addButtonText}>📝 Aggiungi Testo</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity style={styles.addButton} onPress={addImageContent}>
                                                <Text style={styles.addButtonText}>📸 Aggiungi Foto</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </ScrollView>
                            </View>
                        </TouchableWithoutFeedback>
                    ) : (
                        // View Mode
                        <View style={styles.viewContainer}>
                            {currentPage?.contents.length === 0 ? (
                                <View style={styles.emptyPage}>
                                    <Text style={styles.emptyPageText}>Pagina vuota</Text>
                                    <Text style={styles.emptyPageSubtext}>Premi Modifica per aggiungere contenuti</Text>
                                </View>
                            ) : (
                                <ScrollView style={styles.pageContent}>
                                    {currentPage?.contents.map((content, index) => (
                                        <View key={index} style={styles.viewContentItem}>
                                            {content.type === 'text' ? (
                                                <Text style={styles.viewContentText}>{content.content}</Text>
                                            ) : (
                                                <Image source={{ uri: content.content }} style={styles.viewContentImage} />
                                            )}
                                        </View>
                                    ))}
                                </ScrollView>
                            )}
                        </View>
                    )}

                    {/* ✨ NUOVO: Page Number DENTRO pageContainer */}
                    <View style={styles.pageNumber}>
                        <Text style={styles.pageNumberText}>
                            {currentPageIndex + 1} / {pages.length}
                        </Text>
                    </View>
                </View>

                {/* Bottom Navigation - rimane uguale ma SENZA page number */}
                <View style={styles.bottomNav}>
                    <TouchableOpacity
                        style={[styles.navButton, currentPageIndex === 0 && styles.navButtonDisabled]}
                        onPress={goToPreviousPage}
                        disabled={currentPageIndex === 0}
                    >
                        <Text style={[styles.navButtonText, currentPageIndex === 0 && styles.navButtonTextDisabled]}>
                            ← Precedente
                        </Text>
                    </TouchableOpacity>

                    {!isEditMode && (
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={enterEditMode}
                        >
                            <Text style={styles.editButtonText}>✏️ Modifica</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.navButton, currentPageIndex === pages.length - 1 && styles.navButtonDisabled]}
                        onPress={goToNextPage}
                        disabled={currentPageIndex === pages.length - 1}
                    >
                        <Text style={[styles.navButtonText, currentPageIndex === pages.length - 1 && styles.navButtonTextDisabled]}>
                            Successiva →
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.lightBrown,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: Colors.darkBrown,
        ...fontStyle('regular'),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightBrown,
    },
    backButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    backButtonText: {
        fontSize: 16,
        color: Colors.darkBrown,
        ...fontStyle('regular'),
    },
    albumTitle: {
        fontSize: 20,
        ...fontStyle('regular'),
        color: Colors.darkBrown,
        flex: 1,
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: Colors.darkBrown,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    saveButtonText: {
        color: Colors.white,
        fontSize: 14,
        ...fontStyle('regular'),
    },
    headerSpacer: {
        width: 60,
    },
    pageContainer: {
        flex: 1,
        margin: 20,
        backgroundColor: Colors.white,
        borderRadius: 15,
        padding: 20,
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        position: 'relative'
    },
    // View Mode Styles
    viewContainer: {
        flex: 1,
    },
    emptyPage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyPageText: {
        fontSize: 24,
        color: Colors.textBrown,
        ...fontStyle('regular'),
        marginBottom: 10,
    },
    emptyPageSubtext: {
        fontSize: 16,
        color: Colors.textBrown,
        ...fontStyle('regular'),
        textAlign: 'center',
    },
    pageContent: {
        flex: 1,
    },
    viewContentItem: {
        marginBottom: 20,
    },
    viewContentText: {
        fontSize: 18,
        color: Colors.darkBrown,
        ...fontStyle('regular'),
        lineHeight: 24,
    },
    viewContentImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        resizeMode: 'cover',
    },
    // Edit Mode Styles
    editContainer: {
        flex: 1,
    },
    editContent: {
        flex: 1,
    },
    editTitle: {
        fontSize: 22,
        ...fontStyle('regular'),
        color: Colors.darkBrown,
        marginBottom: 20,
        textAlign: 'center',
    },
    contentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.cream,
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    contentText: {
        flex: 1,
        fontSize: 16,
        color: Colors.darkBrown,
        ...fontStyle('regular'),
    },
    contentImage: {
        flex: 1,
        height: 80,
        borderRadius: 5,
        resizeMode: 'cover',
    },
    removeButton: {
        backgroundColor: '#e74c3c',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    removeButtonText: {
        color: 'white',
        fontSize: 16,
    },
    addContentSection: {
        marginTop: 20,
        padding: 15,
        backgroundColor: Colors.lightBrown + '30',
        borderRadius: 10,
    },
    addContentTitle: {
        fontSize: 18,
        ...fontStyle('regular'),
        color: Colors.darkBrown,
        marginBottom: 15,
    },
    textInput: {
        borderWidth: 1,
        borderColor: Colors.lightBrown,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        ...fontStyle('regular'),
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 15,
        backgroundColor: Colors.white,
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    addButtonsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    addButton: {
        flex: 1,
        backgroundColor: Colors.darkBrown,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: Colors.white,
        fontSize: 14,
        ...fontStyle('regular'),
    },
    // Bottom Navigation
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.lightBrown,
    },
    navButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: Colors.darkBrown,
        borderRadius: 20,
        minWidth: 100,
        alignItems: 'center',
    },
    navButtonDisabled: {
        backgroundColor: Colors.lightBrown,
    },
    navButtonText: {
        color: Colors.white,
        fontSize: 14,
        ...fontStyle('regular'),
    },
    navButtonTextDisabled: {
        color: Colors.textBrown,
    },
    editButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#f39c12',
        borderRadius: 25,
    },
    editButtonText: {
        color: Colors.white,
        fontSize: 16,
        ...fontStyle('regular'),
    },
    pageNumber: {
        position: 'absolute',
        bottom: 15,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10
    },
    pageNumberText: {
        fontSize: 14,
        color: Colors.darkBrown,
        ...fontStyle('regular'),
        backgroundColor: Colors.white,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: Colors.lightBrown + '50',
    },
});

export default AlbumDetailScreen;