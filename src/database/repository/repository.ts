import { Types } from "mongoose";
import { escapeRegex } from "../../utils/regex";
import { BrandModel, type Brand } from "../models/brand";
import type { Color } from "../models/color";
import type { Phone } from "../models/phone";

type FindPhonesOpts = {
    brandName: string;
    colors?: string[];
    inStockOnly?: boolean;
    trimColors?: boolean;
};

export async function findPhones({
    brandName,
    colors,
    inStockOnly,
    trimColors = true,
}: FindPhonesOpts): Promise<Phone[]> {
    const brandRx = new RegExp(escapeRegex(brandName), "i");

    const query: Record<string, any> = { name: { $regex: brandRx } };

    let colorRxs: RegExp[] = [];
    if (colors && colors.length) {
        colorRxs = colors.map((c) => new RegExp(`^${escapeRegex(c)}$`, "i"));
        query["phones.colors"] = { $in: colorRxs };
        if (inStockOnly) {
            query["phone.colors.inStock"] = true;
        }
    } else if (inStockOnly) {
        query["phone.colors.inStock"] = true;
    }

    const doc = await BrandModel.findOne(query)
        .select({ phones: 1 })
        .collation({ locale: "pt", strength: 1 })
        .lean();

    if (!doc) return [];

    const phones: Phone[] = Array.isArray(doc.phones) ? doc.phones : [];

    if (!colorRxs.length) {
        if (!inStockOnly) return phones;
        return phones.map((p) => ({
            ...p,
            colors: (p.colors ?? []).filter((c: Color) => c.inStock),
        }));
    }

    const matched = phones.filter((p) => {
        const colors = p.colors ?? [];
        return colors.some((c) => {
            if (inStockOnly && !c.inStock) return false;
            return colorRxs.some((rx) => rx.test(c.color));
        });
    });

    if (!trimColors) return matched;

    return matched.map((p) => ({
        ...p,
        colors: (p.colors ?? []).filter((c) => {
            if (inStockOnly && !c.inStock) return false;
            return colorRxs.some((rx) => rx.test(c.color));
        }),
    }));
}

export async function findPhoneById(id: string): Promise<Phone | undefined> {
    const result = await BrandModel.findOne(
        { "phones._id": id },
        { "phones.$": 1, name: 1 }
    );
    return result?.phones[0];
}
export async function removeColorFromStock(
    phoneId: string,
    colorId: string
): Promise<Brand | null> {
    const result = await BrandModel.findOneAndUpdate(
        {
            "phones._id": phoneId,
            "phones.colors._id": colorId,
        },
        {
            $set: { "phones.$[p].colors.$[c].inStock": false },
        },
        {
            arrayFilters: [
                { "p._id": new Types.ObjectId(phoneId) },
                { "c._id": new Types.ObjectId(colorId) },
            ],
            new: true,
            projection: {
                name: 1,
                phones: { $elemMatch: { _id: new Types.ObjectId(phoneId) } }, // return only the matched phone
            },
        }
    ).lean();
    if (!result?.phones) {
        return null;
    }
    return result;
}
