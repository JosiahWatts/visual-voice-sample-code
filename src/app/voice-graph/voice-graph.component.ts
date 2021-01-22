import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import testAudioMetaData from 'src/data/data';
import { AudioStreamState } from '../shared/models/audio-stream-state.model';
import { VisualVoiceBarChart } from '../shared/models/visual-voice-bar-chart.model';
import { AudioService } from '../shared/services/audio.service';
import { VisualVoiceGraphService } from '../shared/services/visual-voice-graph.service';


@Component({
  	selector: 'app-voice-graph',
  	templateUrl: './voice-graph.component.html',
  	styleUrls: ['./voice-graph.component.scss']
})
export class VoiceGraphComponent implements OnInit {

	public testAudioMetaData = testAudioMetaData;
	public visualVoiceBarChartData: VisualVoiceBarChart;
	public isLoading: boolean = false;
	public audioSeekRate: number;
	public audioUrl: string;
	public audioState: AudioStreamState;

	@ViewChild('audioProgressBar') audioProgressBar: ElementRef;

	constructor(private visualVoiceGraphService: VisualVoiceGraphService,
				private audioService: AudioService) { }

	ngOnInit(): void {
		this.isLoading = true;
		this.audioUrl = this.testAudioMetaData.audioUrl;

		this.audioService.getState()
			.subscribe(state => {
				this.audioState = state;
			});

		this.visualVoiceGraphService.getVisualVoiceData(testAudioMetaData)
			.then(chartData => {
				this.visualVoiceBarChartData = chartData;
				this.audioSeekRate = chartData.seekRate;
				this.loadAudioFile();
				this.isLoading = false;
				console.log(chartData);
			})
			.catch(reason => {
				console.log(reason);
				this.visualVoiceBarChartData = null;
				this.isLoading = false;
			});
	}

	public playAudio() {
        if (!this.audioState.playing)
            this.audioService.play();
        else
            this.audioService.pause();
    }

    public fastForwardAudio() {
        if (this.audioState.currentTime + this.audioSeekRate <= this.audioState.duration) {
            this.audioService.seekTo(this.audioState.currentTime += this.audioSeekRate);
        } else {
            this.audioService.seekTo(this.audioState.duration);
        }
    }

    public rewindAudio() {
        if (this.audioState.currentTime - this.audioSeekRate >= 0) {
            this.audioService.seekTo(this.audioState.currentTime -= this.audioSeekRate);
        } else {
            this.audioService.seekTo(0);
        }
    }

	public getProgressPercentage(): string {
        const progress = (this.audioState.currentTime / this.audioState.duration) * 100;
		
		return progress + '%';
	}
	
	public seekToTime($event) {
		const pointerPosition = $event.offsetX;
		const audioProgressBarWidth = this.audioProgressBar.nativeElement.offsetWidth;
		const audioProgressBarValue = Math.ceil((pointerPosition / audioProgressBarWidth) * 100);
		const seekToSeconds = this.audioState.duration * (audioProgressBarValue / 100);
		
		this.audioService.seekTo(seekToSeconds);
	}

	private loadAudioFile() {
		this.audioService
			.playAudioStream(this.audioUrl)
			.subscribe();
	}
}