import express from 'express';
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  downloadTemplate,
  getTemplateCategories
} from '../controllers/templateController.js';
import { auth, checkSubscription } from '../middleware/auth.js';

const router = express.Router();

// Получение всех шаблонов
router.get('/', auth, getAllTemplates);

// Получение категорий шаблонов
router.get('/categories', auth, getTemplateCategories);

// Получение шаблона по ID
router.get('/:templateId', auth, getTemplateById);

// Скачивание шаблона
router.get('/:templateId/download', auth, downloadTemplate);

// Создание нового шаблона (для админов)
router.post('/', auth, createTemplate);

// Обновление шаблона (для админов)
router.put('/:templateId', auth, updateTemplate);

// Удаление шаблона (для админов)
router.delete('/:templateId', auth, deleteTemplate);

export default router; 