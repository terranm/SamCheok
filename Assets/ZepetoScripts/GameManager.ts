import { ZepetoScriptableObject, ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {ZepetoWorldMultiplay} from 'ZEPETO.World'
import {Room, RoomData} from 'ZEPETO.Multiplay'
import { Player} from 'ZEPETO.Multiplay.Schema';
import { SpawnInfo, UIZepetoPlayerControl, ZepetoCamera, ZepetoCharacter, ZepetoCharacterCreator, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { Animator, AudioClip, AudioListener, AudioSource, Avatar, GameObject, Quaternion, RuntimeAnimatorController, SpriteRenderer, Time, Transform, Vector3, WaitForEndOfFrame, WaitForSeconds } from 'UnityEngine';
import ResourcesManager from './ResourceManager';
import UIManagers from './UIManager';
import ButtonLookat from './ButtonLootat';
import { Text } from 'UnityEngine.UI';
import KayakCtrl from './KayakCtrl';
import JoystickDir from './JoystickDir';
import UIAudioSourceManager from './UIAudioSourceManager';

export default class GameManager extends ZepetoScriptBehaviour {

    //// 인스턴스 및 기본 변수
    private static Instance:GameManager;
    public static get instance():GameManager{return this.Instance;}
    
    __resource:ResourcesManager = new ResourcesManager();
    public static get Resource():ResourcesManager {return this.Instance.__resource;}

    __ui:UIManagers = new UIManagers();
    public static get UI():UIManagers{ return this.Instance.__ui;}

    public room: Room;
    public static get Room():Room{return this.Instance.room;}
    
    private _popupTime:number = 2;
    public get GetPopupTime():number{return this._popupTime;}
    
    public static player:Player;
    public multiplay: ZepetoWorldMultiplay;
    ////
    
    public portyMaskMap:Map<string, GameObject> = new Map<string, GameObject>(); // 아이템 착용자 리스트
    public portyMaskOrignMap:Map<string, GameObject> = new Map<string, GameObject>(); // 원래 착용한 아이템 저장

    public zepetoScreenshot : GameObject;

    public isInPhotozone:boolean;
    public photozone:boolean;
    public onTarget:boolean;

    // public isPeedUploadComplete : boolean;
    //// 초기 세팅
    Awake() {    
        GameManager.Instance = this;
        this.multiplay = GameObject.Find("WorldMultiplay").GetComponent<ZepetoWorldMultiplay>();
        
        GameManager.UI.Init();
        this.multiplay.RoomCreated += (room: Room) => {
            this.room = room;
            this.room.AddMessageHandler("QuestDelay",(message: string)=>{
                // print server message
                let _message = message.toString();
                this.StartCoroutine(this.QuestDelayPopup(_message));
            });
        };
    }

    *QuestDelayPopup(message : string, time : number = 1){
        yield new WaitForSeconds(time);
        GameManager.UI.Popup("Popup_Quest-" + message);
    }

    private teleport : GameObject;
    private Vil_Deokbong : GameObject;
    private Forest_Dokkaebi : GameObject;
    private Beach_Suro : GameObject;

    Start(){
        GameManager.UI.loadingUI.gameObject.SetActive(true);
        this.zepetoScreenshot.SetActive(true);
        this.StartCoroutine(this.StartLoading(GameManager.UI.loadingUI));
        this.audioObject = GameManager.Resource.Instantiate("AudioObject");
        this.uiAudioSourceObj = GameManager.Resource.Instantiate("UIAudioSourceObj");
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this.audioObject.transform.SetParent(ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform);
            this.uiAudioSourceObj.transform.SetParent(ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform);
        });
        this.AudioSource = this.audioObject.GetComponent<AudioSource>();

        this.uiAudioSource = this.uiAudioSourceObj.GetComponent<UIAudioSourceManager>();

        this.teleport = GameObject.Find("Teleport");
        for(let i = 0; i < 3; i++)
        {
            this.teleport.transform.GetChild(i).gameObject.SetActive(false);
        }

        this.transform.GetChild(0).GetChild(0).gameObject.SetActive(false);
        this.transform.GetChild(1).GetChild(0).gameObject.SetActive(false);

        this.Vil_Deokbong = GameObject.Find("Vil_Deokbong");

        for(let i = 1; i < 3; i++)
        {
            this.Vil_Deokbong.transform.GetChild(i).gameObject.SetActive(false);
        }
        
        this.Forest_Dokkaebi = GameObject.Find("Forest_Dokkaebi");

        for(let i = 1; i < 3; i++)
        {
            this.Forest_Dokkaebi.transform.GetChild(i).gameObject.SetActive(false);
        }

        this.Beach_Suro = GameObject.Find("Beach_Suro");

        for(let i = 1; i < 2; i++)
        {
            this.Beach_Suro.transform.GetChild(i).gameObject.SetActive(false);
        }

        this.transform.GetChild(2).GetChild(0).gameObject.SetActive(false);
        this.transform.GetChild(2).GetChild(1).gameObject.SetActive(false);

        
        this.transform.GetChild(3).GetChild(0).GetChild(0).GetChild(0).gameObject.SetActive(false); // 가야금 버튼
        this.transform.GetChild(3).GetChild(0).GetChild(0).GetChild(1).gameObject.SetActive(true); // 잠금 버튼(가야금)
        this.transform.GetChild(3).GetChild(0).GetChild(2).gameObject.SetActive(false); // 좌표, 뮤직 노트
        
        this.transform.GetChild(3).GetChild(1).GetChild(0).GetChild(0).gameObject.SetActive(false); // 카약 버튼
        this.transform.GetChild(3).GetChild(1).GetChild(0).GetChild(1).gameObject.SetActive(true); // 잠금 버튼(카약)

        let sunbeds = this.transform.GetChild(3).GetChild(2);
        for(let i = 0; i < 14; i++){
            sunbeds.GetChild(i).GetChild(0).gameObject.SetActive(false);
        }
        
    }

    public AudioClips : AudioClip[];
    private AudioSource : AudioSource;
    private AudioNum : number;
    private isAudioOn : boolean = true;
    
    public AudioClipChange(num : number){
        if (this.AudioNum == num) return;
        this.AudioSource.clip = this.AudioClips[num];
        if (this.isAudioOn){
            this.AudioSource.Play();
        }
        this.AudioNum = num;
    }
    
    /// 오디오 끄기 켜기
    private audioObject:GameObject;

    public AudioOnOff(isOn : boolean){
        console.log("AudioOnOff " + isOn);
        this.isAudioOn = isOn;
        if(this.isAudioOn){
            this.AudioSource.Play();
        }
        else{
            this.AudioSource.Pause();
        }
        // this.audioObject.GetComponent<AudioListener>().enabled = isOn;
    }
    ///
    
    public uiAudioSourceObj : GameObject;
    private uiAudioSource : UIAudioSourceManager;

    public UIAudioPlay(num){
        this.uiAudioSource.AudioPlay(num);
    }
    
    *StartLoading(loadingUI:Transform){
        let isLoadEnd = false;
        ZepetoPlayers.instance.controllerData.inputAsset.Disable();
        while (!isLoadEnd){
            yield new WaitForSeconds(3);
            if (this.room != null && this.room.IsConnected){
                if (ZepetoPlayers.instance.HasPlayer(this.room.SessionId)){
                    isLoadEnd = true;
                    loadingUI.gameObject.SetActive(false);    
                    // GameManager.instance.NextQuest("1");
                    ZepetoPlayers.instance.controllerData.inputAsset.Enable();
                    console.log(GameManager.player);
                    this.StopCoroutine(this.StartLoading(GameManager.UI.loadingUI));
                }
            }
        }
    }

    // Update(){
    //     console.log("QuestNum : " + GameManager.player.quest + ", positionCheck GM : " + GameManager.player.transform.position.x + ", loc : " + ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.position.x);
    // }
    ////

    //// 보조 함수
    public CourutineStarter(fun : Generator){
        this.StartCoroutine(fun);
    }
    public CourutineStopper(fun : Generator){
        this.StopCoroutine(fun);
    }
    ////


    //// 입국 심사대
    private passportMap:Map<string, GameObject> = new Map<string, GameObject>();
    private disembarkationCardMap:Map<string, GameObject> = new Map<string, GameObject>();

    
    private isTakePassport:boolean = false;
    private isTakeDisembarkationCard:boolean = false;

    /// 덕봉이 타기
    private isRideDeokbong:boolean = false;
    private rideDeokbongBtnObj : GameObject;

    public RideDeokbong(btnObj : GameObject){
        // console.log("DeokbongRideBtn click");
        if (this.isRideDeokbong) return;
        btnObj.transform.parent.GetChild(1).GetComponent<AudioSource>().Play();
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.SetParent(btnObj.transform.parent.GetChild(0).GetChild(0));
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.localPosition = new Vector3(0.34,0.34,0.08);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.localRotation = Quaternion.Euler(new Vector3(0.21389392,4.41733694,357.305511));
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isRideDeokbong", true);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.enabled = false;
        // 내리기 팝업 ON
        GameManager.UI.RideDownBtn.gameObject.SetActive(true);
        this.rideDeokbongBtnObj = btnObj
        this.rideDeokbongBtnObj.SetActive(false);
        this.isRideDeokbong = true;
    }

    public RideOffDeokbong(){
        if (!this.isRideDeokbong) return; // 타지 않은 상태면 내려서는 안됨
        this.rideDeokbongBtnObj.transform.parent.GetComponent<AudioSource>().Play();
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.position = this.rideDeokbongBtnObj.transform.parent.GetChild(4).position;
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.SetParent(null);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.enabled = true;
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isRideDeokbong", false);
        this.isRideDeokbong = false;
        this.rideDeokbongBtnObj.SetActive(true);
        // GameManager.UI.RideDownBtn.gameObject.SetActive(false);
        // ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.Teleport();
    }
    ////



    /// 시점 바꾸기
    public ChangeViewpoint(isFri : boolean){
        if (isFri){
            ZepetoPlayers.instance.cameraData.offset = new Vector3(0,0,0);
            ZepetoPlayers.instance.cameraData.minZoomDistance = -2;
            ZepetoPlayers.instance.cameraData.maxZoomDistance = -2;
        }
        else {
            ZepetoPlayers.instance.cameraData.offset = new Vector3(0,0,0);
            ZepetoPlayers.instance.cameraData.minZoomDistance = 1;
            ZepetoPlayers.instance.cameraData.maxZoomDistance = 8;
            ZepetoPlayers.instance.ZepetoCamera.DoZoom(8);
        }
    }

    /// 복주머니 찾기
    private bokcnt:number = 0;
    private isBokAllFound : boolean = false;
    public Getbok(btnObj : GameObject){
        this.StartCoroutine(this.PlayEff(GameManager.Resource.Instantiate("smokeEff"), btnObj.transform.parent.GetChild(1).GetChild(0), 0.7));
        btnObj.transform.parent.gameObject.SetActive(false);
        this.bokcnt++;
        GameManager.UI.bokCntImg.GetComponentInChildren<Text>().text = this.bokcnt.toString() + " / 7";
        if (this.bokcnt >= 7){
            this.isBokAllFound = true;
            this.UIAudioPlay(0);
            GameManager.UI.Popup("Quest-FClear");
        }
    }

    private *PlayEff(effObj : GameObject, posTr : Transform, waitTime : number){
        console.log("effObj " + effObj.name);
        effObj.transform.position = posTr.position;
        yield new WaitForSeconds(waitTime);
        effObj.SetActive(false);
        GameManager.Resource.Destroy(effObj);
    }

    public CheckBok(){
        if (this.isBokAllFound){
            this.UIAudioPlay(1);
            this.Vil_Deokbong.transform.GetChild(1).gameObject.SetActive(false); // 찾기 덕봉 비활성화
            this.Vil_Deokbong.transform.GetChild(2).gameObject.SetActive(true); // 대기 덕봉 활성화
            this.teleport.transform.GetChild(0).gameObject.SetActive(true);
            GameManager.UI.bokCntImg.gameObject.SetActive(false);
            GameManager.UI.Popup("Quest-FThx");
            GameManager.UI.QuestClear(0);
        }
        else {
            this.Vil_Deokbong.GetComponent<AudioSource>().Play();
            GameManager.UI.Popup("Quest-F1");
        }
    }
    ///

    /// 마을 퀘스트 받기
    public BokQuestStart(){
        this.Vil_Deokbong.GetComponent<AudioSource>().Play();
        this.Vil_Deokbong.transform.GetChild(0).gameObject.SetActive(false); // 인사 덕봉 비활성화
        this.Vil_Deokbong.transform.GetChild(1).gameObject.SetActive(true); // 찾기 덕봉 활성화
        this.transform.GetChild(0).GetChild(0).gameObject.SetActive(true); // 복주머니 활성화
        GameManager.UI.bokCntImg.gameObject.SetActive(true);
        GameManager.UI.Popup("Quest-F1");
    }
    ///
    
    /// 대나무 찾기
    private deacnt:number = 0;
    private isDeaAllFound : boolean = false;
    public GetDea(btnObj : GameObject){
        this.StartCoroutine(this.PlayEff(GameManager.Resource.Instantiate("grassesEff"), btnObj.transform.parent, 0.7));
        btnObj.transform.parent.parent.gameObject.SetActive(false);
        this.deacnt++;
        GameManager.UI.DeaCntImg.GetComponentInChildren<Text>().text = this.deacnt.toString() + " / 7";
        if (this.deacnt >= 7){
            this.UIAudioPlay(0);
            this.Forest_Dokkaebi.transform.Rotate(0,180,0);
            this.isDeaAllFound = true;
            GameManager.UI.Popup("Quest-DClear");
        }
    }

    public CheckDea(){
        if (this.isDeaAllFound){
            this.UIAudioPlay(1);
            this.Forest_Dokkaebi.transform.GetChild(1).gameObject.SetActive(false); // 찾기 도꺠비 비활성화
            this.Forest_Dokkaebi.transform.GetChild(2).gameObject.SetActive(true); // 대기 도꺠비 활성화
            this.teleport.transform.GetChild(1).gameObject.SetActive(true);
            this.teleport.transform.GetChild(2).gameObject.SetActive(true);
            GameManager.UI.DeaCntImg.gameObject.SetActive(false);
            GameManager.UI.Popup("Quest-DThx");
            GameManager.UI.QuestClear(1);
        }
        else {
            this.Forest_Dokkaebi.GetComponent<AudioSource>().Play();
            GameManager.UI.Popup("Quest-D1");
        }
    }
    ///

    /// 대나무숲 퀘스트 받기
    public DeanamuQuestStart(){
        this.Forest_Dokkaebi.GetComponent<AudioSource>().Play();
        this.Forest_Dokkaebi.transform.GetChild(0).gameObject.SetActive(false); // 인사 도꺠비 비활성화
        this.Forest_Dokkaebi.transform.GetChild(1).gameObject.SetActive(true); // 찾기 도꺠비 활성화
        this.transform.GetChild(1).GetChild(0).gameObject.SetActive(true); // 복주머니 활성화
        GameManager.UI.DeaCntImg.gameObject.SetActive(true);
        GameManager.UI.Popup("Quest-D1");
    }
    ///

    /// 헌화부인 퀘스트
    // private isTakeStick :boolean = false;
    private lochandObj : GameObject;
    private soundObj : GameObject;
    private isBeatStick : boolean = false;
    public GetStick(btnObj : GameObject){
        btnObj.transform.gameObject.SetActive(false);
        btnObj.transform.parent.GetChild(1).gameObject.SetActive(false);
        this.soundObj = this.transform.GetChild(2).GetChild(1).gameObject
        this.soundObj.SetActive(true);

        let handTs = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.GetChild(0).
        GetChild(1).GetChild(2).GetChild(0).GetChild(1).GetChild(3).GetChild(1).GetChild(1)
        .GetChild(0).GetChild(1).GetChild(0);

        this.lochandObj = btnObj.transform.parent.gameObject;
        this.lochandObj.transform.SetParent(handTs);
        this.lochandObj.transform.localPosition = new Vector3(0.0725999996,0.0153000001,-0.213300005);
        this.lochandObj.transform.localRotation = Quaternion.Euler(new Vector3(78.1424332,57.461441,56.6916008));
        
    }

    public BeatStick(btnObj : GameObject){
        btnObj.transform.gameObject.SetActive(false);

        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isBeatStick", true);
        ZepetoPlayers.instance.controllerData.inputAsset.Disable();
        this.StartCoroutine(this.BeatAction(btnObj));
    }

    private *BeatAction(btnObj : GameObject){
        let beatSound = this.soundObj.transform.GetChild(1).GetComponent<AudioSource>();
   
        let effObj = GameManager.Resource.Instantiate("star_p");
        effObj.transform.position = btnObj.transform.position;
        effObj.gameObject.SetActive(false);
        yield new WaitForSeconds(0.8);
        beatSound.Play();
        effObj.gameObject.SetActive(true);
        yield new WaitForSeconds(0.5);
        effObj.gameObject.SetActive(false);
        beatSound.Play();
        effObj.gameObject.SetActive(true);
        yield new WaitForSeconds(0.5);
        effObj.gameObject.SetActive(false);
        beatSound.Play();
        effObj.gameObject.SetActive(true);
        yield new WaitForSeconds(1.5);
        GameManager.Resource.Destroy(effObj);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isBeatStick", false);
        ZepetoPlayers.instance.controllerData.inputAsset.Enable();
        this.lochandObj.SetActive(false);
        this.isBeatStick = true;
        this.UIAudioPlay(0);
        GameManager.UI.Popup("Quest-BClear");
    }

    public CheckHun(btnObj : GameObject){
        if (this.isBeatStick){
            this.UIAudioPlay(1);
            this.transform.GetChild(3).GetChild(0).GetChild(0).GetChild(0).gameObject.SetActive(true); // 가야금 버튼
            this.transform.GetChild(3).GetChild(0).GetChild(0).GetChild(1).gameObject.SetActive(false); // 잠금 버튼(가야금)
            
            this.transform.GetChild(3).GetChild(1).GetChild(0).GetChild(0).gameObject.SetActive(true); // 카약 버튼
            this.transform.GetChild(3).GetChild(1).GetChild(0).GetChild(1).gameObject.SetActive(false); // 잠금 버튼(카약)
            btnObj.SetActive(false);
            btnObj.transform.parent.GetChild(4).gameObject.SetActive(false);
            GameManager.UI.Popup("Quest-BThx");
            GameManager.UI.QuestClear(2);
        }
        else {
            this.Beach_Suro.GetComponent<AudioSource>().Play();
            GameManager.UI.Popup("Quest-B1");
        }
    }

    /// 헌화공원 수로부인 퀘스트 받기
    public HunQuestStart(){
        this.Beach_Suro.GetComponent<AudioSource>().Play();
        this.Beach_Suro.transform.GetChild(0).gameObject.SetActive(false); // 인사 수로부인 비활성화
        this.Beach_Suro.transform.GetChild(1).gameObject.SetActive(true); // 찾기 수로부인 활성화
        this.transform.GetChild(2).GetChild(0).gameObject.SetActive(true); // 대나무 활성화
 
        GameManager.UI.Popup("Quest-B1");
    }
    ///

    /// 가야금 연주하기
    private gayaObj :GameObject;
    private isGayaPlay : boolean = false;
    public PlayGaya(btnObj : GameObject){
        if(this.isGayaPlay) return;
        btnObj.transform.parent.gameObject.SetActive(false);
        this.gayaObj = btnObj.transform.parent.parent.gameObject;
        this.gayaObj.transform.GetChild(2).gameObject.SetActive(true); // 좌표, 뮤직노트 이펙트 활성화
        GameManager.instance.Teleport(this.gayaObj.transform.GetChild(2));
        GameManager.instance.AudioClipChange(5);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isPlayGaya", true);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.characterController.center = new Vector3(0,0.7,0);
        GameManager.UI.RideDownBtn.gameObject.SetActive(true);
        this.isGayaPlay = true;
    }

    public CharacterActive(enable : boolean){
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.enabled = enable;
    }

    public PlayOffGaya(){
        if(!this.isGayaPlay) return;
        GameManager.instance.UIAudioPlay(3);
        GameManager.instance.AudioClipChange(4);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.enabled = true;
        GameManager.instance.Teleport(this.gayaObj.transform.GetChild(4));
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isPlayGaya", false);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.characterController.center = new Vector3(0,0.6,0);
        this.gayaObj.transform.GetChild(2).gameObject.SetActive(false);
        this.gayaObj.transform.GetChild(3).gameObject.SetActive(false);
        this.gayaObj.transform.GetChild(3).gameObject.SetActive(true);
        this.isGayaPlay = false;
    }

    /// 선배드 눕기
    private isSitSunbed : boolean = false;
    private SitbtnObj : GameObject;
    public SitSunbed(btnObj : GameObject){
        if(this.isSitSunbed) return;
        this.SitbtnObj = btnObj.transform.parent.gameObject;
        this.SitbtnObj.transform.parent.GetChild(0).gameObject.SetActive(true);
        this.SitbtnObj.SetActive(false);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isLie", true);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.characterController.center = new Vector3(0,1,0);
        GameManager.instance.Teleport(this.SitbtnObj.transform.parent.GetChild(0));
        GameManager.UI.RideDownBtn.gameObject.SetActive(true);
        this.isSitSunbed = true;
    }
    public StandSunbed(){
        if(!this.isSitSunbed) return;
        this.SitbtnObj.SetActive(true);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.enabled = true;
        GameManager.instance.Teleport(this.SitbtnObj.transform.parent.GetChild(1));
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isLie", false);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.characterController.center = new Vector3(0,0.6,0);
        this.isSitSunbed = false
    }

    /// 카약 타기
    public kayak : GameObject;
    private isRide : boolean = false;
    private kayakBtn : GameObject;
    private kayakPlate : GameObject;
    public RideKayak(btnObj : GameObject){
        if (this.isRide) return;
        GameManager.instance.UIAudioPlay(4);
        this.isRide = true;
        this.kayakBtn = btnObj.transform.parent.gameObject
        this.kayakBtn.SetActive(false);

        let controller = ZepetoPlayers.instance.gameObject.GetComponentInChildren<UIZepetoPlayerControl>();
        let joystick = controller.transform.GetChild(0).GetChild(3).gameObject.GetComponent<JoystickDir>();
        controller.transform.GetChild(0).GetChild(1).gameObject.SetActive(false);
        controller.transform.GetChild(0).GetChild(2).gameObject.SetActive(false);
        controller.transform.GetChild(0).GetChild(3).gameObject.SetActive(true);
        
        this.kayak = GameManager.Resource.Instantiate("Kayak");
        let startPos = this.transform.GetChild(3).GetChild(1).GetChild(2);
        this.kayak.transform.position = startPos.position;
        this.kayak.transform.rotation = startPos.rotation;
        this.kayakPlate = this.kayak.transform.GetChild(0).GetChild(1).gameObject;
        let handTs = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.GetChild(0).
        GetChild(1).GetChild(2).GetChild(0).GetChild(1).GetChild(3).GetChild(1).GetChild(1)
        .GetChild(0).GetChild(1).GetChild(0);
        this.kayakPlate.transform.SetParent(handTs);
        this.kayakPlate.transform.localPosition = new Vector3(0.06,0.1,-0.2);
        this.kayakPlate.transform.localRotation = Quaternion.Euler(new Vector3(0,70,15));
        
        joystick.carCtrl = this.kayak.GetComponent<KayakCtrl>();
        
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.SetParent(this.kayak.transform);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.characterController.enabled = false;
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.enabled = false;

        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.localPosition = new Vector3(0,-0.13,0);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.localRotation = Quaternion.identity
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isDrive", true);
        GameManager.UI.RideDownBtn.gameObject.SetActive(true);

        this.room.Send("Ride", true);
    }

    public RideOffKayak(){
        if (!this.isRide) return;
        this.isRide = false;
        this.kayakBtn.SetActive(true);

        let controller = ZepetoPlayers.instance.gameObject.GetComponentInChildren<UIZepetoPlayerControl>();
        
        controller.transform.GetChild(0).GetChild(1).gameObject.SetActive(true);
        controller.transform.GetChild(0).GetChild(2).gameObject.SetActive(true);
        controller.transform.GetChild(0).GetChild(3).gameObject.SetActive(false);
        
        
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.SetParent(null);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.characterController.enabled = true;
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.enabled = true;
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isDrive", false);
        GameManager.Resource.Destroy(this.kayak);
        GameManager.Resource.Destroy(this.kayakPlate);
        this.kayak = null;
        // GameManager.UI.RideDownBtn.gameObject.SetActive(false);
        let returnPos = this.transform.GetChild(3).GetChild(1).GetChild(3);
        GameManager.instance.Teleport(returnPos);

        this.room.Send("Ride", false);
        // ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.localPosition = Vector3.zero;
        // ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.localRotation = Quaternion.identity
    }



    // //// 캐리어 찾기
    // private isCarrierEntry:boolean = false;
    // private isTakeCarrier:boolean = false;

    // public TakeCarrier(){
    //     if (this.isTakeCarrier) return;
    //     this.HoldSomething("MyCarrier", new Vector3(0,0,0), new Vector3(0,0,0), 1);
    //     GameManager.UI.Popup("Popup_Upper-TakeCarrier", this._popupTime);
    //     this.isTakeCarrier = true;
    // }

    // public OutCarrier(passPoint : Transform){
    //     if (!this.isCarrierEntry){
    //         if (this.isTakeCarrier){
    //             this.NextQuest("4");
    //             this.CloseQuestPart("2");
    //             this.DestroyHandObj();
    //             GameManager.Resource.Destroy(passPoint.parent.GetChild(1).gameObject);
    //             //this.Teleport(passPoint);
    //         }
    //         else {
    //             GameManager.UI.Popup("Popup_Upper-OffCarrierEntry", this.GetPopupTime);
    //         }
    //     }
    // }
    ////

    //// OX퀴즈
    //포티탈 획득
    public GetPortyMask(){
        //if (!GameManager.player.isPortyMask){
            this.room.Send("PortyMask", true);
            GameManager.UI.Popup("Popup_Get-Treasure");
            GameManager.UI.canvasObj.transform.GetChild(0).GetChild(2).gameObject.SetActive(true);
            this.WearPortyMask(this.room.SessionId);
            this.isOXEnd = true;
        //}
    }

    private isOXEnd:boolean = false;

    // public OXEndCheck(btnObj : GameObject){
    //     console.log(this.isOXEnd);
    //     if (this.isOXEnd){
    //         this.NextQuest("6");
    //         this.Teleport(btnObj.transform.parent.GetChild(0));
    //         this.CloseQuestPart("4");
    //         GameManager.Resource.Destroy(btnObj);
    //     }
    //     else{
    //         GameManager.UI.Popup("Popup_Upper-TreasureCheck", this._popupTime);
    //     }
    // }
    ////

    // //// 할머니 봇짐
    // private isGetGranmasBusTicket : boolean = false;
    // private isTakeGranmaBag : boolean = false;
    // // public granma : Transform;

    // public TakeGranmaBag(){
    //     if (this.isTakeGranmaBag) return;
    //     this.HoldSomething("GranmaBag", new Vector3(0.062, -0.01, 0.1), new Vector3(0,90,-90));
    //     this.isTakeGranmaBag = true;
    // }

    // public GranmaCheck(btnObj:GameObject){
    //     if(!this.isGetGranmasBusTicket){
    //         if(this.isTakeGranmaBag){
    //             this.GranmaHandOver();
    //             this.isGetGranmasBusTicket = true;
    //             GameManager.Resource.Destroy(btnObj);
    //             GameManager.UI.Popup("Popup_Get-GranmaTicket");
    //         }
    //         else{
    //             GameManager.UI.Popup("Popup_Upper-GranmaUpper", this._popupTime);
    //         }
    //     }
    // }

    // private GranmaHandOver(){
    //     let handTs = this.granma.GetChild(0).GetChild(1).GetChild(2)
    //     .GetChild(0).GetChild(1).GetChild(2).GetChild(1)
    //     .GetChild(1).GetChild(0).GetChild(1).GetChild(0);
    //     let lochandObj = GameManager.Resource.Instantiate("GranmaBag", handTs);
    //     lochandObj.transform.localPosition = new Vector3(-0.116370723,0.0922279954,0.00241758651);
    //     lochandObj.transform.localRotation = Quaternion.Euler(new Vector3(343.373993,65.5889511,188.081711));
    //     this.DestroyHandObj();
    // }

    // public BusCheck(btnObj : GameObject){
    //     if (this.isGetGranmasBusTicket){
    //         GameManager.Resource.Destroy(btnObj.transform.parent.GetChild(0).gameObject);
    //         GameManager.Resource.Destroy(btnObj);
    //         GameManager.UI.Popup("Popup_Upper-TicketPass", this._popupTime);
    //     }
    //     else{
    //         GameManager.UI.Popup("Popup_Upper-TicketCheck", this._popupTime);
    //     }
    // }
    ////

    // //// 집라인 타기
    // private isZipStart:boolean;
    // private zipPoints : Transform[];
    // private zipSpeed : number;

    // public ZipRideSetting(points:Transform[], speed:number){
    //     this.zipPoints = new Array();
    //     this.zipPoints = points;
    //     this.zipSpeed = speed;
    // }

    // public ZipRide(obj:GameObject){
    //     if (this.isZipStart) return;
    //     obj.SetActive(false);
    //     let zipLine = GameManager.Resource.Instantiate("ZipLine");
    //     zipLine.transform.position = this.zipPoints[0].position;
    //     zipLine.transform.LookAt(this.zipPoints[1].position);
    //     ZepetoPlayers.instance.LocalPlayer.StopMoving();
    //     ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.enabled = false;
    //     ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.SetParent(zipLine.transform);
    //     ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.localPosition = new Vector3(0.005,-1.329,0.036);
    //     ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.localRotation = Quaternion.Euler(new Vector3(0, 11.944, 0));
    //     this.isZipStart = true;
    //     ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isZipRide", true);
    //     this.StartCoroutine(this.ZipLine_Move(zipLine, this.zipPoints, this.zipSpeed));
    // }

    // *ZipLine_Move(zipLine : GameObject, points : Transform[], speed:number){
    //     while(this.isZipStart){
    //         yield null;
    //         this.isZipStart = !zipLine.GetComponent<ZipLine>().Move(points, speed);
    //     }
    //     GameManager.Resource.Destroy(zipLine);
    //     ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.enabled = true;
    //     ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.SetParent(null);
    //     ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isZipRide", false);
    //     this.StopCoroutine(this.ZipLine_Move(zipLine, points, speed));
    // }
    ////

    // public *PeedUploadComplete(){
    //     //let camera = this.transform.GetChild(5).GetChild(1).GetComponent<PhotozoneColl>().screenshotModule.activeSelf;
    //     if(this.isPeedUploadComplete){
    //         this.NextQuest("11");
    //     }
    // }

    //// 게임 가동 기타 로직
    // public CloseQuestPart(questNum : string){
    //     this.transform.GetChild(parseInt(questNum) - 1).gameObject.SetActive(false);
    // }

    /// 입국심사대 지역 차단
    // public AreaClose(resetPoint : Transform, areaNum:number){
    //     let isEntry:boolean;
    //     let isTake:boolean;
    //     let onPopUp:string;
    //     let offPopUp:string;
    //     switch (areaNum){
    //         case 0 :
    //             // isEntry = this.isPassEntry;
    //             isTake = this.isTakePassport && this.isTakeDisembarkationCard;
    //             onPopUp = "3";
    //             offPopUp = "Popup_Upper-OffPassportEntry";
    //         break;
    //         case 4 :
    //             isEntry = (GameManager.player.quest == 6);
    //             isTake = (GameManager.player.quest == 6);
    //             onPopUp = "";
    //             offPopUp = "Popup_Upper-OffOxClear";
    //         break;
    //     }
    //     if (!isEntry){
    //         if (isTake){
    //             this.NextQuest(onPopUp);
    //             this.EntryCheck(areaNum, resetPoint);
    //             this.DestroyHandObj();
    //         }
    //         else {
    //             this.Teleport(resetPoint);
    //             GameManager.UI.Popup(offPopUp, this.GetPopupTime);
    //         }
    //     }
    // }
    
    // private EntryCheck(areaNum:number, tr : Transform = null){
    //     switch(areaNum){
    //         case 0 :
    //             // this.isPassEntry = true;    
    //             GameManager.instance.CloseQuestPart("1");
    //         break;
    //         case 4 :
    //             // this.isCarrierEntry = true;
    //             // ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.StopMoving();
    //         break;
    //     }
    // }

    public Teleport(transform : Transform){ // 텔레포트 이상할때 사용함.. 고쳐야 할 필요 있음
        // console.log("teleport 22");
        ZepetoPlayers.instance.controllerData.inputAsset.Disable();
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.StopMoving();
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.Teleport(transform.position, transform.rotation);
        ZepetoPlayers.instance.ZepetoCamera.camera.transform.position = transform.position + new Vector3(0,1,0);
        ZepetoPlayers.instance.controllerData.inputAsset.Enable();
    }

    // public Teleport(transform : Transform){ // 텔레포트 이상할때 사용함.. 고쳐야 할 필요 있음
    //     ZepetoPlayers.instance.controllerData.inputAsset.Disable();
    //     ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.StopMoving();
    //     this.StartCoroutine(this.TeleportDelay(transform));
    // }
    // private *TeleportDelay(transform: Transform){
    //     let isTeleporting = true;
    //     while(isTeleporting){
    //         yield null;
    //         ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.StopMoving();
    //         ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.Teleport(transform.position, transform.rotation);
    //         yield new WaitForSeconds(0.1);
    //         let dist = Vector3.Distance(transform.position, ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.position);
    //         if(dist < 0.5){
    //             isTeleporting = false;
    //         }
    //     }
    //     ZepetoPlayers.instance.controllerData.inputAsset.Enable();
    //     this.StopCoroutine(this.TeleportDelay(transform));
    // }

    /// 아이템 부착 및 애니메이션 변경
    private handObj:GameObject[] = new Array<GameObject>();

    private HoldSomething(obj:string, position:Vector3, rotation:Vector3, itemNum:number = 0){
        let handTs = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.GetChild(0).
        GetChild(1).GetChild(2).GetChild(0).GetChild(1).GetChild(3).GetChild(1).GetChild(1)
        .GetChild(0).GetChild(1).GetChild(0);
        let lochandObj = GameManager.Resource.Instantiate(obj, handTs);
        lochandObj.transform.localPosition = position;;
        lochandObj.transform.localRotation = Quaternion.Euler(rotation);
        this.handObj.push(lochandObj);
        switch(itemNum){
            case 0 :
                ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isHoldSometing", true);
                break;
            case 1:
                ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isHoldSometing", true);
                break;
            default:
                break;
        }
    }

    /// 모든 아이템 탈착 및 애니메이션 초기화
    private DestroyHandObj(){
        this.handObj.forEach((obj)=>{
            GameManager.Resource.Destroy(obj);
        })
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isHoldSometing", false);
        //GameManager.Resource.Destroy(this.handObj);
    }

    /// 퀘스트 진행
    // public NextQuest(questNum : string){
    //     if (questNum == "") return;
    //     if (GameManager.player.quest >= parseInt(questNum)) return;
    //     GameManager.Room.Send("QuestUpdate", parseInt(questNum));
    //     GameManager.UI.Popup("Popup_Quest-" + questNum);
    // }

    public WearPortyMask(sessionId:string){
        let mask = this.portyMaskMap.get(sessionId);
        let maskOri  = this.portyMaskOrignMap.get(sessionId);
        
        if(mask != null){ // 마스크를 획득 한경우
            if(mask.activeSelf == true){ // 이미 착용한 경우
                return;
            }
            else{
                mask.SetActive(true);
                if(this.room.SessionId == sessionId){
                    this.room.Send("PortyMask", true);
                }
                if(maskOri != null)
                    maskOri.SetActive(false);
                return;
            }
        }
        
        // 마스크 획득, 기존에 장착한 안경, 선글라스 벗기기
        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
        
        let maskTr:Transform;
        let _maskTr = zepetoPlayer.character.transform.GetChild(0).
        GetChild(1).GetChild(2).GetChild(0).GetChild(1).GetChild(1).GetChild(0).GetComponentsInChildren<Transform>();

        for(let i = 0; i < _maskTr.length; i++){
            if(_maskTr[i].transform.gameObject.name.startsWith("GLASSES") || _maskTr[i].transform.gameObject.name.startsWith("SUNGLASSES")){
                maskTr = _maskTr[i].transform;
                this.portyMaskOrignMap.set(sessionId, _maskTr[i].transform.gameObject);
                _maskTr[i].transform.gameObject.SetActive(false);
            }
            else{
                maskTr  = zepetoPlayer.character.transform.GetChild(0).
                GetChild(1).GetChild(2).GetChild(0).GetChild(1).GetChild(1).GetChild(0);
            }
        }
        let __mask = GameManager.Resource.Instantiate("PortyMask", maskTr);
        __mask.transform.localPosition = __mask.transform.localPosition + new Vector3(0, 0.04, 0);
        this.portyMaskMap.set(sessionId, __mask);
        
        if(this.room.SessionId == sessionId){
            this.room.Send("PortyMask", true);
        }
        
    }
    ////

    public TurnOffObj(name:string, sessionId:string){
        if(name == "PortyMask"){
            let mask  = this.portyMaskOrignMap.get(sessionId);
            let curMask = this.portyMaskMap.get(sessionId);
            if(mask != null){
                mask.gameObject.SetActive(true);
            }
            curMask.SetActive(false);
            if(sessionId == this.room.SessionId)
                this.room.Send("PortyMask", false);
        }
    }

    public LeavePlayer(sessionId:string){
        this.portyMaskMap.delete(sessionId);
        this.portyMaskOrignMap.delete(sessionId);
    }

    public SendRoomMessage<T>(type:string, message:T){
        GameManager.Room.Send(type, message);
    }
    ////
}