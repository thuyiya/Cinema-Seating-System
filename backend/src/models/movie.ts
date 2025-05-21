import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db/config';
import { Screening } from './Screening';

interface MovieAttributes {
  id: string;
  title: string;
  description: string;
  duration: number;
  rating: number;
  posterUrl: string | null;
  genres: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MovieCreationAttributes extends Optional<MovieAttributes, 'id' | 'createdAt' | 'updatedAt' | 'posterUrl'> {}

class Movie extends Model<MovieAttributes, MovieCreationAttributes> implements MovieAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public duration!: number;
  public rating!: number;
  public posterUrl!: string | null;
  public genres!: string[];
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly screenings?: Screening[];
}

Movie.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      },
      comment: 'Duration in minutes'
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0,
        max: 10
      }
    },
    posterUrl: {
      type: DataTypes.STRING(512),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    genres: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: []
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
    modelName: 'Movie',
    tableName: 'Movies',
    timestamps: true,
    paranoid: false,
    indexes: [
      {
        fields: ['title']
      },
      {
        fields: ['isActive']
      }
    ]
  }
);

export { Movie, MovieAttributes };