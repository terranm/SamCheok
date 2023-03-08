import {ZepetoScriptBehaviour} from 'ZEPETO.Script'
import {ZepetoWorldMultiplay} from 'ZEPETO.World'
import {Room, RoomData} from 'ZEPETO.Multiplay'
import {Car, Player, State, Vector3} from 'ZEPETO.Multiplay.Schema'
import {CharacterState, SpawnInfo, ZepetoPlayers, ZepetoPlayer} from 'ZEPETO.Character.Controller'
import * as UnityEngine from "UnityEngine";
import GameManager from '../GameManager'
import { LightProbeUsage } from 'UnityEngine.Rendering'


export default class Starter extends ZepetoScriptBehaviour {
    
    public multiplay: ZepetoWorldMultiplay;
    public StartPoint : UnityEngine.Transform;
    
    public player:Player;

    private room: Room;
    public get Room() : Room{return this.room;}
    private currentPlayers: Map<string, Player> = new Map<string, Player>();
    private currentCars:Map<string, Car> = new Map<string, Car>();
    private carMap:Map<string, UnityEngine.GameObject> = new Map<string, UnityEngine.GameObject>();

    private Start() {

        this.multiplay.RoomCreated += (room: Room) => {
            this.room = room;
        };

        this.multiplay.RoomJoined += (room: Room) => {
            room.OnStateChange += this.OnStateChange;
        };

        this.StartCoroutine(this.SendMessageLoop(0.1));
    }

