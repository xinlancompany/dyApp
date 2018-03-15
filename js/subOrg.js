(function() {
    var plusReady = function() {
        var wb = plus.webview.currentWebview();
        $(".mui-title").text(wb.orgName);

        var vm = new Vue({
            el: "#subOrg",
            data: {
                activityCategories: [],
                categoryDict: {}
            },
            methods: {
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
            },
        });

        var noticeSwiper = new Swiper('.notice-swiper', {
            autoplay: 1500,
            loop: true,
        });
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}())
