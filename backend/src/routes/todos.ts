import express, { Request, Response } from 'express';
import Todo, { ITodoDocument } from '../models/Todo';
import { ITodo, TodoResponse } from '../types';

const router = express.Router();

// Get all todos
router.get('/', async (req: Request, res: Response<TodoResponse[]>) => {
  try {
    const todos: ITodoDocument[] = await Todo.find()
      .sort({ createdAt: -1 })
      .limit(50);
    
    const todosResponse: TodoResponse[] = todos.map(todo => ({
      _id: todo._id.toString(),
      author: todo.author,
      text: todo.text,
      completed: todo.completed,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt
    }));
    
    res.json(todosResponse);
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json([]);
  }
});

// Create new todo
router.post('/', async (req: Request<{}, TodoResponse | { error: string }, Omit<ITodo, '_id' | 'createdAt' | 'updatedAt'>>, res: Response<TodoResponse | { error: string }>) => {
  try {
    const { author, text } = req.body;
    
    if (!author || !text) {
      return res.status(400).json({ error: 'Author e text sono richiesti' });
    }
    
    if (!['Ilaria', 'Lorenzo'].includes(author)) {
      return res.status(400).json({ error: 'Author non valido' });
    }
    
    if (text.trim().length === 0) {
      return res.status(400).json({ error: 'Il testo non può essere vuoto' });
    }
    
    const todo = new Todo({
      author,
      text: text.trim(),
      completed: false
    });
    
    const savedTodo: ITodoDocument = await todo.save();
    
    const todoResponse: TodoResponse = {
      _id: savedTodo._id.toString(),
      author: savedTodo.author,
      text: savedTodo.text,
      completed: savedTodo.completed,
      createdAt: savedTodo.createdAt,
      updatedAt: savedTodo.updatedAt
    };
    
    res.status(201).json(todoResponse);
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Errore nella creazione del todo' });
  }
});

// Toggle todo completion
router.patch('/:id/toggle', async (req: Request<{ id: string }>, res: Response<TodoResponse | { error: string }>) => {
  try {
    const { id } = req.params;
    
    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo non trovato' });
    }
    
    todo.completed = !todo.completed;
    await todo.save();
    
    const todoResponse: TodoResponse = {
      _id: todo._id.toString(),
      author: todo.author,
      text: todo.text,
      completed: todo.completed,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt
    };
    
    res.json(todoResponse);
  } catch (error) {
    console.error('Toggle todo error:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento del todo' });
  }
});

// Delete todo
router.delete('/:id', async (req: Request<{ id: string }>, res: Response<{ success: boolean; error?: string }>) => {
  try {
    const { id } = req.params;
    
    const result = await Todo.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Todo non trovato' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ success: false, error: 'Errore nella cancellazione del todo' });
  }
});

export default router;