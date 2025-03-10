import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database.js';

// Интерфейс для атрибутов подписки
interface SubscriptionAttributes {
  id: number;
  userId: number;
  startDate: Date;
  endDate: Date;
  paymentId: string;
  amount: number;
  status: 'active' | 'expired' | 'cancelled';
  autoRenewal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Интерфейс для создания подписки
interface SubscriptionCreationAttributes extends Optional<SubscriptionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Класс модели подписки
class Subscription extends Model<SubscriptionAttributes, SubscriptionCreationAttributes> implements SubscriptionAttributes {
  public id!: number;
  public userId!: number;
  public startDate!: Date;
  public endDate!: Date;
  public paymentId!: string;
  public amount!: number;
  public status!: 'active' | 'expired' | 'cancelled';
  public autoRenewal!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

// Инициализация модели
Subscription.init(
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
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    paymentId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'cancelled'),
      allowNull: false,
    },
    autoRenewal: {
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
    modelName: 'Subscription',
    tableName: 'subscriptions',
    timestamps: true,
  }
);

export default Subscription; 