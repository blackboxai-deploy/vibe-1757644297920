import { KeyData, UserCredits, KeyStats, STORAGE_KEYS } from '@/types';

/**
 * Storage utility class for managing local storage operations
 */
export class StorageManager {
  private static instance: StorageManager;

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  /**
   * Get user credits from storage
   */
  getUserCredits(): UserCredits {
    // For server-side, return default credits
    if (typeof window === 'undefined') {
      return {
        balance: 10,
        totalUsed: 0,
        totalPurchased: 10,
        lastTopUp: null
      };
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_CREDITS);
      if (stored) {
        const credits = JSON.parse(stored);
        return {
          ...credits,
          lastTopUp: credits.lastTopUp ? new Date(credits.lastTopUp) : null
        };
      }
    } catch (error) {
      console.error('Error reading user credits:', error);
    }

    // Default credits for new users
    return {
      balance: 10,
      totalUsed: 0,
      totalPurchased: 10,
      lastTopUp: null
    };
  }

  /**
   * Save user credits to storage
   */
  saveUserCredits(credits: UserCredits): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.USER_CREDITS, JSON.stringify(credits));
    } catch (error) {
      console.error('Error saving user credits:', error);
    }
  }

  /**
   * Get all generated keys from storage
   */
  getGeneratedKeys(): KeyData[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GENERATED_KEYS);
      if (stored) {
        const keys = JSON.parse(stored);
        return keys.map((key: any) => ({
          ...key,
          expiryDate: new Date(key.expiryDate),
          createdAt: new Date(key.createdAt),
          lastModified: new Date(key.lastModified)
        }));
      }
    } catch (error) {
      console.error('Error reading generated keys:', error);
    }
    return [];
  }

  /**
   * Save generated keys to storage
   */
  saveGeneratedKeys(keys: KeyData[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.GENERATED_KEYS, JSON.stringify(keys));
    } catch (error) {
      console.error('Error saving generated keys:', error);
    }
  }

  /**
   * Add a new key to storage
   */
  addKey(key: KeyData): void {
    const keys = this.getGeneratedKeys();
    keys.unshift(key);
    this.saveGeneratedKeys(keys);
  }

  /**
   * Update a key in storage
   */
  updateKey(keyId: string, updates: Partial<KeyData>): boolean {
    const keys = this.getGeneratedKeys();
    const keyIndex = keys.findIndex(key => key.id === keyId);
    
    if (keyIndex !== -1) {
      keys[keyIndex] = {
        ...keys[keyIndex],
        ...updates,
        lastModified: new Date()
      };
      this.saveGeneratedKeys(keys);
      return true;
    }
    return false;
  }

  /**
   * Delete a key from storage
   */
  deleteKey(keyId: string): boolean {
    const keys = this.getGeneratedKeys();
    const filteredKeys = keys.filter(key => key.id !== keyId);
    
    if (filteredKeys.length < keys.length) {
      this.saveGeneratedKeys(filteredKeys);
      return true;
    }
    return false;
  }

  /**
   * Delete multiple keys from storage
   */
  deleteKeys(keyIds: string[]): number {
    const keys = this.getGeneratedKeys();
    const filteredKeys = keys.filter(key => !keyIds.includes(key.id));
    const deletedCount = keys.length - filteredKeys.length;
    
    if (deletedCount > 0) {
      this.saveGeneratedKeys(filteredKeys);
    }
    return deletedCount;
  }

  /**
   * Update multiple keys status
   */
  updateKeysStatus(keyIds: string[], status: 'active' | 'paused'): number {
    const keys = this.getGeneratedKeys();
    let updatedCount = 0;
    
    keys.forEach(key => {
      if (keyIds.includes(key.id) && key.status !== 'expired') {
        key.status = status;
        key.lastModified = new Date();
        updatedCount++;
      }
    });
    
    if (updatedCount > 0) {
      this.saveGeneratedKeys(keys);
    }
    return updatedCount;
  }

  /**
   * Get key statistics
   */
  getKeyStats(): KeyStats {
    const keys = this.getGeneratedKeys();
    const credits = this.getUserCredits();
    
    // Update expired keys
    let updatedKeys = false;
    keys.forEach(key => {
      if (key.status !== 'expired' && new Date() > new Date(key.expiryDate)) {
        key.status = 'expired';
        key.lastModified = new Date();
        updatedKeys = true;
      }
    });
    
    if (updatedKeys) {
      this.saveGeneratedKeys(keys);
    }
    
    return {
      totalKeys: keys.length,
      activeKeys: keys.filter(key => key.status === 'active').length,
      pausedKeys: keys.filter(key => key.status === 'paused').length,
      expiredKeys: keys.filter(key => key.status === 'expired').length,
      totalCreditsUsed: credits.totalUsed
    };
  }

  /**
   * Deduct credits from user balance
   */
  deductCredits(amount: number): boolean {
    const credits = this.getUserCredits();
    
    if (credits.balance >= amount) {
      credits.balance -= amount;
      credits.totalUsed += amount;
      this.saveUserCredits(credits);
      return true;
    }
    return false;
  }

  /**
   * Add credits to user balance
   */
  addCredits(amount: number): void {
    const credits = this.getUserCredits();
    credits.balance += amount;
    credits.totalPurchased += amount;
    credits.lastTopUp = new Date();
    this.saveUserCredits(credits);
  }

  /**
   * Check if key exists
   */
  keyExists(keyValue: string): boolean {
    const keys = this.getGeneratedKeys();
    return keys.some(key => key.key.toLowerCase() === keyValue.toLowerCase());
  }

  /**
   * Search and filter keys
   */
  searchKeys(filters: {
    search?: string;
    status?: 'all' | 'active' | 'paused' | 'expired';
    type?: 'all' | 'random' | 'custom';
    duration?: 'all' | 7 | 14 | 30;
  }): KeyData[] {
    let keys = this.getGeneratedKeys();

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      keys = keys.filter(key => 
        key.key.toLowerCase().includes(searchTerm) ||
        key.type.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.status && filters.status !== 'all') {
      keys = keys.filter(key => key.status === filters.status);
    }

    if (filters.type && filters.type !== 'all') {
      keys = keys.filter(key => key.type === filters.type);
    }

    if (filters.duration && filters.duration !== 'all') {
      keys = keys.filter(key => key.duration === filters.duration);
    }

    return keys;
  }
}

// Export singleton instance
export const storage = StorageManager.getInstance();