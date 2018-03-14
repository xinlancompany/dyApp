function plusReady() {
    var vm = new Vue({
        el: "#topicList",
        data: {
            topics: [],
            userType: 0
        },
        methods: {
            goToActivity: function(i) {
                openWindow("activityList.html", "activityList", {
                    lid: i.id,
                    title: i.name
                });
            }
        }
    });

    var userInfoStr = _get("userInfo"),
        userInfo = _load(userInfoStr),
        orgId = userInfo.userType?userInfo.id:userInfo.orgNo,
        wb = plus.webview.currentWebview(),
        lid = wb.lid,
        mname = wb.name;
    $(".mui-title").text(mname+"列表");
    // 设置编辑、删除按钮是否显示
    vm.userType = parseInt(userInfo.userType);
    // 管理员显示新增
    if (!!userInfoStr && !!parseInt(userInfo.userType)) {
        $("#operate").show();
    } else {
        $("#operate").hide();
    }
    var getTopics = function() {
        _callAjax({
            cmd: "fetch",
            sql: "select id, name, img from linkers where orgId = ? and refId = ? and ifValid = 1 order by id desc",
            vals: _dump([orgId, lid])
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
            orgNo: userInfo.id
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
        // alert("rth");
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
