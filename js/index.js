// 首页index.html
var Index = (function () {
    function Index() {
        var _this = this;
        this.updateInfo();
        // 重载安卓系统的返回, 双击间隔小于1秒则退出
        if ('Android' == plus.os.name) {
            mui.back = function () {
                _androidClose(_this);
            };
        }
    }
    Index.prototype.updateInfo = function () {
        var userStr = _get("userInfo", true);
        var orgStr = _get("orgInfo");
        if (userStr)
            this.userInfo = _load(userStr);
        if (orgStr)
            this.orgInfo = _load(orgStr);
        // 设置右上角登陆或退出
        $(".logout").text(!this.userInfo && !this.orgInfo ? "登陆" : " 退出");
    };
    Index.prototype.start = function () {
        var _this = this;
        // 指向对象本身
        var idxObj = this;
        // 底部显示
        this.footer = new Vue({
            el: "#index-footer",
            data: {
                isOrganization: false,
                isPersonal: false,
                tag: "index",
            },
            watch: {
                tag: function (i) {
                    // 仅在首页情况下显示banner
                    if ("index" === i) {
                        $(".index-swiper").show();
                    }
                    else {
                        $(".index-swiper").hide();
                    }
                }
            },
            methods: {
                switchTo: function (title, tag) {
                    $(".mui-title").text(title);
                    this.tag = tag;
                    $(".main").hide();
                    $("#" + tag).show();
                },
                updateState: function () {
                    if (idxObj.userInfo) {
                        this.isPersonal = true;
                        this.isOrganization = false;
                    }
                    if (idxObj.orgInfo) {
                        this.isPersonal = false;
                        this.isOrganization = true;
                    }
                }
            },
            mounted: function () {
                this.updateState();
            }
        });
        // 初始化首页
        this.startIndexNews();
        // 初始化学习平台与个人中心
        if (this.userInfo)
            this.startUserInterface();
        // 初始化组织生活
        if (this.orgInfo)
            this.startOrgInterface();
        // 退出按钮
        $(".logout").click(function () {
            openWindow("views/login.html", "login", {
                closePage: plus.webview.currentWebview()
            });
        });
        // 用于登陆后刷新页面底部标签
        document.addEventListener('updateFooterInfo', function () {
            idxObj.updateInfo();
            idxObj.footer.updateState();
            // 初始化学习平台与个人中心或者组织生活
            if (_this.userInfo)
                _this.startUserInterface();
            if (_this.orgInfo)
                _this.startOrgInterface();
            var loginPage = plus.webview.getWebviewById("login");
            if (loginPage)
                plus.webview.close(loginPage);
        });
    };
    Index.prototype.startIndexNews = function () {
        // banner头
        var banner = new Vue({
            el: ".index-swiper",
            data: {
                scrollNews: [],
                activeSlideText: "",
            },
            methods: {
                openNews: function (i) {
                    // 打开文章页详情
                    _set("newsId", i.id);
                    openWindow("views/newsDetail.html", "newsDetail");
                }
            }
        });
        // 获取新闻与推荐活动的最多数量
        var bannersLimit = 5;
        var newsLimit = 10;
        var activitiesLimit = 10;
        // 新闻与推荐活动列表
        var vm = new Vue({
            el: "#index",
            data: {
                news: [],
                activities: []
            },
            computed: {
                hasMoreNews: function () {
                    return this.news.length >= newsLimit;
                },
                hasMoreActivities: function () {
                    return this.activities.length >= activitiesLimit;
                }
            },
            methods: {
                getIndexContent: function () {
                    var _this = this;
                    // 获取新闻和推荐活动
                    _callAjax({
                        cmd: "multiFetch",
                        multi: _dump([
                            {
                                key: "banners",
                                sql: "select id, title, img, linkerId, readcnt, newsdate, subtitle from articles where ifValid = 1 and linkerId = " + linkerId.IndexNews + " and credit > 0 order by newsdate desc limit " + bannersLimit
                            },
                            {
                                key: "news",
                                sql: "select id, title, img, linkerId, readcnt, newsdate, subtitle from articles where ifValid = 1 and linkerId = " + linkerId.IndexNews + " and credit = 0 order by newsdate desc limit " + newsLimit
                            },
                            {
                                key: "activities",
                                // activityRecommend中的activityId需要unique
                                sql: "select activityId, v.title, v.img, o.name as orgName, strftime('%Y-%m-%d', logdate) as logtime from activityRecommend a, organization o, activitys v where a.activityId = v.id and a.orgNo = o.no order by a.logdate desc limit " + activitiesLimit
                            }
                        ])
                    }, function (d) {
                        _tell(d);
                        if (!d.success)
                            return;
                        if ("banners" in d.data && d.data.banners.length) {
                            banner.scrollNews = d.data.banners;
                            banner.activeSlideText = banner.scrollNews[0].title;
                            banner.$nextTick(function () {
                                new Swiper('.index-swiper', {
                                    pagination: '.swiper-pagination',
                                    observer: true,
                                    observerParents: false,
                                    onSlideChangeEnd: function (swiper) {
                                        banner.activeSlideText = banner.scrollNews[swiper.activeIndex].title;
                                    }
                                });
                            });
                        }
                        if ("news" in d.data && d.data.news.length) {
                            _this.news = d.data.news;
                        }
                        if ("activities" in d.data && d.data.activities.length) {
                            _this.activities = d.data.activities;
                        }
                    });
                },
                openNews: function (i) {
                    // 打开文章页详情
                    _set("newsId", i.id);
                    openWindow("views/newsDetail.html", "newsDetail");
                },
                openNewsList: function () {
                    // 打开文章列表
                    openWindow("views/newsList.html", "newsList", {
                        linkerId: linkerId.IndexNews
                    });
                },
                openActivities: function () {
                    // 打开推荐活动
                    openWindow("views/recommendList.html", "recommendList");
                }
            },
            mounted: function () {
                // 获取新闻和推荐活动列表
                this.getIndexContent();
            }
        });
    };
    Index.prototype.startUserInterface = function () {
        // 指向对象本身
        var idxObj = this;
        this.startStudy();
        this.startUserCenter();
    };
    Index.prototype.startStudy = function () {
        // 指向对象本身
        var idxObj = this;
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
                openStudyNews: function () {
                    openWindow("views/courseList.html", "courseList", {
                        lid: linkerId.News,
                        name: "党建动态",
                    });
                },
                openBranchAct: function () {
                    openWindow("views/courseList.html", "courseList", {
                        lid: linkerId.BranchActNews,
                        name: "支部活动"
                    });
                },
                openPublicNotice: function () {
                    openWindow("views/courseList.html", "courseList", {
                        lid: linkerId.PublicNotice,
                        name: "通知公告"
                    });
                },
                openHandCourse: function () {
                    openWindow('views/internetCourseList.html', 'internetList');
                },
                openBooks: function () {
                    openWindow("views/courseList.html", "courseList", {
                        lid: linkerId.Books,
                        name: "党建书屋"
                    });
                },
                openZhoushanNews: function () {
                    openWindow("views/courseList.html", "courseList", {
                        lid: linkerId.ZhoushanNews,
                        name: "关注舟山"
                    });
                },
                openCourse: function (i) {
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
            mounted: function () {
                var _this = this;
                // 获取推荐课程
                _hotAjax({
                    cmd: "hotest",
                    topn: 3,
                    hotn: 7
                }, function (d) {
                    if (d.success && d.data && d.data.length) {
                        _this.coursesRecommended = d.data;
                    }
                });
            }
        });
    };
    Index.prototype.startUserCenter = function () {
        // 指向类对象本省
        var idxObj = this;
        var vm = new Vue({
            el: "#ucenter",
            data: {
                userInfo: idxObj.userInfo,
                isAndroid: "Android" === plus.os.name,
                systemVersion: '',
                appVersion: plus.runtime.version,
            },
            computed: {
                isNew: function () {
                    return '' !== this.systemVersion && this.systemVersion === this.appVersion;
                }
            },
            methods: {
                checkPoints: function () {
                    openWindow("views/score.html", "score", {
                        tab: 0
                    });
                },
                checkCredit: function () {
                    openWindow("views/score.html", "score", {
                        tab: 1
                    });
                },
                openUcenter: function () {
                    openWindow('views/ucenter.html', 'ucenter');
                },
                openPost: function () {
                    openWindow("views/notice.html", "notice");
                },
                openMyStudy: function () {
                    openWindow("views/myStudy.html", "mystudy");
                },
                openMyActivities: function () {
                    openWindow("views/myActivity.html", "myactivity");
                },
                openApplication: function () {
                    openWindow("views/application.html", "application");
                },
                logout: function () {
                    openWindow("views/login.html", "logout");
                },
                clearCache: function () {
                    plus.cache.clear(function () {
                        mui.toast('已清理');
                    });
                },
                checkNewVersion: function () {
                    if (!this.isNew) {
                        mui.confirm('发现新版本v' + this.systemVersion + '，是否更新?', '', ['更新', '取消'], function (e) {
                            if (0 === e.index) {
                                mui.toast('请使用浏览器打开');
                                plus.runtime.openURL(
                                // 地址需要改变
                                'http://a.app.qq.com/o/simple.jsp?pkgname=com.xinlan.PTtele', function () {
                                    mui.toast('浏览器调用失败，请前往应用中心更新');
                                });
                            }
                        });
                    }
                    else {
                        mui.toast("已是最新版本");
                    }
                },
            },
            mounted: function () {
                var _this = this;
                //获取版本号
                _callAjax({
                    cmd: "fetch",
                    sql: "select version, downloadUrl from system"
                }, function (d) {
                    if (d.success && d.data && d.data.length) {
                        _this.systemVersion = d.data[0].version;
                    }
                });
            }
        });
    };
    Index.prototype.startOrgInterface = function () {
        // 指向对象本身
        var idxObj = this;
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
            },
            computed: {
                ifPartyBranch: function () {
                    // 判断是否为党支部
                    return "党支部" === idxObj.orgInfo.type;
                },
                categoryBtns: function () {
                    // 分类按钮
                    return _map(function (i) {
                        // 保留title原始数据
                        i.rawTitle = i.title;
                        // title加上活动数量
                        i.title += "(" + i.cnt + ")";
                        return i;
                    }, this.activityCategories).concat([
                        { title: "自定义主题" },
                        { title: "自定义编辑" },
                    ]);
                },
            },
            methods: {
                openNoticeList: function () {
                    // 打开通知列表
                    openWindow("views/newsList.html", "newsList", {
                        linkerId: linkerId.Notice,
                        orgNo: idxObj.orgInfo.no,
                        isAdmin: true
                    });
                },
                openNotice: function (i) {
                    openWindow("views/orgNoticeDetail.html", "orgNoticeDetail", {
                        aid: i.id,
                    });
                },
                openActivityCategories: function () {
                    var _this = this;
                    // 打开活动分类选择
                    plus.nativeUI.actionSheet({
                        title: "活动分类",
                        cancel: "取消",
                        buttons: this.categoryBtns
                    }, function (e) {
                        if (0 === e.index)
                            return;
                        var s = _this.categoryBtns[e.index - 1], sName = s.title;
                        if ("自定义主题" === sName) {
                            // CHECK
                            openWindow("views/topicUpload.html", "topicUpload", {
                                lid: linkerId.Activity,
                                orgNo: idxObj.orgInfo.no
                            });
                        }
                        else if ("自定义编辑" === sName) {
                            // CHECK
                            openWindow("views/topicList.html", "activityList", {
                                lid: linkerId.Activity,
                                name: "组织生活"
                            });
                        }
                        else {
                            openWindow("views/activityList.html", "activityList", {
                                lid: s.topicId,
                                title: s.title,
                                isAdmin: true
                            });
                        }
                    });
                },
                openTree: function () {
                    openWindow("views/tree.html", "tree", {
                        orgNo: idxObj.orgInfo.no
                    });
                },
                openMembers: function () {
                    openWindow("views/memberManage.html", "memberManage", {
                        orgNo: idxObj.orgInfo.no
                    });
                },
                openRules: function () {
                    openWindow("views/newsList.html", "newsList", {
                        linkerId: linkerId.Rules,
                        orgNo: idxObj.orgInfo.no,
                        isAdmin: true
                    });
                },
                openApprove: function () {
                    openWindow("views/approve.html", "approve");
                },
                changePswd: function () {
                    var pswd1, pswd2;
                    mui.confirm('<input type="password" id="changepswd" />', "输入新密码", ['确定', '取消'], function (e) {
                        var pswd = _trim($("#changepswd").val());
                        if (0 === e.index) {
                            if ('' === pswd) {
                                mui.toast("请输入密码");
                                return false;
                            }
                            else {
                                pswd1 = pswd;
                                mui.confirm('<input type="password" id="changepswd" />', "再次输入密码", ['确定', '取消'], function (e) {
                                    var pswd = _trim($("#changepswd").val());
                                    if (0 === e.index) {
                                        if ('' === pswd) {
                                            mui.toast("请输入密码");
                                            return false;
                                        }
                                        else {
                                            pswd2 = pswd;
                                            if (pswd1 != pswd2) {
                                                mui.toast("密码不一致，请重填");
                                                return false;
                                            }
                                            else {
                                                _callAjax({
                                                    cmd: "exec",
                                                    sql: "update organization set pswd = ? where no = ?",
                                                    vals: _dump([pswd1, idxObj.orgInfo.no])
                                                }, function (d) {
                                                    mui.toast("修改" + (d.success ? "成功" : "失败"));
                                                });
                                            }
                                        }
                                    }
                                }, 'div');
                            }
                        }
                    }, 'div');
                },
                openSummary: function (i) {
                    openWindow("views/summary.html", "summary", {
                        season: i + 1
                    });
                }
            },
            mounted: function () {
                var _this = this;
                var cateSql = "select l.id as topicId, l.name as title, count(ac.id) as cnt from linkers l left join activityCategories ac on ac.linkerId = l.id  where (orgNo = '" + idxObj.orgInfo.no + "' or orgId = 0) and refId = " + linkerId.Activity + " and l.ifValid = 1 group by l.id order by l.id";
                // 党支部以上均自行设置规则
                if ("党支部" !== idxObj.orgInfo.type)
                    cateSql = "select l.id as topicId, l.name as title, count(ac.id) as cnt from linkers l left join activityCategories ac on ac.linkerId = l.id  where orgNo = '" + idxObj.orgInfo.no + "' and refId = " + linkerId.Activity + " and l.ifValid = 1 group by l.id order by l.id";
                _callAjax({
                    cmd: "multiFetch",
                    multi: _dump([
                        {
                            key: "notices",
                            sql: "select id, title, strftime('%Y-%m-%d', logtime) as logtime from articles where reporter = '" + idxObj.orgInfo.no + "' and linkerId = " + linkerId.Notice + " and ifValid = 1 order by logtime desc limit 3",
                        },
                        {
                            key: "activityCategories",
                            sql: cateSql
                        }
                    ])
                }, function (d) {
                    if (!d.success || !d.data)
                        return;
                    if ("notices" in d.data && d.data.notices) {
                        _this.notices = d.data.notices;
                        _this.$nextTick(function () {
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
                        _this.activityCategories = d.data.activityCategories;
                    }
                });
                // 获取支部考核统计信息
                if (this.ifPartyBranch) {
                    _summaryAjax({
                        cmd: "summary",
                        orgNo: idxObj.orgInfo.no
                    }, function (d) {
                        if (d.success)
                            _this.seasonSummaries = d.data;
                    });
                }
            }
        });
    };
    return Index;
}());
if (window.plus) {
    (new Index()).start();
}
else {
    document.addEventListener('plusready', function () {
        (new Index()).start();
    }, false);
}
