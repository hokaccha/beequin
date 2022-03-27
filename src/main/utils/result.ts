export type Ok<T> = {
  ok: true;
  value: T;
};

export type Err<E = Error> = {
  ok: false;
  error: E;
};

export type Result<T, E = Error> = Ok<T> | Err<E>;

export function unwrap<T>(result: Result<T>): T {
  if (result.ok) {
    return result.value;
  } else {
    throw result.error;
  }
}
