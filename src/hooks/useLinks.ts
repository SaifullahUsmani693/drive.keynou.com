import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useLinks = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["links", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateLink = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ destinationUrl, shortCode }: { destinationUrl: string; shortCode: string }) => {
      const { data, error } = await supabase
        .from("links")
        .insert({
          destination_url: destinationUrl,
          short_code: shortCode,
          user_id: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success("Link created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, destinationUrl, shortCode }: { id: string; destinationUrl: string; shortCode: string }) => {
      const { data, error } = await supabase
        .from("links")
        .update({ destination_url: destinationUrl, short_code: shortCode })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success("Link updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success("Link deleted!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

function generateShortCode(length = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export { generateShortCode };
