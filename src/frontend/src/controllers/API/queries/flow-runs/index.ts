import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api";

export interface FlowRun {
  id: string;
  flow_id: string;
  flow_name?: string;
  user_id?: string;
  session_id?: string;
  status: "pending" | "running" | "success" | "failure" | "cancelled";
  started_at: string;
  ended_at?: string;
  duration_ms?: number;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  error_message?: string;
  error_type?: string;
  trigger_type: string;
  components_executed: number;
  metadata?: Record<string, unknown>;
}

export interface FlowRunStats {
  total_runs: number;
  success_count: number;
  failure_count: number;
  running_count: number;
  success_rate: number;
  avg_duration_ms: number;
  trigger_counts: Record<string, number>;
  status_counts: Record<string, number>;
  period_days: number;
}

export interface FlowRunsQueryParams {
  flow_id?: string;
  status?: string;
  trigger_type?: string;
  limit?: number;
  offset?: number;
  order_by?: string;
  order_dir?: "asc" | "desc";
}

// Get flow runs with optional filters
export const useGetFlowRuns = (params: FlowRunsQueryParams = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.flow_id) queryParams.append("flow_id", params.flow_id);
  if (params.status) queryParams.append("status", params.status);
  if (params.trigger_type) queryParams.append("trigger_type", params.trigger_type);
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.offset) queryParams.append("offset", params.offset.toString());
  if (params.order_by) queryParams.append("order_by", params.order_by);
  if (params.order_dir) queryParams.append("order_dir", params.order_dir);

  return useQuery<FlowRun[]>({
    queryKey: ["flowRuns", params],
    queryFn: async () => {
      const response = await api.get(`/api/v1/flow-runs/?${queryParams.toString()}`);
      return response.data;
    },
  });
};

// Get flow run statistics
export const useGetFlowRunStats = (params: { flow_id?: string; days?: number } = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.flow_id) queryParams.append("flow_id", params.flow_id);
  if (params.days) queryParams.append("days", params.days.toString());

  return useQuery<FlowRunStats>({
    queryKey: ["flowRunStats", params],
    queryFn: async () => {
      const response = await api.get(`/api/v1/flow-runs/stats?${queryParams.toString()}`);
      return response.data;
    },
  });
};

// Get a single flow run
export const useGetFlowRun = (runId: string) => {
  return useQuery<FlowRun>({
    queryKey: ["flowRun", runId],
    queryFn: async () => {
      const response = await api.get(`/api/v1/flow-runs/${runId}`);
      return response.data;
    },
    enabled: !!runId,
  });
};

// Delete a flow run
export const useDeleteFlowRun = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (runId: string) => {
      const response = await api.delete(`/api/v1/flow-runs/${runId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flowRuns"] });
      queryClient.invalidateQueries({ queryKey: ["flowRunStats"] });
    },
  });
};

// Delete multiple flow runs
export const useDeleteFlowRuns = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: { flow_id?: string; older_than_days?: number }) => {
      const queryParams = new URLSearchParams();
      if (params.flow_id) queryParams.append("flow_id", params.flow_id);
      if (params.older_than_days) queryParams.append("older_than_days", params.older_than_days.toString());
      
      const response = await api.delete(`/api/v1/flow-runs/?${queryParams.toString()}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flowRuns"] });
      queryClient.invalidateQueries({ queryKey: ["flowRunStats"] });
    },
  });
};
