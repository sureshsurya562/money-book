const TOKEN_KEY = 'money_book_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data as T;
}

export type User = {
  id: string;
  email: string;
  name: string;
  shareEnabled: boolean;
  shareToken: string | null;
};

export type Pillar = {
  id: string;
  name: string;
  shortName: string;
  color: string;
  accent: string;
  icon: string;
  tagline: string;
  description: string;
  whyUseful: string;
  benefits: string[];
  howItWorks: string;
};

export type Category = {
  id: string;
  pillarId: string;
  pillarName?: string | null;
  pillarColor?: string;
  name: string;
  shortName: string;
  color: string;
  icon: string;
  description: string;
  whyUseful: string;
  benefits: string[];
  platforms: string[];
};

export type Holding = {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon?: string;
  pillarId: string | null;
  pillarName: string | null;
  pillarColor: string;
  name: string;
  platform: string | null;
  investedAmount: number;
  currentValue: number;
  profit: number;
  profitPct: number;
  investedDate: string | null;
  notes: string | null;
  isProtection: boolean;
  isRecurring: boolean;
  recurringAmount: number;
  recurringFrequency: string | null;
  coverAmount: number;
  updatedAt: string;
};

export type SubcategorySummary = {
  categoryId: string;
  name: string;
  shortName?: string;
  color: string;
  icon: string;
  pillarId: string | null;
  invested: number;
  current: number;
  count: number;
  cover: number;
  monthlyRecurring: number;
  description?: string;
  whyUseful?: string;
  benefits?: string[];
};

export type PillarSummary = Pillar & {
  invested: number;
  current: number;
  profit: number;
  cover: number;
  count: number;
  allocationPct: number;
  kind?: 'wealth' | 'future';
  subcategories: SubcategorySummary[];
};

export type FutureSummary = {
  termCover: number;
  healthCover: number;
  totalCover: number;
  yearlyPremium: number;
  monthlyPension: number;
  monthlyCommitments: number;
  retirementCorpus: number;
  items: {
    id: string;
    name: string;
    categoryId: string;
    categoryName: string;
    pillarId: string | null;
    coverAmount: number;
    currentValue: number;
    investedAmount: number;
    recurringAmount: number;
    recurringFrequency: string | null;
    isProtection: boolean;
    notes: string | null;
    platform: string | null;
  }[];
};

export type Summary = {
  totalInvested: number;
  totalCurrent: number;
  totalProfit: number;
  totalProfitPct: number;
  holdingCount: number;
  assetCount: number;
  byCategory: SubcategorySummary[];
  byPillar: PillarSummary[];
  wealthPillars?: PillarSummary[];
  futurePillars?: PillarSummary[];
  monthlyOutflow: number;
  yearlyInsurancePremium: number;
  totalInsuranceCover: number;
  future?: FutureSummary;
};

export type HoldingInput = {
  categoryId: string;
  name: string;
  platform?: string;
  investedAmount?: number;
  currentValue?: number;
  investedDate?: string;
  notes?: string;
  isProtection?: boolean;
  isRecurring?: boolean;
  recurringAmount?: number;
  recurringFrequency?: string;
  coverAmount?: number;
};

export const api = {
  register: (body: { name: string; email: string; password: string; seedDemo?: boolean }) =>
    request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  me: () => request<{ user: User }>('/api/auth/me'),
  updateShare: (body: { enabled?: boolean; rotate?: boolean }) =>
    request<{ user: User }>('/api/auth/share', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  getPortfolio: () =>
    request<{
      holdings: Holding[];
      summary: Summary;
      categories: Category[];
      pillars: Pillar[];
    }>('/api/holdings'),
  getHolding: (id: string) =>
    request<{ holding: Holding; category: Category; pillar: Pillar | null }>(
      `/api/holdings/${id}`
    ),
  createHolding: (body: HoldingInput) =>
    request<{ holding: Holding }>('/api/holdings', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateHolding: (id: string, body: Partial<HoldingInput>) =>
    request<{ holding: Holding }>(`/api/holdings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  deleteHolding: (id: string) =>
    request<{ ok: boolean }>(`/api/holdings/${id}`, { method: 'DELETE' }),
  getCategories: () =>
    request<{ categories: Category[]; pillars: Pillar[] }>('/api/holdings/categories'),
  getShared: (token: string) =>
    request<{
      ownerName: string;
      holdings: Holding[];
      summary: Summary;
      categories: Category[];
    }>(`/api/share/${token}`),
  requestAccess: (body: { name?: string; mobile: string; note?: string }) =>
    request<{ ok: boolean; message: string }>('/api/access-requests', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  listAccessRequests: () =>
    request<{
      requests: {
        id: string;
        name: string | null;
        mobile: string;
        note: string | null;
        status: string;
        createdAt: string;
      }[];
    }>('/api/access-requests'),
};
