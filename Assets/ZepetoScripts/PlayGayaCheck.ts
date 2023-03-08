import { Collider } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';

export default class PlayGayaCheck extends ZepetoScriptBehaviour {

    OnTriggerEnter(coll : Collider){
        if(coll.gameObject.tag == "Player"){
            GameManager.instance.CharacterActive(false);
        }
    }
    OnTriggerExit(coll : Collider){
        if(coll.gameObject.tag == "Player"){
            GameManager.instance.CharacterActive(true);
        }
    }
}