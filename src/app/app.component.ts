import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ColorThemeService } from './shared/services/color-theme.service';
import { ColorPreference } from './shared/enums';
@Component({
  	selector: 'app-root',
  	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    public mobileMenuOpen: boolean = false;
    public themeSubscription: Subscription;
    public isDarkMode: boolean;

    private themePreference: ColorPreference;

    constructor(private colorThemeService: ColorThemeService) {}
    
    public ngOnInit() {

        this.isDarkMode = this.colorThemeService.prefersDarkTheme();
        
        this.themeSubscription = this.colorThemeService.colorPreferenceChange
            .subscribe((preference: ColorPreference) => {
                this.updateColorTheme(preference);
            });

        this.updateColorTheme(this.colorThemeService.getColorPreference());
    }

    public ngOnDestroy() {
        this.themeSubscription.unsubscribe();
    }

	public toggleMobileMenu() {
		this.mobileMenuOpen = !this.mobileMenuOpen;
	}

    public setColorPreference({ checked }) {
        const preference = checked ? ColorPreference.Dark : ColorPreference.Light;
    
        this.colorThemeService.setColorPreference(preference);
    }

    private updateColorTheme(preference: ColorPreference) {
        if (this.themePreference) {
            document.body.classList.remove(ColorPreference[this.themePreference].toLowerCase());
        }
        
        if (preference !== ColorPreference.Unset) {
            this.isDarkMode = preference === ColorPreference.Dark;
            document.body.classList.add(ColorPreference[preference].toLowerCase());
            this.themePreference = preference;
        }
    }
}