    // Send the local character transform to the server at the scheduled Interval Time.
    private* SendMessageLoop(tick: number) {
        while (true) {
            yield new UnityEngine.WaitForSeconds(tick);

            if (this.room != null && this.room.IsConnected) {
                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.room.SessionId);
                if (hasPlayer) {
                    const myPlayer = ZepetoPlayers.instance.GetPlayer(this.room.SessionId);
                    // console.log(GameManager.player.popState);

                        
                    if (myPlayer.character.CurrentState != CharacterState.Idle)
                        this.SendTransform(myPlayer.character.transform);  
                         
                }
            }
        }
    }

    private OnStateChange(state: State, isFirst: boolean) {

        // When the first OnStateChange event is received, a full state snapshot is recorded.
        if (isFirst) {
            // [CharacterController] (Local) Called when the Player instance is fully loaded in Scene
            ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
                const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
                myPlayer.character.tag = "Player";
                let lightProb = myPlayer.character.GetComponentsInChildren<UnityEngine.SkinnedMeshRenderer>();
                lightProb.forEach((value, index)=>{
                    value.lightProbeUsage = LightProbeUsage.BlendProbes;
                });
                myPlayer.character.OnChangedState.AddListener((cur, prev) => {
                    // console.log("cur  " + cur + "  prev" + prev + " myPlayer.character.CurrentStateStatus " + myPlayer.character.CurrentStateStatus);
                    this.SendState(cur);
                });
            });

            // [CharacterController] Called when the Player instance is fully loaded in Scene
            ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId: string) => {
                const isLocal = this.room.SessionId === sessionId;
                if (!isLocal) {
                    const player: Player = this.currentPlayers.get(sessionId);
                    const otherplayer = ZepetoPlayers.instance.GetPlayer(sessionId);

                    let lightProb = otherplayer.character.GetComponentsInChildren<UnityEngine.SkinnedMeshRenderer>();
                    lightProb.forEach((value, index)=>{
                        value.lightProbeUsage = LightProbeUsage.BlendProbes;
                    });
                    // [RoomState] Called whenever the state of the player instance is updated. 
                    player.OnChange += (changeValues) => this.OnUpdatePlayer(sessionId, player);
                }
            });
        }

        let join = new Map<string, Player>();
        let leave = new Map<string, Player>(this.currentPlayers);
        let leaveCar = new Map<string, Car>(this.currentCars);

        state.players.ForEach((sessionId: string, player: Player) => {
            if (!this.currentPlayers.has(sessionId)) {
                join.set(sessionId, player);
            }
            leave.delete(sessionId);
        });
        
        state.cars.ForEach((sessionId:string, car:Car)=>{
            if (this.currentPlayers.has(sessionId)){ // 차량 탑승 중에 나가면, 아래 조건들이 만족되어 차량이 생성됨. 캐릭터가 존재하는지에 대한 확인 후 생성해야함
                if (!this.currentCars.has(sessionId)) {
                    if(sessionId != this.room.SessionId)
                    {
                        this.currentCars.set(sessionId, car);
                        let _position = this.ParseVector3(car.transform.position);
                        let _rotation = this.ParseVector3(car.transform.rotation);
                    
                        let _car = GameManager.Resource.Instantiate("CarMulti");
                        console.log("CarMulti" + sessionId);
                        this.carMap.set(sessionId, _car);

                        _car.transform.position = _position;
                        _car.transform.rotation = UnityEngine.Quaternion.Euler(_rotation);
                        
                    
                        
                        const carObj:Car = this.currentCars.get(sessionId);
                        carObj.OnChange += (changeValues) => this.OnUpdateCar(sessionId, carObj);
                    }
                }
                leaveCar.delete(sessionId);
            }
        })

        // [RoomState] Create a player instance for players that enter the Room
        join.forEach((player: Player, sessionId: string) => this.OnJoinPlayer(sessionId, player));

        // [RoomState] Remove the player instance for players that exit the room
        leave.forEach((player: Player, sessionId: string) => this.OnLeavePlayer(sessionId, player));
    }

    private OnJoinPlayer(sessionId: string, player: Player) {
        console.log(`[OnJoinPlayer] players - sessionId : ${sessionId}`);
        this.currentPlayers.set(sessionId, player);

        const spawnInfo = new SpawnInfo();
        // const position = this.ParseVector3(player.transform.position);
        // const rotation = this.ParseVector3(player.transform.rotation);
        spawnInfo.position = this.StartPoint.position;
        spawnInfo.rotation = this.StartPoint.rotation;

        const isLocal = this.room.SessionId === player.sessionId;
        if(isLocal) {
            this.player = player;
            GameManager.player = player;
        }
        ZepetoPlayers.instance.CreatePlayerWithUserId(sessionId, player.zepetoUserId, spawnInfo, isLocal);
    }

    private OnLeavePlayer(sessionId: string, player: Player) {
        console.log(`[OnRemove] players - sessionId : ${sessionId}`);
        this.currentPlayers.delete(sessionId);

        ZepetoPlayers.instance.RemovePlayer(sessionId);
    }

    private OnUpdatePlayer(sessionId: string, player: Player) {

        const position = this.ParseVector3(player.transform.position);
        const rotation = this.ParseVector3(player.transform.rotation);
        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
        if(player.ride != true){
            zepetoPlayer.character.transform.SetParent(null);
            zepetoPlayer.character.characterController.enabled = true;  
            zepetoPlayer.character.ZepetoAnimator.SetBool("isDrive", false);
            let dist = UnityEngine.Vector3.Distance(position, zepetoPlayer.character.transform.position);
            if(dist >= 3){
                zepetoPlayer.character.transform.position = position;
                zepetoPlayer.character.transform.rotation = UnityEngine.Quaternion.Euler(rotation);
            }else{
                zepetoPlayer.character.MoveToPosition(position);
            }
        }
        else{
            const car = this.carMap.get(sessionId);
            if(car == null || car == undefined) return;
            //console.log(car);
            zepetoPlayer.character.transform.SetParent(car.transform);
            zepetoPlayer.character.characterController.enabled = false;

            zepetoPlayer.character.transform.localPosition = new UnityEngine.Vector3(-0.303, 0, 0.034);
            zepetoPlayer.character.transform.localRotation = UnityEngine.Quaternion.identity;
            zepetoPlayer.character.ZepetoAnimator.SetBool("isDrive", true);
        }

        if (player.state === CharacterState.JumpIdle || player.state === CharacterState.JumpMove)
            zepetoPlayer.character.Jump();
    }
    
    private OnUpdateCar(sessionId:string, car:Car){
        
        const _car = this.carMap.get(sessionId);
        const _rb = this.ParseVector3(car.velocity);
        
        const _steer = this.ParseVector3(car.steer);
        let rb = _car.gameObject.GetComponent<UnityEngine.Rigidbody>();
        rb.velocity = _rb;
        _car.gameObject.transform.eulerAngles = UnityEngine.Vector3.Lerp(_car.transform.eulerAngles, _steer, 3 * UnityEngine.Time.deltaTime);
    }

    private SendTransform(transform: UnityEngine.Transform) {
        const data = new RoomData();

        const pos = new RoomData();
        pos.Add("x", transform.localPosition.x);
        pos.Add("y", transform.localPosition.y);
        pos.Add("z", transform.localPosition.z);
        data.Add("position", pos.GetObject());

        const rot = new RoomData();
        rot.Add("x", transform.localEulerAngles.x);
        rot.Add("y", transform.localEulerAngles.y);
        rot.Add("z", transform.localEulerAngles.z);
        data.Add("rotation", rot.GetObject());
        this.room.Send("onChangedTransform", data.GetObject());
    }

    private SendState(state: CharacterState) {
        const data = new RoomData();
        data.Add("state", state);
        this.room.Send("onChangedState", data.GetObject());
    }

    private ParseVector3(vector3: Vector3): UnityEngine.Vector3 {
        return new UnityEngine.Vector3
        (
            vector3.x,
            vector3.y,
            vector3.z
        );
    }
}
