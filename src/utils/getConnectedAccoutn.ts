import { UserConnected } from "../models/index.js";
import type { IUserConnected } from "../types/index.js";

const getConnectedAccount = async (userId: string)=> {
  const getUser = await UserConnected.findOne({userId});

  return getUser;
};

export default UserConnected;
