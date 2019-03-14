// Custom Params helper type because existing counterpart "Parameters" uses any instead of never, which is faulsy
export type Params<T extends (...args: never[]) => unknown> = T extends (...args: infer P) => any ? P : never;

// For [First, ...Rest] tuple gets [Rest] tuple
export type DropFirst<T extends any[]> =
    ((...args: T) => any) extends (arg: any, ...rest: infer U) => any ? U : T;