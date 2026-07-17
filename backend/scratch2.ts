import { PrismaClientOptions } from '@prisma/client/runtime/library';
import { PrismaClient } from '@prisma/client';

console.log(PrismaClient.prototype.constructor.toString());
