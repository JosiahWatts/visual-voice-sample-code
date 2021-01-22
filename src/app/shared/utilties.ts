export class Utilities {

    public static precisionRound(x, precision) {
        const y = +x + (precision === undefined ? 0.5 : precision / 2);
        return y - (y % (precision === undefined ? 1 : +precision));
    }
}