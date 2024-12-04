import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const userDtoSchema = z.object({
  emailId: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export class UserDTO extends createZodDto(userDtoSchema) {};
export type UserType = z.infer<typeof userDtoSchema>;
