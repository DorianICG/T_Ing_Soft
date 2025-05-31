import { WithdrawalStatus, WithdrawalMethod, QrAction } from './withdrawal.constants';

// DTOs para requests
export interface GenerateQrRequestDto {
  studentId: number;
  reasonId: number;
  customReason?: string;
}

export interface ValidateQrRequestDto {
  qrCode: string;
  action: QrAction;
  notes?: string;
}

export interface ManualWithdrawalRequestDto {
  studentRut: string;
  parentRut: string;
  reasonId: number;
  customReason?: string;
  notes?: string;
}

// DTOs para responses
export interface GenerateQrResponseDto {
  qrCode: string;
  expiresAt: Date;
  student: {
    id: number;
    firstName: string;
    lastName: string;
  };
  reason: {
    id: number;
    name: string;
  };
}

export interface QrValidationInfoDto {
  student: {
    id: number;
    rut: string;
    firstName: string;
    lastName: string;
    courseName: string;
  };
  parent: {
    id: number;
    rut: string;
    firstName: string;
    lastName: string;
    phone: string;
    relationship: string;
  };
  reason: {
    id: number;
    name: string;
  };
  customReason?: string;
  expiresAt: Date;
  generatedAt: Date;
  isExpired: boolean;
}

export interface WithdrawalResultDto {
  id: number;
  status: WithdrawalStatus;
  method: WithdrawalMethod;
  withdrawalTime: Date;
  approver: {
    id: number;
    name: string;
  };
  student: {
    id: number;
    name: string;
    rut: string;
  };
  notes?: string;
}

// Interfaces para servicios internos
export interface CreateQrAuthorizationData {
  studentId: number;
  parentUserId: number;
  reasonId: number;
  customReason?: string;
}

export interface ProcessWithdrawalData {
  studentId: number;
  inspectorUserId: number;
  reasonId: number;
  method: WithdrawalMethod;
  status: WithdrawalStatus;
  qrAuthorizationId?: number;
  retrieverUserId?: number;
  customReason?: string;
  notes?: string;
}