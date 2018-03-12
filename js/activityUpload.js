function plusReady() {
    var upload = new Vue({
        el: "#activityUpload",
        data: {
            lid: 0,
            title: "",
            organizer: "",
            location: "",
            starttime: "",
            endtime: "",
            content: "",
            img: "",
            imgStyle: {
                backgroundImage: ""
            },
            users: []
        },
        computed: {
            selectUserNames: function() {
                var self = this;
                return _map(function(i) {
                    return i.name;
                }, _filter(function(i) {
                    return i.ifSelect;
                }, self.users)).join(", ");
            }
        },
        methods: {
            uploadImg: function(evt) {
				var self = this;
				plus.nativeUI.showWaiting('上传中...')
				uploadImage("articleRulesAdd", evt, function(r) {
					plus.nativeUI.closeWaiting();
					self.img = serverAddr+'/upload/pic/articleRulesAdd/'+r.thumb;
                    _tell("img: ---> "+self.img);
                    self.imgStyle.backgroundImage = "url("+self.img+")";
				});
            },
            chooseStarttime: function(e) {
                e.preventDefault();
                var self = this;
                plus.nativeUI.pickDate(function(d) {
                    plus.nativeUI.pickTime(function(e) {
                        self.starttime = _datetime(d.date).split(" ")[0]+" "+_datetime(e.date).split(" ")[1];
                        // alert(self.starttime);
                    }, function(e) {
                        // 不做什么
                    });
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
                });
            },
            chooseUsers: function() {
                var self = this;
                openWindow("selectUsers.html", "selectUsers", {
                    users: self.users
                });
            },
            newActivity: function() {
                var title = _trim(this.title),
                    organizer = _trim(this.organizer),
                    location = _trim(this.location),
                    starttime = _trim(this.starttime),
                    endtime = _trim(this.endtime),
                    content = _trim(this.content);

                if (!title) return mui.toast("请填写标题");
                if (!organizer) return mui.toast("请填写组织者");
                if (!location) return mui.toast("请填写地点");
                if (!starttime) return mui.toast("请填写开始时间");
                if (!endtime) return mui.toast("请填写结束时间");
                if (!content) return mui.toast("请填写内容");
                if (!this.img) return mui.toast("请上传头图");
                
                var self = this;
                _callAjax({
                    cmd: "exec",
                    sql: "insert into activitys(title, content, img, organizer, starttime, endtime, linkerId) values(?,?,?,?,?,?,?)",
                    vals: _dump([title, content, self.img, organizer, starttime, endtime, self.lid])
                }, function(d) {
                    // 返回并刷
                    if (d.success) {
                        // 更新参加人员表activityEnroll
                        if (self.users.length) {
                            _callAjax({
                                cmd: "multiFetch",
                                multi: _dump([{
                                            key: "del",
                                            sql: "delete from activityEnroll where activityId = "+d.data
                                        }].concat(
                                            _map(function(i) {
                                                return {
                                                    key: "key"+parseInt(Math.random()*10e6),
                                                    sql: "insert into activityEnroll(userId, activityId) values("+i.id+", "+d.data+")"
                                                }
                                            }, _filter(function(i) {
                                                return i.ifSelect;
                                            }, self.users))
                                        ))
                            }, function(_d) {
                                alert(_dump(_d));
                            });
                        }
                        
                        mui.toast("添加成功");
                        mui.fire(plus.webview.getWebviewById("activityList"), "refresh", {
                            lid: self.lid
                        });
                        mui.back();
                    } else {
                        mui.toast("添加失败");
                    }
                });
            },
        },
        created: function() {

        }
    });

    // 返回选择学员
    window.addEventListener("selectUsers", function(event) {
        upload.users  = event.detail.users;
    });

    var wb = plus.webview.currentWebview();
    upload.lid = wb.lid;
    if ("title" in wb) {
        $(".mui-title").text(wb.title);
    }
    $("#ruleDate").val(_now().split(" ")[0]);
};

if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

