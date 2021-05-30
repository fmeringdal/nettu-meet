import { MongoEmailTokenVerificationRepoRepo } from './implementations/mongoTokenVerificationRepo';

const emailTokenVerificationRepoRepo = new MongoEmailTokenVerificationRepoRepo();

export { emailTokenVerificationRepoRepo };
