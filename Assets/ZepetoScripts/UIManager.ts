import { Coroutine, GameObject, RectTransform, Resources, Sprite, Transform, Vector3, WaitForSeconds } from 'UnityEngine';
import { Button, Image } from 'UnityEngine.UI';
import { Room } from 'ZEPETO.Multiplay';
import GameManager from './GameManager';

export default class UIManager {

    // private sprites: Map<string, Sprite> = new Map<string, Sprite>();
    // private spritesBtn: Map<string, Sprite> = new Map<string, Sprite>();
    private popup:Map<string, GameObject> = new Map<string, GameObject>();
    //private room:Room;
    //private gameManager:GameManager;

    private boolObj:GameObject = null;
    
    public canvasObj:GameObject;

    public loadingUI:Transform;
    public loadingUI_lake:Transform;

    public isPopupOn : boolean = false;
    

    public Init() {
        //this.gameManager = GameManager.instance;
        this.canvasObj = GameObject.Find("Canvas_UI").gameObject;
                
        let ScrollPop = this.canvasObj.transform.GetChild(1).GetComponentsInChildren<Transform>();
        let Quest = this.canvasObj.transform.GetChild(2).GetComponentsInChildren<Transform>();
        let Pop  = this.canvasObj.transform.GetChild(3).GetComponentsInChildren<Transform>();

        this.PopupInit(ScrollPop, 1);
        this.PopupInit(Quest);
        this.PopupInit(Pop, 3);
        
        for(let i = 1; i < 4; i++){
            this.popup.get("Quest-F" + i).GetComponentInChildren<Button>().onClick.AddListener(()=>{
                this.Popup("Quest-F" + (i+1));
            });
        }
        for(let i = 1; i < 3; i++){
            this.popup.get("Quest-D" + i).GetComponentInChildren<Button>().onClick.AddListener(()=>{
                this.Popup("Quest-D" + (i+1));
            });
        }
        for(let i = 1; i < 3; i++){
            this.popup.get("Quest-B" + i).GetComponentInChildren<Button>().onClick.AddListener(()=>{
                this.Popup("Quest-B" + (i+1));
            });
        }

        //입장 팝업
        this.popup.get("Pop-WorldIn").transform.GetChild(0).GetComponent<Button>().onClick.AddListener(()=>{
            this.NeverOpen("Pop-WorldIn");
        });
        this.popup.get("Pop-ForestIn").transform.GetChild(0).GetComponent<Button>().onClick.AddListener(()=>{
            this.NeverOpen("Pop-ForestIn");
        });
        this.popup.get("Pop-HiddenIn").transform.GetChild(0).GetComponent<Button>().onClick.AddListener(()=>{
            this.NeverOpen("Pop-HiddenIn");
        });
        

        // UI        
        let mainUI = this.canvasObj.transform.GetChild(0);
        
        // 설정창
        let setup = mainUI.GetChild(0);
        let setupPop = setup.GetChild(0);
        setup.GetComponent<Button>().onClick.AddListener(()=>{ // 설정 UI 버튼
            if (!setupPop.gameObject.activeSelf){
                GameManager.instance.UIAudioPlay(2);
                setupPop.gameObject.SetActive(true);
            }
            else{
                setupPop.gameObject.SetActive(false);
            }
        });

        setupPop.GetChild(0).GetComponent<Button>().onClick.AddListener(()=>{ // 닫기 버튼
            setupPop.gameObject.SetActive(false);
        });
        setupPop.GetChild(1).GetComponent<Button>().onClick.AddListener(()=>{ // BGMon 버튼
            // 오디오 리스너 켜기
            setupPop.GetChild(1).gameObject.SetActive(false);
            setupPop.GetChild(2).gameObject.SetActive(true);
            GameManager.instance.AudioOnOff(true);
        });
        setupPop.GetChild(2).GetComponent<Button>().onClick.AddListener(()=>{ // BGMoff 버튼
            // 오디오 리스너 끄기
            setupPop.GetChild(1).gameObject.SetActive(true);
            setupPop.GetChild(2).gameObject.SetActive(false);
            GameManager.instance.AudioOnOff(false);
        });
        setupPop.GetChild(1).gameObject.SetActive(false);
        setupPop.GetChild(2).gameObject.SetActive(true);
        

        setupPop.GetChild(3).GetComponent<Button>().onClick.AddListener(()=>{ // 3인칭 버튼
            // 3인칭 시점
            setupPop.GetChild(3).gameObject.SetActive(false);
            setupPop.GetChild(4).gameObject.SetActive(true);
            GameManager.instance.ChangeViewpoint(false);
        });
        setupPop.GetChild(4).GetComponent<Button>().onClick.AddListener(()=>{ // 1인칭 버튼
            // 1인칭 시점
            setupPop.GetChild(3).gameObject.SetActive(true);
            setupPop.GetChild(4).gameObject.SetActive(false);
            GameManager.instance.ChangeViewpoint(true);
        });
        setupPop.GetChild(3).gameObject.SetActive(false);
        setupPop.GetChild(4).gameObject.SetActive(true);
        
        setupPop.gameObject.SetActive(false);

        // 퀘스트 현황창
        let bag = mainUI.GetChild(1);
        let questList = bag.GetChild(0);
        
        bag.GetComponent<Button>().onClick.AddListener(()=>{ // 퀘스트 UI 버튼
            if (!questList.gameObject.activeSelf){
                GameManager.instance.UIAudioPlay(2);
                questList.gameObject.SetActive(true);
            }
            else{
                questList.gameObject.SetActive(false);
            }
        });
        
        questList.GetChild(0).GetComponent<Button>().onClick.AddListener(()=>{ 
            questList.gameObject.SetActive(false);
        });

        this.checkMark = new Array();

        for(let i = 1; i < 4; i++){
            this.checkMark.push(questList.GetChild(i).gameObject);
            questList.GetChild(i).gameObject.SetActive(false);
        }

        questList.gameObject.SetActive(false);

        // 내리기 버튼
        this.RideDownBtn = mainUI.GetChild(2);
        this.RideDownBtn.GetComponent<Button>().onClick.AddListener(()=>{ // 내리기
            GameManager.instance.UIAudioPlay(3);
            GameManager.instance.RideOffDeokbong(); // 덕봉이 내리기
            GameManager.instance.RideOffKayak(); // 덕봉이 내리기
            GameManager.instance.PlayOffGaya(); // 가야금 내리기
            GameManager.instance.StandSunbed(); // 선배드 내리기
            this.RideDownBtn.gameObject.SetActive(false);
        });

        this.RideDownBtn.gameObject.SetActive(false);

        this.bokCntImg = mainUI.GetChild(3);
        this.bokCntImg.gameObject.SetActive(false);

        this.DeaCntImg = mainUI.GetChild(4);
        this.DeaCntImg.gameObject.SetActive(false);
        
        // 로딩 UI
        this.loadingUI = this.canvasObj.transform.GetChild(4);
    }

