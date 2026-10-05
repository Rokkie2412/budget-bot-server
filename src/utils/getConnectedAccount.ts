import { UserConnected } from "../models/index.js";
import type { IUserConnected } from "../types/index.js";

export const getConnectedAccount = async (userId: string): Promise<IUserConnected | null> => {
  const getUser = await UserConnected.findOne({userId});

  return getUser;
};

