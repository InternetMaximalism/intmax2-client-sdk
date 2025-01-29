class LocalStorageManage {
    constructor(key = 'intmax.sdk.content') {
        this.key = key;
    }
    getAllData() {
        const data = window.localStorage.getItem(this.key);
        if (data) {
            return JSON.parse(data);
        }
        return {};
    }
    resetAll() {
        window.localStorage.removeItem(this.key);
        window.dispatchEvent(new Event('reset-local-storage-manager'));
    }
    setItem(key, value) {
        const data = this.getAllData();
        data[key] = value;
        window.localStorage.setItem(this.key, JSON.stringify(data));
    }
    getItem(key) {
        const data = this.getAllData();
        if (!data?.[key])
            return data[key];
        try {
            return JSON.parse(data[key]);
            // eslint-disable-next-line
        }
        catch (e) {
            return data[key];
        }
    }
    removeItem(key) {
        const data = this.getAllData();
        delete data[key];
        window.localStorage.setItem(this.key, JSON.stringify(data));
    }
}
export const localStorageManager = new LocalStorageManage();
//# sourceMappingURL=localstorage.manager.js.map