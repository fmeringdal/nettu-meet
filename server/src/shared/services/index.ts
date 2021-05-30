import { FileStorage } from './filestorage/fileStorage';
import { redisConnection } from './redis/redisConnection';
import { EmailService } from './email/email';

const fileStorage = new FileStorage();
const emailService = new EmailService();

export { redisConnection, fileStorage, emailService };
