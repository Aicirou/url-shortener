import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createShortUrlSchema = z.object({
  longUrl: z.string().url(),
  customAlias: z.string().optional(),
  topic: z.string().optional(),
});

export class CreateShortUrlDTO extends createZodDto(createShortUrlSchema) {}
export type CreateShortUrlType = z.infer<typeof createShortUrlSchema>;
