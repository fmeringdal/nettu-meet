export class Identifier<T> {
    constructor(private value: T) {
        this.value = value;
    }

    equals(id?: Identifier<T>): boolean {
        if (id === null || id === undefined) {
            return false;
        }
        if (!(id instanceof this.constructor)) {
            return false;
        }

        return String(id.toValue()) === String(this.value);
    }

    toString() {
        return String(this.value);
    }

    /**
     * Return raw value of identifier
     */

    toValue(): T {
        return this.value;
    }
}
