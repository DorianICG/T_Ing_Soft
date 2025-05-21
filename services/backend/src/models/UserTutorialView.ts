import { Model, DataTypes, Sequelize, CreationOptional, Optional, ForeignKey } from 'sequelize';
import TutorialVideo from './TutorialVideo';
import User from './User';

// Atributos del modelo
export interface UserTutorialViewAttributes {
  user_id: ForeignKey<User['id']>;
  tutorial_video_id: ForeignKey<TutorialVideo['id']>;
  viewed_at: CreationOptional<Date>;
}

// Campos opcionales al crear
export interface UserTutorialViewCreationAttributes
  extends Optional<UserTutorialViewAttributes, 'viewed_at'> {}

class UserTutorialView extends Model<
  UserTutorialViewAttributes,
  UserTutorialViewCreationAttributes
> implements UserTutorialViewAttributes {
  public user_id!: ForeignKey<User['id']>;
  public tutorial_video_id!: ForeignKey<TutorialVideo['id']>;
  public viewed_at!: Date;

  public static associate(models: {
    User: typeof User;
    TutorialVideo: typeof TutorialVideo;
  }) {
    // Relación: pertenece a User
    UserTutorialView.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    // Relación: pertenece a TutorialVideo
    UserTutorialView.belongsTo(models.TutorialVideo, {
      foreignKey: 'tutorial_video_id',
      as: 'tutorialVideo'
    });
  }
}

export const initUserTutorialViewModel = (sequelize: Sequelize) => {
  UserTutorialView.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      tutorial_video_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'tutorial_videos',
          key: 'id'
        }
      },
      viewed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      tableName: 'user_tutorial_views',
      modelName: 'UserTutorialView',
      timestamps: false
    }
  );

  return UserTutorialView;
};

export default UserTutorialView;