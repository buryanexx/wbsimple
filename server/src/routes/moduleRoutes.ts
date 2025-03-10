import express from 'express';
import {
  getAllModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  completeModule
} from '../controllers/moduleController.js';
import { auth, checkSubscription } from '../middleware/auth.js';

const router = express.Router();

// Получение всех модулей
router.get('/', auth, getAllModules);

// Получение модуля по ID
router.get('/:moduleId', auth, getModuleById);

// Создание нового модуля (для админов)
router.post('/', auth, createModule);

// Обновление модуля (для админов)
router.put('/:moduleId', auth, updateModule);

// Удаление модуля (для админов)
router.delete('/:moduleId', auth, deleteModule);

// Отметка модуля как завершенного
router.post('/:moduleId/complete', auth, completeModule);

export default router; 