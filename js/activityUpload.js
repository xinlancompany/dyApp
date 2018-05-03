function plusReady() {
    var upload = new Vue({
        el: "#activityUpload",
        data: {
            aid: null, // 编辑模式
            lid: 0,
            title: "",
            organizer: "",
            recorder: "",
            superAttenders:"",
            location: "",
            starttime: "",
            endtime: "",
            content: "",
            unattendReason: "",
            img: "",
            imgStyle: {
                backgroundImage: ""
            },
            users: [],
            tag: null,
            selectUserNames: '请选择与会人员',
            selectTagName: '请选择积分量化标签',
            starttime: '请选择开始时间',
            endtime: '请选择结束时间'
        },
        watch: {
            aid: function(i) {
                if (!i) {
                    // 设置头部等信息
                    return;
                }
                var self = this;
                _callAjax({
                    cmd: "multiFetch",
                    multi: _dump([
                        {
                            key: "info",
                            sql: "select title,img,content,organizer,recorder,superAttenders,unattendReason,address,strftime('%Y-%m-%d %H:%M:%S', starttime) as starttime,strftime('%Y-%m-%d %H:%M:%S', endtime) as endtime, tags from activitys where id = "+self.aid
                        },
                        {
                            key: "enroll",
                            sql: "select u.id, u.name from activityEnroll a, user u where a.activityId = "+self.aid+" and a.userId = u.id"
                        }
                    ])
                }, function(d) {
                    if (!d.success || !d.data) return;
                    if ("info" in d.data) {
                        var inf = d.data["info"][0];
                        self.title = inf.title;
                        self.organizer = inf.organizer;
                        self.location = inf.address;
                        self.starttime = inf.starttime;
                        self.endtime = inf.endtime;
                        self.content = inf.content;
                        self.img = inf.img;
                        self.imgStyle.backgroundImage = "url("+inf.img+")";
                        self.tag = _load(inf.tags);
                        self.recorder = inf.recorder;
                        self.superAttenders = inf.superAttenders;
                        self.unattendReason = inf.unattendReason;
                    }
                    if ("enroll" in d.data && d.data["enroll"].length) {
                        d.data["enroll"].forEach(function(i) {
                            i.ifSelect = true;
                            self.users.push(i);
                        });
                    }
                });
            }
        },
        computed: {
            selectUserNames: function() {
                var self = this;
                return _map(function(i) {
                    return i.name;
                }, _filter(function(i) {
                    return i.ifSelect;
                }, self.users)).join(", ");
            },
            selectTagName: function() {
            	if (this.tag) return this.tag.name;
            	return "";
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
                    users: self.users,
                    aid: self.aid
                });
            },
            chooseTopics: function() {
                var self = this;
                openWindow("selectTags.html", "selectTags", {
                    tags: self.tags
                });
            },
            newActivity: function() {
                var title = _trim(this.title),
                    organizer = _trim(this.organizer),
                    location = _trim(this.location),
                    starttime = _trim(this.starttime),
                    endtime = _trim(this.endtime),
                    content = _trim(this.content),
                    recorder = _trim(this.recorder),
                    superAttenders = _trim(this.superAttenders),
                    unattendReason = _trim(this.unattendReason);

                if (!title) return mui.toast("请填写标题");
                if (!organizer) return mui.toast("请填写组织者");
                if (!location) return mui.toast("请填写地点");
                if (!starttime) return mui.toast("请填写开始时间");
                if (!endtime) return mui.toast("请填写结束时间");
                if (!content) return mui.toast("请填写内容");
                if (!this.img) return mui.toast("请上传头图");
                
                var self = this,
                    sql = "insert into activitys(title, content, img, organizer, address, starttime, endtime, linkerId, tags, orgId,recorder,superAttenders,unattendReason) values(?,?,?,?,?,?,?,?,?,?,?,?,?)",
                    vals = _dump([title, content, self.img, organizer, location, starttime, endtime, self.lid, _dump(self.tag), _load(_get("userInfo")).id,recorder,superAttenders,unattendReason])

                if (!!self.aid) {
                    sql = "update activitys set title=?,content=?,img=?,organizer=?,address=?,starttime=?,endtime=?,tags=?,recorder=?,superAttenders=?,unattendReason=? where id = ?";
                    vals = _dump([title,content,self.img,organizer,location,starttime,endtime,_dump(self.tag),recorder,superAttenders,unattendReason,self.aid]);
                }
                
                _callAjax({
                    cmd: "exec",
                    sql: sql,
                    vals: vals
                }, function(d) {
                    // 返回并刷
                    var aid = d.data;
                    if (!!self.aid) aid = self.aid;
                    if (d.success) {
                        // 更新参加人员表activityEnroll
                        if (self.users.length) {
                        	var credits = 3;
                        	if ("credits" in self.tag && self.tag.credits) credits = self.tag.credits;
                            _callAjax({
                                cmd: "multiFetch",
                                multi: _dump([{
                                            key: "del",
                                            sql: "delete from activityEnroll where activityId = "+aid
                                        }].concat(
                                            _map(function(i) {
                                                return {
                                                    key: "key"+parseInt(Math.random()*10e6),
                                                    sql: "insert into activityEnroll(userId, activityId, preScore) values("+i.id+", "+aid+", "+credits+")"
                                                }
                                            }, _filter(function(i) {
                                                return i.ifSelect;
                                            }, self.users))
                                        ).concat(
												_map(function(i) {
													return {
														key: "key"+parseInt(Math.random()*10e6),
														sql: "insert into notices(userId, msg, tp) values("+i.id+", '参加"+title+"', 'info')"
													}
												}, _filter(function(i) {
													return i.ifSelect;
												}, self.users))
                                        ))
                            }, function(_d) {
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

    // 返回标签
    window.addEventListener("selectTags", function(event) {
        upload.tag = event.detail.tag;
    });

    var wb = plus.webview.currentWebview();
    upload.lid = wb.lid;
    if ("title" in wb) {
        $(".mui-title").text(wb.title);
    }
    // 编辑模式
    if ("aid" in wb) {
        upload.aid = wb.aid;
    }
    // $("#ruleDate").val(_now().split(" ")[0]);
};

if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

