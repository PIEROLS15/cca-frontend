type RoleLike = {
  name?: string | null;
  group?: number | null;
} | null | undefined;

type UserLike = {
  role?: RoleLike;
} | null | undefined;

const ROLE_GROUPS = [
  { group: 1, roles: ["SuperAdmin", "Admin"] },
  { group: 2, roles: ["Presidente", "Ingeniero"] },
  { group: 3, roles: ["Secretaria", "Supervisor"] },
  { group: 4, roles: ["Asistente", "AtencionCliente"] },
];

const MODULE_ACCESS_BY_GROUP: Record<number, string[]> = {
  1: ["dashboard", "roles", "users", "sectors", "terrain-types", "clients", "comuneros", "certificate-requests", "certificates", "assembly-record-requests", "reports"],
  2: ["dashboard", "roles", "users", "sectors", "terrain-types", "clients", "comuneros", "certificate-requests", "certificates", "assembly-record-requests", "reports"],
  3: ["dashboard", "roles", "sectors", "terrain-types", "clients", "comuneros", "certificate-requests", "certificates", "assembly-record-requests", "reports"],
  4: ["dashboard", "clients", "certificate-requests", "certificates", "assembly-record-requests"],
};

const ROUTE_MODULES = [
  { module: "dashboard", match: (pathname: string) => pathname === "/" },
  { module: "certificates", match: (pathname: string) => pathname.startsWith("/certificados") },
  { module: "sectors", match: (pathname: string) => pathname.startsWith("/sectores") },
  { module: "terrain-types", match: (pathname: string) => pathname.startsWith("/tipos-terreno") },
  { module: "clients", match: (pathname: string) => pathname.startsWith("/clientes") },
  { module: "comuneros", match: (pathname: string) => pathname.startsWith("/comuneros") },
  { module: "certificate-requests", match: (pathname: string) => pathname.startsWith("/solicitudes-certificados") },
  { module: "assembly-record-requests", match: (pathname: string) => pathname.startsWith("/solicitudes-acta") },
  { module: "users", match: (pathname: string) => pathname.startsWith("/usuarios") },
];

const normalizeRoleName = (value: string) =>
  String(value || "")
    .toLowerCase()
    .replace(/[_\s-]/g, "");

export function getRoleGroup(role: RoleLike) {
  if (!role) return null;
  if (typeof role.group === "number" && role.group > 0) return role.group;

  const normalized = normalizeRoleName(role.name || "");
  const match = ROLE_GROUPS.find((item) => item.roles.some((candidate) => normalizeRoleName(candidate) === normalized));
  return match?.group || null;
}

export function getAllowedModuleKeys(user: UserLike) {
  const group = getRoleGroup(user?.role);
  return group ? MODULE_ACCESS_BY_GROUP[group] || [] : [];
}

export function canAccessModule(user: UserLike, moduleKey: string) {
  return getAllowedModuleKeys(user).includes(moduleKey);
}

export function getRouteModuleKey(pathname: string) {
  return ROUTE_MODULES.find((item) => item.match(pathname))?.module || null;
}

export function canAccessPath(user: UserLike, pathname: string) {
  const moduleKey = getRouteModuleKey(pathname);
  if (!moduleKey) return true;
  return canAccessModule(user, moduleKey);
}

export function canManageUser(actor: UserLike, target: { role?: RoleLike } | null | undefined) {
  const actorGroup = getRoleGroup(actor?.role);
  const targetGroup = getRoleGroup(target?.role);

  if (!actorGroup || !targetGroup) return false;
  if (actorGroup === 1) return targetGroup !== 1;
  if (actorGroup === 2) return targetGroup === 3 || targetGroup === 4;
  return false;
}

export function canManageCertificateLimit(actor: UserLike) {
  const actorGroup = getRoleGroup(actor?.role);

  if (!actorGroup) return false;
  return [1, 2].includes(actorGroup);
}

export function canAssignRole(actor: UserLike, role: RoleLike) {
  return canManageUser(actor, { role });
}

export function filterAssignableRoles<T extends { name: string; group?: number | null }>(actor: UserLike, roles: T[]) {
  return roles.filter((role) => canAssignRole(actor, role));
}
