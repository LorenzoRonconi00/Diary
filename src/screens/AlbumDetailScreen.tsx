import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    Dimensions,
    Keyboard,
    TouchableWithoutFeedback,
    Modal,
    TextInput,
    Animated,
    ScrollView,
    Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootStackParamList, AlbumPage, PageContent, PositionedElement } from '../types';
import { Colors } from '@/conts/Colors';
import { fontStyle } from '@/styles/fonts';
import { albumsAPI } from '../services/api';
import DraggableElement from '../components/DraggableElement';
import FloatingToolbar from '../components/FloatingToolbar';
import { SpotifyTrack } from '@/services/spotifyAPI';
import { GiphySticker, GiphyCategory } from '@/services/giphyAPI';

type AlbumDetailNavigationProp = StackNavigationProp<RootStackParamList, 'AlbumDetail'>;
type AlbumDetailRouteProp = RouteProp<RootStackParamList, 'AlbumDetail'>;

interface Props {
    navigation: AlbumDetailNavigationProp;
    route: AlbumDetailRouteProp;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AlbumDetailScreen: React.FC<Props> = ({ navigation, route }) => {
    const { user, album } = route.params;

    // State
    const [pages, setPages] = useState<AlbumPage[]>([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Drag & Drop state
    const [elements, setElements] = useState<PositionedElement[]>([]);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [showTextInput, setShowTextInput] = useState(false);
    const [newTextContent, setNewTextContent] = useState('');
    const [canvasSize, setCanvasSize] = useState({ width: screenWidth - 80, height: screenHeight - 300 });

    const [showDeleteZone, setShowDeleteZone] = useState(false);
    const [deleteZoneOpacity] = useState(new Animated.Value(0));
    const [deleteZoneSize] = useState({ width: 60, height: 60 });
    const [deleteZonePosition, setDeleteZonePosition] = useState({ x: 0, y: 0 });
    const [isDraggingElement, setIsDraggingElement] = useState(false);
    const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
    const [isInDeleteZone, setIsInDeleteZone] = useState(false);

    const [showSpotifySearch, setShowSpotifySearch] = useState(false);
    const [spotifySearchQuery, setSpotifySearchQuery] = useState('');
    const [spotifySearchResults, setSpotifySearchResults] = useState<SpotifyTrack[]>([]);
    const [spotifySearchLoading, setSpotifySearchLoading] = useState(false);
    const [pendingSpotifyPosition, setPendingSpotifyPosition] = useState<{ x: number; y: number } | null>(null);

    const [showStickerSearch, setShowStickerSearch] = useState(false);
    const [stickerSearchQuery, setStickerSearchQuery] = useState('');
    const [stickerSearchResults, setStickerSearchResults] = useState<GiphySticker[]>([]);
    const [stickerSearchLoading, setStickerSearchLoading] = useState(false);
    const [pendingStickerPosition, setPendingStickerPosition] = useState<{ x: number; y: number } | null>(null);
    const [stickerCategories, setStickerCategories] = useState<GiphyCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [trendingStickers, setTrendingStickers] = useState<GiphySticker[]>([]);

    const currentPage = pages[currentPageIndex];

    // LOAD AND CONVERT PAGES
    const loadPages = async () => {
        try {
            setLoading(true);
            const response = await albumsAPI.getPages(album._id);

            if (response.data.length === 0) {
                await createEmptyPage();
            } else {
                setPages(response.data);
                convertPageToElements(response.data[currentPageIndex]);
            }
        } catch (error) {
            console.error('Errore caricamento pagine:', error);
            Alert.alert('Errore', 'Impossibile caricare le pagine dell\'album');
        } finally {
            setLoading(false);
        }
    };

    const searchSpotifyTracks = async (query: string) => {
        if (!query.trim()) {
            setSpotifySearchResults([]);
            return;
        }

        try {
            console.log('🔍 Frontend: Searching for:', query);
            setSpotifySearchLoading(true);

            const response = await albumsAPI.searchSpotifyTracks(query);

            console.log('✅ Frontend: Search response received');
            console.log('📊 Frontend: Found tracks:', response.data.tracks.items.length);

            setSpotifySearchResults(response.data.tracks.items);
        } catch (error) {
            console.error('❌ Frontend: Error searching Spotify:', error);
            if (typeof error === 'object' && error !== null && 'response' in error) {
                // @ts-expect-error: dynamic error shape
                console.error('❌ Frontend: Error details:', error.response?.data);
            }
            Alert.alert('Errore', 'Impossibile cercare brani su Spotify');
        } finally {
            setSpotifySearchLoading(false);
        }
    };

    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchSpotifyTracks(spotifySearchQuery);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [spotifySearchQuery]);

    useEffect(() => {
        const loadStickerData = async () => {
            try {
                const [categoriesResponse, trendingResponse] = await Promise.all([
                    albumsAPI.getStickerCategories(),
                    albumsAPI.getTrendingStickers()
                ]);

                setStickerCategories(categoriesResponse.data.categories);
                setTrendingStickers(trendingResponse.data.data);
            } catch (error) {
                console.error('Error loading sticker data:', error);
            }
        };

        loadStickerData();
    }, []);

    const searchGiphyStickers = async (query: string) => {
        if (!query.trim()) {
            setStickerSearchResults([]);
            return;
        }

        try {
            console.log('🎨 Frontend: Searching stickers for:', query);
            setStickerSearchLoading(true);

            const response = await albumsAPI.searchGiphyStickers(query);

            console.log('✅ Frontend: Sticker search response received');
            console.log('🎨 Frontend: Found stickers:', response.data.data.length);

            setStickerSearchResults(response.data.data);
        } catch (error) {
            console.error('❌ Frontend: Error searching stickers:', error);
            Alert.alert('Errore', 'Impossibile cercare sticker');
        } finally {
            setStickerSearchLoading(false);
        }
    };

    useEffect(() => {
        if (stickerSearchQuery) {
            const timeoutId = setTimeout(() => {
                searchGiphyStickers(stickerSearchQuery);
            }, 500);

            return () => clearTimeout(timeoutId);
        } else {
            setStickerSearchResults([]);
        }
    }, [stickerSearchQuery]);

    const addStickerElement = (position: { x: number; y: number }) => {
        setPendingStickerPosition(position);
        setShowStickerSearch(true);
        setStickerSearchQuery('');
        setStickerSearchResults([]);
        setSelectedCategory(null);
    };

    const confirmStickerSelection = (sticker: GiphySticker) => {
        if (!pendingStickerPosition) return;

        const stickerData = {
            giphyId: sticker.id,
            title: sticker.title,
            originalUrl: sticker.images.original.url,
            smallUrl: sticker.images.fixed_height_small.url,
        };

        const newElement: PositionedElement = {
            id: `sticker_${Date.now()}`,
            type: 'sticker',
            content: stickerData.originalUrl,
            position: pendingStickerPosition,
            size: { width: 120, height: 120 },
            zIndex: elements.length + 1,
            stickerData,
        };

        setElements(prev => [...prev, newElement]);
        setShowStickerSearch(false);
        setPendingStickerPosition(null);
    };

    const searchByCategory = async (categoryId: string) => {
        setSelectedCategory(categoryId);
        setStickerSearchQuery(categoryId);
        await searchGiphyStickers(categoryId);
    };

    // ADD SPOTIFY ELEMENT
    const addSpotifyElement = (position: { x: number; y: number }) => {
        setPendingSpotifyPosition(position);
        setShowSpotifySearch(true);
        setSpotifySearchQuery('');
        setSpotifySearchResults([]);
    };

    const confirmSpotifySelection = (track: SpotifyTrack) => {
        if (!pendingSpotifyPosition) return;

        const spotifyData = {
            trackId: track.id,
            trackName: track.name,
            artistName: track.artists.map(a => a.name).join(', '),
            albumName: track.album.name,
            imageUrl: track.album.images[0]?.url || '',
            previewUrl: track.preview_url,
        };

        const newElement: PositionedElement = {
            id: `spotify_${Date.now()}`,
            type: 'spotify',
            content: spotifyData.imageUrl,
            position: pendingSpotifyPosition,
            size: { width: 150, height: 150 },
            zIndex: elements.length + 1,
            spotifyData,
        };

        setElements(prev => [...prev, newElement]);
        setShowSpotifySearch(false);
        setPendingSpotifyPosition(null);
    };

    const calculateDeleteZonePosition = () => {
        const centerX = (canvasSize.width - deleteZoneSize.width) / 2;
        const bottomY = canvasSize.height - deleteZoneSize.height - 40;
        return { x: centerX, y: bottomY };
    };

    useEffect(() => {
        if (canvasSize.width > 0 && canvasSize.height > 0) {
            setDeleteZonePosition(calculateDeleteZonePosition());
        }
    }, [canvasSize]);

    const convertPageToElements = (page: AlbumPage) => {
        if (!page) return;

        const positionedElements: PositionedElement[] = page.contents.map((content, index) => ({
            id: `element_${index}_${Date.now()}`,
            type: content.type,
            content: content.content,
            position: content.position || { x: 50 + (index * 20), y: 50 + (index * 20) },
            size: content.size || {
                width: content.type === 'text' ? 200 : 150,
                height: content.type === 'text' ? 100 : 150
            },
            rotation: content.rotation || 0,
            zIndex: content.zIndex || index + 1,
            fontSize: content.fontSize || (content.type === 'text' ? 20 : undefined),
            spotifyData: content.spotifyData,
            stickerData: content.stickerData,
        }));

        setElements(positionedElements);
    };

    const convertElementsToPageContents = (): PageContent[] => {
        const pageContents = elements.map(element => ({
            type: element.type,
            content: element.content,
            position: element.position,
            size: element.size,
            rotation: element.rotation || 0,
            zIndex: element.zIndex || 1,
            fontSize: element.type === 'text' ? (element.fontSize || 20) : undefined,
            spotifyData: element.type === 'spotify' ? element.spotifyData : undefined,
            stickerData: element.type === 'sticker' ? element.stickerData : undefined,
        }));

        return pageContents;
    };

    // CREATE EMPTY PAGE
    const createEmptyPage = async () => {
        try {
            const response = await albumsAPI.createPage(album._id, []);
            setPages([response.data]);
            setElements([]);
        } catch (error) {
            console.error('Errore creazione pagina:', error);
            Alert.alert('Errore', 'Impossibile creare la pagina');
        }
    };

    // NAVIGATION FUNCTIONS
    const goToPreviousPage = () => {
        if (currentPageIndex > 0 && !isEditMode) {
            const newIndex = currentPageIndex - 1;
            setCurrentPageIndex(newIndex);
            convertPageToElements(pages[newIndex]);
            setSelectedElementId(null);
        }
    };

    const goToNextPage = () => {
        if (currentPageIndex < pages.length - 1 && !isEditMode) {
            const newIndex = currentPageIndex + 1;
            setCurrentPageIndex(newIndex);
            convertPageToElements(pages[newIndex]);
            setSelectedElementId(null);
        }
    };

    const enterEditMode = () => {
        setIsEditMode(true);
        setSelectedElementId(null);
    };

    const exitEditMode = () => {
        setIsEditMode(false);
        setSelectedElementId(null);
        setShowTextInput(false);
        setNewTextContent('');
        hideDeleteZone();
    };

    // MANAGE DELETE ZONE
    const showDeleteZoneWithAnimation = () => {
        setShowDeleteZone(true);
        Animated.timing(deleteZoneOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const hideDeleteZone = () => {
        Animated.timing(deleteZoneOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setShowDeleteZone(false);
            setIsInDeleteZone(false);
        });
    };

    // ADD TEXT
    const addTextElement = (position: { x: number; y: number }) => {
        setShowTextInput(true);
        setNewTextContent('');
    };

    const confirmAddText = () => {
        if (!newTextContent.trim()) {
            Alert.alert('Errore', 'Inserisci del testo');
            return;
        }

        const newElement: PositionedElement = {
            id: `text_${Date.now()}`,
            type: 'text',
            content: newTextContent.trim(),
            position: { x: 50, y: 50 },
            size: { width: 200, height: 100 },
            zIndex: elements.length + 1,
            fontSize: 20,
        };

        setElements(prev => [...prev, newElement]);
        setShowTextInput(false);
        setNewTextContent('');
    };

    // ADD IMAGE
    const addImageElement = async (position: { x: number; y: number }) => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert('Permesso richiesto', 'È necessario il permesso per accedere alle foto');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled && result.assets[0].base64) {
                const newElement: PositionedElement = {
                    id: `image_${Date.now()}`,
                    type: 'image',
                    content: `data:image/jpeg;base64,${result.assets[0].base64}`,
                    position,
                    size: { width: 150, height: 150 },
                    zIndex: elements.length + 1,
                };

                setElements(prev => [...prev, newElement]);
            }
        } catch (error) {
            console.error('Errore selezione immagine:', error);
            Alert.alert('Errore', 'Impossibile selezionare l\'immagine');
        }
    };

