import { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon | any;
  badge?: string;
  badgeColor?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface DashboardStatCard {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  icon?: any;
}
