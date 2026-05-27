import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOpeningTime {
    days: string;
    opening?: string;
    closing?: string;
    closed: boolean;
}

export interface IReview {
    author?: string;
    rating: number;
    reviewText?: string;
    createdOn: Date;
}

export interface ILocation extends Document {
    name: string;
    address: string;
    rating: number;
    facilities: string[];
    coords: {
        type: string;
        coordinates: number[];
    };
    distance?: string;
    openingTimes: IOpeningTime[];
    reviews: IReview[];
}

const openingTimeSchema: Schema = new Schema({
    days: { type: String, required: true },
    opening: String,
    closing: String,
    closed: { type: Boolean, required: true }
});

const reviewSchema: Schema = new Schema({
    author: String,
    rating: { type: Number, required: true, min: 0, max: 5 },
    reviewText: String,
    createdOn: { type: Date, default: Date.now }
});

const locationSchema: Schema<ILocation> = new Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    facilities: [String],
    coords: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], index: '2dsphere' }
    },
    distance: String,
    openingTimes: [openingTimeSchema],
    reviews: [reviewSchema]
});

const Location: Model<ILocation> = mongoose.model<ILocation>('Location', locationSchema);

export default Location;
