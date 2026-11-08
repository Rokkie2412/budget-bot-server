import supabase from "../libs/supabase.js";
import type { ConnectedAccount } from "../types/index.js";

const normalizePhone = (value: string): string => value.replace(/\D/g, '');

type AuthUser = { id: string; phone?: string | null; user_metadata?: Record<string, unknown> };

const getAuthPhone = (user: AuthUser): string =>
  String(user.phone ?? user.user_metadata?.phoneNumber ?? '');

const findUserByPhone = async (target: string): Promise<AuthUser | null> => {
  const perPage = 1000;
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const users = data.users as AuthUser[];
    const match = users.find((user) => normalizePhone(getAuthPhone(user)) === target);
    if (match) return match;

    if (users.length < perPage) return null;
    page += 1;
  }
};

/**
 * Resolves a WhatsApp number to the linked account. The phone number lives on the
 * Supabase Auth user (set from the budget-tracker-pwa profile), while `premium`
 * and `allow_chat` come from the shared `user_preferences` table.
 */
export const getConnectedAccount = async (phoneNumber: string): Promise<ConnectedAccount> => {
  const target = normalizePhone(phoneNumber);
  if (!target) return { registered: false };

  const user = await findUserByPhone(target);
  if (!user) return { registered: false };

  const { data, error } = await supabase
    .from('user_preferences')
    .select('premium, allow_chat')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;

  const preferences = data as { premium: boolean; allow_chat: boolean } | null;

  return {
    registered: true,
    userId: user.id,
    premium: preferences?.premium === true,
    allowChat: preferences?.allow_chat === true,
  };
};
