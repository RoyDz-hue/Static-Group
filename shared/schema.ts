import { z } from "zod";

// User schema
export const userSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  isAdmin: z.boolean().default(false),
  groups: z.array(z.string()).default([])
});

// Group schema
export const groupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  members: z.array(z.string()),
  createdAt: z.number(),
  updatedAt: z.number()
});

// Chat message schema
export const messageSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  userId: z.string(),
  userDisplayName: z.string(),
  text: z.string(),
  timestamp: z.number()
});

export type User = z.infer<typeof userSchema>;
export type Group = z.infer<typeof groupSchema>;
export type Message = z.infer<typeof messageSchema>;
