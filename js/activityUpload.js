function plusReady() {
    var wb = plus.webview.currentWebview();
    var ifEditFinished = false;
    _set("participants", "");

//	mui.init({
//		beforeback: function() {
//			if (!ifEditFinished) {
//				upload.ifSubmit = false;
//				_set("activityUploadData_"+wb.lid, JSON.stringify(upload.$data));
//			} else {
//				_set("activityUploadData_"+wb.lid, "");
//			}
//		},
//	});

    var upload = new Vue({
        el: "#activityUpload",
        data: {
            aid: null, // 编辑模式
            lid: 0,
            title: "",
            organizer: null,
            recorder: null,
            MC: null,
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
            participants: [],
            tag: null,
//          selectUserNames: '请选择与会人员',
//          selectTagName: '请选择积分量化标签',
            starttime: '请选择开始时间',
            endtime: '请选择结束时间',
            userInfo: _load(_get("userInfo")),
            categories: [],
            originCategories: [],
            absents: [],
            invalids: [],
            ifSubmit: false,
            // 是否当前组织为支部，用于支部以上上传活动用
            isBranch: true,
        },
        watch: {
            aid: function(i) {
                if (!i) {
                    // 设置头部等信息
                    return;
                }
                $(".mui-title").text("更新活动");
                var self = this;
                _callAjax({
                    cmd: "multiFetch",
                    multi: _dump([
                        {
                            key: "info",
                            sql: "select notOnDuties, absents,title,img,content,organizer,recorder,superAttenders,unattendReason,address,strftime('%Y-%m-%d %H:%M:%S', starttime) as starttime,strftime('%Y-%m-%d %H:%M:%S', endtime) as endtime, tags from activitys where id = "+self.aid
                        },
                        {
                            key: "enroll",
                            sql: "select u.id, u.name, u.orgName from activityEnroll a, user u where a.activityId = "+self.aid+" and a.userId = u.id"
                        },
                        {
                            key: "categories",
                            sql: "select ae.id, l.name, linkerId from activityCategories ae, linkers l where activityId = "+self.aid+" and l.id = ae.linkerId"
                        }
                    ])
                }, function(d) {
                    if (!d.success || !d.data) return;
                    if ("info" in d.data) {
                        var inf = d.data["info"][0];
                        self.title = inf.title;
//                      self.MC = _load(inf.organizer);
					   self.organizer = _load(inf.organizer)["name"];
                        self.location = inf.address;
                        self.starttime = inf.starttime;
                        self.endtime = inf.endtime;
                        self.content = inf.content;
                        self.img = inf.img;
                        self.imgStyle.backgroundImage = "url("+inf.img+")";
                        self.tag = _load(inf.tags);
//                      self.recorder = _load(inf.recorder);
                        self.recorder = _load(inf.recorder)["name"];
                        self.superAttenders = inf.superAttenders;
                        self.unattendReason = inf.unattendReason;
                        if (inf.absents) self.absents = _load(inf.absents);
                        if (inf.notOnDuties) self.invalids = _load(inf.notOnDuties);
                    }
                    if ("enroll" in d.data && d.data.enroll && d.data["enroll"].length) {
                        var p = {};
                        d.data["enroll"].forEach(function(i) {
                            i.ifSelect = true;
                            self.participants.push(i);
                            if (!self.isBranch) {
                                if (i.orgName in p) {
                                    p[i.orgName].push(i);
                                } else {
                                    p[i.orgName] = [i,];
                                }
                            }
                        });
                        _set("participants", _dump(p));
                    }
                    if ("categories" in d.data && d.data["categories"].length) {
						self.categories = d.data["categories"];
						self.originCategories = self.categories;
                    }
                });
            },
            participants: function(l) {
            		var self = this,
            			absents = [],
            			invalids = [];
            		self.absents.forEach(function(i) {
            			if (self.participantIds.indexOf(i.id) >= 0) absents.push(i);
            		});
            		self.absents = absents;
            }
        },
        computed: {
        		participantIds: function() {
        			return _map(function(i) {
					return i.id;
        			}, this.participants);
        		},
            selectParticipantNames: function() {
            		if (!this.participants.length) return "请选择应到人员";
                var self = this;
                return _map(function(i) {
                    return i.name;
                }, self.participants).join(", ");
            },
            realParticipants: function() {
            		var self = this;
				var credits = 3;
				if ("credits" in self.tag && self.tag.credits) credits = self.tag.credits;
            		ret = _map(function(j) {
            			for(var i=0; i<self.absents.length; i++) {
            				if (parseInt(self.absents[i].id) == parseInt(j.id)) {
            					j.credits = 0;
            					return j;
            				}
            			}
            			j.credits = credits;
            			return j;
            		}, self.participants.concat(self.invalids)); // 因公需要给平均分
            		return ret;
            },
            selectTagName: function() {
            		if (!this.tag) return "请选择积分量化标签";
            		return this.tag.name;
            },
            selectCategoryName: function() {
            		if (!this.categories.length) return "请选择活动分类";
            		return _map(function(i) {
            			return i.name
            		}, this.categories).join(",");
            },
            absentNames: function() {
            		if (!this.absents.length) return "请选择缺席人员";
            		var ret = {};
            		this.absents.forEach(function(i) {
            			if (i.reason in ret) {
            				ret[i.reason].push(i.name);
            			} else {
            				ret[i.reason] = [i.name];
            			}
            		});
            		var retStr = "";
            		Object.keys(ret).forEach(function(k) {
            			retStr += k+":"+ret[k].join(",")+"\n";
            		});
            		return retStr;
            },
            selectRecorder: function(i) {
            		if (!this.recorder) return "记录人";
            		return this.recorder.name;
            },
            selectMC: function(i) {
            		if (!this.MC) return "主持人";
            		return this.MC.name;
            },
            invalidNames: function() {
            		if (!this.invalids.length) return "请选择因公不记录人员";
                var self = this;
                return _map(function(i) {
                    return i.name;
                }, self.invalids).join(",");
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
            chooseMC: function() {
                var self = this;
                openWindow("selectMC.html", "selectMC", {
                    MC: self.MC,
                });
            },
            chooseRecorder:function() {
                var self = this;
                openWindow("selectRecorder.html", "selectRecorder", {
                    recorder: self.recorder,
                });
            },
            // 最早选择一个月前
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
                }, function() {}, {
//              		"minDate": _oneMonthAgoDateObj()
					// 提交只能是当前时间的前20天内的活动
                		"minDate": _nDaysBefore(20)
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
                		"minDate": _nDaysBefore(20)
                });
            },
            chooseParticipants: function() {
                if (this.isBranch) {
                    // 是支部的时候直接选人
                    var self = this;
                    openWindow("selectUsers.html", "selectUsers", {
                            notIn: self.invalids,
                        participants: self.participants,
                        aid: self.aid
                    });
                } else {
                    // 非支部需要先选择下级组织
                    this.chooseBranchParticipants();
                }
            },
            chooseBranchParticipants: function() {
                // 非支部活动选人
                openWindow("selectBranchUsers.html", "selectBranchUsers");
            },
            chooseAbsents: function() {
                var self = this;
                if (!self.participants || !self.participants.length) return mui.toast("请先选择与会人员");
//              var users = _filter(function(i) {
//					return i.ifSelect;
//				}, self.participants);
                openWindow("absents.html", "absents", {
                		users: self.participants,
                    absents: self.absents,
                });
            },
            chooseInvalid: function() {
                var self = this;
                openWindow("selectInvalids.html", "selectInvalids", {
//              		notIn: _filter(function(i) {
//              			return i.ifSelect;
//              		}, self.users),
					notIn: self.participants,
                    invalids: self.invalids,
                });
            },
            chooseTopics: function() {
                var self = this;
                openWindow("selectTags.html", "selectTags", {
                    tags: self.tags
                });
            },
            chooseCategories: function() {
            		var self = this;
				openWindow("activityCategories.html", "activityCategories", {
					lids: lids = _map(function(i) {
						return parseInt(i.linkerId);
					}, self.categories)
				});
            },
            newActivity: function() {
            		if (this.ifSubmit) return;
            		this.ifSubmit = true;
                var title = _trim(this.title),
                    organizer = _trim(this.organizer),
                    location = _trim(this.location),
                    starttime = _trim(this.starttime),
                    endtime = _trim(this.endtime),
                    content = _trim(this.content),
                    recorder = _trim(this.recorder),
                    superAttenders = _trim(this.superAttenders);
//                  unattendReason = _trim(this.unattendReason);

                if (!title) return mui.toast("请填写标题");
//              if (!this.MC) return mui.toast("请选择组织者");
				// 手动输入组织者
				if (!organizer) return mui.toast("请选择组织者");
				// 手动输入记录者
                if (!recorder) return mui.toast("请选择记录者");
                if (!location) return mui.toast("请填写地点");
                if (!starttime) return mui.toast("请填写开始时间");
                if (!endtime) return mui.toast("请填写结束时间");
                if (!content) return mui.toast("请填写内容");
                if (!this.tag) return mui.toast("请选择积分量化标签");
                if (!this.participants.length) return mui.toast("请选择参会人员");
                if (!this.categories.length) return mui.toast("请选择活动分类");
//              if (!this.img) return mui.toast("请上传头图");
                
                var self = this,
                    sql = "insert into activitys(title, content, img, organizer, address, starttime, endtime, linkerId, tags, orgId,recorder,superAttenders,absents,notOnDuties) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
//                  vals = _dump([title, content, self.img, _dump(self.MC), location, starttime, endtime, self.lid, _dump(self.tag), self.userInfo.id,_dump(self.recorder),superAttenders,_dump(self.absents), _dump([self.invalids])])
                    vals = _dump([title, content, self.img, _dump({"groupId":"0","id":"0","name":organizer}), location, starttime, endtime, self.lid, _dump(self.tag), self.userInfo.id,_dump({"groupId":"0","id":"0","name":recorder}),superAttenders,_dump(self.absents), _dump([self.invalids])])

                if (!!self.aid) {
                    sql = "update activitys set title=?,content=?,img=?,organizer=?,address=?,starttime=?,endtime=?,tags=?,recorder=?,superAttenders=?,absents=?,notOnDuties=? where id = ?";
                    vals = _dump([title,content,self.img,_dump({"groupId":"0","id":"0","name":organizer}),location,starttime,endtime,_dump(self.tag),_dump({"groupId":"0","id":"0","name":recorder}),superAttenders,_dump(self.absents),_dump(self.invalids),self.aid]);
                }
                
                _callAjax({
                    cmd: "exec",
                    sql: sql,
                    vals: vals
                }, function(d) {
                    // 返回并刷
                    var aid = d.data;
                    if (!!self.aid) {
						aid = self.aid;
						_callAjax({
							cmd: "exec",
							sql: "delete from activityCategories where id in ("+(_map(function(i) {
								return i.id;
							}, self.originCategories).join(","))+")"
						});
					}
					_callAjax({
						cmd: "multiFetch",
						multi: _dump(
							_map(function(i) {
								return {
									key: "key"+parseInt(Math.random()*10e6),
									sql: "insert into activityCategories(activityId, linkerId) values("+aid+", "+i.linkerId+")"
								};
							}, self.categories)
						)
					}, function(_d) {});
                    if (d.success) {
                        // 更新参加人员表activityEnroll
                        if (self.participants.length) {
                        	var credits = 3;
                        	if ("credits" in self.tag && self.tag.credits) credits = self.tag.credits;
                            _callAjax({
                                cmd: "multiFetch",
                                multi: _dump([{
                                            key: "del",
                                            sql: "delete from activityEnroll where activityId = "+aid,
                                        }, {
                                        		key: "notice",
                                        		sql: "insert into articles(title, content, reporter, linkerId, newsdate) values('"+title+"', '"+content+"', '"+self.userInfo.no+"', "+linkerId.Notice+", '"+_now().split(' ')[0]+"')"
                                        }].concat(
                                            _map(function(i) {
                                                return {
                                                    key: "key"+parseInt(Math.random()*10e6),
//                                                  sql: "insert into activityEnroll(userId, activityId, preScore) values("+i.id+", "+aid+", "+credits+")"
                                                    sql: "insert into activityEnroll(userId, activityId, preScore) values("+i.id+", "+aid+", "+i.credits+")"
                                                }
//                                          }, self.participants)
                                            }, self.realParticipants)
                                        ))
//                                      .concat(
//												_map(function(i) {
//													return {
//														key: "key"+parseInt(Math.random()*10e6),
//														sql: "insert into notices(userId, msg, tp) values("+i.id+", '参加"+title+"', 'info')"
//													}
//												}, _filter(function(i) {
//													return i.ifSelect;
//												}, self.users))
//                                      ))
                            }, function(_d) {
                            });

                        }
                        
                        // 有aid时是更新状态
                        mui.toast((self.aid?"更新":"添加")+"成功");
                        _set("activityUploadData_"+wb.lid, "");
                        // 清空缓存
                        setTimeout(function() {
							mui.fire(plus.webview.getWebviewById("activityList"), "refresh", {
								lid: self.lid
							});
							mui.back();
                        }, 1000);
                    } else {
                        mui.toast("添加失败");
                        self.ifSubmit = false;
                    }
                });
            },
        },
        created: function() {
            // 设置是否为支部
            this.isBranch = this.userInfo.type == "党支部";

            // 编辑模式，不保存
            if ("aid" in wb) return;
			var dataStr = _get("activityUploadData_"+wb.lid);
			if (!dataStr) return;
			var self = this,
				data = JSON.parse(dataStr);
			Object.keys(data).forEach(function(k) {
				self[k] = data[k];
			});
			this.ifSubmit = false;
        }
    });

	$(".info-save").click(function() {
		_set("activityUploadData_"+wb.lid, JSON.stringify(upload.$data));
		mui.toast("暂存成功");
	});

    // 返回选择学员
    window.addEventListener("selectParticipants", function(event) {
		upload.participants = event.detail.participants;
    });

    // 返回非支部选择成员
    window.addEventListener("selectBranchUsers", function(event) {
        var participantsStr = _get("participants");
        if (!!participantsStr) {
            upload.participants = [];
            var p = _load(participantsStr);
            Object.keys(p).forEach((k) => {
                p[k].forEach((i) => {
                    if (i.ifSelect) upload.participants.push(i);
                });
            });
        }
    });

    // 返回标签
    window.addEventListener("selectTags", function(event) {
        upload.tag = event.detail.tag;
    });

    // 返回分类
    window.addEventListener("selectCategories", function(event) {
        upload.categories = event.detail.categories;
    });

	// 选择缺席人员
    window.addEventListener("selectAbsents", function(event) {
        upload.absents = event.detail.absents;
    });

	// 选择因公不记录人员
    window.addEventListener("selectInvalids", function(event) {
        upload.invalids = event.detail.invalids;
    });

	// 选择主持人
    window.addEventListener("selectMC", function(event) {
    		if (event.detail.MC.length) {
    			upload.MC = event.detail.MC[0];
    		}
    });

	// 选择记录人
    window.addEventListener("selectRecorder", function(event) {
    		if (event.detail.recorder.length) {
    			upload.recorder = event.detail.recorder[0];
    		}
    });

    upload.lid = wb.lid;
    // 编辑模式
    if ("aid" in wb) {
        upload.aid = wb.aid;
    } else {
    		if (!upload.categories.length) {
			upload.categories.push({
				linkerId: wb.lid,
				name: wb.lname.split("(")[0]
			});
    		}
    }
    // $("#ruleDate").val(_now().split(" ")[0]);
};

if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

