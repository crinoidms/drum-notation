var app = new Vue({
    el: '#app',
    data: {
        title: "Djembe 鼓譜",
        isFourBeats: true,
        tempTitle: "",
        noData: true, 
        titleEditing: false,
        titleShowing: true,
        djembeEditClosed: true,
        dumdumEditClosed: true,
        // noteEditing: false,
        noteEditClosed: true,
        isNavClose: true,
        isEditing: false,
        isSaving: false,
        isOperatorOpened:false,
        isNew: false,
        isOutputing: false,
        selectedOrder: "",
        justDeletedOrder: false,
        addPre: false,
        addRepeat: false,
        fullBeats: 16,
        tempBeat: "",
        tempBaz: "",
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
                'type': "djembe",
                'title': "Djembe 1",
                'beat': ['⸆T','-','S','S','❲SS❳','-','TT','T','T','-','S'],
                // 'beat': ['⸆T','-','S','S','❲SS❳','-','TT','T','T','-','S','S','B','-','S','T'],
                'preBeat': 'T',
                'repeat': 3,
            },
        ],
        drumList: [
            // {
            //     'type': "djembe",
            //     'title': "Djembe 1",
            //     'beat': ['⸆T','-','S','S','❲SS❳','-','TT','T','T','-','S','S','B','-','S','T'],
            //     'preBeat': 'T',
            //     'repeat': 3,
            // },
        ],
    },
    methods: {
        // changeFullBeats() {
        //     this.isFourBeats = !this.isFourBeats;
        //     if ( this.isFourBeats ) {
        //         this.fullBeats = 16;
        //     } else {
        //         this.fullBeats = 12;
        //     }
        //     this.closeNav();
        // },
         makeVueBuzy() {
            this.tempDrum.beat.push(0);
            this.showBeat();
            this.tempDrum.beat.pop();
            this.showBeat();
        },
        checkRepeat(){
            if ( this.addRepeat ) {
                this.tempDrum.repeat = 2;
            } else {
                delete this.tempDrum.repeat;
            }
        },
        checkPre(){
            if ( this.addPre ) {
                this.tempDrum.preBeat = '-';
            } else {
                delete this.tempDrum.preBeat;
            }
        },
        openNav(){
            this.isNavClose = false;
            this.isEditing = true;
            this.closeOperator(); 
        },
        closeNav(){
            this.isNavClose = true;
            this.isEditing = false;
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
            //  要把title 加進去
            let data = JSON.stringify(this.drumList);
            this.export(this.title, data);
        },
        read() {
            //  要建立儲存的地方，然後confirm 後再存入drumList
            var fileToLoad = document.getElementById("fileToLoad").files[0];
            var fileReader = new FileReader();
            fileReader.onload = function(fileLoadedEvent) {
                var textFromFileLoaded = fileLoadedEvent.target.result;
                this.loadData = JSON.parse(textFromFileLoaded);
            };
            fileReader.readAsText(fileToLoad, "UTF-8");
        },
        saving(){
            this.isSaving = true;
        },
        offOutput(){
            this.isOutputing = false;
            this.isEditing = false;
        },
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
        // print(){
        //     html2canvas(document.body).then(function(canvas) {
        //         document.body.appendChild(canvas);
        //     });
        // },
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
        offEditing() {
            this.titleEditing = false;
            this.djembeEditClosed = true;
            this.dumdumEditClosed = true;
            this.noteEditClosed = true;
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
            delete this.tempDrum.preBeat;
            this.addRepeat = false;
            delete this.tempDrum.addRepeat;
            //  以下是為了讓畫面render而瞎忙
            // this.tempDrum.beat.push(0);
            // this.showBeat();
            // this.tempDrum.beat.pop();
            // this.showBeat();
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
        addBeats(drum) {
            var length = this.drumList.length;
            this.tempDrum.type = drum;  
            this.isEditing = true;
            this.isNavClose = true;
            this.closeOperator();
            this.isNew = true;
            if( drum ==="note" ) {      
                this.noteEditClosed = false;
                this.scrollToBottom ();
            } else if ( drum === "djembe" ) {
                // this.showBeat();
                this.djembeEditClosed = false;
                this.scrollToBottom ();
            } else if ( drum === 'dum-dum') {
                // this.showBeat();
                this.dumdumEditClosed = false;
                this.scrollToBottom ();
            }
        },
        editBeats(drum) {
            if ( !this.isEditing) {
                var length = this.drumList.length;
                this.isEditing = true;
                this.isNavClose = true;
                this.closeOperator();
                this.showSelectedOuter();
                this.tempDrum = JSON.parse(JSON.stringify(this.drumList[drum]));
                var type = this.tempDrum.type;
                if( this.tempDrum.type ==="note" ) {
                    this.noteEditClosed = false;
                    this.scrollToBottom ();
                } else if ( this.tempDrum.type === "djembe" ) {
                    // this.showBeat();
                    this.djembeEditClosed = false;
                    this.scrollToBottom ();
                } else if ( this.tempDrum.type === 'dum-dum') {
                    // this.showBeat();
                    this.dumdumEditClosed = false;
                    this.scrollToBottom ();
                }   
            }
        },
    // ------input 輸入與刪除功能按鈕------------------------- 

        quickInsert(word) {
            this.tempDrum.title = word;
            //  以下是為了讓畫面render而瞎忙
            this.tempDrum.beat.push(0);
            this.showBeat();
            this.tempDrum.beat.pop();
            this.showBeat();
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
                if ( this.tempDrum.preBeat === '-' ) {
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
            if( length < this.fullBeats ) {
                this.tempDrum.baz.push(s);
                // s ==='-' ? this.tempDrum.baz.push(0) : this.tempDrum.baz.push(s)
            }
            this.showBeat();
        },
        clearBeat() {
            this.tempDrum.beat = [];
            this.tempDrum.baz = [];
            if ( this.addPre ) {
                this.tempDrum.preBeat = '-';
            };
        },
        clearBaz() {
            this.tempDrum.baz = [];
        },
        backWardBeat() {
            var length = this.tempDrum.beat.length;
            console.log(length);
            if ( this.addPre && length <1 ) {
                this.tempDrum.preBeat = '-';
            }
            this.tempDrum.beat.pop();
        },
        backWardBaz() {
            this.tempDrum.baz.pop();
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
                this.noData = false;
                this.scrollToBottom ();
            }
        },
        submitPatch() {
            this.offEditing();
            this.removeSelectedOuter();
            let order = this.selectedOrder;
            this.drumList.splice(order, 1 , this.tempDrum);
            this.resetTempDrum();
        },


    // ------小節focus與刪除------------------------- 

        toggleOperator(drum) {
            let length = this.drumList.length;
            if ( length > 0 ) {
                let lastOperator = this.$refs['drumBeat'+this.selectedOrder];
                lastOperator[0].classList.toggle("active");

                let outer = lastOperator[0].parentElement ;
                outer.classList.toggle("red-border");
                this.isOperatorOpened = !this.isOperatorOpened ;
            };
        },
        clickBeat(drum) {
            if ( !this.isEditing ) {
                if ( this.selectedOrder === "" ) {
                    this.openOperator(drum);                         
                } else if( drum !== this.selectedOrder) {
                    this.closeOperator();
                    this.openOperator(drum);
                } else {
                    this.justDeletedOrder = false;
                    this.toggleOperator(drum);
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
                if ( this.selectedOrder !== "" ) {
                    let lastOperator = this.$refs['drumBeat'+this.selectedOrder];
                    lastOperator[0].classList.remove("active");

                    let outer = lastOperator[0].parentElement ;
                    outer.classList.remove("red-border");
                    this.isOperatorOpened = false; 
                }
            }
        },
        deleteBeats(drum) {         
            let operator = this.$refs['drumBeat'+drum];                 
            var r = confirm("確定刪除這段嗎？");
            if (r == true) {
                this.drumList.splice(drum, 1 ); 
                this.isOperatorOpened = false; 
                this.justDeletedOrder = true;
                this.drumList.length < 1 ? this.noData = true : this.noData = false;
            }
        },

        scrollToBottom () {
            $(document).scrollTop($(document).height());
        },
    },
})