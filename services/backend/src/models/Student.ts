import { Model, DataTypes, Sequelize, Optional, ForeignKey, CreationOptional, BelongsToGetAssociationMixin, HasManyGetAssociationsMixin } from 'sequelize';
import sequelizeInstance from '../config/database';
import User from './User';
import Organization from './Organization';
import Withdrawal from './Withdrawal';
import Course from './Course';
import QrAuthorization from './QrAuthorization';


export interface StudentAttributes {
  id: CreationOptional<number>;
  rut: string;
  firstName: string;
  lastName: string;
  birthDate: Date | null;
  organizationId: ForeignKey<Organization['id']>;
  parentId: ForeignKey<User['id']> | null;
  courseId: ForeignKey<Course['id']>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentCreationAttributes extends Optional<StudentAttributes, 'id' | 'birthDate' | 'parentId' | 'createdAt' | 'updatedAt'> {} // <--- MODIFICADO: 'parentId' añadido a opcionales, 'courseId' quitado si se asume que siempre se proveerá

class Student extends Model<StudentAttributes, StudentCreationAttributes> implements StudentAttributes {
  public id!: CreationOptional<number>;
  public rut!: string;
  public firstName!: string;
  public lastName!: string;
  public birthDate!: Date | null;
  public organizationId!: ForeignKey<Organization['id']>;
  public parentId!: ForeignKey<User['id']> | null;
  public courseId!: ForeignKey<Course['id']>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly parent?: User | null;
  public getParent!: BelongsToGetAssociationMixin<User | null>;

  public readonly organization?: Organization;
  public getOrganization!: BelongsToGetAssociationMixin<Organization>;

  public readonly course?: Course;
  public getCourse!: BelongsToGetAssociationMixin<Course>;

  public readonly withdrawals?: Withdrawal[];
  public getWithdrawals!: HasManyGetAssociationsMixin<Withdrawal>;

  public readonly qrAuthorizations?: QrAuthorization[];
  public getQrAuthorizations!: HasManyGetAssociationsMixin<QrAuthorization>;


  public static associate(models: {
    User: typeof User;
    Organization: typeof Organization;
    Withdrawal: typeof Withdrawal;
    Course: typeof Course;
    QrAuthorization: typeof QrAuthorization;
  }) {
    Student.belongsTo(models.User, {
      foreignKey: 'parentId',
      as: 'parent'
    });

    Student.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });

    Student.belongsTo(models.Course, {
      foreignKey: 'courseId',
      as: 'course',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });

    Student.hasMany(models.Withdrawal, {
      foreignKey: 'studentId',
      as: 'withdrawals',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    Student.hasMany(models.QrAuthorization, {
      foreignKey: 'studentId',
      as: 'qrAuthorizations',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }
}

export const initStudentModel = () => {
  Student.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      rut: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      firstName: { type: DataTypes.STRING(50), allowNull: false, field: 'first_name' },
      lastName: { type: DataTypes.STRING(50), allowNull: false, field: 'last_name' },
      birthDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'birth_date' },
      organizationId: {
        type: DataTypes.INTEGER, allowNull: false, field: 'organization_id',
        references: { model: 'organizations', key: 'id' }
      },
      parentId: { 
        type: DataTypes.INTEGER, allowNull: true, field: 'parent_user_id',
        references: { model: 'users', key: 'id' }
      },
      courseId: {
        type: DataTypes.INTEGER, allowNull: false, field: 'course_id',
        references: { model: 'courses', key: 'id' }
      },
    },
    {
      sequelize: sequelizeInstance,
      tableName: 'students',
      modelName: 'Student',
      timestamps: true,
      underscored: true,
    }
  );
  return Student;
};

export default Student;