    // 퀘스트 UI 체크 마크 표시
    private checkMark : GameObject[];
    
    public QuestClear(num : number){
        this.checkMark[num].SetActive(true);
    }

    public RideDownBtn : Transform;
    public bokCntImg : Transform;
    public DeaCntImg : Transform;

    /// 각 장소 다시 열지 않기
    public NeverOpen(str : string){
        GameManager.Resource.Destroy(this.popup.get(str));
        switch(str){
            case "Pop-WorldIn":
                if (GameManager.player.popState < 100){
                    GameManager.Room.Send("popStateUpdate", GameManager.player.popState + 100);
                }
            break;
            case "Pop-ForestIn":
                if (GameManager.player.popState%100 < 10){
                    GameManager.Room.Send("popStateUpdate", GameManager.player.popState + 10);
                }
            break;
            case "Pop-HiddenIn":
                if (GameManager.player.popState%10 < 1){
                    GameManager.Room.Send("popStateUpdate", GameManager.player.popState + 1);
                }
            break;
        }
        this.popup.delete(str);
    }

    public NeverOpenCheck(num : number){
        console.log("NeverOpenCheck " + num);
        if (num >= 100){
            this.NeverOpen("Pop-WorldIn");
            console.log("Pop-WorldIn " + num);
        }
        if (num%100 >= 10){
            this.NeverOpen("Pop-ForestIn");
            console.log("Pop-ForestIn " + num);
        }
        if (num%10 >= 1){
            this.NeverOpen("Pop-HiddenIn");
            console.log("Pop-HiddenIn " + num);
        }
    }

