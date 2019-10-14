function plusReady() {
    var wb = plus.webview.currentWebview();

    var upload = new Vue({
        el: "#jhActivityUpload",
        data: {
            // ------
            jhActID: -1, // 编辑状态下的活动ID
            isEdit: 0, // 是否处于编辑状态
            // ------
            jhOrgNo: "",
            title: "",
            organizer: "",
            recorder: "",
            address: "",
            starttime: "",
            endtime: "",
            content: "",
            img: "",
            imgStyle: {
                backgroundImage: ""
            },
            participants: [],
            ifSubmit: false,
            records: [
                {
                    img: "",
                    txt: "会场全景图",
                    style: {
                        backgroundImage: ""
                    }
                },
                {
                    img: "",
                    txt: "说明",
                    style: {
                        backgroundImage: ""
                    }
                },
                {
                    img: "",
                    txt: "说明",
                    style: {
                        backgroundImage: ""
                    }
                },
                {
                    img: "",
                    txt: "说明",
                    style: {
                        backgroundImage: ""
                    }
                },
                {
                    img: "",
                    txt: "说明",
                    style: {
                        backgroundImage: ""
                    }
                },
                {
                    img: "",
                    txt: "说明",
                    style: {
                        backgroundImage: ""
                    }
                },
            ]
        },
        watch: {
        },
        computed: {
            participantNames: function() {
                // 显示参加人员
                return _map(i => {
                    return i.name
                }, _filter(i => {
                    return i.ifSelect;
                }, this.participants)).join(",");
            }
        },
        methods: {
            uploadImg: function(evt) {
				var self = this;
				plus.nativeUI.showWaiting('上传中...')
				uploadImage("articleRulesAdd", evt, function(r) {
					plus.nativeUI.closeWaiting();
					self.img = serverAddr+'/upload/pic/articleRulesAdd/'+r.thumb;
                    self.imgStyle.backgroundImage = "url("+self.img+")";
				});
            },
            uploadRecord: function(i, evt) {
				var self = this;
				plus.nativeUI.showWaiting('上传中...')
				uploadImage("articleRulesAdd", evt, function(r) {
					plus.nativeUI.closeWaiting();
					i.img = serverAddr+'/upload/pic/articleRulesAdd/'+r.thumb;
                    i.style.backgroundImage = "url("+i.img+")";
				});
            },
            chooseStarttime: function(e) {
                e.preventDefault();
                var self = this;
                plus.nativeUI.pickDate(function(d) {
                    plus.nativeUI.pickTime(function(e) {
                        self.starttime = _datetime(d.date).split(" ")[0]+" "+_datetime(e.date).split(" ")[1];
                    }, function(e) {
                        // 不做什么
                    });
                }, function() {}, {
//              		"minDate": _nDaysBefore(20)
                });
            },
            chooseEndtime: function(e) {
                e.preventDefault();
                var self = this;
                plus.nativeUI.pickDate(function(d) {
                    plus.nativeUI.pickTime(function(e) {
                        self.endtime = _datetime(d.date).split(" ")[0]+" "+_datetime(e.date).split(" ")[1];
                        // alert(self.endtime);
                    }, function(e) {
                        // 不做什么
                    });
                }, function() {}, {
//              		"minDate": _oneMonthAgoDateObj()
					// 提交只能是当前时间的前20天内的活动
//              		"minDate": _nDaysBefore(20)
                });
            },
            chooseParticipants: function() {
                openWindow("jhSelectUsers.html", "jhSelectUsers", {
                    participants: this.participants,
                    jhOrgNo: this.jhOrgNo
                });
            },
            newActivity: function() {
                if (this.ifSubmit) return;

                // 编辑
                if (this.isEdit) return this.editActivity();

                var title = _trim(this.title),
                    organizer = _trim(this.organizer),
                    address = _trim(this.address),
                    starttime = _trim(this.starttime),
                    endtime = _trim(this.endtime),
                    content = _trim(this.content),
                    recorder = _trim(this.recorder);

                if (!title) return mui.toast("请填写标题");
				if (!organizer) return mui.toast("请选择组织者");
                if (!recorder) return mui.toast("请选择记录者");
                if (!address) return mui.toast("请填写地点");
                if (!starttime) return mui.toast("请填写开始时间");
                if (!endtime) return mui.toast("请填写结束时间");
                if (!content) return mui.toast("请填写内容");
                if (!this.participants.length) return mui.toast("请选择参会人员");

                if (!this.records[0].img) return mui.toast("请上传会场全景图");
                
                this.ifSubmit = true;
                // 新建
                _jhAjax({
                    cmd: "insertJHActInfo",
                    title: title,
                    img: this.img,
                    content: content,
                    organizer: organizer,
                    recorder: recorder,
                    starttime: starttime,
                    endtime: endtime,
                    address: address,
                    jhOrgNo: this.jhOrgNo,
                    jhActEnrollIds: _map(i => {
                        return i.idNo;
                    }, _filter(i => {
                        return i.ifSelect
                    }, this.participants)).join(",")
                }, d => {
                    if (d.success && d.data) {
                        _jhAjax({
                            cmd: "updateJHActImgsByActId",
                            jhActID: d.data,
                            jhActTxt: this.records[0].txt,
                            jhActImg: this.records[0].img,
                            OtherImgs: _dump(this.records.slice(1,6)),
                            logtime: _now
                        }, d2 => {
                            if (d2.success && d2.data) {
                               mui.toast("新建成功");
                               mui.fire(plus.webview.getWebviewById("jhActivityList"), "getActivities");
                               setTimeout(() => {
                                   mui.back();
                               }, 500);
                            } else {
                                mui.toast(d2.errmsg);
                            }
                        });
                    } else {
                        mui.toast(d.errmsg);
                    }
                });
            },
            changeTxt: function(i) {
                var self = this;
                mui.prompt("请输入图片简述", i.txt, "提示", ["取消", "确定"], function(e) {
                    if (e.index == 1) {
                        var intro = _trim(e.value);
                        if (!intro) {
                            mui.toast("请填写内容");
                            return false;
                        }
                        i.txt = intro;
                    }
                });
            },
            init: function(info) {
               if (info.participants) {
                   info.participants.forEach(i => {
                       i.idNo = i.userIdNo;
                       i.ifSelect = 1;
                   });
                   this.participants = info.participants;
               }
               if (info.records) {
                   info.records.forEach(i => {
                       i.style = {
                           backgroundImage: i.img ? "url("+i.img+")" : ""
                       };
                   });
                   this.records = info.records;
               }
               Object.keys(info.detail).forEach(k => {
                   this[k] = info.detail[k];
               });
               if (this.img) {
                   this.imgStyle.backgroundImage = "url("+this.img+")";
               }
               this.jhActID = info.detail.id;
            },
            editActivity: function() {
                var title = _trim(this.title),
                    organizer = _trim(this.organizer),
                    address = _trim(this.address),
                    starttime = _trim(this.starttime),
                    endtime = _trim(this.endtime),
                    content = _trim(this.content),
                    recorder = _trim(this.recorder);

                if (!title) return mui.toast("请填写标题");
				if (!organizer) return mui.toast("请选择组织者");
                if (!recorder) return mui.toast("请选择记录者");
                if (!address) return mui.toast("请填写地点");
                if (!starttime) return mui.toast("请填写开始时间");
                if (!endtime) return mui.toast("请填写结束时间");
                if (!content) return mui.toast("请填写内容");

                if (!this.records[0].img) return mui.toast("请上传会场全景图");
                this.ifSubmit = true;

                _jhAjax({
                    cmd: "updateJHActInfo",
                    jhActID: this.jhActID,
                    title: title,
                    img: this.img,
                    content: content,
                    organizer: organizer,
                    recorder: recorder,
                    starttime: starttime,
                    endtime: endtime,
                    address: address,
                    jhOrgNo: this.jhOrgNo,
                    jhActEnrollIds: _map(i => {
                        return i.idNo;
                    }, _filter(i => {
                        return i.ifSelect
                    }, this.participants)).join(",")
                }, d => {
                    if (!d.success) {
                        mui.toast(errmsg);
                    } else {
                        _jhAjax({
                            cmd: "updateJHActImgsByActId",
                            jhActID: this.jhActID,
                            jhActTxt: this.records[0].txt,
                            jhActImg: this.records[0].img,
                            OtherImgs: _dump(this.records.slice(1,6)),
                            logtime: _now
                        }, d2 => {
                            if (d2.success && d2.data) {
                               mui.toast("更新成功");
                               mui.fire(plus.webview.getWebviewById("jhActivityList"), "getActivities");
                               mui.fire(plus.webview.getWebviewById("jhActivityDetail"), "updateInfo");
                               setTimeout(() => {
                                   mui.back();
                               }, 500);
                            } else {
                                mui.toast(d2.errmsg);
                            }
                        });
                    }
                });
            }
        },
        created: function() {
            let wb = plus.webview.currentWebview();
            this.jhOrgNo = wb.jhOrgNo;
            if (wb.info) {
                this.init(wb.info);
                this.isEdit = 1;
                $(".mui-title").text("更新活动");
            }
        }
    });

    // 返回选择学员
    window.addEventListener("selectParticipants", function(event) {
        _tell(event.detail.participants);
		upload.participants = event.detail.participants;
    });
};

if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

