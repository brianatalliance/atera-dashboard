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
import { useActiveAlerts, useRecentAlerts, timeAgo, type Alert } from "@/hooks/use-data";
import { AlertTriangle, Clock, Shield } from "lucide-react";

const SEVERITY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Critical: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-500" },
  Warning: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-500" },
  Information: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-500" },
};

function SeverityBadge({ severity }: { severity: string }) {
  const colors = SEVERITY_COLORS[severity] || SEVERITY_COLORS.Information;
  return (
    <Badge variant="outline" className={`${colors.bg} ${colors.text} border-none text-[10px] font-medium px-2 py-0.5`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} mr-1.5`} />
      {severity}
    </Badge>
  );
}

function AlertCard({ alert, showMessage }: { alert: Alert; showMessage?: boolean }) {
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-md bg-card border border-border hover:bg-muted/30 transition-colors"
      data-testid={`active-alert-${alert.alertId}`}
    >
      <span
        className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
          SEVERITY_COLORS[alert.severity]?.dot || "bg-blue-500"
        }`}
      />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm text-foreground truncate">{alert.title}</span>
          <SeverityBadge severity={alert.severity} />
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-mono">{alert.device}</span>
          <span>·</span>
          <span>{alert.customer}</span>
          <span>·</span>
          <span className="font-mono tabular-nums">{timeAgo(alert.created)}</span>
        </div>
        {showMessage && alert.message && (
          <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
        )}
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const { data: activeAlerts, isLoading: loadingActive } = useActiveAlerts();
  const { data: recentAlerts, isLoading: loadingRecent } = useRecentAlerts();
  const [severityFilter, setSeverityFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");

  const customers = useMemo(() => {
    if (!recentAlerts) return [];
    return [...new Set(recentAlerts.map((a) => a.customer))].sort();
  }, [recentAlerts]);

  const filteredRecent = useMemo(() => {
    if (!recentAlerts) return [];
    let result = [...recentAlerts];
    if (severityFilter !== "all") {
      result = result.filter((a) => a.severity === severityFilter);
    }
    if (customerFilter !== "all") {
      result = result.filter((a) => a.customer === customerFilter);
    }
    return result;
  }, [recentAlerts, severityFilter, customerFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground" data-testid="page-title">Alerts</h1>
        <p className="text-sm text-muted-foreground">
          Monitor and manage alerts across all devices
        </p>
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-noc-critical" />
            <CardTitle className="text-sm font-medium">
              Active Alerts
              {activeAlerts && (
                <span className="ml-2 text-xs font-mono tabular-nums text-noc-critical">
                  ({activeAlerts.length})
                </span>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loadingActive ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : activeAlerts && activeAlerts.length > 0 ? (
            <div className="space-y-2">
              {activeAlerts.map((alert) => (
                <AlertCard key={alert.alertId} alert={alert} showMessage />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 mr-2 text-noc-success" />
              No active alerts
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Alerts Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Recent Alerts Timeline</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[130px] h-8 text-xs" data-testid="select-severity-filter">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="Warning">Warning</SelectItem>
                  <SelectItem value="Information">Information</SelectItem>
                </SelectContent>
              </Select>
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger className="w-[160px] h-8 text-xs" data-testid="select-customer-filter">
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
          </div>
        </CardHeader>
        <CardContent>
          {loadingRecent ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Sev</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="w-16">Status</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecent.map((alert) => (
                    <TableRow key={alert.alertId} data-testid={`recent-alert-${alert.alertId}`}>
                      <TableCell>
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${
                            SEVERITY_COLORS[alert.severity]?.dot || "bg-blue-500"
                          }`}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-sm">{alert.title}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{alert.device}</TableCell>
                      <TableCell className="text-sm">{alert.customer}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            alert.archived
                              ? "text-muted-foreground border-muted"
                              : "text-noc-critical border-red-500/30"
                          }`}
                        >
                          {alert.archived ? "Archived" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground font-mono tabular-nums">
                        {timeAgo(alert.created)}
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
