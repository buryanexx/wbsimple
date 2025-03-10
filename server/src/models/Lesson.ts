import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database.js';

// Интерфейс для атрибутов урока
interface LessonAttributes {
  id: number;
  moduleId: number;
  title: string;
  content: string;
  order: number;
  videoUrl?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Интерфейс для создания урока
interface LessonCreationAttributes extends Optional<LessonAttributes, 'id' | 'isPublished' | 'createdAt' | 'updatedAt'> {}

// Класс модели урока
class Lesson extends Model<LessonAttributes, LessonCreationAttributes> implements LessonAttributes {
  public id!: number;
  public moduleId!: number;
  public title!: string;
  public content!: string;
  public order!: number;
  public videoUrl?: string;
  public isPublished!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

// Инициализация модели
Lesson.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    moduleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'modules',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    modelName: 'Lesson',
    tableName: 'lessons',
    timestamps: true,
  }
);

export default Lesson; 