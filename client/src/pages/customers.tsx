import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomers } from "@/hooks/use-data";
import { Building2, Monitor, Ticket, MapPin, Phone, Globe } from "lucide-react";

function formatPhone(phone: string): string {
  if (!phone) return "—";
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 10) {
    return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)}-${clean.slice(6)}`;
  }
  return phone;
}

export default function CustomersPage() {
  const { data: customers, isLoading } = useCustomers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground" data-testid="page-title">Customers</h1>
        <p className="text-sm text-muted-foreground">
          Managed customer organizations
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-5 w-32 mb-3" />
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-4 w-36" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers?.map((customer) => (
            <Card
              key={customer.id}
              className="hover:border-primary/30 transition-colors"
              data-testid={`customer-card-${customer.id}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-primary/10">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">{customer.name}</h3>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-mono tabular-nums text-foreground">{customer.agentCount}</span>
                    <span className="text-muted-foreground text-xs">agents</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Ticket className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-mono tabular-nums text-foreground">{customer.ticketCount.toLocaleString()}</span>
                    <span className="text-muted-foreground text-xs">tickets</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-muted-foreground">
                  {customer.domain && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{customer.domain.split(";")[0]}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{customer.address}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span>{formatPhone(customer.phone)}</span>
                    </div>
                  )}
                </div>

                {/* Created date */}
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Customer since {new Date(customer.created).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
