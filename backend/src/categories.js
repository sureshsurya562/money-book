/**
 * Money Book structure — 4 clear pillars anyone can understand:
 * 1. Emergency Fund
 * 2. Long-term (risk) investments
 * 3. Life & Health Insurance
 * 4. Retirement planning
 */

export const PILLARS = [
  {
    id: "emergency",
    name: "Emergency Fund",
    shortName: "Emergency Fund",
    order: 1,
    color: "#0F766E",
    accent: "#CCFBF1",
    icon: "shield-check",
    tagline: "Money kept safe for sudden needs",
    description:
      "This is your safety money. Keep it in places you can take out quickly when life surprises you — job loss, medical bills, or home repairs. Do not put emergency money into stocks or risky investments.",
    whyUseful:
      "Without this, you may be forced to sell long-term investments at a loss or take costly loans when trouble comes.",
    benefits: [
      "Peace of mind when unexpected expenses come",
      "You do not disturb long-term investments",
      "Usually safer and easier to withdraw",
      "Ideal target: 6–12 months of family expenses",
    ],
    howItWorks:
      "Park money in FDs, savings account, and liquid funds. Update the current value every month.",
  },
  {
    id: "growth",
    name: "Long-term Investments",
    shortName: "Long-term (risk)",
    order: 2,
    color: "#1D4ED8",
    accent: "#DBEAFE",
    icon: "trending-up",
    tagline: "Money working hard for the future (some risk)",
    description:
      "These investments can go up and down in the short term, but over many years they can grow your wealth. This includes mutual funds, ETFs, stocks, corporate bonds, and real estate.",
    whyUseful:
      "Safe products alone may not beat inflation. Long-term investments help your money grow faster for big goals — house, children’s education, freedom.",
    benefits: [
      "Higher growth potential over 5–10+ years",
      "Beats inflation better than only FDs",
      "Can build serious wealth with SIPs",
      "Diversify across funds, stocks, bonds, property",
    ],
    howItWorks:
      "Invest regularly (SIPs help). Check values monthly. Do not panic-sell on short dips if your goal is long term.",
  },
  {
    id: "insurance",
    name: "Life & Health Insurance",
    shortName: "Insurance",
    order: 3,
    color: "#B45309",
    accent: "#FEF3C7",
    icon: "umbrella",
    tagline: "Protection for family and medical costs",
    description:
      "Insurance is not an investment. It protects your family if something happens to you (term life) and protects your savings from big hospital bills (health insurance).",
    whyUseful:
      "One medical emergency or loss of income can wipe out years of savings. Cover comes first; investing comes after.",
    benefits: [
      "Term life: large cover for family at low yearly cost",
      "Health: hospital bills do not destroy your savings",
      "Gives you courage to invest the rest confidently",
      "Tax benefits may apply (80C / 80D)",
    ],
    howItWorks:
      "Track cover amount and premium. Review every year. Keep nominees updated.",
  },
  {
    id: "retirement",
    name: "Retirement Planning",
    shortName: "Retirement",
    order: 4,
    color: "#6D28D9",
    accent: "#EDE9FE",
    icon: "sunrise",
    tagline: "Money for life after work stops",
    description:
      "These are long-lock, purpose-built savings for retirement — PPF, NPS, EPF, and Atal Pension Yojana (APY). Start early; small amounts grow a lot over decades.",
    whyUseful:
      "Salary stops one day. Retirement money must keep paying for food, rent, health, and dignity.",
    benefits: [
      "Built for 15–30+ year horizons",
      "Often government-backed or tax-friendly",
      "Forced discipline (lock-in helps you stay invested)",
      "Can combine safe (PPF/APY) + growth (NPS equity)",
    ],
    howItWorks:
      "Contribute every month/year. Track corpus. Do not withdraw early unless rules allow and you truly need it.",
  },
];

