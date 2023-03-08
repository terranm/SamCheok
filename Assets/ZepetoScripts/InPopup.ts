import { Collider } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';

export default class InPopup extends ZepetoScriptBehaviour {
    public popStr : string;
    OnTriggerEnter(coll : Collider){
        if(coll.gameObject.tag == "Player"){
            GameManager.UI.NeverOpenCheck(GameManager.player.popState);
            GameManager.UI.Popup("Pop-" + this.popStr);
        }
    }
}