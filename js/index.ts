// 首页index.html

declare function _get(n: string, isOrg: boolean): string;
declare function _set(n: string, d: string): void;
declare function _getTodayScore(i: number, f: (int) => void): void;
declare function _dump(n: any): string;
declare function _today(): string;
declare function _load(n: string): any;
declare function openWindow(f: string, n: string, params: any): void;
declare function _callAjax(params: any, f: (d: any) => void): void;
declare function _scoreAjax(params: any, f: (d: any) => void): void;
declare function _summaryAjax(params: any, f: (d: any) => void): void;
declare function _hotAjax(params: any, f: (d: any) => void): void;
declare function _tell(s: any): void;
declare function _delayClose(p: any, tm?: number): void;
declare function openOutlink(url: string, title: string): void;

declare var plus: any;
declare var mui: any;
declare var Vue: any;
declare var $: any;
declare var linkerId: any;
declare var Swiper: any;


class Index {
	// vars
	userInfo: any;
	orgInfo: any;
	jhInfo: any;
	footer: any;
	firstClickTimestamp:number;
	appVersion: number; // 当前app版本
	systemVersion: number; // 当前系统最新版本
	apkUrl: string; // 安卓下载路径
	isNewestVersion: boolean; // 是否为最新的版本
	
	constructor() {
	    // 防止返回
		mui.init({
		   swiperBack: false
		});
		if ("iOS" == plus.os.name) {
		    plus.webview.currentWebview().setStyle({
		        popGesture: "none"
		    });
		}

		this.updateInfo();

		// 打开参数页面
		this.openArgs();

		// 重载安卓系统的返回, 双击间隔小于1秒则退出
		if ('Android' == plus.os.name) {
			mui.back = () => {
				_androidClose(this);
			};
		}

		// 打开舟山党建网
		$('.goZSDJ').on('click', function() {
			plus.runtime.openURL('http://www.zsdj.gov.cn/');
		});

		// 下拉刷新
		pullToRefresh();

		// 如是安卓版本，则开始版本的检测，
		// 目前iOS也需要弹出
//		if ("Android" !== plus.os.name) return;

		// 获取app当前版本
		this.appVersion = plus.runtime.version;

		// 获取系统最新版本
		_callAjax({
			cmd: "fetch",
			sql: "select version, downloadUrl from system where os = ? order by id desc limit 1",
			vals: _dump([plus.os.name.toLowerCase(),])
		}, (d) => {
			if (d.success && d.data) {
				this.systemVersion = d.data[0].version;
				this.apkUrl = d.data[0].downloadUrl;

				// 判断当前是否为最新的版本
				let appVs = _map((i) => { return parseInt(i); }, this.appVersion.split(".")),
				    sysVs = _map((i) => { return parseInt(i); }, this.systemVersion.split("."));
				this.isNewestVersion = false;
				if (appVs[0] > sysVs[0]) {
				    this.isNewestVersion = true;
				} else if(appVs[0] == sysVs[0]) {
				    if (appVs[1] > sysVs[1]) {
                        this.isNewestVersion = true;
				    } else if(appVs[1] == sysVs[1]) {
                        if (appVs[2] >= sysVs[2]) {
                            this.isNewestVersion = true;
                        }
                    }
				}
				// alert(_dump(appVs)+","+_dump(sysVs)+","+_dump(this.isNewestVersion));
				// this.isNewestVersion = this.appVersion >= this.systemVersion;
			} else {
				// 若获取失败，当前即为最新版本
				this.isNewestVersion = true;
			}

			// 提示下载新版本
			this.updateAndroid();
		});		

		// 打开外链
		var wb = plus.webview.currentWebview();
		if ("outLink" in wb) {
			openOutlink(wb.outLink, wb.outLinkName);
		}
	}

	openArgs() {
		let args = plus.runtime.arguments;
		if (!args) return;
		let newsInfo = args.split("://")[1];
		if (!newsInfo) return;

		// 获取news的url，并打开
		let infos = newsInfo.split("/"),
			table = infos[0],
			nid = infos[1];
		_callAjax({
			cmd: "fetch",
			sql: "select title, url from "+table+" where id = ?",
			vals: _dump([nid,])
		}, (d) => {
			if (d.success && d.data) {
				let url = d.data[0].url,
					title = d.data[0].title;

				if ("articles" === table) {
					if (url.indexOf("http") === 0) return openOutlink(url, title);
					_set("newsId", nid);
					openWindow("views/newsDetail.html", "newsDetail");
				} else if ("courses" === table) {
					
				}
			}
		});
	}

