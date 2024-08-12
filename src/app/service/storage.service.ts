import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  checkStorageQuota(): Promise<{usage: number, quota: number}> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return navigator.storage.estimate().then(estimate => {
        return {
          usage: estimate.usage || 0,
          quota: estimate.quota || 0
        };
      });
    } else {
      return Promise.reject('Storage API not supported');
    }
  }

  requestPersistentStorage(): Promise<boolean> {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      return navigator.storage.persist().then(granted => {
        return granted;
      });
    } else {
      return Promise.reject('Storage API not supported');
    }
  }

  checkLocalStorageSpace(): void {
    const threshold = 5 * 1024 * 1024; // 5 MB limit for localStorage
    let currentSize = 0;

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        currentSize += localStorage[key].length;
      }
    }

    if (currentSize >= threshold) {
      this.handleStorageFull();
    }
  }

  handleStorageFull(): void {
    // Preserve essential keys
    const essentialKeys = ['accessToken', 'userRights', 'auftragsnummer'];
    const preservedData: { [key: string]: string | null } = {};

    essentialKeys.forEach(key => {
      preservedData[key] = localStorage.getItem(key);
    });

    // Clear localStorage
    localStorage.clear();

    // Restore essential keys
    Object.keys(preservedData).forEach(key => {
      if (preservedData[key]) {
        localStorage.setItem(key, preservedData[key] as string);
      }
    });
  }
}
