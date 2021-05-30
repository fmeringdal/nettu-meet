import express from 'express';
import { Account } from '../../../../modules/account/domain/account';

export interface DecodedExpressRequest extends express.Request {
    decoded: {
        account: Account;
    };
}
