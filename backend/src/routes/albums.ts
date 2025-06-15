import express, { Request, Response } from 'express';
import Album, { IAlbumDocument } from '../models/Album';
import AlbumPage, { IAlbumPageDocument } from '../models/AlbumPage';
import { IAlbum, AlbumResponse, AlbumPageResponse } from '../types';

const router = express.Router();

// Get all albums
router.get('/', async (req: Request, res: Response<AlbumResponse[]>) => {
  try {
    const albums: IAlbumDocument[] = await Album.find()
      .sort({ createdAt: -1 })
      .limit(50);
    
    const albumsResponse: AlbumResponse[] = albums.map(album => ({
      _id: album._id.toString(),
      name: album.name,
      coverImage: album.coverImage,
      totalPages: album.totalPages,
      createdAt: album.createdAt,
      updatedAt: album.updatedAt
    }));
    
    res.json(albumsResponse);
  } catch (error) {
    console.error('Get albums error:', error);
    res.status(500).json([]);
  }
});

// Create new album
router.post('/', async (req: Request<{}, AlbumResponse | { error: string }, Omit<IAlbum, '_id' | 'createdAt' | 'updatedAt' | 'totalPages'>>, res: Response<AlbumResponse | { error: string }>) => {
  try {
    const { name, coverImage } = req.body;
    
    if (!name || !coverImage) {
      return res.status(400).json({ error: 'Nome e immagine sono richiesti' });
    }
    
    if (name.trim().length === 0) {
      return res.status(400).json({ error: 'Il nome non può essere vuoto' });
    }
    
    const album = new Album({
      name: name.trim(),
      coverImage,
      totalPages: 0 // Inizialmente nessuna pagina
    });
    
    const savedAlbum: IAlbumDocument = await album.save();
    
    const albumResponse: AlbumResponse = {
      _id: savedAlbum._id.toString(),
      name: savedAlbum.name,
      coverImage: savedAlbum.coverImage,
      totalPages: savedAlbum.totalPages,
      createdAt: savedAlbum.createdAt,
      updatedAt: savedAlbum.updatedAt
    };
    
    res.status(201).json(albumResponse);
  } catch (error) {
    console.error('Create album error:', error);
    res.status(500).json({ error: 'Errore nella creazione dell\'album' });
  }
});

// Get album pages
router.get('/:id/pages', async (req: Request<{ id: string }>, res: Response<AlbumPageResponse[]>) => {
  try {
    const { id } = req.params;
    
    const pages: IAlbumPageDocument[] = await AlbumPage.find({ albumId: id })
      .sort({ pageNumber: 1 });
    
    const pagesResponse: AlbumPageResponse[] = pages.map(page => ({
      _id: page._id.toString(),
      albumId: page.albumId.toString(),
      pageNumber: page.pageNumber,
      contents: page.contents,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt
    }));
    
    res.json(pagesResponse);
  } catch (error) {
    console.error('Get album pages error:', error);
    res.status(500).json([]);
  }
});

// Add new page to album
router.post('/:id/pages', async (req: Request<{ id: string }>, res: Response<AlbumPageResponse | { error: string }>) => {
  try {
    const { id } = req.params;
    const { contents = [] } = req.body;
    
    // Trova l'album
    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({ error: 'Album non trovato' });
    }
    
    // Calcola il numero della nuova pagina
    const nextPageNumber = album.totalPages + 1;
    
    // Crea la nuova pagina
    const newPage = new AlbumPage({
      albumId: id,
      pageNumber: nextPageNumber,
      contents
    });
    
    const savedPage = await newPage.save();
    
    // Aggiorna il conteggio delle pagine nell'album
    album.totalPages = nextPageNumber;
    await album.save();
    
    const pageResponse: AlbumPageResponse = {
      _id: savedPage._id.toString(),
      albumId: savedPage.albumId.toString(),
      pageNumber: savedPage.pageNumber,
      contents: savedPage.contents,
      createdAt: savedPage.createdAt,
      updatedAt: savedPage.updatedAt
    };
    
    res.status(201).json(pageResponse);
  } catch (error) {
    console.error('Create album page error:', error);
    res.status(500).json({ error: 'Errore nella creazione della pagina' });
  }
});

// Delete album (and all its pages)
router.delete('/:id', async (req: Request<{ id: string }>, res: Response<{ success: boolean; error?: string }>) => {
  try {
    const { id } = req.params;
    
    // Elimina tutte le pagine dell'album
    await AlbumPage.deleteMany({ albumId: id });
    
    // Elimina l'album
    const result = await Album.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Album non trovato' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete album error:', error);
    res.status(500).json({ success: false, error: 'Errore nella cancellazione dell\'album' });
  }
});

// Update page contents
router.put('/:albumId/pages/:pageId', async (req: Request<{ albumId: string; pageId: string }>, res: Response<AlbumPageResponse | { error: string }>) => {
  try {
    const { albumId, pageId } = req.params;
    const { contents = [] } = req.body;
    
    const page = await AlbumPage.findOneAndUpdate(
      { _id: pageId, albumId },
      { contents },
      { new: true }
    );
    
    if (!page) {
      return res.status(404).json({ error: 'Pagina non trovata' });
    }
    
    const pageResponse: AlbumPageResponse = {
      _id: page._id.toString(),
      albumId: page.albumId.toString(),
      pageNumber: page.pageNumber,
      contents: page.contents,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt
    };
    
    res.json(pageResponse);
  } catch (error) {
    console.error('Update album page error:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento della pagina' });
  }
});

export default router;