	// 下载新版本
	updateAndroid() {
		if(!this.isNewestVersion) {
			mui.confirm('发现新版本v' + this.systemVersion + '，是否更新?', '', ['更新', '取消'], (e) => {
				if(0 === e.index) {
					mui.toast('请使用浏览器打开');
					
					plus.runtime.openURL(
						// 地址需要改变
						this.apkUrl,
						function() {
							mui.toast('浏览器调用失败，请前往应用中心更新');
						}
					);
				}
			});
		} else {
			mui.toast("已是最新版本");
		}
	}

	updateInfo() {
		let userStr: string = _get("userInfo", true);
		let orgStr: string = _get("orgInfo");
		let jhStr: string = _get("jhInfo");

		if (userStr) {
		    console.log(userStr);
			this.userInfo = _load(userStr);
			this.orgInfo = null;
			this.jhInfo = null;

            // 设置党员登陆今日登陆
            _getTodayScore(this.userInfo, (score) => {
                let oldScore = score;
                if (score >= 120*60) {
                    _set("score", _dump({
                        score: 120*60,
                        date: _today()
                    }));
                    return;
                }
                score += 60;
                if (score > 120*60) score = 120 * 60;
                _scoreAjax({
                    cmd: "exec",
                    sql: "insert into scoreDailyLogin(userId, idno) values(?,?)",
                    vals: _dump([this.userInfo.id, this.userInfo.idNo,]),
                }, (d) => {
                    if (d.success && d.data) {
                        _set("score", _dump({
                            score: score,
                            date: _today()
                        }));
                        mui.toast("增加1学分");
                    } else {
                        _set("score", _dump({
                            score: oldScore,
                            date: _today()
                        }));
                        
                    }
                });
            });

            _callAjax({
                cmd: "fetch",
                sql: "select id from user where idno = ?",
                vals: _dump([this.userInfo.idNo,])
            }, (d) => {
                if (!d || !d.data || !d.data.length) return;
                let ids = _map(i => {
                    return i.id;
                }, d.data).join(",");

                // 获取以前的登陆与分享
                _scoreAjax({
                    cmd: "multiFetch",
                    multi: _dump([
                        {
                            key: "login",
                            sql: "select count(*) as cnt from scoreDailyLogin where userId in (" + ids +
                                ") and logtime >= '"+(_today().split("-")[0]+"-01-01 00:00:00") +
                                "' and logtime < '"+(_today()+" 00:00:00")+"'"
                        },
                        {
                            key: "share",
                            sql: "select count(*)*2 as cnt from scoreShareCourse " +
                                "where userId in ("+ids+") " +
                                " and logtime < '"+(_today()+" 00:00:00")+"' " +
                                " and logtime >= '"+(_today().split("-")[0]+"-01-01 00:00:00")+"'"
                        },
                        {
                            key: "news",
                            sql: "select count(*) as cnt from newsEnroll " +
                                "where userId in ("+ids+") " +
                                "and logtime < '"+(_today()+" 00:00:00")+"' "+
                                "and logtime >= '"+(_today().split("-")[0]+"-01-01 00:00:00")+"'"
                        },
                    ])
                }, (d) => {
                    let prevScore = 0;
                    if (d.success && d.data) {
                        if (d.data.login && d.data.login.length) prevScore += parseInt(d.data.login[0].cnt);
                        if (d.data.share && d.data.share.length) prevScore += parseInt(d.data.share[0].cnt);
                        if (d.data.news && d.data.news.length) prevScore += parseInt(d.data.news[0].cnt);
                    }
                    _set("prevScore", ""+prevScore);
                });
            });

            // 获取之前课程学时
            _callAjax({
                cmd: "fetch",
                sql: "select ifnull(sum(e.credit), 0) as total from courseEnroll e, " +
                    "courses c where e.userId in (select id from user where idno = ?) and " +
                    "e.courseId = c.id and c.ifValid > 0 and e.logtime <= '"+(_today()+" 00:00:00")+"' " +
                    "and e.logtime >= '"+(_today().split("-")[0]+"-01-01 00:00:00")+"'",
                vals: _dump([this.userInfo.idNo,])
            }, (d) => {
                if (d.success && d.data && d.data.length) {
                    _set("prevCourseScore", ""+d.data[0].total);
                }
            });
		}
		if (orgStr) {
			this.orgInfo = _load(orgStr);
			this.userInfo = null;
			this.jhInfo = null;
		}
		if (jhStr) {
		    this.jhInfo = _load(jhStr);
		    this.userInfo = null;
		    this.orgInfo = null;
		}

		// 设置右上角登陆或退出
		$(".logout").text(!this.userInfo && !this.orgInfo && !this.jhInfo ? "登录" : " 退出");

        // 登录后才能注销login页面
//      if (userStr || orgStr || jhStr) {
//          var loginObj = plus.webview.getWebviewById("login");
//          if (loginObj) _delayClose(loginObj);
//      }
	}

