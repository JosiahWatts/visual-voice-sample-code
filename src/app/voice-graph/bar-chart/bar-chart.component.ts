import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { VisualVoiceBarChart } from 'src/app/shared/models/visual-voice-bar-chart.model';
import { BarChartBar } from 'src/app/shared/models/bar-chart-bar.model';
import { AudioService } from 'src/app/shared/services/audio.service';
import { Subscription } from 'rxjs';
import { Utilities } from 'src/app/shared/utilties';

@Component({
    selector: 'bar-chart',
    templateUrl: 'bar-chart.component.html',
    styleUrls: ['bar-chart.component.scss']
})
export class BarChartComponent {

    @Input() data: VisualVoiceBarChart;
    @Input() audioSeekRate: number;
    @Output() onSeek: EventEmitter<number> = new EventEmitter();

    public barHeight = 1;
    public barWidth = 7;
    public barMargin = 2;
    public dotRadius = 4;
    public barColor = '#c6c6c6';

    public chartWidth = 0;
    public chartHeight = 100;
    public chartViewBox: string;

    public currentAgentText: string;
    public currentClientText: string;
    public selectedKeyword: string;

    public isAudioPlaying: boolean = false;

    private audioSubscription: Subscription;
    private currentAudioTime: number;

    constructor(private audioService: AudioService) {}

    public ngOnInit() {
        this.audioSubscription = 
            this.audioService.getState().subscribe(state => {
                this.isAudioPlaying = state.playing;
                this.currentAudioTime = state.currentTime;

                if (state.playing) {
                    this.getActiveSpeakerText();
                }
            })
    }

    public ngOnDestroy() {
        this.audioSubscription.unsubscribe();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['data'] != undefined) {
            this.chartWidth = this.data.length * (this.barWidth + this.barMargin) + 5;
            this.chartViewBox = `0 0 ${this.chartWidth} ${this.chartHeight}`;
            this.setStartingUtterences();
        }
    }

    public onClick(bar, index) {
        this.onSeek.emit(index);
    
        // Need this for now since production data
        // and development data differ.
        console.log(bar);
    }
    
    public setStartingUtterences() {
        this.currentAgentText = this.data.agent[0].text;
        this.currentClientText = this.data.customer[0].text;
    }

    public showKeywords(bar: BarChartBar) {
        this.selectedKeyword = bar.keywords;
        
        // Need this for now since production data
        // and development data differ.
        console.log(bar.keywords);
    }

    private getActiveSpeakerText() {
        let index = Math.floor(Math.floor(this.currentAudioTime) / this.audioSeekRate);
        index = Utilities.precisionRound(index, 1);

        this.currentAgentText = this.data.agent[index]?.text;
        this.currentClientText = this.data.customer[index]?.text;
    }

    public getOpacity(bar: BarChartBar, agent: boolean = true): boolean {
        const text = agent ? this.currentAgentText : this.currentClientText;

        if (bar.text == text) 
            return true;
        else 
            return false;
    }
}