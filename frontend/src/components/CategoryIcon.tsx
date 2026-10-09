import {
  Activity,
  BarChart2,
  Briefcase,
  Building2,
  Circle,
  Droplets,
  HeartHandshake,
  Home,
  Landmark,
  LineChart,
  PieChart,
  Repeat,
  ScrollText,
  Shield,
  ShieldCheck,
  Sparkles,
  Sunrise,
  TrendingUp,
  Umbrella,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  'shield-check': ShieldCheck,
  'trending-up': TrendingUp,
  umbrella: Umbrella,
  sunrise: Sunrise,
  landmark: Landmark,
  wallet: Wallet,
  droplets: Droplets,
  'pie-chart': PieChart,
  'bar-chart-2': BarChart2,
  'line-chart': LineChart,
  'scroll-text': ScrollText,
  home: Home,
  repeat: Repeat,
  'heart-handshake': HeartHandshake,
  activity: Activity,
  shield: Shield,
  'building-2': Building2,
  briefcase: Briefcase,
  sparkles: Sparkles,
  circle: Circle,
};

export default function CategoryIcon({
  name,
  size = 22,
  color = 'currentColor',
}: {
  name?: string | null;
  size?: number;
  color?: string;
}) {
  const Icon = (name && ICONS[name]) || Circle;
  return <Icon size={size} color={color} strokeWidth={1.75} />;
}
