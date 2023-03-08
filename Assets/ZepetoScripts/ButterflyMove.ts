import { GameObject, Time, Vector3, WaitForSeconds } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class ButterflyMove extends ZepetoScriptBehaviour {
    // 나비 24개
    private butterflys : GameObject[];
    Start() {    
        this.butterflys = new Array();

        for(let i = 0; i < 24; i++){
            this.butterflys.push(this.transform.GetChild(i).gameObject);
            // console.log("butterflys " + this.butterflys[i].name);
        }

        // this.StartCoroutine(this.Move());
    }

    // private *Move(){
    //     while (true){
    //         yield new WaitForSeconds(0.001);
    Update(){
            this.butterflys.forEach((fly)=>{
                let pos = fly.transform.position;
                if (pos.y > 0){
                    pos.y -= Math.random() * 10;
                    Vector3.MoveTowards(fly.transform.position, pos, Time.deltaTime * 0.5);
                }
                else if (pos.y < 1){
                    pos.y += Math.random() * 10;
                    Vector3.MoveTowards(fly.transform.position, pos, Time.deltaTime * 0.5);
                }
                if ("butterfly_Y_Ani" == fly.name){
                    // console.log(fly.name + " " + pos.y + " " + fly.transform.position.y);
                }
            });
    //     }
    }
}