import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
    userId?: string;
    author: string;
    text: string;
    rating: number;
    latitude: number;
    longitude: number;
    createdAt: Date;
}

const commentSchema: Schema = new Schema({
    userId: { type: String },
    author: { type: String, required: true, maxlength: 100 },
    text: { type: String, required: true, maxlength: 1000 },
    rating: { type: Number, required: true, min: 0, max: 5 },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    createdAt: { type: Date, required: true, default: Date.now, immutable: true }
});

export interface IPlayer extends Document {
    name: string;
    firstName?: string;
    lastName?: string;
    age?: number;
    birthdate?: Date;
    nationality?: string;
    height?: number;
    weight?: number;
    number?: number;
    team?: string;
    league?: string;
    position?: string;
    photoUrl?: string;
    latitude: number;
    longitude: number;
    createdAt: Date;
    comments: IComment[];
}

const playerSchema: Schema = new Schema({
    name: { type: String, required: true, maxlength: 100 },
    firstName: { type: String, maxlength: 100 },
    lastName: { type: String, maxlength: 100 },
    age: { type: Number, min: 0 },
    birthdate: Date,
    nationality: { type: String, maxlength: 100 },
    height: { type: Number },
    weight: { type: Number },
    number: { type: Number, min: 0, max: 99 },
    team: { type: String, maxlength: 150 },
    league: { type: String, maxlength: 150 },
    position: { type: String, maxlength: 50 },
    photoUrl: { type: String, maxlength: 255 },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    createdAt: { type: Date, required: true, default: Date.now, immutable: true },
    comments: [commentSchema]
});

playerSchema.set('toJSON', {
    transform: (doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        if (ret.comments) {
            ret.comments = ret.comments.map((c: any) => {
                c.id = c._id;
                delete c._id;
                return c;
            });
        }
        return ret;
    }
});

const Player: Model<IPlayer> = mongoose.model<IPlayer>('Player', playerSchema);

export default Player;