    // UPDATE ELEMENT
    const updateElement = (id: string, updates: Partial<PositionedElement>) => {
        console.log(`Updating element ${id}:`, updates);

        setElements(prev => prev.map(el => {
            if (el.id === id) {
                const updated = { ...el, ...updates };
                console.log(`Element ${id} updated from:`, el, 'to:', updated);
                return updated;
            }
            return el;
        }));
    };

    // START DRAG
    const handleDragStart = (elementId: string) => {
        setDraggedElementId(elementId);
        setIsDraggingElement(true);
        showDeleteZoneWithAnimation();
    };

    // END DRAG
    const handleDragEnd = (elementId: string) => {
        setDraggedElementId(null);
        setIsDraggingElement(false);
        hideDeleteZone();
    };

    // DRAG TO DELETE
    const handleDragToDelete = (elementId: string, elementPosition: { x: number; y: number }, elementSize: { width: number; height: number }) => {
        if (!showDeleteZone) return;

        const elementCenterX = elementPosition.x + elementSize.width / 2;
        const elementCenterY = elementPosition.y + elementSize.height / 2;

        const deleteZoneLeft = deleteZonePosition.x;
        const deleteZoneRight = deleteZonePosition.x + deleteZoneSize.width;
        const deleteZoneTop = deleteZonePosition.y;
        const deleteZoneBottom = deleteZonePosition.y + deleteZoneSize.height;

        const isInDeleteZone = (
            elementCenterX >= deleteZoneLeft &&
            elementCenterX <= deleteZoneRight &&
            elementCenterY >= deleteZoneTop &&
            elementCenterY <= deleteZoneBottom
        );

        console.log('Delete zone check:', {
            elementCenter: { x: elementCenterX, y: elementCenterY },
            deleteZone: { left: deleteZoneLeft, right: deleteZoneRight, top: deleteZoneTop, bottom: deleteZoneBottom },
            isInDeleteZone
        });

        if (isInDeleteZone) {
            Alert.alert(
                'Conferma eliminazione',
                'Vuoi eliminare questo elemento?',
                [
                    {
                        text: 'Annulla',
                        style: 'cancel',
                    },
                    {
                        text: 'Elimina',
                        style: 'destructive',
                        onPress: () => deleteElement(elementId),
                    },
                ],
                { cancelable: true }
            );
        }
    };

