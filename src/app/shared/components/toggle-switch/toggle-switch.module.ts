import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToggleSwitchComponent } from './toggle-switch.component';

@NgModule({
    imports: [
        CommonModule
    ],
    exports: [
        ToggleSwitchComponent
    ],
    declarations: [
        ToggleSwitchComponent
    ],
    providers: [],
})
export class ToggleSwitchModule { }
