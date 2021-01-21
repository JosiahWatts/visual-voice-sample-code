export class EventAudioMetaDataContainer
{
    audioUrl: string;
    json: string;
    metaData: EventAudioMetaData[];
}

export class EventAudioMetaData
{
    start: number;
    end: number;
    channel: string;
    channelType: string;
    emotion: string;
    text: string;
    phrases: string[];
}