import { Prisma } from "@prisma/client";

export const chatMessageSelect = Prisma.validator<Prisma.ChatMessageSelect>()({
  content: true,
  createdAt: true,
  author: {
    select: {
      name: true,
    },
  },
});

export type ChatMessageFrontend = Prisma.ChatMessageGetPayload<{
  select: typeof chatMessageSelect;
}>;
