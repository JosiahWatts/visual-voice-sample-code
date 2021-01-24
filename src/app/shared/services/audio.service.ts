import { Injectable } from '@angular/core';
import { AudioStreamState } from '../models/audio-stream-state.model';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Reference:
// https://auth0.com/blog/building-an-audio-player-app-with-angular-and-rxjs/

@Injectable({providedIn: 'root'})
export class AudioService {
    
    private stop$ = new Subject();
    private audio = new Audio();

    // These are the audio events that exist on the HTML Audio Object
    public audioEvents = [ 
        'ended', 
        'error', 
        'play', 
        'playing', 
        'pause', 
        'timeupdate', 
        'canplay', 
        'loadedmetadata', 
        'loadstart'
    ];

    private state: AudioStreamState = {
        playing: false,
        readableCurrentTime: '',
        readableDuration: '',
        duration: undefined,
        currentTime: undefined,
        canplay: false,
        error: false,
    };

    private stateChange: BehaviorSubject<AudioStreamState> = new BehaviorSubject(this.state);

    constructor () {}

    private audioStreamObservable(url) {
        return new Observable(x => {
            this.audio.src = url;
            this.audio.load();

            const handler = (event: Event) => {
                this.updateStateEvents(event);
                x.next(event);
            }

            this.addEvents(this.audio, this.audioEvents, handler);

            // Stop Playing Audio
            return () => {
                this.audio.pause();
                this.audio.currentTime = 0;

                // remove event listeners
                this.removeEvents(this.audio, this.audioEvents, handler);
                
                // reset audio state
                this.resetState();
            }
        });
    }

    private addEvents(obj, events, handler) {
        events.forEach(event => {
          obj.addEventListener(event, handler);
        });
    }
    
    private removeEvents(obj, events, handler) {
        events.forEach(event => {
            obj.removeEventListener(event, handler);
        });
    }

    private updateStateEvents(event: Event) {
        switch (event.type) {
            case 'canplay':
              this.state.duration = this.audio.duration;
              this.state.readableDuration = this.formatTime(this.state.duration);
              this.state.canplay = true;
              break;
            case 'playing':
              this.state.playing = true;
              break;
            case 'pause':
              this.state.playing = false;
              break;
            case 'timeupdate':
              this.state.currentTime = this.audio.currentTime;
              this.state.readableCurrentTime = this.formatTime(this.state.currentTime);
              break;
            case 'error':
              this.resetState();
              this.state.error = true;
              break;
        }
        
        this.stateChange.next(this.state);
    }

    private resetState() {
        this.state = {
            playing: false,
            readableCurrentTime: '',
            readableDuration: '',
            duration: undefined,
            currentTime: 0,
            canplay: false,
            error: false
        };
    }

    public playAudioStream(url) {
        return this.audioStreamObservable(url)
                .pipe(
                    takeUntil(this.stop$)
                );
    }

    public play() {
        this.audio.play();
    }

    public pause() {
        this.audio.pause();
    }

    public stop() {
        this.stop$.next();
    }

    public seekTo(seconds) {
        this.audio.currentTime = seconds;
    }

    private formatTime(time) {
        const hr  = Math.floor(time / 3600);
        const min = Math.floor((time - (hr * 3600)) / 60);
        const sec = Math.floor(time - (hr * 3600) - (min * 60));
        
        let timeMin: string = min.toString();
        let timeSec: string = sec.toString();

        if (min < 10){ 
            timeMin = '0' + min; 
        }
        if (sec < 10){ 
            timeSec  = '0' + sec;
        }

        return timeMin + ':' + timeSec;
    }

    public getState(): Observable<AudioStreamState> {
        return this.stateChange.asObservable();
    }
}