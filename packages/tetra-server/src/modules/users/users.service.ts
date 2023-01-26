import { Model }                           from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel }                     from '@nestjs/mongoose';
import { User, UserDocument }              from '~modules/users/users.schema';
import { UserRole }                        from '~modules/users/enums/UserRole';
import { CryptoService }                   from '~modules/crypto/crypto.service';

@Injectable()
export class UsersService {
    private readonly _users: Model<UserDocument>;
    private readonly _crypto: CryptoService;

    public constructor(
        @InjectModel(User.name) users: Model<UserDocument>,
        crypto: CryptoService
    ) {
        this._users  = users;
        this._crypto = crypto;
    }

    public async findUserByUsername(username: string): Promise<UserDocument|null> {
        return this._users.findOne({ username });
    }

    public async findUserById(id: string): Promise<UserDocument|null> {
        return this._users.findOne({ _id: id });
    }

    public async createNewUser(username: string, password: string, role: UserRole = UserRole.USER): Promise<UserDocument> {
        const userAlreadyExists = await this._users.exists({ username });
        if (userAlreadyExists) {
            // TODO maybe throw a regular exception here and throw the 400 in controller instead of relying on it bubbling up?
            throw new BadRequestException();
        }

        const pass = await this._crypto.createPasswordHash(password);

        return await this._users.create({
            username,
            password: pass,
            role
        });
    }
}