	start() {
		// 指向对象本身
		let idxObj = this;

		// 底部显示
		this.footer = new Vue({
			el: "#index-footer",
			data: {
				isOrganization: false,
				isPersonal: false,
				isJh: false,
				tag: "index",
				ifShowBianmin: false,
			},
			watch: {
				tag: function(i) {
					// 仅在首页情况下显示banner
					if ("index" === i) {
						$(".index-swiper").show();
					} else {
						$(".index-swiper").hide();
					}
				}
			},
			methods: {
				switchTo: function(title, tag) {
					$(".mui-title").text(title);
					this.tag = tag;
					$(".main").hide();
					$("#"+tag).show();
                    $('body').scrollTop(0);
				},
				updateState: function() {
					if (idxObj.userInfo) {
					    if (idxObj.userInfo.phone != "13857207697") this.ifShowBianmin = true;
						this.isPersonal = true;
						this.isOrganization = false;
						this.isJh = false;
					}
					if (idxObj.orgInfo) {
						this.isPersonal = false;
						this.isJh = false;
						this.isOrganization = true;
					}
					if (idxObj.jhInfo) {
						this.isPersonal = false;
						this.isOrganization = false;
						this.isJh = true;
					}
				}
			},
			mounted: function() {
				this.updateState();
			}
		});

		// 初始化首页
		this.startIndexNews();
		// 初始化学习平台与个人中心
		if (this.userInfo) this.startUserInterface();
		// 初始化组织生活
		if (this.orgInfo) this.startOrgInterface();
		// 初始化兼合支部
		if (this.jhInfo) this.startJhInterface();

		// 退出按钮
		$(".logout").click(() => {
			// 备用
//			var loginPage = plus.webview.getWebviewById("login");
//			if (loginPage) mui.fire(loginPage, "clearCache");
			openWindow("views/login.html", "login");
//			_delayClose(plus.webview.currentWebview(), 1000);
		});

		// 用于登陆后刷新页面底部标签
		document.addEventListener('openOutLink', function(event) {
			openOutlink(event.detail.outLink, event.detail.outLinkName);
		});

		// 用于登陆后刷新页面底部标签
		document.addEventListener('updateFooterInfo', () => {
			idxObj.updateInfo();
			idxObj.footer.updateState();

			// 初始化学习平台与个人中心或者组织生活
			if (this.userInfo) {
				this.startUserInterface();
			}
			if (this.orgInfo) {
				this.startOrgInterface();
			}
			if (this.jhInfo) {
				this.startJhInterface();
			}

			var loginObj = plus.webview.getWebviewById("login");
			if (loginObj) _delayClose(loginObj);

			// 必须返回首页
			this.footer.switchTo('舟山共产党员E家', 'index');
		});

        // 用于学分中心跳转到首页
        document.addEventListener("toIndex", () => {
			this.footer.switchTo('舟山共产党员E家', 'index');
        });

        // 用于学分中心跳转到学习平台
        document.addEventListener("toStudyPlatform", () => {
			this.footer.switchTo('学习平台', 'study');
        });
	}

