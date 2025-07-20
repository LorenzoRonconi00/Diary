import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import entriesRoutes from './routes/entries';
import todosRoutes from './routes/todos';
import albumsRoutes from './routes/albums';
import spotifyRoutes from './routes/spotify';
import giphyRoutes from './routes/giphy';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MONGODB_URI non trovato nel file .env');
  process.exit(1);
}

mongoose.connect(mongoUri)
.then(() => console.log('✅ MongoDB connesso'))
.catch((err: Error) => {
  console.error('❌ Errore MongoDB:', err);
  process.exit(1);
});


app.use('/api/auth', authRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/todos', todosRoutes);
app.use('/api/albums', albumsRoutes);
app.use('/api/spotify', spotifyRoutes);
app.use('/api/giphy', giphyRoutes);


app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server TypeScript running su porta ${PORT}`);
  console.log(`📱 Accessibile da iPhone: http://192.168.1.13:${PORT}`);
});