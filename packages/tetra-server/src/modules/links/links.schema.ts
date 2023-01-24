import { HydratedDocument }            from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type LinksDocument = HydratedDocument<Link>;

@Schema({ timestamps: true })
export class Link {
    @Prop({ required: true })
    creator: string;

    @Prop({ required: true, unique: true })
    shortcode: string;

    @Prop({ required: true })
    destination: string;

    @Prop({ required: true, unique: true })
    deletionKey: string;

    @Prop({ default: false })
    disabled: boolean;

    @Prop({ type: Date })
    expiresAt: Date;
}

export const LinksSchema = SchemaFactory.createForClass(Link);
