import { Sequelize } from 'sequelize';
import sequelizeInstance from '../config/database';

// Importar modelos y sus inicializadores
import User, { initUserModel } from './User';
import Role, { initRoleModel } from './Role';
import Organization, { initOrganizationModel } from './Organization';
import UserOrganizationRole, { initUserOrganizationRoleModel } from './UserOrganizationRole';
import EmergencyContact, { initEmergencyContactModel } from './EmergencyContact';
import Withdrawal, { initWithdrawalModel } from './Withdrawal';
import Delegate, { initDelegateModel } from './Delegate';
import QrAuthorization, { initQrAuthorizationModel } from './QrAuthorization';
import WithdrawalReason, { initWithdrawalReasonModel } from './WithdrawalReason';
import Student, { initStudentModel } from './Student';
import Course, { initCourseModel } from './Course';
import SupportTicket, { initSupportTicketModel } from './SupportTicket';
import TutorialVideo, { initTutorialVideoModel } from './TutorialVideo';
import UserTutorialView, { initUserTutorialViewModel } from './UserTutorialView';

// Inicializar modelos
const UserInstance = initUserModel();
const RoleInstance = initRoleModel();
const OrganizationInstance = initOrganizationModel();
const UserOrganizationRoleInstance = initUserOrganizationRoleModel();
const EmergencyContactInstance = initEmergencyContactModel();
const WithdrawalInstance = initWithdrawalModel();
const DelegateInstance = initDelegateModel();
const QrAuthorizationInstance = initQrAuthorizationModel();
const WithdrawalReasonInstance = initWithdrawalReasonModel();
const StudentInstance = initStudentModel();
const CourseInstance = initCourseModel();
const SupportTicketInstance = initSupportTicketModel(sequelizeInstance);
const TutorialVideoInstance = initTutorialVideoModel(sequelizeInstance);
const UserTutorialViewInstance = initUserTutorialViewModel(sequelizeInstance);

// Objeto principal de modelos
const db = {
  sequelize: sequelizeInstance,
  Sequelize,
  User: UserInstance,
  Role: RoleInstance,
  Organization: OrganizationInstance,
  UserOrganizationRole: UserOrganizationRoleInstance,
  EmergencyContact: EmergencyContactInstance,
  Withdrawal: WithdrawalInstance,
  Delegate: DelegateInstance,
  QrAuthorization: QrAuthorizationInstance,
  WithdrawalReason: WithdrawalReasonInstance,
  Student: StudentInstance,
  Course: CourseInstance,
  SupportTicket: SupportTicketInstance,
  TutorialVideo: TutorialVideoInstance,
  UserTutorialView: UserTutorialViewInstance
};

// Ejecutar asociaciones
Object.values(db).forEach((model: any) => {
  if (model && typeof model.associate === 'function') {
    model.associate(db);
  }
});

export default db;

// Exportar modelos individualmente si se necesita
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
  UserTutorialView
};