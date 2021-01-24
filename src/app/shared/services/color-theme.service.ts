import { EventEmitter, Injectable } from '@angular/core';
import { ColorPreference } from '../enums';
import { LocalStorageService } from './local-storage.service';

@Injectable({providedIn: 'root'})
export class ColorThemeService {
    
    public colorPreferenceChange: EventEmitter<ColorPreference> = new EventEmitter();

    private readonly colorPreferenceKey = 'COLOR_SCHEME_KEY';
    
    constructor(private localStorageService: LocalStorageService) { }
    
    public getColorPreference(): ColorPreference {
        const colorPreference = this.localStorageService.getDataObject(this.colorPreferenceKey);

        if (colorPreference == undefined) {
            return ColorPreference.Unset;
        }

        return colorPreference as ColorPreference;
    }

    public setColorPreference(colorPreference: ColorPreference) {
        this.localStorageService.saveDataObject(colorPreference, this.colorPreferenceKey);
        this.colorPreferenceChange.emit(colorPreference);
    }

    public prefersDarkTheme(): boolean {
        const prefersDarkTheme = window.matchMedia("(prefers-color-scheme: dark)");

        return prefersDarkTheme.matches;
    }
}