import { connect } from "mongoose";
import { Enumerable } from "qinn";
import { BrandModel } from "./models/brand";
const DB_URL = process.env.DATABASE_URL!;

await connect(DB_URL);

type IPhone = {
    id: number;
    modelo: string;
    cores: Enumerable<string>;
    preco: number;
};

const iphones = Enumerable.from([
    {
        id: 1,
        modelo: "iPhone 17 Pro Max 256GB",
        cores: Enumerable.from(["Laranja"]),
        preco: 9600,
    },
    {
        id: 2,
        modelo: "iPhone 17 Pro 256GB E-SIM",
        cores: Enumerable.from(["Laranja"]),
        preco: 8450,
    },
    {
        id: 3,
        modelo: "iPhone 17 Air 256GB E-SIM",
        cores: Enumerable.from(["Preto"]),
        preco: 5700,
    },
    {
        id: 4,
        modelo: "iPhone 16 Plus 128GB Indiano",
        cores: Enumerable.from(["Branco"]),
        preco: 4750,
    },
    {
        id: 5,
        modelo: "iPhone 16 256GB",
        cores: Enumerable.from(["Preto"]),
        preco: 5050,
    },
    {
        id: 6,
        modelo: "iPhone 16 128GB",
        cores: Enumerable.from(["Rose", "Preto"]),
        preco: 4250,
    },
    {
        id: 7,
        modelo: "iPhone 15 128GB Indiano",
        cores: Enumerable.from(["Verde"]),
        preco: 3400,
    },
    {
        id: 8,
        modelo: "iPhone 14 128GB",
        cores: Enumerable.from(["Preto"]),
        preco: 3300,
    },
    {
        id: 9,
        modelo: "iPhone 13 128GB LZ",
        cores: Enumerable.from(["Branco"]),
        preco: 2950,
    },
] as IPhone[]);

export const seed = async () => {
    const p = iphones.toArray().map((p) => {
        return {
            modelName: p.modelo,
            price: p.preco,
            colors: p.cores.toArray().map((c) => ({ color: c, inStock: true })),
        };
    });

    await BrandModel.create({
        name: "Apple",
        phones: p,
    });
};
