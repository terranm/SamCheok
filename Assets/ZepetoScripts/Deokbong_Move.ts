import { GameObject, Time, Transform, Vector3 } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class Deokbong_Move extends ZepetoScriptBehaviour {
    public targets : GameObject;
    private moveTargetList : Transform[];

    public targetNum :number;
    public speed : number;

    private speedAdd : number;

    private addNum : number;

    private isStop : boolean;
    Start(){
        this.targetNum = 0;
        this.speedAdd = 1;
        this.addNum = 1;
        this.speed = this.speedAdd;
        // this.targets = this.transform.parent.gameObject;
        this.moveTargetList = this.targets.GetComponentsInChildren<Transform>();
        let temp = this.moveTargetList.shift();
        // console.log(temp.name);
        // temp = this.moveTargetList.shift();
        // console.log(temp.name);
        this.isStop = true;
        this.StartCoroutine(this.Move());
    }

    private *Move(){
        while(this.isStop){
            yield null;
            this.gameObject.transform.position = Vector3.MoveTowards(this.gameObject.transform.position, this.moveTargetList[this.targetNum].position, this.speed * Time.deltaTime);
            let dist = (this.gameObject.transform.position - this.moveTargetList[this.targetNum].position).magnitude
            if (dist < 0.1){
                this.gameObject.transform.position = this.moveTargetList[this.targetNum].position;
                this.targetNum+=this.addNum;
                if (this.targetNum == this.moveTargetList.length || this.targetNum == -1){
                    this.addNum = -this.addNum;
                    this.targetNum += this.addNum;
                    this.speed = this.speedAdd;
                }
    
                this.gameObject.transform.LookAt(this.moveTargetList[this.targetNum].position);
            }
        }
        this.StopCoroutine(this.Move());
    }

}