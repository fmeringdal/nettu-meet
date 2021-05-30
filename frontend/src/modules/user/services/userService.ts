import { Result } from "../../../shared/core/Result";
import { BaseAPI } from "../../../shared/infra/services/BaseAPI";

export interface IUserService {
  createEmailVerification(email: string): Promise<Result<void>>;
  validateEmailVerification(email: string, code: string): Promise<Result<void>>;
}

export class UserService extends BaseAPI implements IUserService {
  async createEmailVerification(email: string): Promise<Result<void>> {
    try {
      const res = await this.post(`/user/email-verification`, {
        email,
      });
      if (res.status !== 201) {
        return Result.fail("Invalid response code");
      }
      return Result.ok();
    } catch (error) {
      return Result.fail(error);
    }
  }

  async validateEmailVerification(
    email: string,
    code: string
  ): Promise<Result<void>> {
    try {
      const res = await this.post(`/user/email-verification/validate`, {
        email,
        code,
      });
      if (res.status !== 200) {
        return Result.fail("Invalid response code");
      }
      return Result.ok();
    } catch (error) {
      return Result.fail(error);
    }
  }
}
