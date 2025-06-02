import { User, Organization, Role, UserOrganizationRole } from '../../models';
import { RoleAttributes } from '../../models/Role';
import { OrganizationAttributes } from '../../models/Organization';

interface UserOrganizationRoleDetails {
  organization: OrganizationAttributes;
  roles: RoleAttributes[];
}

interface ActiveOrganizationResult {
  activeOrganizationId: number;
  effectiveRoles: RoleAttributes[];
}


class OrganizationAccessService {

  async getUserOrganizationsAndRoles(userId: number): Promise<UserOrganizationRoleDetails[]> {
    const userOrgRolesFromDb = await UserOrganizationRole.findAll({
      where: { userId },
      include: [
        { model: Organization, as: 'organization', required: true },
        { model: Role, as: 'role', required: true },
      ],
      order: [[{ model: Organization, as: 'organization' }, 'name', 'ASC']] 
    });

    const groupedByOrg: Record<number, UserOrganizationRoleDetails> = {};

    for (const uor of userOrgRolesFromDb) {
      if (!uor.organization || !uor.role) continue;

      const orgId = uor.organizationId; 
      if (!groupedByOrg[orgId]) {
        groupedByOrg[orgId] = {
          organization: uor.organization.get({ plain: true }),
          roles: [],
        };
      }
      groupedByOrg[orgId].roles.push(uor.role.get({ plain: true }));
    }
    return Object.values(groupedByOrg);
  }

  async canUserAccessOrganization(
    userId: number,
    organizationId: number,
    requiredRoleNames?: string[]
  ): Promise<boolean> {
    const userOrgRoles = await UserOrganizationRole.findAll({
      where: {
        userId,
        organizationId,
      },
      include: [{ model: Role, as: 'role', required: true }],
    });

    if (userOrgRoles.length === 0) {
      return false;
    }

    if (!requiredRoleNames || requiredRoleNames.length === 0) {
      return true;
    }

    const userRoleNamesInOrg = userOrgRoles.map(uor => uor.role!.name.toUpperCase());
    return requiredRoleNames.some(reqRole => userRoleNamesInOrg.includes(reqRole.toUpperCase()));
  }

  async getEffectiveRolesForUserInOrganization(userId: number, organizationId: number): Promise<RoleAttributes[]> {
    const userOrgRoles = await UserOrganizationRole.findAll({
      where: { userId, organizationId },
      include: [{ model: Role, as: 'role', required: true }],
    });
    return userOrgRoles.map(uor => uor.role!.get({ plain: true }));
  }

  async determineActiveOrganizationAndRoles(
    userId: number,
    preferredOrgId?: number
  ): Promise<ActiveOrganizationResult | null> {
    const userOrgsAndRoles = await this.getUserOrganizationsAndRoles(userId);

    if (userOrgsAndRoles.length === 0) {
      return null; 
    }

    let selectedOrganizationDetail: UserOrganizationRoleDetails | undefined;

    if (preferredOrgId) {
      selectedOrganizationDetail = userOrgsAndRoles.find(
        (orgDetail) => orgDetail.organization.id === preferredOrgId
      );

    }

    if (!selectedOrganizationDetail) {
      selectedOrganizationDetail = userOrgsAndRoles[0];
    }
    
    if (!selectedOrganizationDetail) { 
        return null;
    }


    return {
      activeOrganizationId: selectedOrganizationDetail.organization.id,
      effectiveRoles: selectedOrganizationDetail.roles,
    };
  }
}

export default new OrganizationAccessService();