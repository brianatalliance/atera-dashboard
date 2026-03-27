import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSummary, useOpenTickets, timeAgo } from "@/hooks/use-data";
import { useChartTheme } from "@/hooks/use-chart-theme";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  Open: "#22d3ee",
  Pending: "#f59e0b",
  Closed: "#6b7280",
  Resolved: "#22c55e",
  Deleted: "#ef4444",
  Merged: "#8b5cf6",
};

const PRIORITY_COLORS: Record<string, string> = {
  Low: "#3b82f6",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#ef4444",
};

function ChartTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-md px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.payload?.fill }} />
          <span className="text-foreground">{entry.name}:</span>
          <span className="font-mono tabular-nums font-medium text-foreground">{entry.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || "#6b7280";
  return (
    <Badge
      variant="outline"
      className="text-[10px] font-medium px-2 py-0.5 border-none"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {status}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const color = PRIORITY_COLORS[priority] || "#6b7280";
  return (
    <Badge
      variant="outline"
      className="text-[10px] font-medium px-2 py-0.5 border-none"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {priority}
    </Badge>
  );
}

export default function TicketsPage() {
  const { data: summary, isLoading: loadingSummary } = useSummary();
  const { gridColor, textColor } = useChartTheme();
  const { data: tickets, isLoading: loadingTickets } = useOpenTickets();
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");

  const customers = useMemo(() => {
    if (!tickets) return [];
    return [...new Set(tickets.map((t) => t.customer))].sort();
  }, [tickets]);

  const filtered = useMemo(() => {
    if (!tickets) return [];
    let result = [...tickets];
    if (statusFilter !== "all") result = result.filter((t) => t.status === statusFilter);
    if (priorityFilter !== "all") result = result.filter((t) => t.priority === priorityFilter);
    if (customerFilter !== "all") result = result.filter((t) => t.customer === customerFilter);
    return result;
  }, [tickets, statusFilter, priorityFilter, customerFilter]);

  // Charts
  const statusChartData = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.ticketsByStatus)
      .filter(([_, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [summary]);

  const priorityChartData = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.ticketsByPriority)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [summary]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground" data-testid="page-title">Tickets</h1>
        <p className="text-sm text-muted-foreground">
          Open and pending tickets
        </p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tickets by Status (All Time)</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {loadingSummary ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {statusChartData.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] || "#6b7280"} />
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Tickets by Priority (All Time)</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {loadingSummary ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={priorityChartData} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: textColor }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" name="Tickets" maxBarSize={40} radius={[4, 4, 0, 0]}>
                    {priorityChartData.map((entry, i) => (
                      <Cell key={i} fill={PRIORITY_COLORS[entry.name] || "#6b7280"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] h-9 text-sm" data-testid="select-ticket-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[130px] h-9 text-sm" data-testid="select-ticket-priority">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Select value={customerFilter} onValueChange={setCustomerFilter}>
          <SelectTrigger className="w-[160px] h-9 text-sm" data-testid="select-ticket-customer">
            <SelectValue placeholder="Customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {customers.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardContent className="p-0">
          {loadingTickets ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">Source</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden lg:table-cell">End User</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((ticket) => (
                    <TableRow key={ticket.ticketId} data-testid={`ticket-row-${ticket.ticketId}`}>
                      <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                        #{ticket.ticketId}
                      </TableCell>
                      <TableCell className="font-medium text-sm max-w-[200px] truncate">
                        {ticket.title}
                      </TableCell>
                      <TableCell><StatusBadge status={ticket.status} /></TableCell>
                      <TableCell><PriorityBadge priority={ticket.priority} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{ticket.type}</TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{ticket.source}</TableCell>
                      <TableCell className="text-sm">{ticket.customer}</TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{ticket.endUser}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground font-mono tabular-nums">
                        {timeAgo(ticket.created)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
