import express from 'express';
import moduleController from '../controllers/moduleController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Получение всех модулей
router.get('/', moduleController.getAllModules);

// Получение модуля по ID
router.get('/:id', moduleController.getModuleById);

// Создание нового модуля (только для администраторов)
router.post('/', authenticateToken, moduleController.createModule);

// Обновление модуля (только для администраторов)
router.put('/:id', authenticateToken, moduleController.updateModule);

// Удаление модуля (только для администраторов)
router.delete('/:id', authenticateToken, moduleController.deleteModule);

// Отметка модуля как завершенного
router.post('/:id/complete', authenticateToken, moduleController.completeModule);

export default router; 