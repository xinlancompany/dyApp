(function() {
    var plusReady = function() {
        var wb = plus.webview.currentWebview();
        $(".mui-title").text(wb.orgName);

        var vm = new Vue({
            el: "#subOrg",
            data: {
                activityCategories: [],
                categoryDict: {},
                notices: [],
                summary: {
                    activity: 0,
                    member: 0
                }
            },
            methods: {
                openNotice: function(i) {
                    var wb = plus.webview.getWebviewById("newsDetail");
                    if (!!wb) {
                        // 预加载成功
                        _set("newsId", i.id)
                        mui.fire(wb, "newsId");
                        openWindow("newsDetail.html", "newsDetail");
                    } else {
                        // 预加载失败
                        _set("newsId", "");
                        openWindow("newsDetail.html", "newsDetail", {
                            aid: i.id,
                            table: "articles"
                        });
                    }
                },
                openNotices: function() {
                    var self = this;
                    openWindow("newsList.html", "newsList", {
                        linkerId: linkerId.Notice,
                        orgNo: wb.orgNo,
                        isAdmin: false,
                    });
                },
                openRules: function() {
                    var self = this;
                    openWindow("newsList.html", "newsList", {
                        linkerId: linkerId.Rules,
                        orgNo: wb.orgNo,
                        isAdmin: false,
                    });
                },
                openMembers: function() {
                    var self = this;
                    openWindow("memberManage.html", "memberManage", {
                        orgNo: wb.orgNo,
                        isAdmin: false
                    });
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
                        openWindow('topicList.html', 'topicList', {
                            lid: lid,
                            name: name,
                            isSub: true,
                            orgNo: wb.orgNo
                        });
                    });
                },
                goBack: function() {
                    mui.back();
                }
            },
            mounted: function() {
                var self = this;
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

                // 通知
                _callAjax({
                    cmd: "fetch",
                    sql: "select id, title, strftime('%Y-%m-%d', logtime) as logtime from articles where reporter = ? and linkerId = ? and ifValid = 1 limit 3",
                    vals: _dump([wb.orgNo, linkerId.Notice])
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
                            sql: "select count(*) as cnt from activitys where linkerId in (select id from linkers where orgId ="+parseInt(wb.orgNo)+")"
                        },
                        {
                            key: "member",
                            sql: "select count(*) cnt from activityEnroll where activityId in (select id from activitys where linkerId in (select id from linkers where orgId = "+parseInt(wb.orgNo)+"))"
                        }
                    ])
                }, function(d) {
                    // alert(_dump(d));
                    self.summary.activity = d.data.activity[0].cnt;
                    self.summary.member = d.data.member[0].cnt;
                });
            },
        });

        var noticeSwiper = new Swiper('.notice-swiper', {
            autoplay: 2000,
            loop: true,
            observeParents: false,
            observer: true,
        });
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}())
