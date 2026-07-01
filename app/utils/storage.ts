class LocalStorageService {
  // Set item in localStorage, stringifies non-primitive values
  setItem<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      const stringValue =
        typeof value === "object" ? JSON.stringify(value) : value;
      localStorage.setItem(key, stringValue as string);
    } catch (error) {
      console.error(
        `Error setting item in localStorage for key "${key}":`,
        error
      );
    }
  }

  // Get item from localStorage, parses if it's a JSON string
  getItem<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      // Try to parse the item, return the item itself if parsing fails
      return this.isJSON(item) ? JSON.parse(item) : (item as unknown as T);
    } catch (error) {
      console.error(
        `Error getting item from localStorage for key "${key}":`,
        error
      );
      return null;
    }
  }

  // Remove item from localStorage
  removeItem(key: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(
        `Error removing item from localStorage for key "${key}":`,
        error
      );
    }
  }

  // Clear all localStorage items
  clear(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.clear();
    } catch (error) {
      console.error(`Error clearing localStorage:`, error);
    }
  }

  // Helper function to check if a string is a valid JSON
  private isJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
}

const storage = new LocalStorageService();
export default storage;
