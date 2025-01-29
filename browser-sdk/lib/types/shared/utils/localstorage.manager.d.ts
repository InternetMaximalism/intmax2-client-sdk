export interface StorageManager {
    getAllData: () => {} | Record<string, string>;
    setItem: (key: string, value: string) => void;
    getItem: (key: string) => string;
    removeItem: (key: string) => void;
    resetAll: () => void;
}
declare class LocalStorageManage implements StorageManager {
    key: string;
    constructor(key?: string);
    getAllData(): any;
    resetAll(): void;
    setItem<T>(key: string, value: string | T[] | T): void;
    getItem<T>(key: string): T;
    removeItem(key: string): void;
}
export declare const localStorageManager: LocalStorageManage;
export {};
