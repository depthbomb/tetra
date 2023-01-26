import { UserDocument } from '~modules/users/users.schema';

declare module 'express-serve-static-core' {
    interface Request {
        user?: UserDocument;
    }
}
