import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VoiceGraphComponent } from './voice-graph/voice-graph.component';
import { BarChartComponent } from './voice-graph/bar-chart/bar-chart.component';
import { ToggleSwitchModule } from './shared/components/toggle-switch/toggle-switch.module';

@NgModule({
  declarations: [
    AppComponent,
    VoiceGraphComponent,
    BarChartComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ToggleSwitchModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
