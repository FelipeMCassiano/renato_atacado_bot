import { model, Schema } from "mongoose";
import { PhoneSchema, type Phone } from "./phone";

export interface Brand extends Document {
    name: string;
    phones: Phone[];
}
const BrandSchema = new Schema<Brand>(
    {
        name: { type: String, required: true, unique: true },
        phones: { type: [PhoneSchema], default: [] },
    },
    { timestamps: true }
);
BrandSchema.index(
    { name: "text", "phones.modelName": "text" },
    { default_language: "portguese" }
);
BrandSchema.index({ "phones.colors.color": 1 });
BrandSchema.index({ "phones.colors.inStock": 1 });

export const BrandModel = model<Brand>("Brand", BrandSchema);
