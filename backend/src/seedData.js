/** Seed holdings based on the user's actual portfolio notes */
export const SEED_HOLDINGS = [
  // Mutual Funds (GROWW) — invested = worth today until you update
  {
    category_id: "mutual_funds",
    name: "ICICI Prudential Manufacturing Fund Direct Growth",
    platform: "Groww",
    invested_amount: 125994,
    current_value: 125994,
    is_recurring: 1,
    recurring_amount: 0,
    recurring_frequency: "monthly",
    notes: "SIP on Groww — update worth today from app",
  },
  {
    category_id: "mutual_funds",
    name: "UTI Nifty 50 Index Fund Direct Growth",
    platform: "Groww",
    invested_amount: 119994,
    current_value: 119994,
    notes: "Index fund on Groww — update worth today from app",
  },
  {
    category_id: "mutual_funds",
    name: "ICICI Prudential Large Cap Fund Direct Growth",
    platform: "Groww",
    invested_amount: 44998,
    current_value: 44998,
    notes: "Large-cap on Groww — update worth today from app",
  },
  {
    category_id: "mutual_funds",
    name: "Quant Large and Mid Cap Fund Direct Growth",
    platform: "Groww",
    invested_amount: 31998,
    current_value: 31998,
    notes: "Large & mid-cap on Groww — update worth today from app",
  },
  {
    category_id: "mutual_funds",
    name: "Parag Parikh Flexi Cap Fund Direct Growth",
    platform: "Groww",
    invested_amount: 24999,
    current_value: 24999,
    is_recurring: 1,
    recurring_amount: 0,
    recurring_frequency: "monthly",
    notes: "SIP on Groww — update worth today from app",
  },
  {
    category_id: "mutual_funds",
    name: "Nippon India Small Cap Fund Direct Growth",
    platform: "Groww",
    invested_amount: 9999,
    current_value: 9999,
    notes: "Small-cap on Groww — update worth today from app",
  },

  // ETFs (GROWW) - 5L
  {
    category_id: "etfs",
    name: "Mirae Asset S&P 500 Top 50 ETF",
    platform: "Groww",
    invested_amount: 100000,
    current_value: 100000,
    notes: "US large-cap international exposure",
  },
  {
    category_id: "etfs",
    name: "Nippon India Hang Seng BeES / Hong Kong ETF",
    platform: "Groww",
    invested_amount: 40000,
    current_value: 40000,
    notes: "Hong Kong / China exposure",
  },
  {
    category_id: "etfs",
    name: "Nippon India Nifty 50 ETF",
    platform: "Groww",
    invested_amount: 100000,
    current_value: 100000,
    notes: "India large-cap core index",
  },
  {
    category_id: "etfs",
    name: "Nippon India Nifty Next 50 Junior BeES",
    platform: "Groww",
    invested_amount: 50000,
    current_value: 50000,
    notes: "Next 50 mid-large exposure",
  },
  {
    category_id: "etfs",
    name: "ICICI Prudential Gold ETF",
    platform: "Groww",
    invested_amount: 50000,
    current_value: 50000,
    notes: "Gold hedge allocation",
  },
  {
    category_id: "etfs",
    name: "ICICI Prudential BSE Sensex ETF",
    platform: "Groww",
    invested_amount: 100000,
    current_value: 100000,
    notes: "Sensex index exposure",
  },
  {
    category_id: "etfs",
    name: "Kotak Nifty PSU Bank ETF",
    platform: "Groww",
    invested_amount: 30000,
    current_value: 30000,
    notes: "PSU bank thematic",
  },
  {
    category_id: "etfs",
    name: "Motilal Oswal Nasdaq 100 ETF",
    platform: "Groww",
    invested_amount: 30000,
    current_value: 30000,
    notes: "US tech / Nasdaq exposure",
  },

  // Bonds
  {
    category_id: "bonds",
    name: "WintWealth Bonds (4 bonds × ₹10K)",
    platform: "WintWealth",
    invested_amount: 40000,
    current_value: 40000,
    notes: "4 different bonds, ₹10,000 each",
  },

  // FDs
  {
    category_id: "fixed_deposits",
    name: "SBI Fixed Deposit (444 days auto-renewal)",
    platform: "Yono SBI",
    invested_amount: 500000,
    current_value: 500000,
    notes: "444-day tenure with auto renewal",
    invested_date: null,
  },
  {
    category_id: "fixed_deposits",
    name: "ICICI Bank FDs (legacy)",
    platform: "iMobile (ICICI)",
    invested_amount: 461000,
    current_value: 461000,
    notes: "Older ICICI bank FDs (~4.61L)",
  },

  // PPF
  {
    category_id: "ppf",
    name: "ICICI PPF",
    platform: "iMobile (ICICI)",
    invested_amount: 150000,
    current_value: 150000,
    notes: "Public Provident Fund — long-term EEE savings",
  },

  // Liquid / savings (Emergency Fund)
  {
    category_id: "liquid_funds",
    name: "SBI Liquid Fund Direct Plan Growth",
    platform: "Groww",
    invested_amount: 100000,
    current_value: 100000,
    notes: "Liquid fund for near-term emergency parking",
  },
  {
    category_id: "savings_account",
    name: "SBI Savings Account (daily needs)",
    platform: "Yono SBI",
    invested_amount: 50000,
    current_value: 50000,
    notes: "Emergency / daily usage buffer",
  },

  // Stocks
  {
    category_id: "stocks",
    name: "Shares portfolio",
    platform: "iB Group",
    invested_amount: 1000000,
    current_value: 1000000,
    notes: "Direct equity holdings via iB Group (~10L)",
  },

  // Real estate
  {
    category_id: "real_estate",
    name: "Nature City open plot — Hyderabad",
    platform: "Direct purchase",
    invested_amount: 2500000,
    current_value: 2500000,
    notes: "Open plot real estate investment in Hyderabad",
  },

  // NPS
  {
    category_id: "nps",
    name: "NPS (employer contribution)",
    platform: "Employer payroll / NPS",
    invested_amount: 0,
    current_value: 0,
    is_recurring: 1,
    recurring_amount: 5000,
    recurring_frequency: "monthly",
    notes: "Company NPS ~₹5,000 every month. Update corpus current value as statements arrive.",
  },

  // APY
  {
    category_id: "apy",
    name: "Atal Pension Yojana (APY)",
    platform: "Bank auto-debit",
    invested_amount: 0,
    current_value: 0,
    is_recurring: 1,
    recurring_amount: 250,
    recurring_frequency: "monthly",
    notes: "Govt pension scheme — ₹250/month. Guaranteed pension after age 60.",
  },

  // Insurance — future protection (cover), not "money already invested"
  {
    category_id: "term_insurance",
    name: "Term Life Insurance — ₹1 Cr cover",
    platform: "Insurer / policy portal",
    invested_amount: 0,
    current_value: 0,
    is_protection: 1,
    cover_amount: 10000000,
    is_recurring: 1,
    recurring_amount: 28000,
    recurring_frequency: "yearly",
    notes: "₹1 Cr cover if something happens. Premium ~₹28,000/year for 10 years. Not an investment — family protection.",
  },
  {
    category_id: "health_insurance",
    name: "Health Insurance — Self + Mother",
    platform: "Insurer / policy portal",
    invested_amount: 0,
    current_value: 0,
    is_protection: 1,
    cover_amount: 1000000,
    is_recurring: 0,
    notes: "₹10 L health cover. Premium already paid for 3 years. Update cover/premium anytime.",
  },

  // EPF placeholder — add your balance when you have it
  {
    category_id: "epf",
    name: "EPF (Employees’ Provident Fund)",
    platform: "EPFO / Employer",
    invested_amount: 0,
    current_value: 0,
    notes: "Add your EPF balance from EPFO / UMANG when available.",
  },

  // Recurring SIPs
  {
    category_id: "sip_recurring",
    name: "Monthly SIP — 2 Mutual Funds on Groww",
    platform: "Groww",
    invested_amount: 0,
    current_value: 0,
    is_recurring: 1,
    recurring_amount: 5000,
    recurring_frequency: "monthly",
    notes: "₹5,000/month SIP across 2 mutual funds. Principal already reflected in MF holdings as you update them.",
  },
];
