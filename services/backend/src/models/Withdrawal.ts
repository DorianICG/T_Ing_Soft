import { Model, DataTypes, Sequelize, CreationOptional, Optional, ForeignKey, BelongsToGetAssociationMixin } from 'sequelize';
import sequelizeInstance from '../config/database';
import QrAuthorization from './QrAuthorization';
import Student from './Student';
import User from './User';
import WithdrawalReason from './WithdrawalReason';
import Delegate from './Delegate';
import EmergencyContact from './EmergencyContact';
import Organization from './Organization';

export interface WithdrawalAttributes {
  id: CreationOptional<number>;
  qrAuthorizationId: ForeignKey<QrAuthorization['id']> | null;
  studentId: ForeignKey<Student['id']>;
  organizationApproverUserId: ForeignKey<User['id']>;
  reasonId: ForeignKey<WithdrawalReason['id']>;
  status: string; // 'PENDING', 'APPROVED', 'DENIED'
  method: string; // 'QR', 'MANUAL', etc.
  contactVerified: boolean;
  retrieverUserId: ForeignKey<User['id']> | null;
  retrieverDelegateId: ForeignKey<Delegate['id']> | null;
  retrieverEmergencyContactId: ForeignKey<EmergencyContact['id']> | null;
  retrieverNameIfOther: string | null;
  guardianAuthorizerUserId: ForeignKey<User['id']> | null;
  guardianAuthorizerEmergencyContactId: ForeignKey<EmergencyContact['id']> | null;
  customWithdrawalReason: string | null;
  organizationId: ForeignKey<Organization['id']> | null;
  retrieverRutIfOther: string | null;
  retrieverRelationshipIfOther: string | null;
  withdrawalTime: Date;
  notes: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WithdrawalCreationAttributes extends Optional<WithdrawalAttributes,
  'id' |
  'qrAuthorizationId' |
  'contactVerified' |
  'status' |
  'retrieverUserId' |
  'retrieverDelegateId' |
  'retrieverEmergencyContactId' |
  'retrieverNameIfOther' |
  'guardianAuthorizerUserId' |
  'guardianAuthorizerEmergencyContactId' |
  'customWithdrawalReason' |
  'organizationId' |
  'retrieverRutIfOther' |
  'retrieverRelationshipIfOther' |
  'withdrawalTime' |
  'notes' |
  'createdAt' |
  'updatedAt'
> {}

class Withdrawal extends Model<WithdrawalAttributes, WithdrawalCreationAttributes> implements WithdrawalAttributes {
  public id!: CreationOptional<number>;
  public qrAuthorizationId!: ForeignKey<QrAuthorization['id']> | null;
  public studentId!: ForeignKey<Student['id']>;
  public organizationApproverUserId!: ForeignKey<User['id']>;
  public reasonId!: ForeignKey<WithdrawalReason['id']>;
  public method!: string;
  public status!: string; // 'PENDING', 'APPROVED', 'DENIED'
  public contactVerified!: boolean;
  public retrieverUserId!: ForeignKey<User['id']> | null;
  public retrieverDelegateId!: ForeignKey<Delegate['id']> | null;
  public retrieverEmergencyContactId!: ForeignKey<EmergencyContact['id']> | null;
  public retrieverNameIfOther!: string | null;
  public guardianAuthorizerUserId!: ForeignKey<User['id']> | null;
  public guardianAuthorizerEmergencyContactId!: ForeignKey<EmergencyContact['id']> | null;
  public customWithdrawalReason!: string | null;
  public organizationId!: ForeignKey<Organization['id']> | null;
  public retrieverRutIfOther!: string | null;
  public retrieverRelationshipIfOther!: string | null;
  public withdrawalTime!: Date;
  public notes!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly qrAuthorization?: QrAuthorization;
  public getQrAuthorization!: BelongsToGetAssociationMixin<QrAuthorization>;

  public readonly student?: Student;
  public getStudent!: BelongsToGetAssociationMixin<Student>;

  public readonly organizationApproverUser?: User;
  public getOrganizationApproverUser!: BelongsToGetAssociationMixin<User>;

  public readonly reason?: WithdrawalReason;
  public getReason!: BelongsToGetAssociationMixin<WithdrawalReason>;

  public readonly retrieverUser?: User;
  public getRetrieverUser!: BelongsToGetAssociationMixin<User>;

  public readonly retrieverDelegate?: Delegate;
  public getRetrieverDelegate!: BelongsToGetAssociationMixin<Delegate>;

  public readonly retrieverEmergencyContact?: EmergencyContact;
  public getRetrieverEmergencyContact!: BelongsToGetAssociationMixin<EmergencyContact>;

  public readonly guardianAuthorizerUser?: User;
  public getGuardianAuthorizerUser!: BelongsToGetAssociationMixin<User>;

  public readonly guardianAuthorizerEmergencyContact?: EmergencyContact;
  public getGuardianAuthorizerEmergencyContact!: BelongsToGetAssociationMixin<EmergencyContact>;
  
  public readonly organization?: Organization;
  public getOrganization!: BelongsToGetAssociationMixin<Organization>;


