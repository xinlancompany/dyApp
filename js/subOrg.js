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
                },
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
                        orgId: wb.orgId,
                        isAdmin: false
                    });
                },
                openActivityChoices: function() {
					// 打开活动分类选择
					var self = this,
                        buttons = _map(function(i) {
                            return {
                                title: i.title
                            };
                        }, self.activityCategories);
					plus.nativeUI.actionSheet({
						title: "活动分类",
						cancel: "取消",
						buttons: buttons
					}, function(e) {
						if (0 === e.index) return;
						var r = buttons[e.index-1],
							sName = r.title,
							topicId = self.categoryDict[sName];
						openWindow("activityList.html", "activityList", {
							lid: topicId,
							title: sName,
							isAdmin: true,
							isSub: true,
							orgId: wb.orgId
						});
					});
                },
                _openActivityChoices: function() {
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
//                      if (e.index == 0) return;
//                      var name = buttons[e.index-1].title,
//                          lid = self.categoryDict[name];
//                      openWindow('topicList.html', 'topicList', {
//                          lid: lid,
//                          name: name,
//                          isSub: true,
//                          orgNo: wb.orgNo
//                      });
                    });
                },
                goBack: function() {
                    mui.back();
                },
				openActicityTopics: function(lid, name) {
					var self = this;
					_callAjax({
						cmd: "fetch",
						sql: "select id as topicId, name as title from linkers where (orgNo = ? or orgNo = '') and refId = ? and ifValid = 1 order by id",
						vals: _dump([wb.orgNo, lid])
					}, function(d) {
						var buttons = [];
						if (d.success && d.data && d.data.length) {
							buttons = d.data;
						}
						plus.nativeUI.actionSheet({
							title: name+"主题",
							cancel: "取消",
							buttons: buttons
						}, function(e) {
							if (e.index == 0) return;
							var i = buttons[e.index-1];
							openWindow("activityList.html", "activityList", {
								lid: i.topicId,
								title: i.title,
								isAdmin: self.isAdmin,
								isSub: true,
								orgId: wb.orgId
							});
						});
					});
				},
            },
            mounted: function() {
                var self = this;
				var cateSql = "select l.id as topicId, l.name as title, count(ac.id) as cnt from linkers l left join activityCategories ac on ac.linkerId = l.id  where (orgNo = '"+wb.orgNo+"' or orgNo = '') and refId = "+linkerId.Activity+" and l.ifValid = 1 group by l.id order by l.id";
				// 党支部以上均自行设置规则
				if ("党支部" !== wb.orgType) cateSql = "select l.id as topicId, l.name as title, count(ac.id) as cnt from linkers l left join activityCategories ac on ac.linkerId = l.id  where orgNo = '"+wb.orgNo+"' and refId = "+linkerId.Activity+" and l.ifValid = 1 group by l.id order by l.id";
                _callAjax({
                    cmd: "fetch",
                    sql: cateSql
                }, function(d) {
                    if (d.success && d.data && d.data.length) {
                        d.data.forEach(function(i) {
                            self.categoryDict[i.title] = i.topicId;
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
                            sql: "select count(*) cnt from activityEnroll where activityId in (select id from activitys where linkerId in (select id from linkers where orgNo = "+wb.orgNo+"))"
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
            observer: true,
        });
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}())
