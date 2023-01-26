import { Module }           from '@nestjs/common';
import { MongooseModule }   from '@nestjs/mongoose';
import { User, UserSchema } from '~modules/users/users.schema';
import { UsersService }     from '~modules/users/users.service';
import { CryptoModule }     from '~modules/crypto/crypto.module';

@Module({
    imports: [CryptoModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    providers: [UsersService],
    exports: [UsersService]
})
export class UsersModule {}
