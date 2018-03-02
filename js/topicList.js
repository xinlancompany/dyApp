function plusReady() {
    var vm = new Vue({
        el: "#topicList",
        data: {
            topics: []
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
    $(".mui-title").text(mname+" 专题列表");
    // 管理员显示新增
    if (!!userInfoStr && !!parseInt(userInfo.userType)) {
        $("#newTopic").show();
    } else {
        $("#newTopic").hide();
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
    // 点击打开新增页面
    $("#newTopic").click(function() {
        openWindow("topicUpload.html", "topicUpload", {
            lid: lid,
            orgNo: userInfo.id
        });
    });
    
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
