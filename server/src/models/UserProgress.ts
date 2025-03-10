import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database.js';

// Интерфейс для атрибутов прогресса пользователя
interface UserProgressAttributes {
  id: number;
  userId: number;
  lessonId: number;
  moduleId: number;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Интерфейс для создания прогресса пользователя
interface UserProgressCreationAttributes extends Optional<UserProgressAttributes, 'id' | 'completed' | 'completedAt' | 'createdAt' | 'updatedAt'> {}

// Класс модели прогресса пользователя
class UserProgress extends Model<UserProgressAttributes, UserProgressCreationAttributes> implements UserProgressAttributes {
  public id!: number;
  public userId!: number;
  public lessonId!: number;
  public moduleId!: number;
  public completed!: boolean;
  public completedAt?: Date;
  public createdAt!: Date;
  public updatedAt!: Date;
}

// Инициализация модели
UserProgress.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    lessonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'lessons',
        key: 'id',
      },
    },
    moduleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'modules',
        key: 'id',
      },
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
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
    modelName: 'UserProgress',
    tableName: 'user_progress',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'lessonId'],
      },
    ],
  }
);

export default UserProgress; 