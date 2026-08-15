import { getDb } from "@/lib/database";
import { createSplitRepository } from "@/lib/repositories/split_repository";
import { VCreateSplitInput, VSplit, type CreateSplitInput } from "@/lib/types";
import { mutation } from "noxt";

const splitRepo = createSplitRepository(getDb());

export const POST = mutation()
  .input(VCreateSplitInput)
  .output(VSplit)
  .endpoint((data) => {
    const input: CreateSplitInput = {
      ...data.input,
      participants: [...new Set(data.input.participants)],
    };

    const id = splitRepo.createSplit(input);
    const split = splitRepo.getSplit(id)!;

    data.response.status = 201;
    return split;
  });
