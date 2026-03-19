import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useProfileAccess = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile-access", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, display_name, company_name, plan, subscription_active, link_limit, is_admin")
        .eq("user_id", user!.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useMySubscriptionRequests = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["subscription-requests", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_requests")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateSubscriptionRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      name,
      email,
      phone,
      message,
    }: {
      name: string;
      email: string;
      phone: string;
      message: string;
    }) => {
      const { data, error } = await supabase
        .from("subscription_requests")
        .insert({
          user_id: user?.id ?? null,
          name,
          email,
          phone,
          message,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-requests"] });
      toast.success("Your request has been sent.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useAdminProfiles = () => {
  return useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, display_name, company_name, plan, subscription_active, link_limit, is_admin, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useAdminSubscriptionRequests = () => {
  return useQuery({
    queryKey: ["admin-subscription-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateProfileAccess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      subscription_active,
      link_limit,
    }: {
      id: string;
      subscription_active: boolean;
      link_limit: number;
    }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update({ subscription_active, link_limit })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["profile-access"] });
      toast.success("Subscription access updated.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateSubscriptionRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      adminNotes,
    }: {
      id: string;
      status: "pending" | "approved" | "declined";
      adminNotes: string;
    }) => {
      const { data, error } = await supabase
        .from("subscription_requests")
        .update({ status, admin_notes: adminNotes })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-requests"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-requests"] });
      toast.success("Request updated.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
