import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

// Интерфейс для прогресса пользователя
interface UserProgressData {
  completedLessons: number[];
  completedModules: number[];
}

// Интерфейс для атрибутов пользователя
interface UserAttributes {
  id: number;
  telegramId: string;
  username: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  email?: string;
  isAdmin: boolean;
  hasActiveSubscription: boolean;
  subscriptionEndDate?: Date;
  autoRenewal: boolean;
  progress?: UserProgressData;
  createdAt: Date;
  updatedAt: Date;
}

// Интерфейс для создания пользователя (некоторые поля могут быть опциональными)
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'isAdmin' | 'hasActiveSubscription' | 'autoRenewal' | 'progress' | 'createdAt' | 'updatedAt'> {}

// Класс модели пользователя
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public telegramId!: string;
  public username!: string;
  public firstName!: string;
  public lastName?: string;
  public photoUrl?: string;
  public email?: string;
  public isAdmin!: boolean;
  public hasActiveSubscription!: boolean;
  public subscriptionEndDate?: Date;
  public autoRenewal!: boolean;
  public progress?: UserProgressData;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Метод для проверки, является ли пользователь администратором
  public isAdminUser(): boolean {
    return this.isAdmin;
  }

  // Метод для проверки, имеет ли пользователь активную подписку
  public hasSubscription(): boolean {
    return this.hasActiveSubscription;
  }
}

// Инициализация модели
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    telegramId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    photoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    hasActiveSubscription: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    subscriptionEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    autoRenewal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    progress: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        completedLessons: [],
        completedModules: []
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
  }
);

export default User; 