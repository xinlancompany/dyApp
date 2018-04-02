if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

mui.init({
	preloadPages: [{
		url: 'views/newsDetail.html',
		id: 'newsDetail'
	},{
		url: 'views/regulationDetail.html',
		id: 'regulationDetail'
	},
    /*
    {
		url: 'views/score.html',
		id: 'score'
	},
    {
        url: 'views/newsList.html',
        id: 'newsList'
    }
    */
    ]
});

var changeTab = function(el, self) {
	$('.main').hide();
	$('#' + el + '').show();
	self.addClass('active').siblings().removeClass('active');
};

// 重新加载用户信息
var ucenterReload = function(ucenter) {
    if (!ucenter) return;
    var self = ucenter;
    
    self.isLogin = true;
    self.userInfo = _load(_get('userInfo'));
    self.userType = self.userInfo.userType;
    
    //获取用户信息
    /*
    if(self.userInfo != null) {
        var userType = self.userInfo.userType;
        console.log("首页登录usertype=" + userType);
        var sql = '';
        if(userType == 1){
            //组织登录
            sql = "select * from organization where name = ? and pswd = ?";
        }else {
            //党员登录
            sql = "select id,name,orgName,orgNo,pswd from User where name = ? and pswd = ?";					
        }
        
        _callAjax({
            cmd: "fetch",
            sql: sql,
            vals: _dump([self.userInfo.name, self.userInfo.pswd])
        }, function(d) {
        
            if(d.success && d.data) {
                self.isLogin = true;
                self.userInfo = d.data[0];
                self.userInfo.userType = userType;
                _set('userInfo', _dump(self.userInfo));
                self.userType = userType;
            } else {
                self.isLogin = false;
                self.userInfo = {};
                plus.storage.removeItem('userInfo');
                self.userType = null;
            }
        });
    }
    */
};

