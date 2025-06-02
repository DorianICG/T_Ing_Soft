import { Model, DataTypes, Sequelize, CreationOptional, Optional, ForeignKey, BelongsToGetAssociationMixin, HasManyGetAssociationsMixin } from 'sequelize';
import sequelizeInstance from '../config/database';
import Organization from './Organization';
import Student from './Student';

export interface CourseAttributes {
  id: CreationOptional<number>;
  name: string;
  organizationId: ForeignKey<Organization['id']>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CourseCreationAttributes extends Optional<CourseAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Course extends Model<CourseAttributes, CourseCreationAttributes> implements CourseAttributes {
  public id!: CreationOptional<number>;
  public name!: string;
  public organizationId!: ForeignKey<Organization['id']>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly organization?: Organization;
  public getOrganization!: BelongsToGetAssociationMixin<Organization>;

  public readonly students?: Student[];
  public getStudents!: HasManyGetAssociationsMixin<Student>;

  public static associate(models: {
    Organization: typeof Organization;
    Student: typeof Student;
  }) {
    Course.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization'
    });

    Course.hasMany(models.Student, {
      foreignKey: 'courseId',
      as: 'students',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
  }
}

export const initCourseModel = () => {
  Course.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(255), allowNull: false },
      organizationId: {
        type: DataTypes.INTEGER, allowNull: false, field: 'organization_id',
        references: { model: 'organizations', key: 'id' }
      },
    },
    {
      sequelize: sequelizeInstance,
      tableName: 'courses',
      modelName: 'Course',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['name', 'organization_id']
        }
      ]
    }
  );
  return Course;
};

export default Course;