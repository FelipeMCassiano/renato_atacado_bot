import { model, Schema, Types } from "mongoose";
import { ColorSchema, type Color } from "./color";

export interface Phone extends Document {
    _id: Types.ObjectId;
    modelName: string;
    colors: Color[];
    price: number;
}

export const PhoneSchema = new Schema<Phone>(
    {
        modelName: { type: String, required: true },
        colors: { type: [ColorSchema], required: true, default: [] },
        price: { type: Number, required: true },
    },
    { _id: true }
);

export const PhoneModel = model<Phone>("Phone", PhoneSchema);
