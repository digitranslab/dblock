import ForwardedIconComponent from "@/components/common/genericIconComponent";
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
import { AuthContext } from "@/contexts/authContext";
import {
  FlowRun,
  useDeleteFlowRun,
  useGetFlowRuns,
  useGetFlowRunStats,
} from "@/controllers/API/queries/flow-runs";
import { useContext, useState } from "react";

function formatDuration(ms: number | undefined): string {
  if (!ms) return "-";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString();
}

function getStatusColor(status: string): string {
  switch (status) {
    case "success":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "failure":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "running":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "cancelled":
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
}

export default function ExecutionHistoryPage(): JSX.Element {
  const { userData } = useContext(AuthContext);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [triggerFilter, setTriggerFilter] = useState<string>("all");

  const username = userData?.username || "User";

  const { data: flowRuns, isLoading, refetch } = useGetFlowRuns({
    status: statusFilter !== "all" ? statusFilter : undefined,
    trigger_type: triggerFilter !== "all" ? triggerFilter : undefined,
    limit: 100,
    order_by: "started_at",
    order_dir: "desc",
  });

  const { data: stats } = useGetFlowRunStats({ days: 7 });
  const deleteFlowRun = useDeleteFlowRun();

  const handleDelete = async (runId: string) => {
    if (confirm("Are you sure you want to delete this execution record?")) {
      await deleteFlowRun.mutateAsync(runId);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ForwardedIconComponent name="Home" className="h-5 w-5" />
            Homepage
          </h2>
          <p className="text-sm text-muted-foreground">
            Welcome, {username}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <ForwardedIconComponent name="RotateCw" className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold">{stats.total_runs}</div>
            <div className="text-sm text-muted-foreground">Total Runs (7d)</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.success_rate.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold text-red-600">
              {stats.failure_count}
            </div>
            <div className="text-sm text-muted-foreground">Failures</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold">
              {formatDuration(stats.avg_duration_ms)}
            </div>
            <div className="text-sm text-muted-foreground">Avg Duration</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failure">Failure</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={triggerFilter} onValueChange={setTriggerFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Trigger" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Triggers</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="api">API</SelectItem>
            <SelectItem value="webhook">Webhook</SelectItem>
            <SelectItem value="cron">Cron</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workflow</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Components</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : flowRuns && flowRuns.length > 0 ? (
              flowRuns.map((run: FlowRun) => (
                <TableRow key={run.id}>
                  <TableCell className="font-medium">
                    {run.flow_name || run.flow_id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(run.status)}`}
                    >
                      {run.status}
                    </span>
                  </TableCell>
                  <TableCell className="capitalize">{run.trigger_type}</TableCell>
                  <TableCell>{formatDate(run.started_at)}</TableCell>
                  <TableCell>{formatDuration(run.duration_ms)}</TableCell>
                  <TableCell>{run.components_executed}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(run.id)}
                    >
                      <ForwardedIconComponent
                        name="Trash2"
                        className="h-4 w-4 text-destructive"
                      />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No execution history found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