    // public RoomInit(room:Room){
    //     this.room = room;    
    // }

    private PopupInit(obj : Transform[], btnTrNum : number = 2){ // 기본 팝업창 세팅
        let objOri = obj.shift();
        for(let i = 0; i < obj.length; i++){ 
            // if(isUpper){
            //     this.popup.set(objOri.name + "-" + obj[i].name, obj[i].gameObject);
            //     obj[i].gameObject.SetActive(false);
            // }
            // else {
                if(i % btnTrNum == 0){
                    this.popup.set(objOri.name + "-" + obj[i].name, obj[i].gameObject);
                    obj[i].gameObject.SetActive(false);
                }
                else{
                    let btn = obj[i].transform.GetComponent<Button>();
                    btn.onClick.AddListener(()=>{
                        this.ClosePopui(obj[i].parent);
                        this.isPopupOn = false;
                    });
                }
            // }
        }
        //obj[1].gameObject.SetActive(true);
        objOri.gameObject.SetActive(false);
    }

    
    public Popup(name : string, popupOffTime : number = 0){ 
        // console.log("call " + name);
        let trans:Transform;
        if(this.popup.get(name) != null){
            let pop = this.popup.get(name);
            pop.transform.parent.gameObject.SetActive(true);
            pop.SetActive(true);
            trans = pop.transform;
            // console.log("call 2 "+pop.transform.parent.name);
            if (popupOffTime != 0) {
                GameManager.instance.CourutineStarter(this.PopupOff(trans, popupOffTime));
            }
            else {
                this.isPopupOn = true;
            }
            // console.log("call2 " + name);
        }
        // console.log("call3 " + name);
    }

    private *PopupOff(trans:Transform,popupOffTime:number){
        yield new WaitForSeconds(popupOffTime);
        this.ClosePopui(trans);
    }

    private ClosePopui(tr:Transform){//, popupClose : boolean = false){ // 캔버스 내의 해당 묶음용 게임 오브젝트를 끔
        //if(popupClose) 
        tr.transform.gameObject.SetActive(false); 
        tr.transform.parent.gameObject.SetActive(false); 
    }

    private isScrolling :boolean = false;
    public Popup_Scroll(name : string){ 
        if (this.isScrolling) {
            return;
        }
        this.isScrolling = true;
        let pop = this.popup.get(name);
        this.Popup(name, 5);
        // let y = pop.GetComponent<RectTransform>().position.y - 200;
        // let pos = new Vector3(0,y,0);
        // pop.GetComponent<RectTransform>().position = pos;
        GameManager.instance.CourutineStarter(this.Scrolling(pop));
    }

    private *Scrolling(pop:GameObject){
        let rectPos =  new Vector3(0,0,0);
        rectPos = pop.GetComponent<RectTransform>().position;
        // console.log("rectPos x : " + rectPos.x + " y : "+ rectPos.y + " z : "+ rectPos.z);
        let tempY = rectPos.y;
        rectPos.y += 200;
        pop.GetComponent<RectTransform>().position = rectPos;
        while (rectPos.y > tempY){
            yield new WaitForSeconds(0.001);
            rectPos.y -= 5;
            pop.GetComponent<RectTransform>().position = rectPos;
        }
        yield new WaitForSeconds(2);
        while (rectPos.y < (tempY + 200)){
            yield new WaitForSeconds(0.001);
            rectPos.y += 5;
            pop.GetComponent<RectTransform>().position = rectPos;
        }
        yield new WaitForSeconds(0.5);
        rectPos.y = tempY;
        pop.GetComponent<RectTransform>().position = rectPos;
        this.isScrolling = false;
        GameManager.instance.CourutineStopper(this.Scrolling(pop));
    }
    
