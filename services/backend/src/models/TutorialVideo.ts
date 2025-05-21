import { Model, DataTypes, Sequelize, CreationOptional, Optional, ForeignKey } from 'sequelize';
import User from './User'; // Solo si necesitas asociarlo más adelante

// Atributos del modelo
export interface TutorialVideoAttributes {
  id: CreationOptional<number>;
  title: string;
  description?: string | null;
  url: string;
  duration_seconds: number;
  is_active: boolean;
  created_at: CreationOptional<Date>;
  updated_at: CreationOptional<Date>;
}

// Campos opcionales al crear
export interface TutorialVideoCreationAttributes
  extends Optional<TutorialVideoAttributes, 'id' | 'description' | 'created_at' | 'updated_at'> {}

class TutorialVideo extends Model<TutorialVideoAttributes, TutorialVideoCreationAttributes>
  implements TutorialVideoAttributes {
  public id!: number;
  public title!: string;
  public description!: string | null;
  public url!: string;
  public duration_seconds!: number;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  public static associate() {
    // Aquí puedes asociar con otros modelos (ej. User)
  }
}

export const initTutorialVideoModel = (sequelize: Sequelize) => {
  TutorialVideo.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      url: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      duration_seconds: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          max: 300 // Máximo 5 minutos
        }
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      tableName: 'tutorial_videos',
      modelName: 'TutorialVideo',
      timestamps: false,
      createdAt: false,
      updatedAt: false
    }
  );

  return TutorialVideo;
};

export default TutorialVideo;