    // DELETE ELEMENT
    const deleteElement = (id: string) => {
        setElements(prev => prev.filter(el => el.id !== id));
        setSelectedElementId(null);
    };

    // SELECT ELEMENT
    const selectElement = (id: string) => {
        if (isEditMode) {
            const newSelectedId = selectedElementId === id ? null : id;
            setSelectedElementId(newSelectedId);
        }
    };

    // SAVE PAGE
    const savePage = async () => {
        if (!currentPage) return;

        try {
            setSaving(true);

            const pageContents = convertElementsToPageContents();

            console.log('Saving page contents:', JSON.stringify(pageContents, null, 2));
            console.log('Current elements state:', JSON.stringify(elements, null, 2));

            await albumsAPI.updatePage(album._id, currentPage._id, pageContents);

            const updatedPages = [...pages];
            updatedPages[currentPageIndex] = {
                ...currentPage,
                contents: pageContents
            };
            setPages(updatedPages);

            console.log('Updated pages:', JSON.stringify(updatedPages[currentPageIndex].contents, null, 2));

            if (currentPage.contents.length === 0 && pageContents.length > 0) {
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

    // DISMISS KEYBOARD
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    useEffect(() => {
        loadPages();
    }, []);

    useEffect(() => {
        console.log('Elements state changed:', elements.map(el => ({
            id: el.id,
            type: el.type,
            position: el.position,
            size: el.size,
            fontSize: el.fontSize
        })));
    }, [elements]);

    useEffect(() => {
        if (pages.length > 0 && currentPageIndex < pages.length) {
            convertPageToElements(pages[currentPageIndex]);
        }
    }, [currentPageIndex, pages]);

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

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <SafeAreaView style={styles.container}>
                    {/* HEADER */}
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

                    {/* CANVAS AREA */}
                    <View
                        style={styles.canvasContainer}
                        onLayout={(event) => {
                            const { width, height } = event.nativeEvent.layout;
                            setCanvasSize({ width, height });
                        }}
                    >
                        <View style={styles.canvas}>
                            {elements.map((element) => (
                                <DraggableElement
                                    key={element.id}
                                    element={element}
                                    isSelected={selectedElementId === element.id}
                                    isEditMode={isEditMode}
                                    onSelect={selectElement}
                                    onUpdate={updateElement}
                                    onDragToDelete={handleDragToDelete}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                    canvasSize={canvasSize}
                                />
                            ))}

                            {/* EMPTY STATE - VIEW MODE */}
                            {elements.length === 0 && !isEditMode && (
                                <View style={styles.emptyCanvas}>
                                    <Text style={styles.emptyText}>Pagina vuota</Text>
                                    <Text style={styles.emptySubtext}>Premi Modifica per aggiungere contenuti</Text>
                                </View>
                            )}

                            {/* EMPTY STATE - EDIT MODE */}
                            {elements.length === 0 && isEditMode && (
                                <View style={styles.emptyCanvas}>
                                    <Text style={styles.emptyText}>Canvas vuoto</Text>
                                    <Text style={styles.emptySubtext}>Usa il toolbar per aggiungere elementi</Text>
                                </View>
                            )}

                            {/* DELETE ZONE */}
                            {showDeleteZone && (
                                <Animated.View
                                    style={[
                                        styles.deleteZone,
                                        {
                                            left: deleteZonePosition.x,
                                            top: deleteZonePosition.y,
                                            width: deleteZoneSize.width,
                                            height: deleteZoneSize.height,
                                            opacity: deleteZoneOpacity,
                                        },
                                        isInDeleteZone && styles.deleteZoneActive
                                    ]}
                                >
                                    <Text style={styles.deleteZoneIcon}>🗑️</Text>
                                </Animated.View>
                            )}
                        </View>

                        {/* PAGE NUMBER */}
                        <View style={styles.pageNumber}>
                            <Text style={styles.pageNumberText}>
                                {currentPageIndex + 1} / {pages.length}
                            </Text>
                        </View>
                    </View>

                    {/* BOTTOM NAVIGATION */}
                    {!isEditMode && (
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

                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={enterEditMode}
                            >
                                <Text style={styles.editButtonText}>✏️ Modifica</Text>
                            </TouchableOpacity>

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
                    )}

                    {isEditMode && (
                        <FloatingToolbar
                            onAddText={addTextElement}
                            onAddImage={addImageElement}
                            onAddSpotify={addSpotifyElement}
                            onAddSticker={addStickerElement}
                            canvasSize={canvasSize}
                        />
                    )}

                    {/* SPOTIFY SEARCH */}
                    <Modal
                        visible={showTextInput}
                        transparent={true}
                        animationType="slide"
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Aggiungi Testo</Text>

                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Scrivi il tuo testo..."
                                    value={newTextContent}
                                    onChangeText={setNewTextContent}
                                    multiline
                                    autoFocus
                                />

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.modalButtonCancel]}
                                        onPress={() => setShowTextInput(false)}
                                    >
                                        <Text style={styles.modalButtonTextCancel}>Annulla</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.modalButtonSave]}
                                        onPress={confirmAddText}
                                    >
                                        <Text style={styles.modalButtonTextSave}>Aggiungi</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <Modal
                        visible={showSpotifySearch}
                        transparent={true}
                        animationType="slide"
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.spotifyModalContent}>
                                <Text style={styles.modalTitle}>Cerca brano su Spotify</Text>

                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Cerca artista, brano o album..."
                                    value={spotifySearchQuery}
                                    onChangeText={setSpotifySearchQuery}
                                    autoFocus
                                />

                                {spotifySearchLoading && (
                                    <ActivityIndicator size="small" color={Colors.darkBrown} style={{ margin: 20 }} />
                                )}

                                <ScrollView style={styles.spotifyResults}>
                                    {spotifySearchResults.map((track) => (
                                        <TouchableOpacity
                                            key={track.id}
                                            style={styles.spotifyResultItem}
                                            onPress={() => confirmSpotifySelection(track)}
                                        >
                                            <Image
                                                source={{ uri: track.album.images[2]?.url || track.album.images[0]?.url }}
                                                style={styles.spotifyResultImage}
                                            />
                                            <View style={styles.spotifyResultInfo}>
                                                <Text style={styles.spotifyResultTrack} numberOfLines={1}>
                                                    {track.name}
                                                </Text>
                                                <Text style={styles.spotifyResultArtist} numberOfLines={1}>
                                                    {track.artists.map(a => a.name).join(', ')}
                                                </Text>
                                                <Text style={styles.spotifyResultAlbum} numberOfLines={1}>
                                                    {track.album.name}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.modalButtonCancel]}
                                    onPress={() => setShowSpotifySearch(false)}
                                >
                                    <Text style={styles.modalButtonTextCancel}>Annulla</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    <Modal
                        visible={showStickerSearch}
                        transparent={true}
                        animationType="slide"
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.stickerModalContent}>
                                <Text style={styles.modalTitle}>Scegli uno sticker</Text>

                                {/* Barra di ricerca */}
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Cerca sticker..."
                                    value={stickerSearchQuery}
                                    onChangeText={setStickerSearchQuery}
                                    autoFocus={false}
                                />

                                {/* Categorie */}
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.categoriesContainer}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.categoryButton,
                                            !selectedCategory && styles.categoryButtonActive
                                        ]}
                                        onPress={() => {
                                            setSelectedCategory(null);
                                            setStickerSearchQuery('');
                                            setStickerSearchResults(trendingStickers);
                                        }}
                                    >
                                        <Text style={styles.categoryEmoji}>🔥</Text>
                                        <Text style={styles.categoryText}>Trending</Text>
                                    </TouchableOpacity>

                                    {stickerCategories.map((category) => (
                                        <TouchableOpacity
                                            key={category.id}
                                            style={[
                                                styles.categoryButton,
                                                selectedCategory === category.id && styles.categoryButtonActive
                                            ]}
                                            onPress={() => searchByCategory(category.id)}
                                        >
                                            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                                            <Text style={styles.categoryText}>{category.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {/* Loading */}
                                {stickerSearchLoading && (
                                    <ActivityIndicator size="small" color={Colors.darkBrown} style={{ margin: 20 }} />
                                )}

                                {/* Risultati sticker */}
                                <ScrollView style={styles.stickerResults}>
                                    <View style={styles.stickerGrid}>
                                        {(stickerSearchResults.length > 0 ? stickerSearchResults : trendingStickers).map((sticker) => (
                                            <TouchableOpacity
                                                key={sticker.id}
                                                style={styles.stickerItem}
                                                onPress={() => confirmStickerSelection(sticker)}
                                            >
                                                <Image
                                                    source={{ uri: sticker.images.fixed_height_small.url }}
                                                    style={styles.stickerImage}
                                                    resizeMode="contain"
                                                />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.modalButtonCancel]}
                                    onPress={() => setShowStickerSearch(false)}
                                >
                                    <Text style={styles.modalButtonTextCancel}>Annulla</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </SafeAreaView>
            </TouchableWithoutFeedback>
        </GestureHandlerRootView>
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
    canvasContainer: {
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
        position: 'relative',
    },
    canvas: {
        flex: 1,
        position: 'relative',
        backgroundColor: 'rgba(248, 249, 250, 0.5)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.lightBrown + '30',
        borderStyle: 'dashed',
    },
    emptyCanvas: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 24,
        color: Colors.textBrown,
        ...fontStyle('regular'),
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 16,
        color: Colors.textBrown,
        ...fontStyle('regular'),
        textAlign: 'center',
    },
    deleteZone: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(231, 76, 60, 0.9)',
        borderRadius: 30,
        borderWidth: 3,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        zIndex: 1000,
    },
    deleteZoneActive: {
        backgroundColor: 'rgba(231, 76, 60, 1)',
        transform: [{ scale: 1.1 }],
    },
    deleteZoneIcon: {
        fontSize: 24,
        color: 'white',
    },
    pageNumber: {
        position: 'absolute',
        bottom: 15,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
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
    textInput: {
        borderWidth: 1,
        borderColor: Colors.lightBrown,
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        ...fontStyle('regular'),
        minHeight: 30,
        maxHeight: 50,
        textAlignVertical: 'top',
        marginBottom: 10,
        backgroundColor: Colors.white,
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
        minHeight: 50
    },
    modalButtonCancel: {
        backgroundColor: Colors.lightBrown,
    },
    modalButtonSave: {
        backgroundColor: Colors.darkBrown,
    },
    modalButtonTextCancel: {
        color: Colors.textBrown,
        fontSize: 16,
        ...fontStyle('regular'),
    },
    modalButtonTextSave: {
        color: Colors.white,
        fontSize: 16,
        ...fontStyle('regular'),
    },
    spotifyModalContent: {
        backgroundColor: Colors.white,
        borderRadius: 15,
        padding: 20,
        width: '100%',
        maxWidth: 400,
        maxHeight: '85%',
    },
    spotifyResults: {
        maxHeight: 300,
        marginBottom: 20,
    },
    spotifyResultItem: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightBrown + '30',
        alignItems: 'center',
    },
    spotifyResultImage: {
        width: 50,
        height: 50,
        borderRadius: 5,
        marginRight: 10,
    },
    spotifyResultInfo: {
        flex: 1,
    },
    spotifyResultTrack: {
        fontSize: 16,
        ...fontStyle('regular'),
        color: Colors.darkBrown,
        marginBottom: 2,
    },
    spotifyResultArtist: {
        fontSize: 14,
        color: Colors.textBrown,
        marginBottom: 1,
    },
    spotifyResultAlbum: {
        fontSize: 12,
        color: Colors.lightBrown,
    },
    stickerModalContent: {
        backgroundColor: Colors.white,
        borderRadius: 15,
        padding: 20,
        width: '100%',
        maxWidth: 400,
        maxHeight: '85%',
    },
    categoriesContainer: {
        marginBottom: 15,
        maxHeight: 60,
    },
    categoryButton: {
        alignItems: 'center',
        marginRight: 15,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: Colors.lightBrown + '30',
        minWidth: 70,
    },
    categoryButtonActive: {
        backgroundColor: Colors.darkBrown,
    },
    categoryEmoji: {
        fontSize: 20,
        marginBottom: 2,
    },
    categoryText: {
        fontSize: 10,
        color: Colors.darkBrown,
        fontWeight: 'bold',
    },
    stickerResults: {
        maxHeight: 350,
        marginBottom: 20,
    },
    stickerGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    stickerItem: {
        width: '30%',
        aspectRatio: 1,
        marginBottom: 10,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: Colors.lightBrown + '20',
    },
    stickerImage: {
        width: '100%',
        height: '100%',
    },
});

export default AlbumDetailScreen;