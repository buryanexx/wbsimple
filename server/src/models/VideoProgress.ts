import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database.js';

// Интерфейс для атрибутов VideoProgress
interface VideoProgressAttributes {
  id: number;
  userId: number;
  videoId: string;
  progress: number;
  lastWatched: Date;
}

// Интерфейс для создания VideoProgress
interface VideoProgressCreationAttributes extends Optional<VideoProgressAttributes, 'id'> {}

// Класс модели VideoProgress
class VideoProgress extends Model<VideoProgressAttributes, VideoProgressCreationAttributes> implements VideoProgressAttributes {
  public id!: number;
  public userId!: number;
  public videoId!: string;
  public progress!: number;
  public lastWatched!: Date;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

VideoProgress.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    videoId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    lastWatched: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  },
  {
    sequelize,
    tableName: 'video_progress',
    timestamps: true
  }
);

export default VideoProgress; 