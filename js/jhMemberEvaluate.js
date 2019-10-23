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
            evaluationId: -1,
            evaluationStatus: -1,
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
                    return jhGrades[this.grade-1];
                }
            },
            evaluationStatusText: function() {
                if (this.evaluationStatus == -1) {
                    return "未考评";
                } else if (this.evaluationStatus == 0) {
                    return "考评未确认";
                } else if (this.evaluationStatus == 1) {
                    return "考评待接收";
                } else if (this.evaluationStatus == 2) {
                    return "考评已接收";
                }
            }
        },
        methods: {
            chooseGrade: function() {
                plus.nativeUI.actionSheet({
                    title: "考评等级",
                    cancel: "取消",
                    buttons: _map(t => {
                        return {
                            title: t
                        }
                    }, jhGrades)
                }, (e) => {
                    if (0 === e.index) return;
                    let sName = jhGrades[e.index-1];
                    this.grade = jhGrades.indexOf(sName)+1;
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
            pushEvaluation: function() {
                alert("update classification set status = 1 where id = "+this.evaluationId);
                _jhAjax({
                    cmd: "exec",
                    sql: "update classification set status = 1 where id = "+this.evaluationId,
                }, d => {
                    if (d.success) {
                        mui.toast("推送成功");
                        mui.back();
                    } else {
                        mui.toast("推送失败");
                    }
                }, "/db4web");
            },
            newEvaluation: function() {
                if (this.ifSubmit) return;
                this.ifSubmit = true;

                let evaluation = _trim(this.evaluation);
                if (!evaluation) return mui.toast("请填写评语");
                if (!this.grade) return mui.toast("请选择等级");
                
                _jhAjax({
                    cmd: (this.isNewEvaluate?"insert":"update")+"ClassificationByIDNo",
                    type: 2,
                    year: _now().split("-")[0],
                    grade: this.grade,
                    evaluation: evaluation,
                    coverImg: "",
                    idNo: this.idNo,
                }, d => {
                    if (d.success) {
                        mui.toast("评定完成");
                        mui.back();
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
            if ("canEdit" in wb) {
                this.canEdit = wb.canEdit;
            }
            _jhAjax({
                cmd: "fetch",
                sql: "select id, evaluation, status, grade from classification where userIdNo = ? and type = 2",
                vals: _dump([this.idNo,])
            }, d => {
                if (d.success && d.data && d.data.length) {
                    this.evaluationId = d.data[0].id;
                    this.evaluationStatus = parseInt(d.data[0].status);
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

