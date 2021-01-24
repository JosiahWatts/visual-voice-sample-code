import { Component, forwardRef, EventEmitter, Output, ChangeDetectorRef, Input, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

export const TOGGLE_SWITCH_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ToggleSwitchComponent),
    multi: true
};

@Component({
    selector: 'toggle-switch',
    providers: [ TOGGLE_SWITCH_ACCESSOR],
    encapsulation: ViewEncapsulation.None,
    template: `
        <div class="toggle-switch">
            <label class="toggle-switch__switch">
                <input (change)="onToggle($event)" 
                       [checked]="checked" 
                       type="checkbox" 
                       [ngClass]="{'disabled' : isDisabled}">
                <span class="toggle-switch__slider"></span>
            </label>
        </div>
    `
})

export class ToggleSwitchComponent {

    constructor(private cd: ChangeDetectorRef) { }

    public checked = false;

    @Input() isChecked = false;
    @Input() isDisabled = false; 

    @Output() onChange: EventEmitter<any> = new EventEmitter();

    onChanged: Function = () => {};
    onTouched: Function = () => {};
    
    public ngOnInit() {
        this.checked = this.isChecked;
    }

    public onToggle(event) {
        const inputChecked = event.target.checked;
        this.updateModel(event, inputChecked);
    }

    public toggle(event) {
        this.updateModel(event, !this.checked);
    }

    public updateModel(event: Event, value: boolean) {
        this.checked = value;
        this.onChanged(this.checked);
        this.onChange.emit({
            originalEvent: event,
            checked: this.checked
        });
    }

    public writeValue(checked: any) {
        this.checked = checked;
        this.cd.markForCheck();
    }

    public registerOnChange(fn: Function) {
        this.onChanged = fn;
    }

    public registerOnTouched(fn: Function) {
        this.onTouched = fn;
    }
}