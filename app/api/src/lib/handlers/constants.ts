export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 50;
export const DEFAULT_ORDER_DIRECTION = 'desc';

export const ScopeKinds = { USER: ['user'], ADMIN: ['user', 'admin'] } as const;
export const ScopeKindKeys = ['USER', 'ADMIN'] as const;
