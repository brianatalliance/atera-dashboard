import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useAgents, type Agent } from "@/hooks/use-data";
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X } from "lucide-react";

const PAGE_SIZE = 25;

type SortKey = keyof Agent;
type SortDir = "asc" | "desc";

export default function AgentsPage() {
  const { data: agents, isLoading } = useAgents();
  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const customers = useMemo(() => {
    if (!agents) return [];
    return [...new Set(agents.map((a) => a.customer))].sort();
  }, [agents]);

  const filtered = useMemo(() => {
    if (!agents) return [];
    let result = [...agents];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.customer.toLowerCase().includes(q) ||
          a.ip.toLowerCase().includes(q) ||
          a.user.toLowerCase().includes(q)
      );
    }

    // Customer filter
    if (customerFilter !== "all") {
      result = result.filter((a) => a.customer === customerFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      const isOnline = statusFilter === "online";
      result = result.filter((a) => a.online === isOnline);
    }

    // Sort
    result.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      if (typeof av === "boolean" && typeof bv === "boolean") {
        return sortDir === "asc" ? (av === bv ? 0 : av ? -1 : 1) : av === bv ? 0 : av ? 1 : -1;
      }
      return 0;
    });

    return result;
  }, [agents, search, customerFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 inline-block ml-0.5" />
    ) : (
      <ChevronDown className="w-3 h-3 inline-block ml-0.5" />
    );
  };

  const formatLastSeen = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " " +
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground" data-testid="page-title">Agents</h1>
        <p className="text-sm text-muted-foreground">
          {filtered.length} agent{filtered.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search name, customer, IP, user..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-9 text-sm"
            data-testid="input-search-agents"
          />
        </div>
        <Select value={customerFilter} onValueChange={(v) => { setCustomerFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px] h-9 text-sm" data-testid="select-customer-filter">
            <SelectValue placeholder="All Customers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {customers.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px] h-9 text-sm" data-testid="select-status-filter">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
        {(search || customerFilter !== "all" || statusFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSearch(""); setCustomerFilter("all"); setStatusFilter("all"); setPage(1); }}
            className="h-9 text-xs"
            data-testid="button-clear-filters"
          >
            <X className="w-3 h-3 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10 cursor-pointer select-none" onClick={() => handleSort("online")}>
                      Status <SortIcon col="online" />
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>
                      Name <SortIcon col="name" />
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort("customer")}>
                      Customer <SortIcon col="customer" />
                    </TableHead>
                    <TableHead className="cursor-pointer select-none hidden lg:table-cell" onClick={() => handleSort("os")}>
                      OS <SortIcon col="os" />
                    </TableHead>
                    <TableHead className="cursor-pointer select-none hidden md:table-cell" onClick={() => handleSort("ip")}>
                      IP <SortIcon col="ip" />
                    </TableHead>
                    <TableHead className="cursor-pointer select-none hidden xl:table-cell" onClick={() => handleSort("memory")}>
                      RAM <SortIcon col="memory" />
                    </TableHead>
                    <TableHead className="cursor-pointer select-none hidden md:table-cell" onClick={() => handleSort("lastSeen")}>
                      Last Seen <SortIcon col="lastSeen" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((agent) => (
                    <>
                      <TableRow
                        key={agent.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setExpandedId(expandedId === agent.id ? null : agent.id)}
                        data-testid={`agent-row-${agent.id}`}
                      >
                        <TableCell>
                          <span
                            className={`inline-block w-2.5 h-2.5 rounded-full ${
                              agent.online ? "bg-noc-success" : "bg-status-offline"
                            }`}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm font-medium">{agent.name}</TableCell>
                        <TableCell className="text-sm">{agent.customer}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell max-w-[200px] truncate">
                          {agent.os.replace("Microsoft ", "").replace("  x64", "")}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground hidden md:table-cell">{agent.ip}</TableCell>
                        <TableCell className="font-mono text-xs tabular-nums hidden xl:table-cell">
                          {(agent.memory / 1024).toFixed(1)} GB
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                          {formatLastSeen(agent.lastSeen)}
                        </TableCell>
                      </TableRow>
                      {expandedId === agent.id && (
                        <TableRow key={`${agent.id}-detail`}>
                          <TableCell colSpan={7} className="bg-muted/30 p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground text-xs block">Processor</span>
                                <span className="text-foreground text-xs">{agent.processor}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground text-xs block">Memory</span>
                                <span className="text-foreground text-xs font-mono tabular-nums">{agent.memory} MB ({(agent.memory / 1024).toFixed(1)} GB)</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground text-xs block">Vendor / Model</span>
                                <span className="text-foreground text-xs">{agent.vendor || "—"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground text-xs block">Domain</span>
                                <span className="text-foreground text-xs font-mono">{agent.domain || "—"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground text-xs block">OS Type</span>
                                <span className="text-foreground text-xs">{agent.osType}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground text-xs block">User</span>
                                <span className="text-foreground text-xs">{agent.user || "—"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground text-xs block">IP Address</span>
                                <span className="text-foreground text-xs font-mono">{agent.ip}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground text-xs block">Full OS</span>
                                <span className="text-foreground text-xs">{agent.os}</span>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-mono tabular-nums">{(page - 1) * PAGE_SIZE + 1}</span>–
            <span className="font-mono tabular-nums">{Math.min(page * PAGE_SIZE, filtered.length)}</span> of{" "}
            <span className="font-mono tabular-nums">{filtered.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="h-8 w-8 p-0"
              data-testid="button-prev-page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className="h-8 w-8 p-0 text-xs font-mono"
                  data-testid={`button-page-${pageNum}`}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="h-8 w-8 p-0"
              data-testid="button-next-page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
