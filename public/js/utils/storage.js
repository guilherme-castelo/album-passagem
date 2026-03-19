export const storage = {
    get(key, fallback = null) {
        try {
            const item = localStorage.getItem(key);
            return item !== null ? JSON.parse(item) : fallback;
        } catch (e) {
            console.warn(`Error reading localStorage for key "${key}"`, e);
            return fallback;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn(`Error writing to localStorage for key "${key}"`, e);
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn(`Error removing localStorage for key "${key}"`, e);
        }
    }
};
