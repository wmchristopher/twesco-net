export function gcd(arr: number[]): number {
    function helper(a: number, b: number) {
        while (b !== 0) [a, b] = [b, a % b];
        return Math.abs(a);
    }
    return arr.reduce(helper)
}