	startIndexNews() {
		// banner头
		let banner = new Vue({
			el: ".index-swiper",
			data: {
				scrollNews: [],
				activeSlideText: "",
			},
			methods: {
				openNews: function(i) {
					// 打开文章页详情
					if (i.url.indexOf("http") === 0) return openOutlink(i.url, i.title);
					_set("newsId", i.id);
					openWindow("views/newsDetail.html", "newsDetail");
				}
			}
		});

        let idxObj = this;

		// 获取新闻与推荐活动的最多数量
		const bannersLimit = 5;
		const newsLimit = 10;
		const activitiesLimit = 10;

		// 新闻与推荐活动列表
		let vm = new Vue({
			el: "#index",
			data: {
				news: [],
				newsHavMore: true,
				activities: [],
				ads: [],
				activeAdsText: "",
			},
			computed: {
				hasMoreNews: function() {
					return this.news.length >= newsLimit;
				},
				hasMoreActivities: function() {
					return this.activities.length >= activitiesLimit;
				}
			},
			methods: {
				getIndexContent: function() {
					// 获取新闻和推荐活动
					_callAjax({
						cmd: "multiFetch",
						multi: _dump([
							{
								key: "banners",
								sql: "select id, title, url, img, bannerimg, linkerId, readcnt, newsdate, subtitle from articles where ifValid = 1 and linkerId = " + linkerId.IndexNews +" and credit > 0 order by newsdate desc limit "+bannersLimit
							},
							{
								key: "news",
								sql: "select id, title, url, img, linkerId, readcnt, newsdate, subtitle from articles where ifValid = 1 and linkerId = " + linkerId.IndexNews +" and credit = 0 order by newsdate desc, id desc limit "+newsLimit
							},
							{
								key: "activities",
								// activityRecommend中的activityId需要unique
								sql: "select activityId, v.title, v.img, o.name as orgName, strftime('%Y-%m-%d', logdate) as logtime from activityRecommend a, organization o, activitys v where a.activityId = v.id and a.orgNo = o.no order by a.logdate desc limit "+activitiesLimit
							}
						])
					}, (d) => {
						if (!d.success) return;
						if ("banners" in d.data && d.data.banners.length) {
							d.data.banners.forEach(function(i) {
								if (i.bannerimg) i.img = i.bannerimg;
							});
							banner.scrollNews = d.data.banners;
							banner.activeSlideText = banner.scrollNews[0].title;
							banner.$nextTick(function() {
								new Swiper('.index-swiper', {
									pagination: '.index-pagination',
									observer: true,
									observerParents: false,
									onSlideChangeEnd: function(swiper) {
										  banner.activeSlideText = banner.scrollNews[swiper.activeIndex].title;
									}
								});
							});
						}
						if ("news" in d.data && d.data.news.length) {
						    d.data.news.forEach(i => {
						        if (i.img.indexOf("//") == 0) {
						            i.img = "https:"+i.img;
						        }
						    });
							this.news = d.data.news;
						}
						if ("activities" in d.data && d.data.activities && d.data.activities.length) {
							this.activities = d.data.activities;
						}
					});
				},
				openNews: function(i) {
					// 打开文章页详情
					if (i.url.indexOf("http") === 0) return openOutlink(i.url, i.title);
					_set("newsId", i.id);
					openWindow("views/newsDetail.html", "newsDetail");
				},
				openNewsList: function() {
					// 打开文章列表
					openWindow("views/newsList.html", "newsList", {
						linkerId: linkerId.IndexNews
					});
				},
				moreNews: function () {
				    // 加载更多新闻
                    var f = 10e6;
                    var ndate = '3000-12-31 23:59:59';
                    if(this.news.length) {
                        var ii = _at(this.news, -1);
                        f = ii.id;
                        ndate = ii.newsdate;
                    }

                    _callAjax({
                        cmd: "fetch",
                        sql: "select id, title, url, img, linkerId, reporter, readcnt, newsdate, subtitle from articles where ifValid = 1 and credit = 0 and linkerId = ? and (newsdate < ? or (newsdate = ? and id < ?)) order by newsdate desc, id desc limit 10",
                        vals: _dump([linkerId.IndexNews, ndate, ndate, f])
                    }, (d) => {
                       if (d.success && d.data) {
                           this.newsHavMore = true;
                           d.data.forEach((i) => {
                               if (i.img.indexOf("//") == 0) {
                                   i.img = "https:"+i.img;
                               }
                               this.news.push(i);
                           });
                       } else {
                           this.newsHavMore = false;
                       }
                    });
				},
				openActivities: function() {
					// 打开推荐活动
					openWindow("views/recommendList.html", "recommendList");
				},
				openActivity: function(i) {
					// 打开推荐活动
					openWindow('views/activeDetail.html', 'activeDetail', {
						activityId: i.id,
						isAdmin: false,
						isSub: false
					});
				},
				openAd: function(i) {
					// 打开广告
					if (i.url.indexOf("http") === 0) return openOutlink(i.url, i.name);
					_set("newsId", i.articleId);
					openWindow("views/newsDetail.html", "newsDetail");
				},
				getAds: function() {
					// 获取广告
					_callAjax({
						cmd: "fetch",
						sql: "select id, name, img, articleId, url from ads where (type = 'index' and status = 1) order by logtime desc limit 5"
					}, (d) => {
						if(d.success && d.data) {
							this.ads = d.data;
							this.activeAdsText = this.ads[0].name;
							var self = this;
							this.$nextTick(function() {
								new Swiper('.ad-swiper', {
									pagination: '.ad-pagination',
									observer: true,
									observerParents: false,
									onSlideChangeStart: function(swiper) {
										  self.activeAdsText = self.ads[swiper.activeIndex].name;
									}
								});
							});
						}
					});
				}
			},
			mounted: function() {
				// 获取新闻和推荐活动列表
				this.getIndexContent();
				this.getAds();

                let self = this;
                $(window).scroll(function() {
                    if (idxObj.footer.tag != "index") return;
                    var scrollTop = $(this).scrollTop();
                    var scrollHeight = $(document).height();
                    var windowHeight = $(this).height();
                    if (scrollTop + windowHeight == scrollHeight && self.newsHavMore) {
                        // 底部自动加载
                        self.moreNews();
                    }
                });
			}
		});
	}

	startUserInterface() {
		// 指向对象本身
		let idxObj = this;
		this.startStudy();
		this.startUserCenter();
	}

