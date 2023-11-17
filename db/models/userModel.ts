import { Schema, model } from "mongoose";

interface users {
  userId: string;
  first_name: string;
  username?: string;
  text?: [{text: string, date: string}];
  emoji: string,
}

const users = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      default: "no username :(",
    },
    text: [{ text: String, date: String }],
    emoji: String,
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

export const Users = model("users", users);