  public static associate(models: {
    QrAuthorization: typeof QrAuthorization;
    Student: typeof Student;
    User: typeof User;
    WithdrawalReason: typeof WithdrawalReason;
    Delegate: typeof Delegate;
    EmergencyContact: typeof EmergencyContact;
    Organization: typeof Organization;
  }) {
    Withdrawal.belongsTo(models.QrAuthorization, {
      foreignKey: 'qrAuthorizationId',
      as: 'qrAuthorization'
    });

    Withdrawal.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student'
    });

    Withdrawal.belongsTo(models.User, {
      foreignKey: 'organizationApproverUserId',
      as: 'organizationApproverUser'
    });

    Withdrawal.belongsTo(models.WithdrawalReason, {
      foreignKey: 'reasonId',
      as: 'reason',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });

    Withdrawal.belongsTo(models.User, {
      foreignKey: 'retrieverUserId',
      as: 'retrieverUser'
    });

    Withdrawal.belongsTo(models.Delegate, {
      foreignKey: 'retrieverDelegateId',
      as: 'retrieverDelegate',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    Withdrawal.belongsTo(models.EmergencyContact, {
      foreignKey: 'retrieverEmergencyContactId',
      as: 'retrieverEmergencyContact',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    Withdrawal.belongsTo(models.User, {
      foreignKey: 'guardianAuthorizerUserId',
      as: 'guardianAuthorizerUser'
    });

    Withdrawal.belongsTo(models.EmergencyContact, {
      foreignKey: 'guardianAuthorizerEmergencyContactId',
      as: 'guardianAuthorizerEmergencyContact',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
    
    Withdrawal.belongsTo(models.Organization, {
        foreignKey: 'organizationId',
        as: 'organization',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      });
  }
}

export const initWithdrawalModel = () => {
  Withdrawal.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      qrAuthorizationId: { // Atributo en modelo
        type: DataTypes.INTEGER, allowNull: true, field: 'qr_authorization_id', // Columna en BD
        references: { model: 'qr_authorizations', key: 'id' },
        unique: true, // uq_withdrawals_qr_authorization_id
      },
      studentId: {
        type: DataTypes.INTEGER, allowNull: false, field: 'student_id',
        references: { model: 'students', key: 'id' }
      },
      organizationApproverUserId: { // Atributo en modelo
        type: DataTypes.INTEGER, allowNull: false, field: 'organization_approver_user_id', // Columna en BD
        references: { model: 'users', key: 'id' }
      },
      reasonId: {
        type: DataTypes.INTEGER, allowNull: false, field: 'reason_id',
        references: { model: 'withdrawal_reasons', key: 'id' }
      },
      method: { type: DataTypes.STRING(10), allowNull: false },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'PENDING' }, // 'PENDING', 'APPROVED', 'DENIED'
      contactVerified: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'contact_verified' },
      retrieverUserId: { // Atributo en modelo
        type: DataTypes.INTEGER, allowNull: true, field: 'retriever_user_id', // Columna en BD
        references: { model: 'users', key: 'id' }
      },
      retrieverDelegateId: { // Atributo en modelo
        type: DataTypes.INTEGER, allowNull: true, field: 'retriever_delegate_id', // Columna en BD
        references: { model: 'delegates', key: 'id' }
      },
      retrieverEmergencyContactId: { // Atributo en modelo
        type: DataTypes.INTEGER, allowNull: true, field: 'retriever_emergency_contact_id', // Columna en BD
        references: { model: 'emergency_contacts', key: 'id' }
      },
      retrieverNameIfOther: { type: DataTypes.STRING(255), allowNull: true, field: 'retriever_name_if_other' },
      guardianAuthorizerUserId: { // Atributo en modelo
        type: DataTypes.INTEGER, allowNull: true, field: 'guardian_authorizer_user_id', // Columna en BD
        references: { model: 'users', key: 'id' }
      },
      guardianAuthorizerEmergencyContactId: { // Atributo en modelo
        type: DataTypes.INTEGER, allowNull: true, field: 'guardian_authorizer_emergency_contact_id', // Columna en BD
        references: { model: 'emergency_contacts', key: 'id' }
      },
      customWithdrawalReason: { type: DataTypes.TEXT, allowNull: true, field: 'custom_withdrawal_reason' },
      organizationId: { // Atributo en modelo
        type: DataTypes.INTEGER, allowNull: true, field: 'organization_id', // Columna en BD
        references: { model: 'organizations', key: 'id' }
      },
      retrieverRutIfOther: { type: DataTypes.STRING(20), allowNull: true, field: 'retriever_rut_if_other' },
      retrieverRelationshipIfOther: { type: DataTypes.STRING(100), allowNull: true, field: 'retriever_relationship_if_other' },
      withdrawalTime: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'withdrawal_time' },
      notes: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      sequelize: sequelizeInstance,
      tableName: 'withdrawals',
      modelName: 'Withdrawal',
      timestamps: true,
      underscored: true,
    }
  );
  return Withdrawal;
};

export default Withdrawal;