function plusReady() {
	pullToRefresh();

    // 获取学习积分的设置，覆盖util.js里的设置
    _callAjax({
        cmd: "fetch",
        sql: "select * from studyScoreSetting"
    }, function(d) {
       if (d.success && d.data && d.data.length) {
           d.data.forEach(function(i) {
               if (i.tag == "totalScore") studyScoreSetting.totalScore = i.score;
               if (i.tag == "livePerMinute") studyScoreSetting.livePerMinute = i.score;
           });
       }
    });

	// 获取活动积分设置
    _callAjax({
        cmd: "fetch",
        sql: "select * from activityScoreSetting"
    }, function(d) {
       if (d.success && d.data && d.data.length) {
           d.data.forEach(function(i) {
               if (i.tag == "activityLimit") activityScoreSetting.activityLimit = i.score;
           });
       }
    });
	
	var swiperStudy = null;
	
	//添加登录返回refresh自定义事件监听
	window.addEventListener('loginBack', function(event) {
		console.log('loginback回调');

		// var webview = plus.webview.currentWebview();
		// webview.reload();
        var tp = event.detail.tp;
        if (tp == "organization") {
            $(".go-activity").click();
        } else {
            ucenterReload(ucenter);
            $(".go-ucenter").click();
        }
        activity.init();
	});
    
    // 关闭boot
    window.addEventListener("closeBoot", function() {
        plus.webview.close(plus.webview.getLaunchWebview());
    });
	
	var header = new Vue({
		el: '.pageTitle',
		data: {
			showOrgTitle: false,
		}
	});
	
	var indexSwiper = new Vue({
		el: '.index-swiper',
		data: {
			scrollNews: [],
            indexTopNews: [],
            studyTopNews: [],
			activeSlideText: '',
			show: true
		},
		methods: {
			//跳转到新闻详情
			gotoDetail: function(i) {
				index.gotoDetail(i);
			},
		}
	})
		
	var index = new Vue({
		el: '#index',
		data: {
			headNews: [],
			activity: [], //活动专题
		},
		methods: {
			//跳转到新闻详情
			gotoDetail: function(i) {
				_set("newsId", i.id);
				//触发详情页面的newsId事件
				mui.fire(plus.webview.getWebviewById("newsDetail"), 'newsId', {});
			
				openWindow("views/newsDetail.html", "newsDetail");
			},
			goActivity: function(i) {
					
			},
			goActivityTab: function() {
				$('.go-activity').click();
			},
			//跳转到某个专题的活动列表页
			goActivityList:function(id){			
				_set('activitySortId', id);
				mui.fire(plus.webview.getWebviewById("activityList"), 'activitySortId', {});
				
				openWindow('views/activityList.html', 'activityList');
			},
			//获取动态新闻
			getNews: function(){
				var self = this;
				
				_callAjax({
					cmd:"fetch",
					sql:"select id, title, img, content, linkerId, reporter, readcnt, newsdate, subtitle, credit from articles where ifValid =1 and linkerId = " + linkerId.IndexNews +" order by newsdate desc limit 10"
				},function(d){
					if(d.success && d.data && d.data.length) {
                        /*
						if(d.data.length>5){
							indexSwiper.scrollNews = d.data.slice(0,5);
							self.headNews = d.data.slice(5,8);
						}else {
							indexSwiper.scrollNews = d.data;
						}
                        */
                        d.data.forEach(function(i) {
                            if (i.credit > 0) {
                                indexSwiper.indexTopNews.push(i);
                            } else {
                                self.headNews.push(i);
                            }
                        });
                        // 设置为首页新闻
                        indexSwiper.scrollNews = indexSwiper.indexTopNews;
						
						indexSwiper.activeSlideText = indexSwiper.scrollNews[0].title;
						setTimeout(function(){
							var swiper = new Swiper('.index-swiper', {
								pagination: '.swiper-pagination',
                                observer: true,
                                observerParents: false,
								onSlideChangeEnd: function(swiper){
							      	indexSwiper.activeSlideText = indexSwiper.scrollNews[swiper.activeIndex].title
								}
							});
						}, 500)
					}
				});

                // 获取学习置顶新闻
                _callAjax({
                    cmd: "fetch",
                    sql: "select id, title, img, content, linkerId, reporter, readcnt, newsdate, subtitle, credit from articles where ifValid = 1 and credit > 0 and linkerId = " + linkerId.News +" order by id desc limit 10"
                }, function(d) {
                    if (d.success && d.data && d.data.length) {
                        indexSwiper.studyTopNews = d.data;
                    }
                });
			},
			//获取活动专题
			getActivitySort: function(){
				var self = this;
				self.activity = [];
				var orgId = _getOrgId();
				
				_callAjax({
					cmd: "fetch",
					sql: "select id, name, img, strftime('%Y-%m-%d %H:%M', logtime) as logtime from linkers where ifValid = 1 and refId = ? and orgId = ? order by id desc limit 2",
					vals: _dump([linkerId.activitySort, orgId])
				},function(d){
					if(d.success && d.data){
						d.data.forEach(function(r){
							var arrImg = r.img.split('/upload');
							r.img = serverAddr + '/upload' + arrImg[1];
							self.activity.push(r);
						})
					}
				})
			},
			//党员信息管理
			gotoUcenter: function(){
                $(".go-ucenter").click();
                /*
				var userInfo = _load(_get('userInfo'));
				if(userInfo){
					if(userInfo.userType == 0) {
                        alert("rth1");
						ucenter.goLogin();
					} else {
                        alert("rth2");
                        $(".go-ucenter").click();
					}
				} else {
                    alert("rth3");
                    $(".go-ucenter").click();
				}
				*/
			},
			//组织信息管理
			gotoOrganization: function(){
				var userInfo = _load(_get('userInfo'));
                _tell(userInfo);
				if(userInfo){
					if(userInfo.userType == 1) {
						// ucenter.goLogin();
                        // openWindow("views/organization.html", "organization");
                        $(".go-activity").click();
					} else {
						// mui.toast('请切换组织账号登录');
						openWindow('views/login.html', 'login', {type: "organization"});
					}
				}else {
					openWindow('views/login.html', 'login', {type: "organization"});
				}
				
			},
		},
		mounted: function() {
			var self = this;
			
			//获取动态新闻
			self.getNews();
			//获取活动专题
			self.getActivitySort();
			
			var scrollOrgSwiper = new Swiper('.scroll-org', {
				slidesPerView: 'auto',
				freeMode: true,
			})
		}
	})
	
	var activity = new Vue({
		el: '#activity',
		data: {
			activity: [],
			bHaveMore: false,
            activityCategories: [],
            categoryDict: {},
            notices: [],
            // noticeTag: "通知",
            isAdmin: false,
            orgNo: "",
            summary: {
                activity: 0,
                member: 0
            }
		},
		methods: {
            // 规章制度
            openRules: function() {
                var self = this;
				openWindow("views/newsList.html", "newsList", {
                    linkerId: linkerId.Rules,
                    orgNo: self.orgNo,
                    isAdmin: self.isAdmin,
                });
            },
            // 跳转到规章
            gotoRules: function() {
				//触发列表页面的newList事件
				mui.fire(plus.webview.getWebviewById("newsList"), 'newList', {
                    linkerId: linkerId.Rules
				});
			
				openWindow("views/newsList.html", "newsList");
            },
            goTopicList: function() {
				openWindow('views/topicList.html', 'topicList');
            },
            openActivityChoices: function() {
                var self = this,
                    buttons = _map(function(i) {
                        return {
                            title: i.name
                        };
                    }, self.activityCategories);
                plus.nativeUI.actionSheet({
                    title: "活动类别",
                    cancel: "取消",
                    buttons: buttons
                }, function(e) {
                    if (e.index == 0) return;
                    var name = buttons[e.index-1].title,
                        lid = self.categoryDict[name];
                    self.openActicityTopics(lid, name);
                });
            },
            openActicityTopics: function(lid, name) {
            	var self = this;
            	_callAjax({
            		cmd: "fetch",
					sql: "select id as topicId, name as title from linkers where (orgId = ? or orgId = 0) and refId = ? and ifValid = 1 order by id desc",
					vals: _dump([self.orgNo, lid])
            	}, function(d) {
            		var buttons = [];
            		if (d.success && d.data && d.data.length) {
            			buttons = d.data;
            		}
            		if (self.isAdmin) {
            			["新建", "编辑"].forEach(function(i) {
							buttons.push({
								title: i
							});
            			});
            		}
					plus.nativeUI.actionSheet({
						title: name+"主题",
						cancel: "取消",
						buttons: buttons
					}, function(e) {
						if (e.index == 0) return;
						if (buttons[e.index-1].title == "新建") {
							openWindow("views/topicUpload.html", "topicUpload", {
								lid: lid,
								orgNo: self.orgNo
							});
							return;
						}
						if (buttons[e.index-1].title == "编辑") {
							openWindow('views/topicList.html', 'topicList', {
								lid: lid,
								name: name
							});
							return;
						}
						var i = buttons[e.index-1];
						openWindow("views/activityList.html", "activityList", {
							lid: i.topicId,
							title: i.title,
							isAdmin: self.isAdmin
						});
					});
            	});
            },
            openTree: function() {
                var userInfo = _load(_get("userInfo")),
                    orgNo;
                if ("no" in userInfo) {
                    orgNo = userInfo.no;
                } else {
                    orgNo = userInfo.orgNo;
                }
                openWindow("views/tree.html", "tree", {
                    orgNo: orgNo
                });
            },
            openNotice: function(i) {
                var wb = plus.webview.getWebviewById("newsDetail");
                if (!!wb) {
                    // 预加载成功
                    _set("newsId", i.id)
                    mui.fire(wb, "newsId");
                    openWindow("views/newsDetail.html", "newsDetail");
                } else {
                    // 预加载失败
                    _set("newsId", "");
                    openWindow("views/newsDetail.html", "newsDetail", {
                        aid: i.id,
                        table: "articles"
                    });
                }
            },
            openNotices: function() {
                /*
                if (!this.isAdmin) return;
                var self = this;
                openWindow("views/articleUpload.html", "articleUpload", {
                    lid: linkerId.Notice,
                    reporter: self.orgNo,
                    title: "新增通知",
                });
                */
                var self = this;
				openWindow("views/newsList.html", "newsList", {
                    linkerId: linkerId.Notice,
                    orgNo: self.orgNo,
                    isAdmin: self.isAdmin,
                });
            },
            init: function() {
                var self = this;
                self.activity = [];
                self.bHaveMore = false;
                self.activityCategories = [];
                self.categoryDict = {},
                self.notices = [],
                // self.noticeTag = "通知",
                self.isAdmin = false,
                self.orgNo = "",
                // 获取活动分类
                _callAjax({
                    cmd: "fetch",
                    sql: "select id, name from linkers where refid = ?",
                    vals: _dump([linkerId.Activity,])
                }, function(d) {
                    if (d.success && d.data && d.data.length) {
                        d.data.forEach(function(i) {
                            self.categoryDict[i.name] = i.id;
                            self.activityCategories.push(i);
                        });
                    } 
                });

                // 获取通知信息
                var userInfo = _load(_get("userInfo")),
                    orgNo;
                self.isAdmin = "no" in userInfo;
                if ("no" in userInfo) {
                    orgNo = userInfo.no;
                } else {
                    orgNo = userInfo.orgNo;
                }
                self.orgNo = orgNo; // 新增通知时要用到
                _callAjax({
                    cmd: "fetch",
                    sql: "select id, title, strftime('%Y-%m-%d', logtime) as logtime from articles where reporter = ? and linkerId = ? and ifValid = 1 limit 3",
                    vals: _dump([orgNo, linkerId.Notice])
                }, function(d) {
                    // alert(_dump(d));
                    if (d.success && d.data && d.data.length) {
                        self.notices = d.data;
                    }
                });
                // 获取统计信息
                _callAjax({
                    cmd: "multiFetch",
                    multi: _dump([
                        {
                            key: "activity",
                            sql: "select count(*) as cnt from activitys where linkerId in (select id from linkers where orgId ="+parseInt(orgNo)+")"
                        },
                        {
                            key: "member",
                            sql: "select count(*) cnt from activityEnroll where activityId in (select id from activitys where linkerId in (select id from linkers where orgId = "+parseInt(orgNo)+"))"
                        }
                    ])
                }, function(d) {
                    // alert(_dump(d));
                    self.summary.activity = d.data.activity[0].cnt;
                    self.summary.member = d.data.member[0].cnt;
                });
            },
            // 党员信息
            openMembers: function() {
                var self = this;
                openWindow("views/memberManage.html", "memberManage", {
                    orgNo: self.orgNo
                });
            },
            // 更改密码
            changePswd: function() {
                var self = this;
                var pswd1, pswd2;
                mui.confirm('<input type="password" id="changepswd" />', "输入新密码", ['确定', '取消'], function(e) {
                    var pswd = _trim($("#changepswd").val());
                    if (e.index == 0) {
                        if (pswd == '') {
                            mui.toast("请输入密码");
                            return false;
                        } else {
                            pswd1 = pswd;
                            mui.confirm('<input type="password" id="changepswd" />', "再次输入密码", ['确定', '取消'], function(e) {
                                var pswd = _trim($("#changepswd").val());
                                if (e.index == 0) {
                                    if (pswd == '') {
                                        mui.toast("请输入密码");
                                        return false;
                                    } else {
                                        pswd2 = pswd;
                                        if (pswd1 != pswd2) {
                                            mui.toast("密码不一致，请重填");
                                            return false;
                                        } else {
                                            _callAjax({
                                                cmd: "exec",
                                                sql: "update organization set pswd = ? where no = ?",
                                                vals: _dump([pswd1, self.orgNo])
                                            }, function(d) {
                                                mui.toast("修改"+(d.success?"成功":"失败"));
                                            });
                                        }
                                    }
                                }
                            }, 'div');
                        }
                    }
                }, 'div');
            }
		},
		mounted: function() {
            this.init();
        },
	});
	
	var study = new Vue({
		el: '#study',
		data: {
	//		scrollNews: [],
			headNews: [],
			activeSlideText: '',
			lives: [], //直播课堂
			internets: [],//网络课堂
            tabid: 1, // 直播tab
            tabLive: null,
            todayLive: null,
            tommorrowLive: null,
            recentRecord: null,
            randomCourses: []
		},
		methods: {
            // 打开课件
            openCourse: function(i) {
                var wb = plus.webview.getWebviewById("newsDetail");
                if (!!wb) {
                    // 预加载成功
                    _set("newsId", i.id)
                    mui.fire(wb, "courseId");
                    openWindow("views/newsDetail.html", "newsDetail");
                } else {
                    // 预加载失败
                    _set("newsId", "");
                    openWindow("views/newsDetail.html", "newsDetail", {
                        aid: i.id,
                        table: "courses"
                    });
                }
            },
            // 随机获取2个网络课件
            randomTwoCourses: function() {
                var self = this;
                _callAjax({
                    cmd: "fetch",
                    sql: "select id, title, img, readcnt from courses order by random() limit 2"
                }, function(d) {
                    if (d.success && d.data && d.data.length) {
                        self.randomCourses = d.data;
                    }
                });
            },
            //  打开tab的直播
            openTabLive: function() {
                var self = this;
                openWindow("views/liveDetail.html", "liveDetail", {
                    liveId: self.tabLive.id
                });
            },
            // 切换直播tab
            switchToLive: function(id) {
                this.tabid = id;
                if (id == 1) this.tabLive = this.todayLive;
                if (id == 2) this.tabLive = this.tommorrowLive;
                if (id == 3) this.tabLive = this.recentRecord;
            },
            // 跳转到教育动态
            goStudyNews: function() {
                /*
				mui.fire(plus.webview.getWebviewById("newsList"), 'newList', {
                    linkerId: linkerId.News
				});
                */
			
				openWindow("views/newsList.html", "newsList", {
                    linkerId: linkerId.News
                });
            },
			//跳转到直播列表
			goLiveList: function() {
				openWindow('views/liveList.html','liveList');
			},
			//跳转到直播课堂详情
			goLiveDetail: function(i) {			
				var userInfo = _load(_get('userInfo'));
				
				if(userInfo) {
					_set("livecourseId", i.id);
					mui.fire(plus.webview.getWebviewById("liveDetail"), 'livecourseId', {
						
					});
					
					openWindow("views/liveDetail.html", "liveDetail");
				} else {
					openWindow("views/login.html", "login");
				}
				
			},
			//跳转到网络课堂列表
			goInternetList: function() {
				openWindow('views/internetCourseList.html','internetList');
			},
			//跳转到网络课堂详情
			gotoNetCourseDetail: function(i){
				var userInfo = _load(_get('userInfo'));
				
				if(userInfo) {
					_set("netcourseId", i.id);
					mui.fire(plus.webview.getWebviewById("internetCourseware"), 'netcourseId', {});
					
					openWindow("views/internetCourseware.html", "internetCourseware");
				} else {
					openWindow("views/login.html", "login");
				}
				
			},
			//获取动态新闻
			getNews: function(){
				var self = this;
				
				_callAjax({
					cmd:"fetch",
					sql:"select id, title, img, content, linkerId, reporter, readcnt, newsdate, subtitle from articles where ifValid =1 and linkerId = " + linkerId.News +" order by newsdate desc limit 10"
				},function(d){
					if(d.success && d.data) {
						if(d.data.length>5){
							self.headNews = d.data.slice(5,8);
						}else {
							self.scrollNews = d.data;
						}						
					}
				})
			},
			//获取网络课件
			getNetClass: function(){
				var self = this;
				
				var orgId = _getOrgId();
				_callAjax({
					cmd: "fetch",
					sql: "select id, title, img, content, brief, linkerId, reporter, readcnt, newsdate, url from courses where ifValid =1 and orgId = "+ orgId + " order by id desc limit 2"
				},function(d){
					_tell(d);
					if(d.success && d.data){
						self.internets = d.data;
						_tell(self.internets);
					}
				})
			},
			//获取直播课件
			getliveClass: function(){
				var self = this;
				var orgId = _getOrgId();
				self.lives = [];
				_callAjax({
					cmd: "fetch",
					sql: "select a.id, a.title, a.img, a.content, a.linkerId, a.url, a.brief, strftime('%Y-%m-%d %H:%M', a.starttime)as starttime, strftime('%Y-%m-%d %H:%M', a.endtime)as endtime, a.status, count(e.id) as audience from lives a outer left join liveEnroll e on e.liveId = a.id where ifValid =1 and a.orgId = ? group by a.id order by a.starttime desc limit 2",
					vals: _dump([orgId])
				}, function(d) {
					if(d.success && d.data) {
						d.data.forEach(function(r){
							var arrImg = r.img.split('/upload');
							r.img = serverAddr + '/upload' + arrImg[1];
							self.lives.push(r);
						});
					}
				})
			}
		},
		mounted: function() {
			var self = this;
			
			//获取动态新闻
			// self.getNews();
			//获取网络课件
			// self.getNetClass();
			//获取直播课件
			// self.getliveClass();
            
            // 随机取两个课件
            self.randomTwoCourses();
            
            // 获取今日直播信息
            var today = _now().split(" ")[0];
            _callAjax({
                cmd: "fetch",
                sql: "select l.id, l.title, strftime('%H:%M:%S', l.starttime) as starttime, l.img, count(distinct e.userId) as cnt from lives l left join liveEnroll e on e.liveId = l.id where l.starttime > '"+today+" 00:00:00' and l.starttime < '"+today+" 23:59:59' group by l.id limit 1"
            }, function(d) {
                if (d.success && d.data && d.data.length) {
                    study.todayLive = d.data[0];
                    study.tabLive = d.data[0];
                }
            });

            // 获取明天的直播
            var dt = new Date();
            dt.setDate(dt.getDate()+1);
            var tommorrow = _datetime(dt).split(" ")[0];
            _callAjax({
                cmd: "fetch",
                sql: "select l.id, l.title, strftime('%H:%M:%S', l.starttime) as starttime, l.img, count(distinct e.userId) as cnt from lives l left join liveEnroll e on e.liveId = l.id where l.starttime > '"+tommorrow+" 00:00:00' and l.starttime < '"+tommorrow+" 23:59:59' group by l.id limit 1"
            }, function(d) {
                if (d.success && d.data && d.data.length) {
                    study.tommorrowLive = d.data[0];
                }
            });

            // 今天之前录像
            var today = _now().split(" ")[0];
            _callAjax({
                cmd: "fetch",
                sql: "select l.id, l.title, strftime('%H:%M:%S', l.starttime) as starttime, l.img, count(distinct e.userId) from lives l left join liveEnroll e on e.liveId = l.id where l.starttime < '"+today+" 00:00:00' group by l.id order by l.id desc limit 1"
            }, function(d) {
                // alert(_dump(d));
                if (d.success && d.data && d.data.length) {
                    study.recentRecord = d.data[0];
                }
            });

		}
	});
	
	var ucenter = new Vue({
		el: '#ucenter',
		data: {
			isLogin: false,
			androidUpdate: false,
			isNew: false,
			userType: null,
			userInfo: {
			}
		},
		methods: {
			//登录
			goLogin: function() {
				if(this.isLogin){
					console.log('登录');
					var userInfo = _load(_get('userInfo'));
					_tell(userInfo);
					if(userInfo.userType == 1){
						openWindow('views/organization.html', 'organization');
					}else {
						openWindow('views/ucenter.html','ucenter');	
					}
				}else{
					openWindow("views/login.html","login");
				} 
			},
			//查看党员先锋指数
			checkPoints: function(){
                /*
				if(this.isLogin){
					_set('checkPoints','0');
					mui.fire(plus.webview.getWebviewById("score"), 'checkPoints', {});

					openWindow("views/score.html","score");
				}else{
					openWindow("views/login.html","login");
				}
				*/
                openWindow("views/score.html","score", {
                    tab: 0
                });
			},
			//查看学习积分
			checkCredit: function(){
                /*
				if(this.isLogin){
					_set('checkPoints', '1');
					mui.fire(plus.webview.getWebviewById("score"), 'checkPoints', {});
					
					openWindow("views/score.html","score");
				}else{
					openWindow("views/login.html","login");
				}
                */
                openWindow("views/score.html","score", {
                    tab: 1
                });
			},
			//我的消息
			goPost: function(){
				
			},
			//我的学习
			goMyStudy: function(){
				if(this.isLogin){
					openWindow("views/myStudy.html","mystudy");
				}else{
					openWindow("views/login.html","login");
				}
			},
			//我的活动
			goMyActivity: function(){
				if(this.isLogin) {
					openWindow("views/myActivity.html","myactivity");
				} else {
					openWindow("views/login.html","login");
				}
				
			},
			//跳转到组织学习tab
			goOrgStudy: function() {
				$('.go-study').click();
			},
			//跳转到组织活动tab
			goOrgActivity: function() {
				$('.go-activity').click();
			},
			//退出登录
			logout: function(){
				var self = this;
//				self.isLogin = false;
//				self.userInfo = {};
//				self.userType = null;
				plus.storage.removeItem('userInfo');
				mui.toast('退出成功');
				plus.webview.currentWebview().reload();
			},
			//清除缓存
			clearCache:function(){
				plus.cache.clear(function() {
					mui.toast('已清理');
				})
			},
			// 检查新版本
			checkNewVersion: function(){
				var self = this;
				
				var dicVersion = _load(_get('version'));
				var curVersion = plus.runtime.version;
	
				if(curVersion < dicVersion.version){
					mui.confirm('发现新版本v' + dicVersion.version + '，是否更新?', '', ['更新', '取消'], function(e) {
						if(e.index == 0) {
							mui.toast('请使用浏览器打开');
							
							plus.runtime.openURL('http://a.app.qq.com/o/simple.jsp?pkgname=com.xinlan.PTtele', function(){
								mui.toast('浏览器调用失败，请前往应用中心更新');
							});
						}
					})
				}else{
					mui.toast("已是最新版本");
				}
			}
		},
		mounted: function(){
			var self = this;
			self.userInfo = _load(_get('userInfo'));
            self.isLogin = true;
            self.userType = self.userInfo.userType;

            /*
			var self = this;
			
			self.userInfo = _load(_get('userInfo'));
			
			//获取用户信息
			if(self.userInfo != null) {
				var userType = self.userInfo.userType;
				console.log("首页登录usertype=" + userType);
				var sql = '';
				if(userType == 1){
					//组织登录
					sql = "select * from organization where name = ? and pswd = ?";
				}else {
					//党员登录
					sql = "select id,name,orgName,orgNo,pswd from User where name = ? and pswd = ?";					
				}
				
				_callAjax({
					cmd: "fetch",
					sql: sql,
					vals: _dump([self.userInfo.name, self.userInfo.pswd])
				}, function(d) {
				
					if(d.success && d.data) {
						self.isLogin = true;
						self.userInfo = d.data[0];
						self.userInfo.userType = userType;
						_set('userInfo', _dump(self.userInfo));
						self.userType = userType;
						
						
					} else {
						self.isLogin = false;
						self.userInfo = {};
						plus.storage.removeItem('userInfo');
						self.userType = null;
					}
				});
				
			}
            */
			
			//获取版本号
			_callAjax({
				cmd: "fetch",
				sql: "select * from system"
			}, function(d) {
				if(d.success && d.data) {
					var dicVersion = d.data[0];
			
					_set('version', _dump(dicVersion));
			
					var curVersion = plus.runtime.version;
			
					if(curVersion < dicVersion.version) {
						self.isNew = true;
					} else {
						self.isNew = false;
					}
				}
			});
		}
	})
	
	if('Android' == plus.os.name) {
		ucenter.androidUpdate = true;
		var first = null;
		mui.back = function() {
			if(!first) {
				first = new Date().getTime();
				mui.toast('再按一次退出应用');
				setTimeout(function() {
					first = null;
				}, 1000);
			} else {
				if(new Date().getTime() - first < 1000) {
					plus.runtime.quit();
				}
			}
		}
	}

    // 底部事件绑定
    var footer = new Vue({
        el: "#index-footer",
        methods: {
            switchIndexTopNews: function() {
                indexSwiper.scrollNews = indexSwiper.indexTopNews;
                indexSwiper.activeSlideText = indexSwiper.scrollNews[0].title;
            },
            switchStudyTopNews: function() {
                indexSwiper.scrollNews = indexSwiper.studyTopNews;
                indexSwiper.activeSlideText = indexSwiper.scrollNews[0].title;
            }
        }
    });

    // 获取用户信息
	
	$('.footer-tab a').on('click', function() {
		var page = $(this).data('page');
        var userInfoStr = _get('userInfo');
        var userInfo = null;
        if (!!userInfoStr) userInfo = _load(userInfoStr);
        // 组织生活需要组织登录
        if (page == "activity" && !userInfo) {
            mui.toast("需组织登录");
            return openWindow('views/login.html', 'login', {type: "organization"});
        }
        // 学习与用户中心需个人登录
        if ((page == "study" || page == "ucenter") && (!userInfo || ("no" in userInfo))) {
            mui.toast("需党员登录");
            return openWindow('views/login.html', 'login', {type: "personal"});
        }
		changeTab(page, $(this));
		
		if (page == 'activity') {
            if ("no" in userInfo) {
                $(".mui-title").text(userInfo.name);
            } else {
                $(".mui-title").text(userInfo.orgName);
            }
			var noticeSwiper = new Swiper('.notice-swiper', {
				autoplay: 2000,
                observer: true,
			});
		}

        if (page == "ucenter") {
            $(".mui-title").text("个人中心");
        }
        if (page == "study") {
            $(".mui-title").text("学习平台");
        }
        if (page == "index") {
            $(".mui-title").text("舟山共产党员");
        }
		header.showOrgTitle = false;

		if(page == 'ucenter' || page == 'activity') {
			indexSwiper.show = false;
		}else if(page == 'study'){
			indexSwiper.show = true;
			if(userInfo != null){
				var name = userInfo.userType == 1 ? userInfo.name : userInfo.orgName;
				header.showOrgTitle = true;
			}
		}else if (page == 'index') {
			indexSwiper.show = true;
		}
	});
}
