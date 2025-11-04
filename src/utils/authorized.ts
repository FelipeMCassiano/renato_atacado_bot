export const authorized1 = parseInt(process.env.AUTHORIZED1!);
export const authorized2 = parseInt(process.env.AUTHORIZED2!);
export function isAuthorized(id: number): boolean {
    return id === authorized1 || authorized2 === id;
}
