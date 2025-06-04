import { Sequelize } from 'sequelize';
import sequelizeInstance from '../config/database';

import UserClass, { initUserModel } from './User';
import RoleClass, { initRoleModel } from './Role';
import OrganizationClass, { initOrganizationModel } from './Organization';
import UserOrganizationRoleClass, { initUserOrganizationRoleModel } from './UserOrganizationRole';
import EmergencyContactClass, { initEmergencyContactModel } from './EmergencyContact';
import WithdrawalClass, { initWithdrawalModel } from './Withdrawal';
import DelegateClass, { initDelegateModel } from './Delegate';
import QrAuthorizationClass, { initQrAuthorizationModel } from './QrAuthorization';
import WithdrawalReasonClass, { initWithdrawalReasonModel } from './WithdrawalReason';
import StudentClass, { initStudentModel } from './Student';
import CourseClass, { initCourseModel } from './Course';
import SupportTicketClass, { initSupportTicketModel } from './SupportTicket';
import TutorialVideoClass, { initTutorialVideoModel } from './TutorialVideo';
import UserTutorialViewClass, { initUserTutorialViewModel } from './UserTutorialView';

// Inicializar modelos
const User = initUserModel();
const Role = initRoleModel();
const Organization = initOrganizationModel();
const UserOrganizationRole = initUserOrganizationRoleModel();
const EmergencyContact = initEmergencyContactModel();
const Withdrawal = initWithdrawalModel();
const Delegate = initDelegateModel();
const QrAuthorization = initQrAuthorizationModel();
const WithdrawalReason = initWithdrawalReasonModel();
const Student = initStudentModel();
const Course = initCourseModel();
const SupportTicket = initSupportTicketModel();
const TutorialVideo = initTutorialVideoModel();
const UserTutorialView = initUserTutorialViewModel();

const db = {
  sequelize: sequelizeInstance,
  Sequelize,
  User,
  Role,
  Organization,
  UserOrganizationRole,
  EmergencyContact,
  Withdrawal,
  Delegate,
  QrAuthorization,
  WithdrawalReason,
  Student,
  Course,
  SupportTicket,
  TutorialVideo,
  UserTutorialView,
};

type ModelsType = typeof db & {
    User: typeof UserClass;
    Role: typeof RoleClass;
    Organization: typeof OrganizationClass;
    UserOrganizationRole: typeof UserOrganizationRoleClass;
    EmergencyContact: typeof EmergencyContactClass;
    Withdrawal: typeof WithdrawalClass;
    Delegate: typeof DelegateClass;
    QrAuthorization: typeof QrAuthorizationClass;
    WithdrawalReason: typeof WithdrawalReasonClass;
    Student: typeof StudentClass;
    Course: typeof CourseClass;
    SupportTicket: typeof SupportTicketClass;
    TutorialVideo: typeof TutorialVideoClass;
    UserTutorialView: typeof UserTutorialViewClass;
};

Object.values(db).forEach((model: any) => {
  if (model && typeof model.associate === 'function') {
    model.associate(db as ModelsType); 
  }
});

export default db;

export {
  User,
  Role,
  Organization,
  UserOrganizationRole,
  EmergencyContact,
  Withdrawal,
  Delegate,
  QrAuthorization,
  WithdrawalReason,
  Student,
  Course,
  SupportTicket,
  TutorialVideo,
  UserTutorialView,
};