import { Model }              from 'mongoose';
import { Injectable }         from '@nestjs/common';
import { InjectModel }        from '@nestjs/mongoose';
import { User, UserDocument } from '~modules/users/users.schema';

@Injectable()
export class UsersService {
    public constructor(@InjectModel(User.name) private readonly _users: Model<UserDocument>) {}

    public async findUserByUsername(username: string): Promise<UserDocument|null> {
        return this._users.findOne({ username });
    }

    public async findUserById(id: string): Promise<UserDocument|null> {
        return this._users.findOne({ _id: id });
    }
}
