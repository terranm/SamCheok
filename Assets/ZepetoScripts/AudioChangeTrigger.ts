import { Collider } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';

export default class AudioChangeTrigger extends ZepetoScriptBehaviour {
    public clipNum : number;
    OnTriggerEnter(coll : Collider){
        if(coll.gameObject.tag == "Player"){
            GameManager.instance.AudioClipChange(this.clipNum);
        }
    }
}