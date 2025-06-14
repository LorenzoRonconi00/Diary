import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import entriesRoutes from './routes/entries';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/entries', entriesRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server TypeScript running su porta ${PORT}`);
  console.log(`📱 Accessibile da iPhone: http://192.168.1.11:${PORT}`);
});