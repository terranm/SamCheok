import { AudioClip, AudioSource } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class UIAudioSourceManager extends ZepetoScriptBehaviour {

    public AudioClips : AudioClip[];
    private AudioSource : AudioSource;

    Start() {    
        this.AudioSource = this.transform.GetComponent<AudioSource>();
    }

    public AudioPlay(clipNum : number){
        this.AudioSource.clip = this.AudioClips[clipNum];
        this.AudioSource.Play();
    }

}