	startStudy() {
		// 指向对象本身
		let idxObj = this;

		// 预加载课程详细页面，因为有时候会发生打不开下级页面的情况
		mui.preload({
			url: "views/courseDetail.html",
			id: "courseDetail"
		});

		var vm = new Vue({
			el: "#study",
			data: {
				coursesRecommended: []
			},
			methods: {
				openStudyNews: function() {
					openWindow("views/courseList.html", "courseList", {
						lid: linkerId.News,
						name: "党建动态",
					});
				},
				openBranchAct: function() {
					openWindow("views/courseList.html", "courseList", {
						lid: linkerId.BranchActNews,
						name: "活动案例"
					});
				},
				openPublicNotice: function() {
					openWindow("views/courseList.html", "courseList", {
						lid: linkerId.PublicNotice,
						name: "通知公告"
					});
				},
				openHandCourse: function() {
					openWindow('views/internetCourseList.html','internetList');
				},
				openBooks: function() {
//					openOutlink("https://wk3.bookan.com.cn/?id=27089&token=!&from=groupmessage#/book/50400", "党建书屋");
//					openWindow("views/courseList.html", "courseList", {
//						lid: linkerId.Books,
//						name: "党建书屋"
//					});
					_replaceAjax({
						cmd: "book",
					}, function(d) {
						if (d.success && d.data) {
							if (d.data.indexOf("http") == 0) {
								openOutlink(d.data, "党建书屋");
							} else {
								openWindow("views/courseList.html", "courseList", {
									lid: linkerId.Books,
									name: "党建书屋"
								});
							}
						}
					});
				},
				openZhoushanNews: function() {
					openWindow("views/courseList.html", "courseList", {
						lid: linkerId.ZhoushanNews,
						name: "关注舟山"
					});
				},
				openVideos: function() {
				    return openOutlink("http://develop.wifizs.cn/dist/channel/gov/dyvideo/views/index.html", "微视频展播");
				},
				openCourse: function(i) {
					// 打开外链
					if (i.url.indexOf("http") === 0) return openOutlink(i.url, i.title);
					// 预加载时发送事件
					mui.fire(plus.webview.getWebviewById("courseDetail"), "courseId", {
						cid: i.id
					});
					// 如未预加载，则直接发送id
					openWindow("views/courseDetail.html", "courseDetail", {
						cid: i.id
					});
				},
			},
			mounted: function() {
				// 获取推荐课程
				_hotAjax({
					cmd: "hotest",
					topn: 3,
					hotn: 7,
				}, (d) => {
                    if (d.success && d.data && d.data.length) {
                    		// 过滤重复的文章，因为最新和手动推荐的可能会重复
                    		let ids = [];
                    		d.data.forEach((i) => {
                    			if (ids.indexOf(i.id) == -1) {
                    				ids.push(i.id);
                    				this.coursesRecommended.push(i);
                    			}
                    		});
                    }
				});
			}
		});
	}

