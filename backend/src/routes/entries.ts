import express, { Request, Response } from 'express';
import Entry, { IEntryDocument } from '../models/Entry';
import { IEntry, EntryResponse } from '../types';

const router = express.Router();

// Get all entries
router.get('/', async (req: Request, res: Response<EntryResponse[]>) => {
  try {
    const entries: IEntryDocument[] = await Entry.find()
      .sort({ date: -1 })
      .limit(50);
    
    // Converti in formato response
    const entriesResponse: EntryResponse[] = entries.map(entry => ({
      _id: entry._id.toString(),
      author: entry.author,
      text: entry.text,
      attachments: entry.attachments,
      date: entry.date,
      edited: entry.edited,
      editedAt: entry.editedAt,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    }));
    
    res.json(entriesResponse);
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json([]);
  }
});

// Create new entry
router.post('/', async (req: Request<{}, EntryResponse | { error: string }, Omit<IEntry, '_id' | 'createdAt' | 'updatedAt'>>, res: Response<EntryResponse | { error: string }>) => {
  try {
    const { author, text, attachments } = req.body;
    
    if (!author || !text) {
      return res.status(400).json({ error: 'Author e text sono richiesti' });
    }
    
    if (!['Ilaria', 'Lorenzo'].includes(author)) {
      return res.status(400).json({ error: 'Author non valido' });
    }
    
    const entry = new Entry({
      author,
      text,
      attachments: attachments || []
    });
    
    const savedEntry: IEntryDocument = await entry.save();
    
    const entryResponse: EntryResponse = {
      _id: savedEntry._id.toString(),
      author: savedEntry.author,
      text: savedEntry.text,
      attachments: savedEntry.attachments,
      date: savedEntry.date,
      edited: savedEntry.edited,
      editedAt: savedEntry.editedAt,
      createdAt: savedEntry.createdAt,
      updatedAt: savedEntry.updatedAt
    };
    
    res.status(201).json(entryResponse);
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({ error: 'Errore nella creazione dell\'entry' });
  }
});

// Get entries by date
router.get('/date/:date', async (req: Request<{ date: string }>, res: Response<EntryResponse[]>) => {
  try {
    const date = new Date(req.params.date);
    const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    
    const entries: IEntryDocument[] = await Entry.find({
      date: {
        $gte: date,
        $lt: nextDay
      }
    }).sort({ date: 1 });
    
    const entriesResponse: EntryResponse[] = entries.map(entry => ({
      _id: entry._id.toString(),
      author: entry.author,
      text: entry.text,
      attachments: entry.attachments,
      date: entry.date,
      edited: entry.edited,
      editedAt: entry.editedAt,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    }));
    
    res.json(entriesResponse);
  } catch (error) {
    console.error('Get entries by date error:', error);
    res.status(500).json([]);
  }
});

export default router;