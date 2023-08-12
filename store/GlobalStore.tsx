let Store: any = null;

export function saveStore(createdStore: { state: any; dispatch: any }) {
    Store = { ...createdStore };
}

export function getStore() {
    return Store;
}

export function clearStore() {
    Store = null;
    return Store;
}