	startUserCenter() {
		// 指向类对象本省
		let idxObj = this;

		var vm = new Vue({
			el: "#ucenter",
			data: {
				apk: "",
				userInfo: idxObj.userInfo,
				isAndroid: "Android" === plus.os.name, // 是否处于安卓系统
				isNew: idxObj.isNewestVersion,
				score: 0, // 学时
				jhStatus: -1, // JH
			},
			computed: {
			    jhStatusText: function() {
			        if (this.jhStatus == -1) {
			            return "申请加入兼合支部";
			        } else if (this.jhStatus == 4) {
			            return "退出兼合支部申请审核中";
			        } else if (this.jhStatus == 2) {
			            return "加入兼合支部申情审核中";
			        } else if (this.jhStatus == 1) {
			            return "进入兼合支部";
			        }
			    }
			},
			methods: {
				checkPoints: function() {
					openWindow("views/score.html","score", {
						tab: 0
					});
				},
				checkCredit: function() {
					openWindow("views/score.html","score", {
						tab: 1
					});
				},
				openUcenter: function() {
					openWindow('views/ucenter.html','ucenter');	
				},
				openPost: function() {
					openWindow("views/notice.html","notice");
				},
				openMyStudy: function() {
					openWindow("views/myStudy.html","mystudy");
				},
				openMyActivities: function() {
					openWindow("views/myActivity.html","myactivity");
				},
				openApplication: function() {
					openWindow("views/application.html","application");
				},
				openJh: function() {
				    // 打开兼合支部
				    _jhAjax({
				        cmd: "fetch",
				        sql: "select jhOrgNo as orgNo, status from jhMember where idNo = ? and status != 3",
				        vals: _dump([this.userInfo.idNo,])
				    }, d => {
				        if (!d.data || !d.data.length) {
                           mui.confirm("是否现在加入？", "未加入兼合支部", ["确定", "取消"], function(e) {
                               if (e.index == 0) {
                                   openWindow("views/jhApply.html", "jhApply");
                               }
                           });
				        } else {
				            let status = parseInt((d.data[0].status));
				            if (status == 3) {
				                mui.confirm("是否现在加入？", "未加入兼合支部", ["确定", "取消"], function(e) {
				                    if (e.index == 0) {
				                        openWindow("views/jhApply.html", "jhApply");
				                    }
                                });
				            } else if (status == 4) {
				                mui.toast("退出兼合支部申请审核中");
				            } else if (status == 2) {
				                mui.toast("加入兼合支部申请审核中");
				            } else if (status == 1) {
				                openWindow("views/jhMemberActivityRecord.html", "jhMemberActivityRecord", {
				                    name: this.userInfo.name,
				                    idNo: this.userInfo.idNo
				                });
				            }
				        }
				    }, "/db4web");
				},
				openEvaluate: function() {
				    let btns = [
				        {
				            title: "支部考评",
				        },
				        {
				            title: "兼合支部考评"
				        }
				    ];
					plus.nativeUI.actionSheet({
						title: "考评分类",
						cancel: "取消",
						buttons: btns
					}, (e) => {
						if (0 === e.index) return;
						let t = btns[e.index-1].title;
						if (t == "支部考评") {
						    openWindow("views/memberEvaluate.html", "memberEvaluate", {
						        idNo: this.userInfo.idNo
						    });
						} else {
						    openWindow("views/jhMemberEvaluate.html", "jhMemberEvaluate", {
						        idNo: this.userInfo.idNo
						    });
						}
                    });
				},
				logout: function() {
					openWindow("views/login.html", "logout");
				},
				clearCache: function() {
					plus.cache.clear(function() {
						mui.toast('已清理');
					});
				},
				checkNewVersion: function() {
					idxObj.updateAndroid();
				},
				openMsgBoard: function() {
					openWindow("views/msgBoard.html", "msgBoard");
				}
			},
			mounted: function() {
                document.addEventListener("updateScore", (event) => {
                    setTimeout(() => {
                        let prevScoreStr = _get("prevScore"),
                            prevScore = 0,
                            prevCourseScoreStr = _get("prevCourseScore"),
                            prevCourseScore = 0,
                            todayScore = 0;
                        let scoreStr = _get("score");
                        if (scoreStr) {
                            todayScore = _load(scoreStr).score;
                        }
                        if (prevScoreStr) prevScore = parseInt(_load(prevScoreStr));
                        if (prevCourseScoreStr) prevCourseScore = parseInt(_load(prevCourseScoreStr));
                        this.score = prevScore+Math.ceil(parseInt(todayScore)/60)+Math.ceil(parseInt(prevCourseScore)/60);
                    }, 1000);
                });
                // jh member status
                document.addEventListener("updateJhMemberStatus", (event) => {
                    this.jhStatus = event.detail.status;
                });
                // chech JH status
                _jhAjax({
                    cmd: "fetch",
                    sql: "select jhOrgNo as orgNo, status from jhMember where idNo = ? and status in (1,2,4)",
                    vals: _dump([this.userInfo.idNo,])
                }, d => {
                    if (d.data && d.data.length) {
                        this.jhStatus = parseInt(d.data[0].status);
                    }
                }, "/db4web");
			}
		});
	}

