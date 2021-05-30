export class Option<T> {
  private val: T | undefined;

  private constructor(val: T | undefined) {
    this.val = val;
  }

  public static some<T>(val: T) {
    return new Option(val);
  }

  public static none<T>(): Option<T> {
    return new Option<T>(undefined);
  }

  public isNone() {
    return this.val === undefined;
  }

  public isSome() {
    return !this.isNone();
  }

  public unwrap() {
    return this.val as T;
  }

  public unwrap_or(val: T) {
    return this.isSome() ? this.val : val;
  }
}

export function some<T>(val: T): Option<T> {
  return Option.some(val);
}

export function none<T>(): Option<T> {
  return Option.none();
}