export const CATEGORIES = [
  // —— 1. Emergency Fund ——
  {
    id: "fixed_deposits",
    pillarId: "emergency",
    name: "Fixed Deposits (FDs)",
    shortName: "FDs",
    color: "#0F766E",
    icon: "landmark",
    description:
      "You give money to the bank for a fixed time. The bank pays you interest. Your money is safer here than in the stock market.",
    whyUseful:
      "Good for emergency corpus and near-term goals. You know roughly what you will get back.",
    benefits: [
      "Almost guaranteed returns",
      "Bank deposits insured up to ₹5 lakh per bank (DICGC)",
      "Auto-renewal options",
      "Easy to understand for anyone",
    ],
    platforms: ["Yono SBI", "iMobile (ICICI)", "Any bank app"],
  },
  {
    id: "savings_account",
    pillarId: "emergency",
    name: "Savings Account",
    shortName: "Savings",
    color: "#0D9488",
    icon: "wallet",
    description:
      "Everyday bank money you can withdraw anytime for daily needs or sudden expenses.",
    whyUseful:
      "Keeps cash ready. Use for day-to-day spending and a small instant emergency buffer.",
    benefits: [
      "Instant access to money",
      "Safe and simple",
      "Useful for monthly bills and small shocks",
      "Link to UPI / cards for daily use",
    ],
    platforms: ["Yono SBI", "iMobile (ICICI)", "Any bank"],
  },
  {
    id: "liquid_funds",
    pillarId: "emergency",
    name: "Liquid Funds",
    shortName: "Liquid",
    color: "#0891B2",
    icon: "droplets",
    description:
      "Mutual funds that invest in very short-term safe papers. Usually easier to take out than equity funds, and can earn a bit more than a savings account.",
    whyUseful:
      "Park emergency money that you may need in a few days — better return than idle cash, still relatively safe.",
    benefits: [
      "Usually T+1 liquidity",
      "Low risk compared to stocks",
      "Better than leaving large cash idle",
      "Good middle layer of emergency fund",
    ],
    platforms: ["Groww", "Zerodha Coin", "Bank apps"],
  },

  // —— 2. Long-term / risk investments ——
  {
    id: "mutual_funds",
    pillarId: "growth",
    name: "Mutual Funds",
    shortName: "MFs",
    color: "#2563EB",
    icon: "pie-chart",
    description:
      "Many people put money together. A professional fund manager invests it in shares or bonds. You own units of that fund.",
    whyUseful:
      "You get diversification and professional management without buying individual stocks yourself. SIPs make it easy every month.",
    benefits: [
      "Managed by professionals",
      "Spread across many companies",
      "Start small with SIPs",
      "Direct plans cost less",
      "Redeem when you need (exit load may apply)",
    ],
    platforms: ["Groww", "Zerodha Coin", "MF Central"],
  },
  {
    id: "etfs",
    pillarId: "growth",
    name: "ETFs",
    shortName: "ETFs",
    color: "#1D4ED8",
    icon: "bar-chart-2",
    description:
      "Funds that track an index (like Nifty 50 or gold) and trade on the stock exchange like a share.",
    whyUseful:
      "Low-cost way to own the whole market, gold, or foreign markets without picking stocks one by one.",
    benefits: [
      "Usually cheaper than active funds",
      "Clear what they track",
      "Buy/sell on exchange hours",
      "Good for India, US, gold exposure",
    ],
    platforms: ["Groww", "Zerodha", "Upstox"],
  },
  {
    id: "stocks",
    pillarId: "growth",
    name: "Stocks & Shares",
    shortName: "Stocks",
    color: "#4338CA",
    icon: "line-chart",
    description:
      "You buy a small ownership piece of a company. Price can rise or fall every day.",
    whyUseful:
      "Highest potential growth — and highest risk. Best if you understand the company and can hold for years.",
    benefits: [
      "Direct ownership in businesses",
      "Can grow a lot over long periods",
      "May pay dividends",
      "Full control over what you buy",
    ],
    platforms: ["iB Group", "Zerodha", "Groww"],
  },
  {
    id: "bonds",
    pillarId: "growth",
    name: "Corporate Bonds",
    shortName: "Bonds",
    color: "#CA8A04",
    icon: "scroll-text",
    description:
      "You lend money to a company. They pay you interest and return principal on a set date. Safer than stocks, riskier than bank FDs.",
    whyUseful:
      "Adds predictable income and balances a stock-heavy portfolio. Still check the company’s credit quality.",
    benefits: [
      "Regular interest (coupon)",
      "Less wild than stocks",
      "Known maturity date",
      "Helps diversify your money",
    ],
    platforms: ["WintWealth", "GoldenPi", "RBI Retail Direct"],
  },
  {
    id: "real_estate",
    pillarId: "growth",
    name: "Real Estate",
    shortName: "Property",
    color: "#DC2626",
    icon: "home",
    description:
      "Land or building you own — plot, flat, or shop. Value can rise over years. Hard to sell quickly.",
    whyUseful:
      "A solid long-term asset many Indian families understand. Good inflation hedge, but needs big money and patience.",
    benefits: [
      "You can see and touch the asset",
      "Can grow in value over decades",
      "May give rent (if built property)",
      "Familiar asset class in India",
    ],
    platforms: ["Direct purchase", "Developer / registry"],
  },
  {
    id: "sip_recurring",
    pillarId: "growth",
    name: "Monthly SIPs",
    shortName: "SIPs",
    color: "#0284C7",
    icon: "repeat",
    description:
      "Automatic monthly investments into mutual funds. Track the commitment here; the actual units usually sit under Mutual Funds.",
    whyUseful:
      "Builds the habit of investing every month without timing the market.",
    benefits: [
      "Rupee-cost averaging",
      "Discipline without thinking every month",
      "Small amounts grow with time",
      "Easy to increase as salary grows",
    ],
    platforms: ["Groww", "Zerodha Coin", "Bank mandate"],
  },

  // —— 3. Insurance ——
  {
    id: "term_insurance",
    pillarId: "insurance",
    name: "Term Life Insurance",
    shortName: "Term",
    color: "#B45309",
    icon: "heart-handshake",
    description:
      "If you pass away during the policy period, your family gets a large sum. You pay a small yearly premium. There is usually no big maturity payout if you survive — that is normal for pure term plans.",
    whyUseful:
      "Replaces your income for dependents. Essential if anyone relies on your salary.",
    benefits: [
      "High cover at low cost",
      "Protects spouse / children / parents",
      "Keeps long-term goals alive for family",
      "Simple product — pure protection",
    ],
    platforms: ["Insurer portal", "Policybazaar", "Bank"],
  },
  {
    id: "health_insurance",
    pillarId: "insurance",
    name: "Health Insurance",
    shortName: "Health",
    color: "#D97706",
    icon: "activity",
    description:
      "Pays (or reimburses) hospital and medical bills as per policy. Protects your emergency fund and investments from medical shocks.",
    whyUseful:
      "One surgery can cost lakhs. Health cover stops you from breaking FDs or selling investments in a hurry.",
    benefits: [
      "Cashless / reimbursement for treatment",
      "Protects family savings",
      "Can cover parents too (check policy)",
      "Often tax benefit under 80D",
    ],
    platforms: ["Insurer portal", "Hospital network", "Employer"],
  },

  // —— 4. Retirement ——
  {
    id: "ppf",
    pillarId: "retirement",
    name: "PPF",
    shortName: "PPF",
    color: "#7C3AED",
    icon: "shield",
    description:
      "Public Provident Fund — a government-backed savings account with long lock-in (15 years). Interest is tax-free.",
    whyUseful:
      "Very safe retirement / long-term bucket with strong tax benefits (EEE).",
    benefits: [
      "Government-backed safety",
      "Tax-free interest (EEE)",
      "80C benefit on deposits",
      "Compounds quietly for 15+ years",
    ],
    platforms: ["iMobile (ICICI)", "SBI Yono", "Post Office"],
  },
  {
    id: "nps",
    pillarId: "retirement",
    name: "NPS",
    shortName: "NPS",
    color: "#6D28D9",
    icon: "building-2",
    description:
      "National Pension System — retirement account where money can go into equity and debt. Employer may also contribute every month.",
    whyUseful:
      "Low-cost way to build a retirement corpus with extra tax benefits and market-linked growth options.",
    benefits: [
      "Employer + your contributions",
      "Choice of equity/debt mix",
      "Extra tax benefit (80CCD 1B)",
      "Built for retirement withdrawals",
    ],
    platforms: ["Employer payroll", "eNPS", "NSDL / CRA"],
  },
  {
    id: "epf",
    pillarId: "retirement",
    name: "EPF",
    shortName: "EPF",
    color: "#5B21B6",
    icon: "briefcase",
    description:
      "Employees’ Provident Fund — money cut from salary + employer share, saved for retirement. Many salaried people already have this.",
    whyUseful:
      "Automatic retirement saving from salary. Often a big part of Indian middle-class retirement corpus.",
    benefits: [
      "Auto-saved from salary",
      "Employer also contributes",
      "Long-term compounding",
      "Familiar and regulated",
    ],
    platforms: ["EPFO / UMANG", "Employer payroll"],
  },
  {
    id: "apy",
    pillarId: "retirement",
    name: "Atal Pension Yojana (APY)",
    shortName: "APY",
    color: "#A21CAF",
    icon: "sparkles",
    description:
      "A Government of India pension scheme. You pay a small amount every month. After age 60, you get a fixed monthly pension (based on what you chose).",
    whyUseful:
      "Very simple retirement income promise from the government — useful even if contribution is only a few hundred rupees a month.",
    benefits: [
      "Guaranteed pension after 60",
      "Pension options ₹1,000–₹5,000 / month",
      "Very small monthly payment",
      "Spouse / nominee protection",
      "Auto-debit from bank",
    ],
    platforms: ["Bank auto-debit", "Bank branch", "eNPS"],
  },
];

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || null;
}

export function getPillar(id) {
  return PILLARS.find((p) => p.id === id) || null;
}

export function getCategoriesByPillar(pillarId) {
  return CATEGORIES.filter((c) => c.pillarId === pillarId);
}

export function enrichCategory(category) {
  if (!category) return null;
  const pillar = getPillar(category.pillarId);
  return {
    ...category,
    pillarId: category.pillarId,
    pillarName: pillar?.name || null,
    pillarColor: pillar?.color || category.color,
    pillarTagline: pillar?.tagline || null,
  };
}
