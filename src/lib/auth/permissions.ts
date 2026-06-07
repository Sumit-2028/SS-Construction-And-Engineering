export const roles = [
  "ADMIN",
  "CUSTOMER"
] as const;

export type AppRole = (typeof roles)[number];

export const roleRank: Record<AppRole, number> = {
  ADMIN: 90,
  CUSTOMER: 20
};

export function hasRoleAtLeast(role: AppRole, requiredRole: AppRole) {
  return roleRank[role] >= roleRank[requiredRole];
}
