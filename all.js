var app = new Vue({
    el: '#app',
    data: {
        isMobile: false,
        noData: true, 
        titleEditing: false,
        titleShowing: true,
        editClosed: true,
        isNavClose: true,
        isEditing: false,
        // isSaving: false,
        isOperatorOpened:false,
        isNew: false,
        isOutputing: false,
        selectedOrder: "",
        justDeletedOrder: false,
        addPre: false,
        addRepeat: false,
        nextCannotBeEffect: false,
        title: "Djembe 鼓譜",
        isFourBeats: true,
        tempTitle: "",
        fullBeats: 16,
        beatLines: 4,
        tempBeat: "",
        tempBaz: "",
        tempUploadData: [],
        tempDrum: {
            'beat':[],
            'baz': [],
        },
        demoDrum: [
            {
                'type': "note",
                'note': "請點選右上方按鈕，開始編輯樂譜。",
                'title': "畫面示意",
            },
            {
                'type': "Djembe",
                'title': "Djembe 1",
                'beat': ['⸆T','-','S','S','❲SS❳','-','TT','T','T','-','S'],
                // 'beat': ['⸆T','-','S','S','❲SS❳','-','TT','T','T','-','S','S','B','-','S','T'],
                'preBeat': 'T',
                'repeat': 3,
            },
        ],
        drumList: [
            {
                'type': "Djembe",
                'title': "Djembe 1",
                'beat': ['⸆T','-','S','S','❲SS❳','-','TT','T','T','-','S','S'],
                'preBeat': 'T',
                'repeat': 3,
            },
        ],
    },
    methods: {
        moveUp(index){
            if ( index !== 0 ) {
                let item = this.drumList[index];
                let pre = this.drumList[index - 1 ];
                itemRepeat2 = this.containsKey(item, 'repeatWithNext') || this.containsKey(item, 'repeatWithPre') ;
                preRepeat2 = this.containsKey(pre, 'repeatWithPre') ;
                if ( itemRepeat2 ) {
                    alert('請先移除兩行合併重複，再進行移動')
                } else {
                    preRepeat2 ? newIndex = index-2 : newIndex = index-1 ;
                    this.drumList.splice(newIndex, 0, this.drumList.splice(index, 1)[0]);
                }
            }
        },
        moveDown(index){
            let length =  this.drumList.length;
            if ( index !== length -1 ) {
                let item = this.drumList[index];
                let next = this.drumList[index + 1 ];
                itemRepeat2 = this.containsKey(item, 'repeatWithNext') || this.containsKey(item, 'repeatWithPre') ;
                nextRepeat2 = this.containsKey(next, 'repeatWithNext') ;
                if ( itemRepeat2 ) {
                    alert('請先移除兩行合併重複，再進行移動')
                } else {
                    nextRepeat2 ? newIndex = index+2 : newIndex = index+1 ;
                    this.drumList.splice(newIndex, 0, this.drumList.splice(index, 1)[0]);
                }
            }
        },
 // ----存檔讀檔-------------
        checkNoData (){
            this.drumList.length < 1 ? this.noData=true : this.noData=false;
        },
        checkLoad(data) {
            var check = data.pop();
            if (check.fileCheck==='Drum-Notation-1.0') {
                this.title = check.fileTitle;
                this.isFourBeats = check.isFourBeats;
                this.drumList = data ;
                this.checkNoData ();
            } else {
                alert('上傳資料錯誤，請重新操作'); 
            }
            this.closeNav();
        },
        read() {         
            const files = document.getElementById('fileToLoad').files;
            if (files.length <= 0) {
                return false;
            }
            
            const fr = new FileReader();
            
            fr.onload = e => {
                const result = JSON.parse(e.target.result);
                this.checkLoad(result);
            }
            fr.readAsText(files.item(0));

        },
        fake_click(obj) {
            var ev = document.createEvent("MouseEvents");
            ev.initMouseEvent(
                "click", true, false, window, 0, 0, 0, 0, 0
                , false, false, false, false, 0, null
            );
            obj.dispatchEvent(ev);
        },
        export(name, data) {
            var urlObject = window.URL || window.webkitURL || window;
            var export_blob = new Blob([data]);
            var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
            save_link.href = urlObject.createObjectURL(export_blob);
            save_link.download = name;
            this.fake_click(save_link);
        },
        clickDownload() {
            if ( !this.noData ) {
                let info = { fileTitle: this.title, isFourBeats: this.isFourBeats, fileCheck: 'Drum-Notation-1.0'}
                let tempData = JSON.parse(JSON.stringify(this.drumList));
                tempData.push(info);
                let data = JSON.stringify(tempData);
                this.export(this.title, data);
                this.isNavClose = true;
            } 
        },
// --------匯出----------------
        // clickSave(){
        //     this.offEditing();
        //     this.closeOperator();
        //     this.isSaving = true;
        //     this.isEditing = true;
        // },        

        output() {
            this.offEditing();
            this.closeOperator();
            this.isOutputing = true;
            this.isEditing = true;
        },
        printPdf() {
            window.print();
            this.isEditing = false;
            this.isOutputing = false;
        },

    // --------匯出圖片------------------------
        saveImg(){
            html2canvas(document.querySelector("#page"), {
                // scale:3
            }).then(canvas => {
                this.downloadImg(canvas.toDataURL("image/png", 1));
            });
        },
        downloadImg(url){
            var a = $("<a style='display:none' id='js-downloader'>")
            .attr("href", url)
            .attr("download", this.title+".png")
            .appendTo("body");
            a[0].click();
            a.remove();
        },
 //  ------nav------------------
        openNav(){
            this.isNavClose = false;
            this.isEditing = true;
            this.closeOperator(); 
        },
        closeNav(){
            this.isNavClose = true;
            this.isEditing = false;
        },

    //  ------關閉------------------
        offEditing() {
            this.titleEditing = false;
            this.editClosed = true;
            // this.djembeEditClosed = true;
            // this.dumdumEditClosed = true;
            // this.noteEditClosed = true;
            this.isEditing = false;
            this.isNew = false;
            this.titleShowing = true;
            this.isNavClose = true;
        },
        resetTempDrum() {
            this.tempDrum = {} ;
            this.tempDrum.beat = [];
            this.tempDrum.baz = [];
            this.addPre = false;
            this.addRepeat = false;
            delete this.tempDrum.repeatWithPre;
        },
        offOutput(){
            this.isOutputing = false;
            this.isEditing = false;
        },
        
    // ------觸發新增與修改------------------------- 
        editTitle() {
            if ( !this.isEditing ) {
                this.tempTitle = this.title;
                this.titleEditing = true;
                this.titleShowing = false;
                this.isEditing = true;
                this.isNavClose = true;
                this.closeOperator();
            }
        },
        containsKey(obj, key ) {
            return Object.keys(obj).includes(key);
        },
        addBeats(drum) {
            this.resetTempDrum();
            // 1. 確認是否被上段影響
            var length = this.drumList.length;
            if ( length > 0 ) {
                var preDrum = this.drumList[length - 1];
                var beenEffected = this.containsKey(preDrum, 'repeatWithNext');
                if ( beenEffected ) {
                    this.tempDrum.repeatWithPre = true;
                }
            }
            this.tempDrum.type = drum;  
            this.isEditing = true;
            this.isNavClose = true;
            this.closeOperator();
            this.isNew = true;
            this.editClosed = false;
        },
        editBeats(drum) {
            if ( !this.isEditing) {
                // 確定下段是否已有repeat
                let length = this.drumList.length;
                let isFinalItem = drum === length - 1 ? true : false;
                if ( !isFinalItem ) {
                    let next = this.drumList[ drum + 1];
                    this.nextCannotBeEffect = this.containsKey(next, 'repeat');
                }
                this.isEditing = true;
                this.isNavClose = true;
                this.closeOperator();
                this.showSelectedOuter();
                this.addRepeat = this.containsKey(this.drumList[drum], 'repeat');
                this.tempDrum = JSON.parse(JSON.stringify(this.drumList[drum]));
                var type = this.tempDrum.type;
                this.editClosed = false; 
            }
        },
    // ------input 輸入與刪除功能按鈕------------------------- 

        quickInsert(word) {
            var newTemp = JSON.parse(JSON.stringify(this.tempDrum));
            newTemp.title = word;
            this.tempDrum = newTemp ;
        },
        changeRepeatTimes(x) {
            if ( x === '+') {
                this.tempDrum.repeat < 9 ? this.tempDrum.repeat += 1 : this.tempDrum.repeat = this.tempDrum.repeat
                this.makeVueBuzy();
            } else {
                this.tempDrum.repeat > 2 ? this.tempDrum.repeat -= 1 : this.tempDrum.repeat = this.tempDrum.repeat
                this.makeVueBuzy();
            }
        },
        insertBeat(s) {
            var length = this.tempDrum.beat.length;  
            if ( this.addPre ) {
                if ( this.tempDrum.preBeat === '' ) {
                    var newTemp = JSON.parse(JSON.stringify(this.tempDrum));
                    newTemp.preBeat = s ;
                    this.tempDrum = newTemp ; 
                } else {
                    if ( length < this.fullBeats ) {
                        this.tempDrum.beat.push(s);
                    }
                }   
            } else {
                if ( length < 1) {
                    var newTemp = JSON.parse(JSON.stringify(this.tempDrum));
                    newTemp.beat.push(s);
                    this.tempDrum = newTemp ; 
                } else if ( length < this.fullBeats ) {
                    this.tempDrum.beat.push(s);
                }
            }
        },
        insertBaz(s) { 
            var length = this.tempDrum.baz.length;  
            if ( this.addPre ) {
                if ( this.tempDrum.preBaz === '' ) {
                    var newTemp = JSON.parse(JSON.stringify(this.tempDrum));
                    newTemp.preBaz = s ;
                    this.tempDrum = newTemp ; 
                } else {
                    if ( length < this.fullBeats ) {
                        this.tempDrum.baz.push(s);
                    }
                }   
            } else {
                if ( length < 1) {
                    var newTemp = JSON.parse(JSON.stringify(this.tempDrum));
                    newTemp.baz.push(s);
                    this.tempDrum = newTemp ; 
                } else if ( length < this.fullBeats ) {
                    this.tempDrum.baz.push(s);
                }
            }
        },
        clearBeat() {
            this.tempDrum.beat = [];
            this.tempDrum.baz = [];
            if ( this.addPre ) {
                this.tempDrum.preBeat = '';
                this.tempDrum.preBaz = '';
            };
        },
        backWardBeat() {
            var length = this.tempDrum.beat.length;
            if ( this.addPre && length < 1 ) {
                this.tempDrum.preBeat = '';
            }
            this.tempDrum.beat.pop();
        },
        backWardBaz() {
            var length = this.tempDrum.baz.length;
            if ( this.addPre && length < 1 ) {
                this.tempDrum.preBaz = '';
            }
            this.tempDrum.baz.pop();
        },
        toggleIsRepeat(){
            if ( this.addRepeat ) {
                this.tempDrum.repeat = 2;
            } else {
                delete this.tempDrum.repeat;
                var isContain = this.containsKey(this.tempDrum, 'repeatWithNext');
                if ( isContain ) {
                    delete this.tempDrum.repeatWithNext;
                }
            }
        },
        checkPre(){
            if ( this.addPre ) {
                this.tempDrum.preBeat = '';
                this.tempDrum.preBaz = '';
            } else {
                delete this.tempDrum.preBeat;
                delete this.tempDrum.preBaz;
            }
        },

    // ------submit 與 cancel-------------------------      
        cancelTitleChange() {
            this.offEditing();
            this.tempTitle="";   
        },
        cancel() {
            this.offEditing();
            this.resetTempDrum();
            this.removeSelectedOuter();
        },
        submitNewTitle() {
            this.title = this.tempTitle;
            this.offEditing();  
        },
        submitNew() {
            let temp = this.tempDrum;     
            let notEmpty = temp.title || temp.note || temp.baz.length > 0 || temp.beat.length > 0 ;

            if ( notEmpty === false ) {
                alert('未輸入任何資料'); 
            } else {
                this.offEditing();
                this.removeSelectedOuter();
                this.drumList.push(this.tempDrum);
                this.resetTempDrum();
                this.checkNoData ();
                // this.noData = false;
                this.scrollToBottom ();
            }
        },
        submitPatch() {
            // 未檢查空資料
            this.offEditing();
            this.removeSelectedOuter();
            let order = this.selectedOrder;
            let length = this.drumList.length;
            let isFinalItem = order === length-1 ? true : false;
        // check isEffectNext
            let isEffectNext = false
            let contain = this.containsKey(this.tempDrum, 'repeatWithNext');
            if (contain) {
                this.tempDrum.repeatWithNext ? isEffectNext = true : delete this.tempDrum.repeatWithNext
            }
            if ( !isFinalItem ) {
                if ( !isEffectNext ) {
                    this.deleteNextRepeatPre(order);
                } else {
                    let next = this.drumList[ order + 1 ];
                    next.repeatWithPre = true;
                }   
            }
            this.drumList.splice(order, 1 , this.tempDrum);
            this.resetTempDrum();
        },
        


    // ------小節focus---------------------- 

        toggleOperator(drum) {
            let length = this.drumList.length;
            if (  length > 0 && drum <= length-1 ) {
                let lastOperator = this.$refs['drumBeat'+this.selectedOrder];
                lastOperator[0].classList.toggle("active");
                let outer = lastOperator[0].parentElement ;
                outer.classList.toggle("red-border");
                this.isOperatorOpened = !this.isOperatorOpened ;
                
            };
        },
        clickBeat(drum) {
            let length = this.drumList.length;
            if (this.selectedOrder > length-1 ) {
                // 資料已被刪除
                this.selectedOrder ="";
            } else {
                if ( !this.isEditing && length > 0 ) {
                    if ( this.selectedOrder === "") {
                        this.openOperator(drum);                         
                    } else if( drum !== this.selectedOrder) {
                        this.closeOperator();
                        this.openOperator(drum);
                    } else {
                        this.justDeletedOrder = false;
                        this.toggleOperator(drum);
                    }
                }   
            }
            
        },
        showSelectedOuter() {
            if ( this.selectedOrder !== "" ) {
                let lastOperator = this.$refs['drumBeat'+this.selectedOrder];
                let outer = lastOperator[0].parentElement ;
                outer.classList.add("red-border");
             }
        },
        removeSelectedOuter() {
            let length = this.drumList.length;
            if ( length > 0 ) {
                if ( this.selectedOrder !== "" ) {
                    let lastOperator = this.$refs['drumBeat'+this.selectedOrder];
                    let outer = lastOperator[0].parentElement ;
                    outer.classList.remove("red-border");
                }
            }
        },

        openOperator(drum) {
            this.selectedOrder = drum;
            let operator = this.$refs['drumBeat'+drum];
            operator[0].classList.add("active");
            this.showSelectedOuter();
            this.isOperatorOpened = true;   
        },
        closeOperator() {
            let length = this.drumList.length;
            if ( length > 0 ) {
                if ( this.selectedOrder !== "") {
                    let lastOperator = this.$refs['drumBeat'+this.selectedOrder];
                    lastOperator[0].classList.remove("active");

                    let outer = lastOperator[0].parentElement ;
                    outer.classList.remove("red-border");
                    this.isOperatorOpened = false; 
                }
            }
        },
    // ---------刪除---------------
        deleteBeats(drum) {     
            let operator = this.$refs['drumBeat'+drum];
            let item = this.drumList[drum];
            if (item.repeatWithNext || item.repeatWithPre) {
                alert('請先移除兩行合併重複，再進行刪除')
            } else {
                var r = confirm("確定刪除這段嗎？");
                if (r == true) {
                    this.drumList.splice(drum, 1 ); 
                    this.isOperatorOpened = false; 
                    this.justDeletedOrder = true;
                    // this.drumList.length < 1 ? this.noData = true : this.noData = false;
                    this.checkNoData ();
                }
            }
            // v-if="!item.repeatWithNext && !item.repeatWithPre"
        },
        deleteNextRepeatPre(order){
            let nextOrder = order+1;
            let nextBeenEffected = this.containsKey( this.drumList[nextOrder], 'repeatWithPre');
            if(nextBeenEffected) {
                delete this.drumList[nextOrder].repeatWithPre;
            }
        },

    // -----tools---------------------------
        checkDevice() {
            if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                this.isMobile = true;
                // console.log(this.isMobile);
            } 
        },
        scrollToBottom() {
            $(document).scrollTop($(document).height());
        },
        makeVueBuzy() {
            this.tempDrum.beat.push(0);
            this.showBeat();
            this.tempDrum.beat.pop();
            this.showBeat();
        },


        changeFullBeats() {
            var msg = this.isFourBeats ? ' 3/4拍 ' : ' 4/4 拍 '
            this.closeNav();
            var r = confirm("※注意 修改拍子將清除全部資料，確定要修改成"+ msg +"？");
            if (r == true) {
                this.drumList = [];
                this.isFourBeats = !this.isFourBeats;
                this.isFourBeats ? this.fullBeats = 16 : this.fullBeats = 12
            }  
        },

    // -----棄用------------------------- 
        showBeat() {
            var beat = this.tempDrum.beat;
            var baz = this.tempDrum.baz;
            this.tempBeat = this.mergeBeats(beat);
            if (baz) {
                this.tempBaz = this.mergeBeats(baz);
            }
        },
        mergeBeats(array) {
            var mergeBeats = "";
            array.forEach(e => {
                mergeBeats += e ;
                // e === 0 ? mergeBeats += '-'  : mergeBeats += e ;
            });
            return mergeBeats.replace(/(.{4})/g, '$1  ');
        },
    },
    mounted() {
        this.checkDevice();
    }
})