    // public MoveNextPopup(name:string, level:number = null, delay:number = null){ // 퀘스트 진행 관련인 것으로 보임
    //     if(this.boolObj == null || this.boolObj == undefined){
    //         this.boolObj = this.popup.get(name);
    //     }
    //     else{
    //         this.boolObj.SetActive(false);
    //         this.boolObj = this.popup.get(name);
    //     }
    //     this.boolObj.SetActive(true);
    //     if(level != null && name != "x"){
    //         GameManager.Room.Send("QuestUpdate", parseInt(name));
    //     }
    // }

    public GetItem(name:string){

        // if(name == "glasses"){
        //     this.glassesOffBtn.gameObject.SetActive(true);
        // }
        // else if(name == "balloon"){
        //     this.balloonOffBtn.gameObject.SetActive(true);
        // }
        // else{
        //     this.wingOffBtn.gameObject.SetActive(true);
        // }
    }

    // Glasses(){
    //     if(GameManager.player.quest >= 6){  
    //         let glasses = GameManager.GetInstance.glassesMap.get(this.room.SessionId);
            
    //         if(glasses == null || glasses.gameObject.activeSelf == false)
    //         {
    //             this.gameManager.WearGlasses(this.room.SessionId);
    //             this.glassesBtn.gameObject.SetActive(false);
    //             this.glassesOffBtn.gameObject.SetActive(true);
    //         }  
    //         else{
    //             this.gameManager.TurnOffObj("glasses", this.room.SessionId);
    //             this.glassesBtn.gameObject.SetActive(true);
    //             this.glassesOffBtn.gameObject.SetActive(false);
    //         }
    //     }
    //    else{
    //         //GameManager.UI().ShowUI("x", 1);
    //         this.ShowUI("x", 1);
    //    }
    // }

    // Balloon(){
    //     if(GameManager.player.quest >= 12){
    //         let balloon = GameManager.GetInstance.ballonMap.get(this.room.SessionId);
            
    //         if(balloon == null ||balloon.activeSelf == false)
    //         {
    //             this.gameManager.WearBalloon(this.room.SessionId);
    //             this.balloonBtn.gameObject.SetActive(false);
    //             this.balloonOffBtn.gameObject.SetActive(true);
    //         }
    //         else{
    //             this.gameManager.TurnOffObj("balloon", this.room.SessionId);
    //             this.balloonBtn.gameObject.SetActive(true);
    //             this.balloonOffBtn.gameObject.SetActive(false);
    //         }
    //    }
    //    else{
    //         //GameManager.UI().ShowUI("x", 1);
    //         this.ShowUI("x",1);
    //     }
    // }

    // Wing(){
    //     if(GameManager.player.quest >= 18){
    //         let wing = GameManager.GetInstance.wingMap.get(this.room.SessionId);
            
    //         if(wing == null || wing.activeSelf == false)
    //         {
    //             this.gameManager.WearWing(this.room.SessionId);
    //             this.wingBtn.gameObject.SetActive(false);
    //             this.wingOffBtn.gameObject.SetActive(true);
    //         }
    //         else{
    //             this.gameManager.TurnOffObj("wing",this.room.SessionId);
    //             this.wingBtn.gameObject.SetActive(true);
    //             this.wingOffBtn.gameObject.SetActive(false);
    //         }
    // }
    // else{
    //         //GameManager.UI().ShowUI("x", 1);
    //         this.ShowUI("x",1);
    // }
    // }

    // *Delay(num:string){
    //     yield new WaitForSeconds(1);
    //     console.log("startcour");
    //     this.MoveNextPopup(num, 1);
    // }


}