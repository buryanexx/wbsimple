import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database.js';

// Интерфейс для атрибутов модуля
interface ModuleAttributes {
  id: number;
  title: string;
  description: string;
  order: number;
  imageUrl?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Интерфейс для создания модуля
interface ModuleCreationAttributes extends Optional<ModuleAttributes, 'id' | 'isPublished' | 'createdAt' | 'updatedAt'> {}

// Класс модели модуля
class Module extends Model<ModuleAttributes, ModuleCreationAttributes> implements ModuleAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public order!: number;
  public imageUrl?: string;
  public isPublished!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

// Инициализация модели
Module.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    imageUrl: {
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
    modelName: 'Module',
    tableName: 'modules',
    timestamps: true,
  }
);

export default Module; 