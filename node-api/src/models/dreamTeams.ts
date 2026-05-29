import mongoose, { Schema, Document } from 'mongoose';

export interface IDreamTeam extends Document {
    userId: string;
    name: string;
    createdAt: Date;
    playerIds: string[];
}

const DreamTeamSchema = new Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true, maxlength: 100 },
    createdAt: { type: Date, default: Date.now },
    playerIds: [{ type: Schema.Types.ObjectId, ref: 'Player' }]
});

export default mongoose.model<IDreamTeam>('DreamTeam', DreamTeamSchema);
