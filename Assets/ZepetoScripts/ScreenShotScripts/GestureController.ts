import { AnimationClip, Time, WaitForSeconds } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { CharacterState, ZepetoCharacter, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class GestureController extends ZepetoScriptBehaviour {

    public gestureListButtons: Button[];
    public gestureClips: AnimationClip[];
    
    private character : ZepetoCharacter;

    Start() {
        for (let i = 0; i < this.gestureClips.length; ++i) {
            this.gestureListButtons[i].onClick.AddListener(() => {
                this.character = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
                this.character.SetGesture(this.gestureClips[i]);
                
                this.StartCoroutine(this.StopCharacterGesture(this.gestureClips[i].length - 0.3));
            });
        }
    }

    *StopCharacterGesture(length:number) {
        let timer = 0;
        while (length >= timer){
            yield null;
            timer += Time.deltaTime;
            if ((this.character.CurrentState == CharacterState.Gesture) && (this.character.tryMove || this.character.tryJump)){
                this.character.CancelGesture();
            }
        }
        // yield new WaitForSeconds(length);
        this.character.CancelGesture();
    }
}