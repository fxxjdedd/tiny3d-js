export abstract class AsyncResource<T> {
    abstract load(): Promise<T>;
    get finished() {
        return !!this.defer.unsafe_value || !!this.defer.unsafe_failedReason;
    }
    getAsyncHandle(): { promise: Promise<T> } {
        return {
            promise: this.defer.promise,
        };
    }
    unsafe_getValue(): T | undefined {
        return this.defer.unsafe_value;
    }
    unsafe_getFailedReason(): string | undefined {
        return this.defer.unsafe_failedReason;
    }
    protected defer: Defer<T> = createDefer();
    resetDefer() {
        this.defer = createDefer();
    }
}

type Defer<T> = {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
    unsafe_value?: T;
    unsafe_failedReason?: string;
};
export function createDefer<T>() {
    const ret = {} as {
        promise: Promise<T>;
        resolve: (value: T | PromiseLike<T>) => void;
        reject: (reason?: any) => void;
        unsafe_value?: T;
        unsafe_failedReason?: string;
    };
    const promise = new Promise<T>((res, rej) => {
        ret.resolve = (val) => {
            ret.unsafe_value = val as T;
            res(val);
        };
        ret.reject = (reason) => {
            ret.unsafe_failedReason = reason;
            rej(reason);
        };
    });
    ret.promise = promise;
    return ret;
}
