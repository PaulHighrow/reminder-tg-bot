import "dotenv/config";
import mongoose from "mongoose";

declare var process: {
  env: {
    DB_URI: string;
  };
};

export const connectDB = async () => {
  await mongoose
    .connect(process.env.DB_URI)
    .then(() => console.log("success"))
    .catch((err: Error) => console.log(err));
};
