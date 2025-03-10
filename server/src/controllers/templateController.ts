import { Request, Response } from 'express';
import Template from '../models/Template.js';

// Получение всех шаблонов
export const getAllTemplates = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    let query = {};
    
    // Фильтрация по категории, если указана
    if (category && category !== 'Все') {
      query = { category };
    }
    
    const templates = await Template.find(query).sort({ popularity: -1 });
    
    res.status(200).json({ templates });
  } catch (error) {
    console.error('Ошибка получения шаблонов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получение шаблона по ID
export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    
    const template = await Template.findOne({ templateId: parseInt(templateId) });
    
    if (!template) {
      return res.status(404).json({ message: 'Шаблон не найден' });
    }
    
    res.status(200).json({ template });
  } catch (error) {
    console.error('Ошибка получения шаблона:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Создание нового шаблона (для админов)
export const createTemplate = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      downloadUrl,
      previewUrl,
      isPremium
    } = req.body;
    
    // Находим максимальный templateId
    const maxTemplateIdDoc = await Template.findOne().sort({ templateId: -1 });
    const nextTemplateId = maxTemplateIdDoc ? maxTemplateIdDoc.templateId + 1 : 1;
    
    const newTemplate = new Template({
      templateId: nextTemplateId,
      title,
      description,
      category,
      downloadUrl,
      previewUrl,
      isPremium,
      popularity: 0,
      downloads: 0
    });
    
    await newTemplate.save();
    
    res.status(201).json({ template: newTemplate });
  } catch (error) {
    console.error('Ошибка создания шаблона:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновление шаблона (для админов)
export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const {
      title,
      description,
      category,
      downloadUrl,
      previewUrl,
      isPremium,
      popularity
    } = req.body;
    
    const template = await Template.findOne({ templateId: parseInt(templateId) });
    
    if (!template) {
      return res.status(404).json({ message: 'Шаблон не найден' });
    }
    
    template.title = title || template.title;
    template.description = description || template.description;
    template.category = category || template.category;
    template.downloadUrl = downloadUrl || template.downloadUrl;
    template.previewUrl = previewUrl || template.previewUrl;
    template.isPremium = isPremium !== undefined ? isPremium : template.isPremium;
    template.popularity = popularity || template.popularity;
    
    await template.save();
    
    res.status(200).json({ template });
  } catch (error) {
    console.error('Ошибка обновления шаблона:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удаление шаблона (для админов)
export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    
    const template = await Template.findOne({ templateId: parseInt(templateId) });
    
    if (!template) {
      return res.status(404).json({ message: 'Шаблон не найден' });
    }
    
    await template.deleteOne();
    
    res.status(200).json({ message: 'Шаблон успешно удален' });
  } catch (error) {
    console.error('Ошибка удаления шаблона:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Скачивание шаблона
export const downloadTemplate = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const user = req.user;
    
    const template = await Template.findOne({ templateId: parseInt(templateId) });
    
    if (!template) {
      return res.status(404).json({ message: 'Шаблон не найден' });
    }
    
    // Проверяем, требуется ли подписка для скачивания
    if (template.isPremium && (!user.isSubscribed || (user.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date()))) {
      return res.status(403).json({ message: 'Для скачивания этого шаблона требуется активная подписка' });
    }
    
    // Увеличиваем счетчик скачиваний
    template.downloads += 1;
    await template.save();
    
    // Возвращаем URL для скачивания
    res.status(200).json({ downloadUrl: template.downloadUrl });
  } catch (error) {
    console.error('Ошибка скачивания шаблона:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получение категорий шаблонов
export const getTemplateCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Template.distinct('category');
    
    // Добавляем категорию "Все" в начало списка
    categories.unshift('Все');
    
    res.status(200).json({ categories });
  } catch (error) {
    console.error('Ошибка получения категорий шаблонов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}; 