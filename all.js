Vue.use(VueLoading);
Vue.component('loading', VueLoading);
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
        title: "",
        isFourBeats: true,
        tempTitle: "",
        fullBeats: 16,
        beatLines: 4,
        tempBeat: "",
        tempBaz: "",
        tempDrum: {
            'beat':[],
            'baz': [],
        }, 
        tempDum: [ ['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''] ],
        drumList: [],
        dumdumList: [],
        isLoading: false,
        notion: {
            'type': "note",
            'title': "網站說明",
            'note': "本站為非洲鼓鼓譜編輯器，開放給有記譜需求的鼓友們使用。為確保完整功能，請優先使用電腦操作。 iphone / ipad 請使用safari瀏覽器，以保障匯出功能正常。",    
        },
    },
    methods: {
        appendAbout() {
            this.drumList.push(this.notion);
            this.checkNoData ();
            this.closeNav();
        },
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
        hideNav(){
            this.output();
            var output = document.querySelector('#output')
            output.style.opacity = 0;
            setTimeout(( () => this.offOutput() ), 3000);
            setTimeout(( () => output.style.opacity = 1 ), 3000);
        },
 // ----存檔讀檔-------------
        checkNoData (){
            this.drumList.length < 1 && this.dumdumList.length < 1  ? this.noData=true : this.noData=false;
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
        export(name, data) {
            var urlObject = window.URL || window.webkitURL || window;
            var export_blob = new Blob([data]);
            var save_link = document.createElement("a");
            save_link.href = urlObject.createObjectURL(export_blob);
            save_link.download = name;
            save_link.click();            
        },
        clickDownload() {
            // var newWindow = window.open();
            if ( !this.noData ) {
                let info = { fileTitle: this.title, isFourBeats: this.isFourBeats, fileCheck: 'Drum-Notation-1.0'}
                let tempData = JSON.parse(JSON.stringify(this.drumList));
                tempData.push(info);
                let data = JSON.stringify(tempData);
                this.export(this.title, data);
            } 
            this.closeNav();
        },
// --------匯出----------------
        output() {
            this.offEditing();
            this.closeOperator();
            this.isOutputing = true;
            this.isEditing = true;
        },
        winPrintPdf() {
            document.title = this.title;
            window.print();
            this.isEditing = false;
            this.isOutputing = false;
            this.offOutput();
        },
        printPdf() {
            this.isEditing = false;
            this.isOutputing = false;
            this.offOutput();

            let page = document.querySelector("#page");
            html2canvas(page, {
                scale:3,
                height: page.scrollHeight,//
                width: page.scrollWidth,//為了使橫向滾動條的內容全部展示，這裡必須指定
                background: "#FFFFFF",
            }).then(canvas => {

                var contentWidth = canvas.width;
                var contentHeight = canvas.height;

                //一頁pdf顯示html頁面生成的canvas高度;
                var pageHeight = contentWidth / 595.28 * 841.89;
                //未生成pdf的html頁面高度
                var leftHeight = contentHeight;
                //pdf頁面偏移
                var position = 0;
                //a4紙的尺寸[595.28,841.89]，html頁面生成的canvas在pdf中圖片的寬高
                var imgWidth = 555.28;
                var imgHeight = 555.28/contentWidth * contentHeight;

                var pageData = canvas.toDataURL('image/jpeg', 1.0);

                var pdf = new jsPDF('', 'pt', 'a4');
                //有兩個高度需要區分，一個是html頁面的實際高度，和生成pdf的頁面高度(841.89)
                //當內容未超過pdf一頁顯示的範圍，無需分頁
                if (leftHeight < pageHeight) {
                    pdf.addImage(pageData, 'JPEG', 20, 0, imgWidth, imgHeight );
                } else {
                    while(leftHeight > 0) {
                        pdf.addImage(pageData, 'JPEG', 20, position, imgWidth, imgHeight)
                        leftHeight -= pageHeight;
                        position -= 841.89;
                        //避免新增空白頁
                        if(leftHeight > 0) {
                            pdf.addPage();
                        }
                    }
                }
                window.open(pdf.output('bloburl'), '_blank');
                pdf.save(this.title+'.pdf');
            });
        },

    // --------匯出圖片------------------------
        closeOutputModal(){
            document.querySelector("#outputImg").innerHTML="";
            $('#outputModal').modal('hide');
        },
        openImg(){
            // $('#editModal').modal('show');
            let show = document.querySelector("#outputImg");
            let page = document.querySelector("#page");

            if(page.scrollHeight < 500 ) {
                page.classList.add('minHeight');

                html2canvas(page, {
                    scale:3
                }).then(canvas => {
                    show.innerHTML = '<img src="' + canvas.toDataURL() + '" />' ;
                    $('#outputModal').modal('show');
                    // imageURL = canvas.toDataURL();
                    // this.openInNewTab(imageURL, this.title);
                    page.classList.remove('minHeight');
                });
            } else {
                html2canvas(page, {
                    scale:3
                }).then(canvas => {
                    show.innerHTML = '<img src="' + canvas.toDataURL() + '" />' ;
                    $('#outputModal').modal('show');
                    // imageURL = canvas.toDataURL();
                    // this.openInNewTab(imageURL, this.title);
                    // window.open().document.write('<img src="' + canvas.toDataURL() + '" />');
                });
            }
            this.offOutput();     
        },
        openInNewTab(imageURL, name) {
            var img = new Image();
            img.crossOrigin = "Anonymous";
            img.id = "getshot";
            img.src = imageURL;
            document.body.appendChild(img);

            var a = document.createElement("a");
            a.href = getshot.src;
            a.download = name +".png";
            a.click();
            document.body.removeChild(img);
            a.remove();
        },
        saveImg(){
            let page = document.querySelector("#page");
            html2canvas(document.querySelector("#page"), {
            }).then(canvas => {
                this.downloadImg(canvas.toDataURL("image/png", 1));
            });

            // if(page.scrollHeight < 500 ) {
            //     page.classList.add('minHeight');
            
            //     html2canvas(document.querySelector("#page"), {
            //     }).then(canvas => {
            //         this.downloadImg(canvas.toDataURL("image/png", 1));
            //         page.classList.remove('minHeight');
            //     });
            // } else {
            //     html2canvas(document.querySelector("#page"), {
            //     }).then(canvas => {
            //         this.downloadImg(canvas.toDataURL("image/png", 1));
            //     });

            // }
            this.offOutput();
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
        resetTempDum() {
            this.tempDum = [ ['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''] ];
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
        addDumBeats() {
            this.resetTempDum();
            this.isEditing = true;
            this.isNavClose = true;
            this.closeDumOperator();
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
                this.containsKey(this.tempDrum, 'preBeat') ? this.addPre=true : this.addPre=false;
                var type = this.tempDrum.type;
                this.editClosed = false; 
            }
        },
        editDumBeats(drum) {
            this.isEditing = true;
            this.isNavClose = true;
            this.closeDumOperator();
            this.showSelectedOuter();
            this.tempDum = JSON.parse(JSON.stringify(this.dumdumList[drum]));
            this.editClosed = false; 
        },
        editDum(i, s) {
            var editingItem = this.tempDum[i];
            if ( editingItem[s] ==='' ) {
                editingItem.splice(s, 1, '○');
            } else if ( editingItem[s] ==='○' ) {
                editingItem.splice(s, 1, '△');
            } else if ( editingItem[s] ==='△' ) {
                editingItem.splice(s, 1, '');
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
            this.resetTempDum();
            this.removeSelectedOuter();
            this.removeSelectedDumOuter();
        },
        submitNewTitle() {
            this.title = this.tempTitle;
            this.offEditing();  
        },
        submitNew() {
            let temp = this.tempDrum;     
            let hasPreBeat = this.containsKey(temp, 'preBeat');
            let notEmpty = temp.title || temp.note || temp.baz.length > 0 || temp.beat.length > 0 || hasPreBeat;

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
        submitNewDum() {
            this.offEditing();
            this.removeSelectedOuter();
            this.dumdumList.push(this.tempDum);
            this.resetTempDum();
            this.checkNoData ();
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
        submitPatchDum() {
            // 未檢查空資料
            this.offEditing();
            this.removeSelectedDumOuter();
            let order = this.selectedOrder;
            let length = this.dumdumList.length;
            let isFinalItem = order === length-1 ? true : false;
            this.dumdumList.splice(order, 1 , this.tempDum);
            this.resetTempDum();
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
        toggleDumOperator(drum) {
            console.log('toggle');
            let length = this.dumdumList.length;
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
        clickDumBeat(drum) {
            let length = this.dumdumList.length;
            if (this.selectedOrder > length-1 ) {
                // 資料已被刪除
                this.selectedOrder ="";
            } else {
                if ( !this.isEditing && length > 0 ) {
                    if ( this.selectedOrder === "") {
                        this.openOperator(drum);                         
                    } else if( drum !== this.selectedOrder) {
                        this.closeDumOperator();
                        this.openOperator(drum);
                    } else {
                        this.justDeletedOrder = false;
                        this.toggleDumOperator(drum);
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
        removeSelectedDumOuter() {
            let length = this.dumdumList.length;
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
            if (this.selectedOrder > length-1 ) {
                // 資料已被刪除
                this.selectedOrder ="";
            } else {
                if ( length > 0 ) {
                    if ( this.selectedOrder !== "") {
                        let lastOperator = this.$refs['drumBeat'+this.selectedOrder];
                        lastOperator[0].classList.remove("active");
                        let outer = lastOperator[0].parentElement ;
                        outer.classList.remove("red-border");
                        this.isOperatorOpened = false; 
                    }
                }
            }  
        },
        closeDumOperator() {
            let length = this.dumdumList.length;
            if (this.selectedOrder !== "" && this.selectedOrder > length-1 ) {
                // 資料已被刪除
                this.selectedOrder ="";
            } else {
                if ( length > 0 ) {
                    if ( this.selectedOrder !== "") {
                        let lastOperator = this.$refs['drumBeat'+this.selectedOrder];
                        lastOperator[0].classList.remove("active");
                        let outer = lastOperator[0].parentElement ;
                        outer.classList.remove("red-border");
                        this.isOperatorOpened = false;    
                    }
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
        deleteDumBeats(drum) {     
            let operator = this.$refs['drumBeat'+drum];
            let item = this.dumdumList[drum];
            var r = confirm("確定刪除這段嗎？");
            if (r == true) {
                this.dumdumList.splice(drum, 1 ); 
                this.isOperatorOpened = false; 
                this.justDeletedOrder = true;
                // this.drumList.length < 1 ? this.noData = true : this.noData = false;
                this.checkNoData ();
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
                this.isFourBeats ? this.fullBeats = 16 : this.fullBeats = 12 ;
                this.checkNoData();
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
    created() {
        this.checkDevice();
        this.isLoading = true;
    },
    mounted() {
        this.isLoading = false;
    }
})