import { Component, OnInit } from '@angular/core';
import testData1 from 'src/data/test-data';
import { VisualVoiceBarChart } from '../shared/models/visual-voice-bar-chart.model';
import { VisualVoiceGraphService } from '../shared/services/visual-voice-graph.service';

@Component({
  	selector: 'app-voice-graph',
  	templateUrl: './voice-graph.component.html',
  	styleUrls: ['./voice-graph.component.scss']
})
export class VoiceGraphComponent implements OnInit {

	public testData1 = testData1;
	public visualVoiceBarChartData: VisualVoiceBarChart;
	public isLoading: boolean = false;
	public audioSeekRate: number;

  	constructor(private visualVoiceGraphService: VisualVoiceGraphService) { }

	ngOnInit(): void {
		this.visualVoiceGraphService.getVisualVoiceData(testData1)
			.then(chartData => {
				this.visualVoiceBarChartData = chartData;
				this.audioSeekRate = chartData.seekRate;
				this.isLoading = false;
			})
			.catch(reason => {
				console.log(reason);
				this.visualVoiceBarChartData = null;
				this.isLoading = false;
			});
	}

}

// import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
// import { CiGraphService } from 'src/app/shared/services/ci-graph.service';
// import { ReportService } from 'src/app/shared/services/report/report.service';
// import { VisualVoiceGraphMetadata } from 'src/app/shared/models/call/visual-voice.model';
// import { VisualVoiceBarChart } from 'src/app/shared/models/call/visual-voice-bar-chart.model';
// import { AudioService } from 'src/app/shared/services/audio.service';
// import { AudioStreamState } from 'src/app/shared/models/audio-stream-state.model';
// import { Router } from '@angular/router';
// import { SubscriptionWrapper } from 'src/app/shared/subscription-wrapper';
// import { NgxSpinnerService } from 'ngx-spinner';
// import { fadeInOut } from 'src/app/shared/animations/animations';

// @Component({
//     selector: 'call-graph',
//     templateUrl: 'call-graph.component.html',
//     styleUrls: ['./call-graph.component.scss'],
//     animations: [fadeInOut],
// })

// export class CallGraphComponent implements OnInit {

//     public visualVoiceGraphMetadata: VisualVoiceGraphMetadata;
//     public visualVoiceBarChartData: VisualVoiceBarChart;
//     public audioState: AudioStreamState;

//     public currentTime = 0;
//     public seekRate = 5;
//     public audioFile: string;
//     public isSentimentPositive = 'yes';
//     public isLoading: boolean = false;
//     public graphErrorMessage: string;
//     public showHighlighting: boolean = false;

//     @Input() isPreview: boolean = false;
//     @Input() eventId: number;
//     @Input() audioUrl: string;
//     @Input() secondsToAnswer: number;
//     @Input() audioDuration: number;
//     @Input() overTalk: number;
//     @Input() silence: number;
//     @Input() callEndType: string;
//     @Input() agentGender: string;
//     @Input() clientGender: string;
//     @Input() sentiment: string;
//     @Input() clientTalkTime: number;
//     @Input() agentTalkTime: number;

//     public toolTipText = `
//                         The sum of the agent talk time, customer talk time, silence and over talk 
//                         will show the total talk time percentage.  If the percentage is above 100% then there was over 
//                         talk that occurred on the call which means the agent and customer were speaking at the same time.`;

//     private subWrapper = new SubscriptionWrapper();

//     constructor(private graphService: CiGraphService,
//         private reportService: ReportService,
//         private audioService: AudioService,
//         private spinner: NgxSpinnerService,
//         private router: Router) { }

//     ngOnInit() {
//         this.subWrapper.add(
//             this.audioService
//                 .getState()
//                 .subscribe(state => {
//                     this.audioState = state;
//                 })
//         );

//         this.subWrapper.add(
//             this.router.events.subscribe((val) => {
//                 if (this.router.navigated) {
//                     this.audioService.stop();
//                 }
//             })
//         );
//     }

//     ngOnChanges(changes: SimpleChanges) {
//         if (typeof changes['eventId'] !== 'undefined') {
//             if (this.eventId && this.eventId > 0) {
//                 this.isLoading = true;
//                 this.spinner.show();

//                 this.subWrapper.add(
//                     this.reportService.getCallEventVisualVoice(this.eventId).subscribe(voiceData => {
//                         if (voiceData) {
//                             this.graphService.getVisualVoiceData(voiceData)
//                                 .then(chartData => {
//                                     this.visualVoiceBarChartData = chartData;
//                                     this.seekRate = chartData.seekRate;
//                                     this.isLoading = false;
//                                     this.spinner.hide();
//                                 })
//                                 .catch(reason => {
//                                     this.graphErrorMessage = reason;
//                                     this.visualVoiceBarChartData = null;
//                                     this.isLoading = false;
//                                     this.spinner.hide();
//                                 });
//                         }
//                     })
//                 );
//             }
//         }

//         if (typeof changes['audioUrl'] !== 'undefined') {
//             this.stopAudio();
//             this.visualVoiceBarChartData = null;
//             this.loadCall();
//         }

//         if (typeof changes['sentiment'] !== 'undefined' && this.sentiment) {
//             if (this.sentiment.toString().toUpperCase().includes('POSITIVE')) {
//                 this.isSentimentPositive = 'yes';
//             } else if (this.sentiment.toString().toUpperCase().includes('MIXED')) {
//                 this.isSentimentPositive = 'neutral';
//             } else {
//                 this.isSentimentPositive = 'no';
//             }
//         }
//     }

//     ngOnDestroy() {
//         this.subWrapper.cleanup();
//     }

//     public loadCall() {
//         this.audioFile = 'http://' + this.audioUrl;
//         this.subWrapper.add(
//             this.audioService
//                 .playAudioStream(this.audioFile)
//                 .subscribe()
//         );
//     }

//     public playPauseAudio(play = true) {
//         if (!this.audioState.playing)
//             this.audioService.play();
//         else
//             this.audioService.pause();
//     }

//     public stopAudio() {
//         this.audioService.stop();
//     }

//     public fastForwardAudio() {
//         if (this.audioState.currentTime + this.seekRate <= this.audioState.duration) {

//             this.audioService.seekTo(this.audioState.currentTime += this.seekRate);
//         } else {
//             this.audioService.seekTo(this.audioState.duration);
//         }
//     }

//     public rewindAudio() {
//         if (this.audioState.currentTime - this.seekRate >= 0) {
//             this.audioService.seekTo(this.audioState.currentTime -= this.seekRate);

//         } else {
//             this.audioService.seekTo(0);
//         }
//     }

//     public seekAudioToIndex($event) {
//         this.audioService.seekTo($event);
//     }

//     public getSentimentColor(): string {
//         let css = 'neutral';

//         if (this.isSentimentPositive === 'yes') {
//             css = 'positive';
//         }
//         else if (this.isSentimentPositive === 'no') {
//             css = 'negative';
//         }

//         return css;
//     }
// }
