import { createRequestHandler } from "@react-router/express";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "~/database/schema";
import express from "express";
import postgres from "postgres";
import "react-router";

import { DatabaseContext } from "~/database/context";

declare module "react-router" {
  interface AppLoadContext {
    VALUE_FROM_EXPRESS: string;
  }
}

export const app = express();

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });
app.use(express.json());
app.use((_, __, next) => DatabaseContext.run(db, next));

// Add API routes here

// Simple GET users route
app.get("/api/users", async (req, res) => {
  try {
    const users = await db.select().from(schema.guestBook); // Adjust based on your schema
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching users" });
  }
});

// Simple POST user route
app.post("/api/users", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email)
    return res.status(400).json({ error: "Missing name or email" });
  try {
    const [user] = await db
      .insert(schema.guestBook)
      .values({ name, email })
      .returning();
    res.status(201).json(user);
  } catch (error) {
    console.log(error.stack);
    res.status(500).json({ error: "Error saving user" });
  }
});

app.use(
  createRequestHandler({
    build: () => import("virtual:react-router/server-build"),
    getLoadContext() {
      return {
        VALUE_FROM_EXPRESS: "Hello from Express",
      };
    },
  })
);
