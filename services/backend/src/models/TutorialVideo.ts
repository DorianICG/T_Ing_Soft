import { Model, DataTypes, CreationOptional, Optional } from 'sequelize';
import sequelizeInstance from '../config/database';

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

export interface TutorialVideoCreationAttributes extends Optional<TutorialVideoAttributes, 'id' | 'description' | 'is_active' | 'created_at' | 'updated_at'> {}

class TutorialVideo extends Model<TutorialVideoAttributes, TutorialVideoCreationAttributes> implements TutorialVideoAttributes {
  public id!: number;
  public title!: string;
  public description!: string | null;
  public url!: string;
  public duration_seconds!: number;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  // Relaciones
  public readonly userViews?: any[];

  public static associate(models: any) {
    TutorialVideo.hasMany(models.UserTutorialView, {
      foreignKey: 'tutorial_video_id',
      as: 'userViews',
      onDelete: 'CASCADE'
    });

    TutorialVideo.belongsToMany(models.User, {
      through: models.UserTutorialView,
      foreignKey: 'tutorial_video_id',
      otherKey: 'user_id',
      as: 'viewers'
    });
  }
}

export const initTutorialVideoModel = () => {
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
        allowNull: false,
        validate: {
          isUrl: true
        }
      },
      duration_seconds: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 300 // Máximo 5 minutos
        },
        field: 'duration_seconds'
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at'
      }
    },
    {
      sequelize: sequelizeInstance,
      tableName: 'tutorial_videos',
      modelName: 'TutorialVideo',
      timestamps: false,
      underscored: true,
      hooks: {
        beforeUpdate: (tutorial: TutorialVideo) => {
          tutorial.updated_at = new Date();
        }
      }
    }
  );

  return TutorialVideo;
};

export default TutorialVideo;