    startJhInterface() {
		// 指向对象本身
		let idxObj = this;

		var vm = new Vue({
			el: "#jh",
			data: {
			    jhInfo: null,
			    activityCount: 0,
			    activityMemberCount: 0
			},
			computed: {
			    curOrgName: function() {
			        return this.jhInfo ? this.jhInfo.username : "";
			    },
			    isBranch: function() {
			        return _filter(i => {
			            return i.name == '兼合式支部';
			        }, this.jhInfo.roles).length;
			    }
			},
			methods: {
				openMsgBoard: function() {
					openWindow("views/msgBoard.html", "msgBoard");
				},
			    openDetail: function() {
                    openWindow("views/jhOrgDetail.html", "jhOrgDetail", {
                        orgId: this.jhInfo.id
                    });
			    },
			    openActivityList: function() {
					openWindow("views/jhActivityList.html","jhActivityList", {
						jhOrgNo: this.jhInfo.no
					});
			    },
			    openMembers: function() {
					openWindow("views/jhMemberManage.html","jhMemberManage", {
						jhOrgNo: this.jhInfo.no
					});
			    },
			    openApprove: function() {
					openWindow("views/jhMemberApprove.html","jhMemberApprove", {
						jhOrgNo: this.jhInfo.no,
						jhOrgName: this.curOrgName,
					});
			    },
			    openTree: function() {
			        let canEdit = _filter(i => {
			            return i.name == "社区";
			        }, this.jhInfo.roles).length;
					openWindow("views/jhTree.html","jhTree", {
						jhOrgNo: this.jhInfo.no,
						jhOrgName: this.jhInfo.username,
						canEdit: canEdit
					});
			    },
			    changePswd: function() {
					let pswd1: string,
						pswd2: string;
					let self = this;
					
					mui.confirm('<input type="password" id="changepswd" />', "输入新密码", ['确定', '取消'], function(e) {
						let pswd = _trim($("#changepswd").val());
						if (0 === e.index) {
							if ('' === pswd) {
								mui.toast("请输入密码");
								return false;
							} else {
								pswd1 = pswd;
								mui.confirm('<input type="password" id="changepswd" />', "再次输入密码", ['确定', '取消'], (e) => {
									let pswd = _trim($("#changepswd").val());
									if (0 === e.index) {
										if ('' === pswd) {
											mui.toast("请输入密码");
											return false;
										} else {
											pswd2 = pswd;
											if (pswd1 != pswd2) {
												mui.toast("密码不一致，请重填");
												return false;
											} else {
												_jhAjax({
													cmd: "exec",
													sql: "update jhOrg set pswd = ? where orgNo = ?",
													vals: _dump([pswd1, self.jhInfo.no])
												}, (d) => {
													mui.toast("修改"+(d.success?"成功":"失败"));
												}, "/db4web");
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
			    let jhStr = _get("jhInfo");
			    console.log(jhStr);
			    if (!!jhStr) this.jhInfo = _load(jhStr);
			}
        });
    }

	startOrgInterface() {
		// 指向对象本身
		let idxObj = this;

		// 组织生活
		var vm = new Vue({
			el: "#activity",
			data: {
				activities: [],
				activityCategories: [],
				curOrgName: idxObj.orgInfo.name,
				seasonSummaries: [],
				notices: [],
				branchSummary: {
					activitiesCnt: 0,
					membersCnt: 0
				},
				ifFirstPC: false,
			},
			computed: {
				ifPartyBranch: function() {
					// 判断是否为党支部
					return "党支部" === idxObj.orgInfo.type;
				},
				categoryBtns: function() {
					// 分类按钮
					return _map((i) => {
						// 保留title原始数据
						i.rawTitle = i.title;
						// title加上活动数量
						i.title += "("+i.cnt+")";
						return i;
					}, this.activityCategories).concat([
						{ title: "自定义主题" },
						{ title: "自定义编辑" },
					]);
				},
			},
			methods: {
				openCheckRules: function() {
					// 打开考核规则制定
					openWindow("views/newRule.html", "newRule");
				},
				openNoticeList: function() {
					// 打开通知列表
					openWindow("views/newsList.html", "newsList", {
						linkerId: linkerId.Notice,
						orgNo: idxObj.orgInfo.no,
						isAdmin: true
					});
				},
				openNotice: function(i) {
					openWindow("views/orgNoticeDetail.html", "orgNoticeDetail", {
						aid: i.id,
					});
				},
				openActivityCategories: function() {
					// 打开活动分类选择
					plus.nativeUI.actionSheet({
						title: "活动分类",
						cancel: "取消",
						buttons: this.categoryBtns
					}, (e) => {
						if (0 === e.index) return;
						let s = this.categoryBtns[e.index-1],
							sName = s.title;
						if ("自定义主题" === sName) {
							// CHECK
							openWindow("views/topicUpload.html", "topicUpload", {
								lid: linkerId.Activity,
								orgNo: idxObj.orgInfo.no
							});
						} else if ("自定义编辑" === sName) {
							// CHECK
							openWindow("views/topicList.html", "topicList", {
								lid: linkerId.Activity,
								name: "组织生活",
								isAdmin: true,
							});
						} else {
							openWindow("views/activityList.html", "activityList", {
								lid: s.topicId,
								title: s.title,
								isAdmin: true,
							});
						}
					});
				},
				openTree: function() {
					openWindow("views/tree.html", "tree", {
						orgNo: idxObj.orgInfo.no
					});
				},
				openMembers: function() {
					openWindow("views/memberManage.html", "memberManage", {
						orgNo: idxObj.orgInfo.no,
						orgId: idxObj.orgInfo.id
					});
				},
				openRules: function() {
					openWindow("views/newsList.html", "newsList", {
						linkerId: linkerId.Rules,
						orgNo: idxObj.orgInfo.no,
						isAdmin: true
					});
				},
				openApprove: function() {
					openWindow("views/approve.html", "approve");
				},
				changePswd: function() {
					let pswd1: string,
						pswd2: string;
					
					mui.confirm('<input type="password" id="changepswd" />', "输入新密码", ['确定', '取消'], function(e) {
						let pswd = _trim($("#changepswd").val());
						if (0 === e.index) {
							if ('' === pswd) {
								mui.toast("请输入密码");
								return false;
							} else {
								pswd1 = pswd;
								mui.confirm('<input type="password" id="changepswd" />', "再次输入密码", ['确定', '取消'], (e) => {
									let pswd = _trim($("#changepswd").val());
									if (0 === e.index) {
										if ('' === pswd) {
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
													vals: _dump([pswd1, idxObj.orgInfo.no])
												}, (d) => {
													mui.toast("修改"+(d.success?"成功":"失败"));
												});
											}
										}
									}
								}, 'div');
							}
						}
					}, 'div');
				},
				openSummary: function(i) {
					openWindow("views/summary.html", "summary", {
						season: i+1
					});
				}
			},
			mounted: function() {
				let cateSql = "select l.id as topicId, l.name as title, count(ac.id) as cnt from linkers l, activitys a left join activityCategories ac on ac.linkerId = l.id and a.id = ac.activityId where a.orgId = "+idxObj.orgInfo.id+" and (orgNo = '"+idxObj.orgInfo.no+"' or orgNo = '') and refId = "+linkerId.Activity+" and l.ifValid = 1 group by l.id order by l.id";
				// 党支部以上均自行设置规则
				if ("党支部" !== idxObj.orgInfo.type) cateSql = "select l.id as topicId, l.name as title, count(ac.id) as cnt from linkers l, activitys a left join activityCategories ac on ac.linkerId = l.id and a.id = ac.activityId where a.orgId = "+idxObj.orgInfo.id+" and orgNo = '"+idxObj.orgInfo.no+"' and refId = "+linkerId.Activity+" and l.ifValid = 1 group by l.id order by l.id";

				_callAjax({
					cmd: "multiFetch",
					multi: _dump([
						{
							key: "notices",
							sql: "select id, title, strftime('%Y-%m-%d', logtime) as logtime from articles where reporter = '"+idxObj.orgInfo.no+"' and linkerId = "+linkerId.Notice+" and ifValid = 1 order by logtime desc limit 3",
						},
//						{
//							key: "activityCategories",
//							sql: cateSql
//						}
					])
				}, (d) => {
					if (!d.success || !d.data) return;
					if ("notices" in d.data && d.data.notices) {
						this.notices = d.data.notices;
						this.$nextTick(() => {
							new Swiper('.notice-swiper', {
								autoplay: 2000,
								autoplayDisableOnInteraction: false,
								loop: true,
								observer: true,
								observeParents: true,
							});
						});
					}
					if ("activityCategories" in d.data && d.data.activityCategories) {
						this.activityCategories = d.data.activityCategories;
					}
				});

				// 获取支部活动类型
				_replaceAjax({
					cmd: "orgActivityCategories",
					orgId: idxObj.orgInfo.id,
					orgNo: idxObj.orgInfo.no
				}, (d) => {
					this.activityCategories = d.data;
				});

				// 获取支部考核统计信息
				if (this.ifPartyBranch) {
					_summaryAjax({
						cmd: "summary",
						orgNo: idxObj.orgInfo.no
					}, (d) => {
						if (d.success) this.seasonSummaries = d.data;
					});
				}

				// 判断是否是一级党委
				_summaryAjax({
					cmd: "getFirstPC",
					no: idxObj.orgInfo.no
				}, (d) => {
					if (d.success && d.data) {
						this.ifFirstPC = d.data.no === idxObj.orgInfo.no;
					}
				});

				// 获取统计数据
                _callAjax({
                    cmd: "multiFetch",
                    multi: _dump([
                        {
                            key: "activity",
                            sql: "select count(*) as cnt from activitys where orgId = "+idxObj.orgInfo.id+" and ifValid > 0"
                        },
                        {
                            key: "member",
                            sql: "select count(*) cnt from activityEnroll where activityId in (select id from activitys where orgId ="+idxObj.orgInfo.id+" and ifValid > 0)"
                        }
                    ])
                }, (d) => {
                    this.branchSummary.activitiesCnt = d.data.activity[0].cnt;
                    this.branchSummary.membersCnt = d.data.member[0].cnt;
                });

                document.addEventListener("updateActivityCategories", () => {
                    // 获取支部活动类型
                    _replaceAjax({
                        cmd: "orgActivityCategories",
                        orgId: idxObj.orgInfo.id,
                        orgNo: idxObj.orgInfo.no
                    }, (d) => {
                        this.activityCategories = d.data;
                    });
                });
			}
		});
	}
}

if(window.plus) {
	(new Index()).start();
} else {
	document.addEventListener('plusready', function() {
		(new Index()).start();
	}, false);
}