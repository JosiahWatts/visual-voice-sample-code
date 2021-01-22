import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
// import { AudioService } from 'src/app/shared/services/audio.service';
// import { AudioStreamState } from 'src/app/shared/models/audio-stream-state.model';
import { VisualVoiceBarChart } from 'src/app/shared/models/visual-voice-bar-chart.model';
import { BarChartBar } from 'src/app/shared/models/bar-chart-bar.model';

@Component({
    selector: 'bar-chart',
    templateUrl: 'bar-chart.component.html',
    styleUrls: ['bar-chart.component.scss']
})
export class BarChartComponent implements OnInit {

    @Input() data: VisualVoiceBarChart;
    @Input() agentTalkTime: number;
    @Input() clientTalkTime: number;
    @Input() currentTime: number;
    @Input() seekRate = 5;
    @Output() onSeek: EventEmitter<number> = new EventEmitter();

    public barHeight = 1;
    public barWidth = 7;
    public barMargin = 2;
    public dotRadius = 4;
    public barColor = '#c6c6c6';

    public _agentGender = 'm';
    public _clientGender = 'f';

    public chartWidth = 0;
    public chartHeight = 100;
    public chartViewBox: string;

    public currentAgentText: string;
    public currentClientText: string;
    //public audioState: AudioStreamState;

    constructor() {}

    public ngOnInit() {
        // this.audioService.getState().subscribe(state => {
        //     this.currentTime = state.currentTime;

        //     if (state.playing) {
        //         this.getActiveText();
        //     }
        // })
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['data'] != undefined) {
            this.chartWidth = this.data.length * (this.barWidth + this.barMargin) + 5;
            this.chartViewBox = `0 0 ${this.chartWidth} ${this.chartHeight}`;
            this.setStartingUtterences();
        }
    }

    public onClick(bar, index) {
        this.onSeek.emit((index * this.seekRate) - (this.seekRate / 2));

        // Need this for now since production data
        // and development data differ.
        console.log(bar);
    }
    
    public setStartingUtterences() {
        this.currentAgentText = this.data.agent[0].text;
        this.currentClientText = this.data.customer[0].text;
    }

    public showKeywords(bar: BarChartBar) {
        
        // Need this for now since production data
        // and development data differ.
        console.log(bar.keywords);
    }

    public getProgressValue() {
        const progressValue = (((this.currentTime * (this.barWidth + this.barMargin) - 10) / this.seekRate));

        if (progressValue <= 0) { return 0; }
        else return progressValue;
    }

    public getActiveText() {
        let index = Math.floor(Math.floor(this.currentTime) / this.seekRate);
        index = this.precRound(index, 3);

        this.currentAgentText = this.data.agent[index]?.text;
        this.currentClientText = this.data.customer[index]?.text;
    }

    public getOpacity(bar: BarChartBar, agent: boolean = true): boolean {
        const text = agent ? this.currentAgentText : this.currentClientText;

        if (bar.text == text) return true;
        else return false;
    }

    private precRound(x, precision) {
        const y = +x + (precision === undefined ? 0.5 : precision / 2);
        return y - (y % (precision === undefined ? 1 : +precision));
    }
}