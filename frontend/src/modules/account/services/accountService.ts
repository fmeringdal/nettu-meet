import { Result } from "../../../shared/core/Result";
import { BaseAPI } from "../../../shared/infra/services/BaseAPI";

export interface CreateAccountRequest {
  emailToken: {
    email: string;
    code: string;
  };
  name: string;
}

export interface CreateAccountRespone {
  secretKey: string;
}

export interface IAccountService {
  createAccount(
    req: CreateAccountRequest
  ): Promise<Result<CreateAccountRespone>>;
}

export class AccountService extends BaseAPI implements IAccountService {
  async createAccount(
    req: CreateAccountRequest
  ): Promise<Result<CreateAccountRespone>> {
    try {
      const res = await this.post(`/account`, {
        ...req,
        label: req.name,
      });
      if (res.status !== 201) {
        return Result.fail("Invalid response code");
      }
      return Result.ok({
        secretKey: res.data.secretKey,
      });
    } catch (error) {
      return Result.fail(error);
    }
  }
}
