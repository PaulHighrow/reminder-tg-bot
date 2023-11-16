import { Users } from "../models/userModel";

export const getUsers = async () => await Users.find({});

export const saveUser = async (body: Object) => await new Users(body).save();

export const findUser = async (userId: string) =>
  await Users.findOne({ userId });

export const updateUser = async (userId: string, update: Object) =>
  await Users.updateOne({ userId }, update, { new: false });
