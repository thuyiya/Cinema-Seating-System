import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db/config';
import { Movie } from './movie';

interface ScreeningAttributes {
  id: string;
  movieId: string;
  screenNumber: number;
  startsAt: Date;
  endsAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ScreeningCreationAttributes extends Optional<ScreeningAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Screening extends Model<ScreeningAttributes, ScreeningCreationAttributes> implements ScreeningAttributes {
  public id!: string;
  public movieId!: string;
  public screenNumber!: number;
  public startsAt!: Date;
  public endsAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly movie?: Movie;
}

Screening.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    movieId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Movies',
        key: 'id'
      }
    },
    screenNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    startsAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true
      }
    },
    endsAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'Screening',
    tableName: 'Screenings',
    timestamps: true,
    paranoid: false,
    indexes: [
      {
        fields: ['movieId']
      },
      {
        fields: ['startsAt']
      },
      {
        fields: ['screenNumber', 'startsAt'],
        unique: true
      }
    ]
  }
);

// Define associations
Screening.belongsTo(Movie, {
  foreignKey: 'movieId',
  as: 'movie'
});

Movie.hasMany(Screening, {
  foreignKey: 'movieId',
  as: 'screenings'
});

export { Screening, ScreeningAttributes };