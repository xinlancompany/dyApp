function plusReady() {
    var wb = plus.webview.currentWebview();

    var upload = new Vue({
        el: "#jhActivityUpload",
        data: {
            // ------
            idNo:  "", // 身份证
            isEdit: 0, // 是否处于编辑状态
            canEdit: 0, 
            // ------
            jhOrgNo: "",
            evaluation: "",
            grade: 0,
            img: "",
            imgStyle: {
                backgroundImage: ""
            },
            isNewEvaluate: false,
        },
        computed: {
            gradeName: function() {
                if (!this.grade) {
                    return "请选择等级"
                } else {
                    return bhGrades[this.grade-1];
                }
            }
        },
        methods: {
            chooseGrade: function() {
                if (!this.canEdit) return;
                plus.nativeUI.actionSheet({
                    title: "考评等级",
                    cancel: "取消",
                    buttons: _map(t => {
                        return {
                            title: t
                        }
                    }, bhGrades)
                }, (e) => {
                    if (0 === e.index) return;
                    let sName = bhGrades[e.index-1];
                    this.grade = bhGrades.indexOf(sName)+1;
                });
            },
            uploadImg: function(evt) {
				var self = this;
				plus.nativeUI.showWaiting('上传中...')
				uploadImage("articleRulesAdd", evt, function(r) {
					plus.nativeUI.closeWaiting();
					self.img = serverAddr+'/upload/pic/articleRulesAdd/'+r.thumb;
                    self.imgStyle.backgroundImage = "url("+self.img+")";
				});
            },
            newEvaluation: function() {
                if (this.ifSubmit) return;
                this.ifSubmit = true;

                let evaluation = _trim(this.evaluation);
                if (!evaluation) return mui.toast("请填写评语");
                if (!this.grade) return mui.toast("请选择等级");
                
                _jhAjax({
                    cmd: (this.isNewEvaluate?"insert":"update")+"ClassificationByIDNo",
                    type: 1,
                    year: _now().split("-")[0],
                    grade: this.grade,
                    evaluation: evaluation,
                    coverImg: "",
                    idNo: this.idNo,
                }, d => {
                    if (d.success) {
                        mui.toast("评定完成");
                        mui.fire(plus.webview.getWebviewById("memberManage"), "updateUsers");
                        setTimeout(() => {
                            mui.back();
                        }, 500);
                    } else {
                        mui.toast(d.errmsg);
                    }
                });
            },
            changeTxt: function(i) {
            },
            init: function(info) {
            },
        },
        created: function() {
            let wb = plus.webview.currentWebview();
            this.idNo = wb.idNo;
            if ("canEdit" in wb) this.canEdit = wb.canEdit;
            _jhAjax({
                cmd: "fetch",
                sql: "select evaluation, grade from classification where userIdNo = ? and type = 1",
                vals: _dump([this.idNo,])
            }, d => {
                if (d.success && d.data && d.data.length) {
                    this.grade = d.data[0].grade;
                    this.evaluation = d.data[0].evaluation;
                    this.isEdit = 1;
                    this.isNewEvaluate = false;
                } else {
                    this.isNewEvaluate = true;
                }
            }, "/db4web");
        }
    });
};

if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

