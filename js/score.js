(function() {
    var plusReady = function() {
        var vm = new Vue({
            el: "#score",
            data: {
                activityScore: 0,
                studyScore: 0,
                activeTab: 0,
                totalScore: 0,
				userInfo: _load(_get("userInfo")),
				activityList: [], //党员先锋指数数据
				liveList: [], // 直播学习列表
				courseList: [],  //学习数据
				contentList:[], //当前选中tab数据
				bHaveMore_activity: true,
				bHaveMore_course: true,
				bHaveMore_live: true,
				easyScoreList: [],
            },
            computed:{
//          	s2: function() {
//				var r = this.activityScore/20.0;
//				return r;
//         	},
            	courseLiveList: function() {
            		var l = this.courseList.concat(this.liveList);
            		l.sort(function(a, b) {
            			return a.time < b.time;
            		});
            		return l;
            	},
            	// 活动积分列表加上申请积分的列表
            	scoreList: function() {
            		var l = this.activityList.concat(this.easyScoreList);
            		l.sort(function(a, b) {
            			return a.time < b.time;
            		});
            		return l;
            	}
            },
            watch: {
                activeTab: function(i) {
                    if (i) {
                        this.totalScore = this.studyScore;
                        this.contentList = this.courseLiveList;
                    } else {
                        this.totalScore = this.activityScore;
                        // this.contentList = this.activityList;
                        this.contentList = this.scoreList;
                    }
                }
            },
            methods: {
                changeTab: function(i) {
                    this.activeTab = i;
                    if (i) {
                        this.totalScore = this.studyScore;
                    } else {
                        this.totalScore = this.activityScore;
                    }
                },
                // 获取申请加分项目
                getEasyScoreList: function() {
					var self = this;
                		_callAjax({
                			cmd: "fetch",
                			sql: "select id, content as title, 0 as isActicvity, " +
                			"strftime('%Y-%m-%d %H:%M', logtime) as time, score as points, " +
                			"0 as isActicvity from easyScore where ifValid = 2 and userId in " +
                			"(select id from user where idNo = ?) order by id desc",
                			vals: _dump([self.userInfo.idNo,])
                		}, function(d) {
                			if (d.success && d.data && d.data.length) {
                				self.easyScoreList = d.data;
                			}
                		});
                },
				//获取活动列表
				getActivityList: function(){
					var self = this;
					
					if(self.userInfo) {
						var f = 10e5;
					
						if(self.activityList.length) {
							f = _at(self.activityList, -1).id;
						}
					
					    // 现实已审核的活动
						_callAjax({
							cmd: "fetch",
							// sql: "select a.id, a.title, a.img, a.content, a.linkerId, a.organizer, strftime('%Y-%m-%d %H:%M', a.starttime)as time, a.address, a.status, a.points, count(e.id) as applicant from activitys a left join activityEnroll e on e.activityId = a.id where ifValid =1 and e.userId = ? and a.id < ? group by a.id order by a.id desc limit 10",
							sql: "select a.id, a.title, e.score, 1 as isActivity, " +
                                "strftime('%Y-%m-%d %H:%M', a.starttime) as time, " +
                                "e.score as points from activityEnroll e, activitys a " +
                                "where a.ifValid >= 4 and a.ifValid < 7 and " +
                                "e.activityId = a.id and e.userId = (select id from user where idno = ?) and " +
                                "a.id < ? order by a.logtime desc",
							vals: _dump([self.userInfo.idNo, f])
						}, function(d) {
							if(d.success && d.data) {
								d.data.forEach(function(r) {
									self.activityList.push(r);
					
								});
					
								if(self.activityList.length < 10) {
									self.bHaveMore_activity = false;
								} else {
									self.bHaveMore_activity = true;
								}

								if(self.activeTab == 0) {
									// self.contentList = self.activityList;
									self.contentList = self.scoreList;
								}
							} else {
								self.bHaveMore_activity = false;
								if(f != 10e5) {
									mui.toast("已全部加载完毕")
								}
							}
						})
					}
				},
				// 获取直播学习列表, 暂时不用了
				_getLiveList: function(){
					var self = this;
					
					if(self.userInfo && self.bHaveMore_live) {
						var f = 10e5;

						if(self.liveList.length) {
							f = _at(self.liveList, -1).id;
						}
					
						_callAjax({
							cmd: "fetch",
//							sql: "select a.id, a.title, a.img, a.content, a.brief, strftime('%Y-%m-%d %H:%M', a.newsdate)as time, a.credit as points from courses a left join courseEnroll e on e.courseId = a.id where a.ifValid =1 and e.userId = ? and a.id< ? and a.linkerId = ? order by a.id desc limit 10",
							sql: "select l.id, l.title, strftime('%Y-%m-%d %H:%M', e.logtime)as time, count(e.id) as points from lives l, liveEnroll e where l.ifValid > 0 and e.liveId = l.id and e.userId = ? and l.id < ? group by l.id order by l.id desc",
							vals: _dump([self.userInfo.id, f])
						}, function(d) {
							if(d.success && d.data) {
								d.data.forEach(function(r) {
									r.points = studyScoreSetting.livePerMinute * r.points;
									r.points = Math.round(r.points*100)/100.0;
									self.liveList.push(r);				
								});
					
								if(self.liveList.length < 10) {
									self.bHaveMore_live = false;
								} else {
									self.bHaveMore_live = true;
								}

								if(self.activeTab == 1){
									self.contentList = self.courseLiveList;
								}
							} else {
								self.bHaveMore_live = false;
								if(f != 10e5) {
									mui.toast("已全部加载完毕")
								}
							}
						})
					}
				},
				//获取学习列表
				getCourseList: function() {
					var self = this;
					
					if(self.userInfo && self.bHaveMore_course) {
						var f = 10e5;

						if(self.courseList.length) {
							f = _at(self.courseList, -1).id;
						}
					
						_callAjax({
							cmd: "fetch",
//							sql: "select a.id, a.title, a.url, a.img, a.content, a.brief, strftime('%Y-%m-%d %H:%M', e.logtime)as time, ifnull(e.credit, 0) as points from courses a left join courseEnroll e on e.courseId = a.id where a.ifValid > 0 and e.userId = ? and a.id < ? and a.linkerId in (select id from linkers where refId = ? or refId = ?) order by e.logtime desc limit 10",
							sql: "select a.id, a.title, a.url, a.img, a.content, a.brief, " +
                                "strftime('%Y-%m-%d %H:%M', e.logtime) as time, " +
                                "ifnull(e.credit, 0) as points from courses a, courseEnroll e " +
                                "where e.courseId = a.id and a.ifValid > 0 " +
                                "and e.userId in (select id from user where idno = ?) and " +
                                "a.id < ? and a.linkerId in " +
                                "(select id from linkers where refId = ? or refId = ?) " +
                                "order by e.logtime desc limit 10",
							vals: _dump([self.userInfo.idNo, f, linkerId.StudyPlatform, linkerId.HandCourse])
						}, function(d) {
							if(d.success && d.data) {
								d.data.forEach(function(r) {
									self.courseList.push(r);				
								});
					
								if(self.courseList.length < 10) {
									self.bHaveMore_course = false;
								} else {
									self.bHaveMore_course = true;
								}									

								if(self.activeTab == 1){
									self.contentList = self.courseLiveList;
								}
							} else {
								self.bHaveMore_course = false;
								if(f != 10e5) {
									mui.toast("已全部加载完毕")
								}
							}
						})
					}
				},
				getMoreList: function() {
					var self = this;
					
					if(self.activeTab == 0){
						self.getActivityList();
					}else {
						self.getCourseList();
//						self.getLiveList();
					}
				},
				openDetail: function(i) {
					if (this.activeTab) {
						this.openCourse(i);
					} else {
						this.openActivity(i);
					}
				},
				openCourse: function(i) {
					// 打开外链
					if (i.url.indexOf("http") === 0) return openOutlink(i.url, i.title);
					// 如果预加载，需要触发事件
					mui.fire(plus.webview.getWebviewById("courseDetail"), "courseId", {
						cid: i.id
					});
					openWindow("courseDetail.html", "courseDetail", {
						cid: i.id
					});
				},
				openActivity: function(i) {
					if (!parseInt(i.isActivity)) return;
					openWindow('activeDetail.html', 'activeDetail', {
						activityId: i.id,
						isAdmin: false
					});
				}
            }
        });

        var userInfo = _load(_get("userInfo"));

        _callAjax({
            cmd: "multiFetch",
            multi: _dump([
                {
                    key: "score",
                    sql: "select ifnull(sum(score), 0) as total, scoreType from activityEnroll where userId in (select id from user where idno = '"+userInfo.idNo+"') and activityId in (select id from activitys where ifValid >= 4 and ifValid < 7)"
                },
                {
                    key: "easyScore",
                    sql: "select ifnull(sum(score), 0) as total from easyScore where userId in (select id from user where idNo = '"+userInfo.idNo+"') and ifValid = 2"
				},
                {
                    // 前一天的内容
                    sql: "select ifnull(sum(e.credit), 0) as total from courseEnroll e, courses c where e.userId in (select id from user where idno = '"+userInfo.idNo+"') and e.courseId = c.id and c.ifValid > 0 and e.logtime <= '"+(_today()+" 00:00:00")+"'",
                    key: "course"
                },
//              {
//                  key: "live",
//                  sql: "select liveId, count(id) as cnt from liveEnroll where userId ="+userInfo.id+" group by liveId"
//              }
            ])
        }, function(d) {
            if (!d.success) return;
            if ("score" in d.data && d.data.score && d.data.score.length) {
				vm.activityScore += parseInt(d.data.score[0].total);
                    // 五星制取消
                    // if (i.scoreType == "五星制") vm.activityScore += i.total * 20;
            }
            // 获取申请加分
            if ("easyScore" in d.data && d.data.score && d.data.easyScore.length) {
				vm.activityScore += parseInt(d.data.easyScore[0].total);
			}
            var studyScore = 0;
            if ("course" in d.data && d.data.course && d.data.course.length) {
                studyScore += parseInt(d.data.course[0].total);
            }
            if ("live" in d.data && d.data.live && d.data.live.length) {
                d.data.live.forEach(function(i) {
                    var score = i.cnt * studyScoreSetting.livePerMinute; // 每10分钟1分
                    if (score > 1) score = 1; // 最多能得到1分
                    studyScore += score;
                    studyScore = Math.round(studyScore*100)/100.0;
                });
            }
            // 党员先锋指数要包含学习分数时，需要加上学习积分，目前暂时不加上
            // vm.activityScore += vm.studyScore;
            _getTodayScore(userInfo, function(score) {
                let prevScore = 0;
                    prevScoreStr = _get("prevScore");
                if (prevScoreStr && parseInt(prevScoreStr)) prevScore += parseInt(prevScoreStr);
                vm.studyScore = (Math.round((parseInt(studyScore)+parseInt(score))/60)+prevScore)+"（"+Math.round(parseInt(score)/60.0)+"）分钟"; 
                if (vm.activeTab) {
                    vm.totalScore = vm.studyScore;
                }
            });
//          vm.studyScore = Math.round(studyScore/60); // 转换为分钟
            if (vm.activeTab) {
                vm.totalScore = vm.studyScore;
            } else {
                vm.totalScore = vm.activityScore;
            }
        });

		vm.activityList = [];
		vm.courseList = [];
		vm.getActivityList();
		vm.getCourseList();
		vm.getEasyScoreList();
//		vm.getLiveList();


        var wb = plus.webview.currentWebview();
        vm.activeTab = wb.tab;
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());
