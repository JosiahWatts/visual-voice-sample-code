import { Injectable } from '@angular/core';
import WaveformData from 'waveform-data';
import { VisualVoiceGraphMetadata } from '../models/visual-voice.model';
import { CallRecordingWaveformData } from '../models/call-recording-waveform.model';
import { EventAudioMetaData, EventAudioMetaDataContainer } from '../models/event-audio-metadata.model';
import { VisualVoiceBarChart } from '../models/visual-voice-bar-chart.model';
import { Keyword } from '../models/keyword.model';
import { BarChartBar } from '../models/bar-chart-bar.model';
import { Utilities } from '../utilties';

@Injectable({providedIn: 'root'})
export class VisualVoiceGraphService {

    private graphLabels: number[] = [];
    private agentChannelData: number[] = [];
    private customerChannelData: number[] = [];
    private audioDuration: number;
    private segmentSecondLength: number;

    private agentKeywords: Keyword[] = [];
    private customerKeywords: Keyword[] = [];

    private visualVoiceChartData: VisualVoiceBarChart;
    private audioWaveformData: CallRecordingWaveformData;
    private audioUtteranceData: EventAudioMetaData[];

    private readonly positveEmotionColor = '#87c03f';
    private readonly negativeEmotionColor = '#e04a1d';
    private readonly neutralEmotionColor = '#c6c6c6';

    constructor() { }

    public get audioSeekRate(): number {
        return this.segmentSecondLength;
    }

    public getVisualVoiceData(voiceData: EventAudioMetaDataContainer): Promise<VisualVoiceBarChart> {
        return new Promise((res, rej) => {
            
            const callMetaData = this.convertToVisualVoiceMeta(voiceData);

            this.resetGraph();
        
            this.processGraphData(callMetaData)
                .then(data => {
                    res(data);
                })
                .catch(reason => {
                    rej(reason);
                });
        });
    }

    private convertToVisualVoiceMeta(voiceData: EventAudioMetaDataContainer) {
        if (voiceData.json == '')
            return null;

        return {
            callRecordingWaveform: JSON.parse(voiceData.json),
            callRecordingEmotion: voiceData.metaData,
        };
    }

    private processGraphData(callMetaData: VisualVoiceGraphMetadata): Promise<VisualVoiceBarChart> {
        return new Promise((res, rej) => {

            if (!callMetaData) {
                rej('No Data found for call');
            }

            this.audioWaveformData = callMetaData.callRecordingWaveform;
            this.audioUtteranceData = callMetaData.callRecordingEmotion;
            
            this.normalizeWaveformData();
            this.createGraphData();
            this.packageUpGraphData();
            this.updateChannelEmotionColors('customer');
            this.updateChannelEmotionColors('agent');

            res(this.visualVoiceChartData);
        });
    }

    private resetGraph() {
        this.visualVoiceChartData = null;
        this.audioWaveformData = null;
        this.audioUtteranceData = [];
    }

    private normalizeWaveformData() {
        const maxVal = Math.max(...this.audioWaveformData.data);
        const normalizedValues = this.audioWaveformData.data.map(x => Math.abs(Math.round((x / maxVal) * 100) / 100));
        this.audioWaveformData.data = normalizedValues;
    }

    private createGraphData() {
        const waveform = WaveformData.create(this.audioWaveformData);
        
        this.agentChannelData = [];
        this.customerChannelData = [];
        this.audioDuration = Utilities.precisionRound(waveform.duration, 1);
        const chan1 = waveform.channel(1);
        const chan2 = waveform.channel(0);

        for (let i = 0; i < waveform.length - 1; i++) {
            const time = waveform.time(i + 1);
            const minChan1 = chan1.min_sample(i);
            const minChan2 = chan2.min_sample(i);
            const maxChan1 = chan1.max_sample(i);
            const maxChan2 = chan2.max_sample(i);

            this.graphLabels.push(Utilities.precisionRound(time, 1));
            this.agentChannelData.push((maxChan1 + minChan1) / 2);
            this.customerChannelData.push(((maxChan2 + minChan2) / 2));
        }

        this.segmentSecondLength = Math.floor((this.graphLabels[1] - this.graphLabels[0]));
    }

    private packageUpGraphData() {
        this.resetVisualVoiceGraph();
        this.visualVoiceChartData.length = this.agentChannelData.length;
        const buildChartBar = (index: number, value: number): BarChartBar => {
            return { index: index * this.segmentSecondLength, value: value, color: '#c6c6c6' }
        };

        for (let i = 0; i <= this.agentChannelData.length - 1; i++) {
          this.visualVoiceChartData.agent.push(buildChartBar(i, this.agentChannelData[i]));
          this.visualVoiceChartData.customer.push(buildChartBar(i, this.customerChannelData[i]));
        }

        this.visualVoiceChartData.seekRate = this.segmentSecondLength;
    }

    private updateChannelEmotionColors(channel: string) {
        let chartData: BarChartBar[] = this.visualVoiceChartData[channel];
        let utterences: EventAudioMetaData[];
        let keywordSet: Keyword[];
        
        if (channel === 'customer') {
            utterences = this.audioUtteranceData.filter(segment => segment['channel'] === 'Customer');
            keywordSet = this.customerKeywords;
        } else {
            utterences = this.audioUtteranceData.filter(segment => segment['channel'] === 'Agent');
            keywordSet = this.agentKeywords;
        }

        utterences.forEach(utt => {
            utt.start = Utilities.precisionRound(utt.start, 1);
            utt.end = Utilities.precisionRound(utt.end, 1);
        });

        utterences = this.sortUtterences(utterences);

        for (let i = 0; i <= chartData.length - 1; i++ ) {

            for (let j = 0; j <= utterences.length - 1; j++) {
            
                let utterenceStart = utterences[j].start;
                let utterenceEnd = utterences[j].end;

                if (chartData[i].index >= utterenceStart && chartData[chartData.length - 1].index >= utterenceEnd) {

                    chartData[i].color = this.getBarChartColor(utterences[j]?.emotion);
                    chartData[i].text = utterences[j]?.text;

                    if (i > 0 && (chartData[i].text !== chartData[i - 1].text)) {
                        chartData[i].keywords = this.getBarEmotionKeywords(utterences[j]);
                    } 
                    else 
                        chartData[i].keywords = '';
                }
            }
        }
    }

    private sortUtterences(utterences: EventAudioMetaData[]) {
        return utterences.sort((a,b) => (a.start - b.start) * 100);
    }

    private getBarChartColor(emotion: string): string {
        const callEmotion = emotion.toLowerCase();
    
        if (callEmotion.includes('positive'))
            return this.positveEmotionColor;
        else if (callEmotion.includes('negative'))
            return this.negativeEmotionColor;
        else
            return this.neutralEmotionColor;
    }

    private getBarEmotionKeywords(event: EventAudioMetaData) {
        const callEmotion = event?.emotion.toLowerCase();
        let keywords = event?.phrases.join(', ');
    
        if (keywords) {
            if (callEmotion.includes('positive'))
                keywords = `🙂 ${keywords}`;
            else if (callEmotion.includes('negative'))
                keywords = `😒 ${keywords}`;
        }

        return keywords;
    }

    private resetVisualVoiceGraph() {
        this.visualVoiceChartData = {
            agent: [],
            customer: [],
            seekRate: 3,
            length: 0
        };
    }
}