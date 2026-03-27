import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSummary,
  useActiveAlerts,
  useAlertTrend,
  useTicketTrend,
  timeAgo,
} from "@/hooks/use-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Monitor,
  AlertTriangle,
  Ticket,
  Building2,
  Clock,
} from "lucide-react";
import { useChartTheme } from "@/hooks/use-chart-theme";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CHART_COLORS = {
  cyan: "#22d3ee",
  amber: "#f59e0b",
  red: "#ef4444",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  orange: "#f97316",
  pink: "#ec4899",
};

const SEVERITY_COLORS: Record<string, string> = {
  Critical: CHART_COLORS.red,
  Warning: CHART_COLORS.amber,
  Information: CHART_COLORS.blue,
};

const SOURCE_COLORS = [CHART_COLORS.cyan, CHART_COLORS.amber, CHART_COLORS.purple, CHART_COLORS.green, CHART_COLORS.pink, CHART_COLORS.orange];

function ChartTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-md px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-foreground">{entry.name}:</span>
          <span className="font-mono tabular-nums font-medium text-foreground">{entry.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// KPI Card
function KpiCard({
  title,
  value,
  icon: Icon,
  subtitle,
  accent,
  pulse,
}: {
  title: string;
  value: number | string;
  icon: typeof Monitor;
  subtitle?: React.ReactNode;
  accent?: string;
  pulse?: boolean;
}) {
  return (
    <Card className={`relative overflow-hidden ${pulse ? "animate-alert-pulse" : ""}`} data-testid={`kpi-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className={`text-2xl font-bold font-mono tabular-nums ${accent || "text-foreground"}`}>
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
          </div>
          <div className={`p-2 rounded-md ${accent ? "bg-opacity-10" : "bg-muted"}`}>
            <Icon className={`w-4 h-4 ${accent || "text-muted-foreground"}`} />
          </div>
        </div>
      </CardContent>
      {accent && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: accent === "text-noc-critical" ? CHART_COLORS.red : accent === "text-noc-cyan" ? CHART_COLORS.cyan : CHART_COLORS.green }} />}
    </Card>
  );
}

function KpiSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <Skeleton className="h-3 w-20 mb-2" />
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

export default function OverviewPage() {
  const { data: summary, isLoading: loadingSummary } = useSummary();
  const { gridColor, textColor } = useChartTheme();
  const { data: activeAlerts, isLoading: loadingAlerts } = useActiveAlerts();
  const { data: alertTrend, isLoading: loadingAlertTrend } = useAlertTrend();
  const { data: ticketTrend, isLoading: loadingTicketTrend } = useTicketTrend();

  // Agents by customer chart data
  const agentsByCustomerData = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.agentsByCustomer)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [summary]);

  // Online vs Offline by customer
  const onlineOfflineData = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.onlineByCustomer)
      .map(([name, data]) => ({ name, online: data.online, offline: data.offline }))
      .sort((a, b) => (b.online + b.offline) - (a.online + a.offline));
  }, [summary]);

  // Tickets by source donut
  const ticketsBySourceData = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.ticketsBySource)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [summary]);

  // OS Distribution
  const osData = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.agentsByOS)
      .map(([name, count]) => ({
        name: name.replace("Microsoft ", "").replace("  x64", ""),
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [summary]);

  // Alert trend with formatted months
  const alertTrendData = useMemo(() => {
    if (!alertTrend) return [];
    return alertTrend.map((d) => ({
      ...d,
      label: new Date(d.month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    }));
  }, [alertTrend]);

  // Ticket trend with formatted months
  const ticketTrendData = useMemo(() => {
    if (!ticketTrend) return [];
    return ticketTrend.map((d) => ({
      ...d,
      label: new Date(d.month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    }));
  }, [ticketTrend]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground" data-testid="page-title">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Network operations center — real-time monitoring
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {loadingSummary ? (
          Array.from({ length: 5 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : summary ? (
          <>
            <KpiCard
              title="Total Agents"
              value={summary.kpis.totalAgents}
              icon={Monitor}
              accent="text-noc-cyan"
              subtitle={
                <span className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-noc-success" />
                    <span className="font-mono tabular-nums">{summary.kpis.onlineAgents}</span> online
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-offline" />
                    <span className="font-mono tabular-nums">{summary.kpis.offlineAgents}</span> offline
                  </span>
                </span>
              }
            />
            <KpiCard
              title="Active Alerts"
              value={summary.kpis.activeAlerts}
              icon={AlertTriangle}
              accent="text-noc-critical"
              pulse={summary.kpis.activeAlerts > 0}
            />
            <KpiCard
              title="Open Tickets"
              value={summary.kpis.openTickets}
              icon={Ticket}
            />
            <KpiCard
              title="Pending Tickets"
              value={summary.kpis.pendingTickets}
              icon={Clock}
              accent="text-noc-cyan"
            />
            <KpiCard
              title="Customers"
              value={summary.kpis.totalCustomers}
              icon={Building2}
            />
          </>
        ) : null}
      </div>

      {/* Charts Row 1: Agents by Customer + Online/Offline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agents by Customer</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {loadingSummary ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={agentsByCustomerData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" name="Agents" fill={CHART_COLORS.cyan} radius={[0, 4, 4, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Online vs Offline by Customer</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {loadingSummary ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={onlineOfflineData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="online" name="Online" stackId="a" fill={CHART_COLORS.green} maxBarSize={24} />
                  <Bar dataKey="offline" name="Offline" stackId="a" fill="#6b7280" radius={[0, 4, 4, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Alert Trend + Ticket Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alert Trend (12 Months)</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {loadingAlertTrend ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={alertTrendData} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: textColor }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: textColor }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="Critical" stackId="1" stroke={CHART_COLORS.red} fill={CHART_COLORS.red} fillOpacity={0.3} />
                  <Area type="monotone" dataKey="Warning" stackId="1" stroke={CHART_COLORS.amber} fill={CHART_COLORS.amber} fillOpacity={0.3} />
                  <Area type="monotone" dataKey="Information" stackId="1" stroke={CHART_COLORS.blue} fill={CHART_COLORS.blue} fillOpacity={0.3} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: "11px", color: textColor }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Trend (12 Months)</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {loadingTicketTrend ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={ticketTrendData} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: textColor }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: textColor }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="count" name="Tickets" stroke={CHART_COLORS.cyan} strokeWidth={2} dot={{ r: 3, fill: CHART_COLORS.cyan }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3: Tickets by Source + OS Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tickets by Source</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {loadingSummary ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={ticketsBySourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {ticketsBySourceData.map((_, i) => (
                      <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">OS Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {loadingSummary ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={osData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: textColor }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 10, fill: textColor }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" name="Agents" fill={CHART_COLORS.purple} radius={[0, 4, 4, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAlerts ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : activeAlerts && activeAlerts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Sev</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeAlerts.map((alert) => (
                    <TableRow key={alert.alertId} data-testid={`alert-row-${alert.alertId}`}>
                      <TableCell>
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: SEVERITY_COLORS[alert.severity] || CHART_COLORS.blue }}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-sm">{alert.title}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{alert.device}</TableCell>
                      <TableCell className="text-sm">{alert.customer}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground font-mono tabular-nums">
                        {timeAgo(alert.created)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-noc-success" />
                No active alerts — all systems operational
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
