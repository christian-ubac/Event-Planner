import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.envPUBLIC_SUPABASE_URL=https://nisjcizwryulqcnjlnst.supabase.co.,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEYsb_publishable__eI_5oQ-cAYei8GnZCXSww_DzYGZt1M,
  {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);