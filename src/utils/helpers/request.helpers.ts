import { AsyncLocalStorage } from "async_hooks";

type AsyncLocalStorageType = {
    correlationId: string;
}

// creating an instance of async local storage 
export const asyncLocalStorage = new AsyncLocalStorage<AsyncLocalStorageType>();  

// Function to get the correlation id from the async local storage 
export const getCorrelationId = () => {
    const asyncStore = asyncLocalStorage.getStore();
    return asyncStore?.correlationId || 'unknown-error-while-creating-correlation-id';  
}

