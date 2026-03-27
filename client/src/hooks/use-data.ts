import { useQuery } from "@tanstack/react-query";

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}

// Types
export interface Summary {
  generatedAt: string;
  kpis: {
    totalAgents: number;
    onlineAgents: number;
    offlineAgents: number;
    activeAlerts: number;
    totalAlerts: number;
    openTickets: number;
    pendingTickets: number;
    totalTickets: number;
    totalCustomers: number;
  };
  agentsByCustomer: Record<string, number>;
  agentsByOSType: Record<string, number>;
  agentsByOS: Record<string, number>;
  onlineByCustomer: Record<string, { online: number; offline: number; total: number }>;
  alertsByCustomer: Record<string, number>;
  alertsBySeverity: Record<string, number>;
  alertsByCategory: Record<string, number>;
  ticketsByStatus: Record<string, number>;
  ticketsByPriority: Record<string, number>;
  ticketsBySource: Record<string, number>;
  ticketsByType: Record<string, number>;
  ticketsByCustomer: Record<string, number>;
}

export interface Agent {
  id: number;
  name: string;
  customer: string;
  os: string;
  osType: string;
  online: boolean;
  lastSeen: string;
  ip: string;
  processor: string;
  memory: number;
  vendor: string;
  user: string;
  domain: string;
}

export interface Alert {
  alertId: number;
  title: string;
  severity: string;
  category?: string;
  device: string;
  customer: string;
  created: string;
  message?: string;
  archived?: boolean;
}

export interface Ticket {
  ticketId: number;
  title: string;
  status: string;
  priority: string;
  type: string;
  source: string;
  customer: string;
  endUser: string;
  endUserEmail: string;
  created: string;
  technician: string;
}

export interface Customer {
  id: number;
  name: string;
  domain: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  created: string;
  agentCount: number;
  ticketCount: number;
}

export interface AlertTrend {
  month: string;
  Critical: number;
  Warning: number;
  Information: number;
}

export interface TicketTrend {
  month: string;
  count: number;
}

export function useSummary() {
  return useQuery<Summary>({
    queryKey: ["/data/summary"],
    queryFn: () => fetchJSON<Summary>("/data/summary.json"),
  });
}

export function useAgents() {
  return useQuery<Agent[]>({
    queryKey: ["/data/agents"],
    queryFn: () => fetchJSON<Agent[]>("/data/agents.json"),
  });
}

export function useActiveAlerts() {
  return useQuery<Alert[]>({
    queryKey: ["/data/active-alerts"],
    queryFn: () => fetchJSON<Alert[]>("/data/active-alerts.json"),
  });
}

export function useRecentAlerts() {
  return useQuery<Alert[]>({
    queryKey: ["/data/recent-alerts"],
    queryFn: () => fetchJSON<Alert[]>("/data/recent-alerts.json"),
  });
}

export function useOpenTickets() {
  return useQuery<Ticket[]>({
    queryKey: ["/data/open-tickets"],
    queryFn: () => fetchJSON<Ticket[]>("/data/open-tickets.json"),
  });
}

export function useCustomers() {
  return useQuery<Customer[]>({
    queryKey: ["/data/customers"],
    queryFn: () => fetchJSON<Customer[]>("/data/customers.json"),
  });
}

export function useAlertTrend() {
  return useQuery<AlertTrend[]>({
    queryKey: ["/data/alert-trend"],
    queryFn: () => fetchJSON<AlertTrend[]>("/data/alert-trend.json"),
  });
}

export function useTicketTrend() {
  return useQuery<TicketTrend[]>({
    queryKey: ["/data/ticket-trend"],
    queryFn: () => fetchJSON<TicketTrend[]>("/data/ticket-trend.json"),
  });
}

// Helper: time ago
export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
