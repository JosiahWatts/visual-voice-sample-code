import { CallRecordingWaveformData } from "./call-recording-waveform.model";
import { EventAudioMetaData } from "./event-audio-metadata.model";

export class VisualVoiceGraphMetadata {
    callRecordingWaveform: CallRecordingWaveformData;
    callRecordingEmotion: Array<EventAudioMetaData>;
}