import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Аутентификация пользователя Telegram
export const telegramAuth = async (req: Request, res: Response) => {
  try {
    const { telegramData } = req.body;
    
    if (!telegramData) {
      return res.status(400).json({ message: 'Отсутствуют данные Telegram' });
    }
    
    // Проверяем, существует ли пользователь
    let user = await User.findOne({ telegramId: telegramData.id });
    
    if (!user) {
      // Создаем нового пользователя
      user = new User({
        telegramId: telegramData.id,
        firstName: telegramData.first_name,
        lastName: telegramData.last_name,
        username: telegramData.username,
        photoUrl: telegramData.photo_url,
        isSubscribed: false,
        progress: {
          completedLessons: [],
          completedModules: []
        }
      });
      
      await user.save();
    } else {
      // Обновляем данные пользователя
      user.firstName = telegramData.first_name;
      user.lastName = telegramData.last_name;
      user.username = telegramData.username;
      user.photoUrl = telegramData.photo_url;
      user.lastLoginAt = new Date();
      
      await user.save();
    }
    
    // Создаем JWT токен
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    
    res.status(200).json({
      token,
      user: {
        id: user._id,
        telegramId: user.telegramId,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        photoUrl: user.photoUrl,
        isSubscribed: user.isSubscribed,
        subscriptionExpiry: user.subscriptionExpiry,
        progress: user.progress
      }
    });
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получение данных текущего пользователя
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    
    res.status(200).json({
      user: {
        id: user._id,
        telegramId: user.telegramId,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        photoUrl: user.photoUrl,
        isSubscribed: user.isSubscribed,
        subscriptionExpiry: user.subscriptionExpiry,
        progress: user.progress
      }
    });
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}; 