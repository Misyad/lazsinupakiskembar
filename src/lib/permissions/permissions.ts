export const permissions = {
  housesRead: "houses.read",
  housesCreate: "houses.create",
  housesUpdate: "houses.update",
  housesDelete: "houses.delete",
  coinBoxesRead: "coin_boxes.read",
  coinBoxesCreate: "coin_boxes.create",
  coinBoxesAssign: "coin_boxes.assign",
  withdrawalsRead: "withdrawals.read",
  withdrawalsCreate: "withdrawals.create",
  withdrawalsValidate: "withdrawals.validate",
  withdrawalsReject: "withdrawals.reject",
  auditRead: "audit.read",
  settingsManage: "settings.manage"
} as const;

export type PermissionCode = (typeof permissions)[keyof typeof permissions];

export type RoleCode = "SUPER_ADMIN" | "ADMIN_RANTING" | "PETUGAS" | "BENDAHARA";
