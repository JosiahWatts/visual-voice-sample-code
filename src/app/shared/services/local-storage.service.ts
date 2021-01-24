import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class LocalStorageService {
    
    public getDataObject<T>(key: string): T {
        const data = this.retrieveItem(key);

        if (data !== null)
            return data as T;

        return null;
    }

    public saveDataObject(data: any, key: string) {
        this.addItem(data, key);
    }

    private retrieveItem(key: string) {
        const item = JSON.parse(localStorage.getItem(key));
        
        return item;
    }
    
    private addItem(data: any, key: string) {
        localStorage.setItem(key, JSON.stringify(data));
    }
}