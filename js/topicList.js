function plusReady() {
    var vm = new Vue({
        el: "#topicList",
        data: {
            topics: [],
            isAdmin: false
        },
        methods: {
            goToActivity: function(i) {
                var self = this;
                openWindow("activityList.html", "activityList", {
                    lid: i.id,
                    title: i.name,
                    isAdmin: self.isAdmin
                });
            },
            editTopic: function(i) {
                openWindow("topicUpload.html", "topicUpload", {
                    lid: lid,
                    orgNo: orgNo,
                    tid: i.id
                });
            },
            delTopic: function(i, idx) {
                var self = this;
                mui.confirm("确定删除？", "提示", ["是", "否"], function(e) {
                    if (e.index == 0) {
                        _callAjax({
                            cmd: "exec",
                            sql: "update linkers set ifValid = 0 where id = ?",
                            vals: _dump([i.id,])
                        }, function(d) {
                            mui.toast("删除"+(d.success?"成功":"失败"));
                            self.topics = _del_ele(self.topics, idx);
                        });
                    }
                });
            }
        }
    });

    var userInfoStr = _get("userInfo"),
        userInfo = _load(userInfoStr),
        orgNo = userInfo.userType?userInfo.no:userInfo.orgNo,
        wb = plus.webview.currentWebview(),
        lid = wb.lid,
        mname = wb.name;
    $(".mui-title").text(mname);
    // 设置编辑、删除按钮是否显示
    vm.isAdmin = !!parseInt(userInfo.userType);

    // 子组织打开模式
    if ("isSub" in wb) {
        orgNo = wb.orgNo;
        vm.isAdmin = false;
    }
    
    // 管理员显示新增
    if (vm.isAdmin) {
        $("#operate").show();
    } else {
        $("#operate").hide();
    }
    var getTopics = function() {
        _callAjax({
            cmd: "fetch",
            // orgId为0的是分发型专题
            sql: "select id, name, img from linkers where (orgId = ? or orgId = 0) and refId = ? and ifValid = 1 order by id desc",
            vals: _dump([orgNo, lid])
        }, function(d) {
            if (d.success && d.data && d.data.length) {
                d.data.forEach(function(i) {
                    vm.topics.push(i);
                });
            }
        });
    };
    getTopics();

    // 新增
    $("#operate").click(function() {
        openWindow("topicUpload.html", "topicUpload", {
            lid: lid,
            orgNo: orgNo
        });
    });

    /*
    $("#operate").click(function() {
    	var btnArray = [{
			title: "查看模式",
		}, {
			title: "新增模式"
		}, {
			title: "编辑模式"
		}];
		plus.nativeUI.actionSheet({
			title: "操作",
			cancel: "取消",
			buttons: btnArray
		}, function(e) {
			var index = e.index;
			switch(index) {
				case 0:
					break;
				case 1:
					openWindow("topicUpload.html", "topicUpload", {
			            lid: lid,
			            orgNo: userInfo.id
			        });
					break;
				case 2:
					break;
            };
		});
    });
    */
    
    // 新增后刷新
    window.addEventListener("refresh", function(event) {
        vm.topics = [];
        getTopics(lid);
    });
};

// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}
