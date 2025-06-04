import { Model, DataTypes, CreationOptional, ForeignKey, Optional } from 'sequelize';
import sequelizeInstance from '../config/database';
import User from './User';
import TutorialVideo from './TutorialVideo';

export interface UserTutorialViewAttributes {
  user_id: ForeignKey<User['id']>;
  tutorial_video_id: ForeignKey<TutorialVideo['id']>;
  viewed_at: CreationOptional<Date>;
}

export interface UserTutorialViewCreationAttributes extends Optional<UserTutorialViewAttributes, 'viewed_at'> {}

class UserTutorialView extends Model<UserTutorialViewAttributes, UserTutorialViewCreationAttributes> implements UserTutorialViewAttributes {
  public user_id!: ForeignKey<User['id']>;
  public tutorial_video_id!: ForeignKey<TutorialVideo['id']>;
  public viewed_at!: Date;

  // Relaciones
  public readonly user?: User;
  public readonly tutorialVideo?: TutorialVideo;

  public static associate(models: any) {
    UserTutorialView.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE'
    });

    UserTutorialView.belongsTo(models.TutorialVideo, {
      foreignKey: 'tutorial_video_id',
      as: 'tutorialVideo',
      onDelete: 'CASCADE'
    });
  }
}

export const initUserTutorialViewModel = () => {
  UserTutorialView.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      tutorial_video_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: 'tutorial_video_id',
        references: {
          model: 'tutorial_videos',
          key: 'id'
        }
      },
      viewed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'viewed_at'
      }
    },
    {
      sequelize: sequelizeInstance,
      tableName: 'user_tutorial_views',
      modelName: 'UserTutorialView',
      timestamps: false,
      underscored: true
    }
  );

  return UserTutorialView;
};

export default UserTutorialView;