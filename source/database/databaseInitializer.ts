import { Handler } from 'flexiblepersistence';

export default interface DatabaseInitializer {
  eventHandler?: Handler;
  prisma?;
  hasMemory?: boolean;
}
