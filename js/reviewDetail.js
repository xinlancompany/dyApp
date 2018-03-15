(function() {
    var plusReady = function() {
        var vm = new Vue({
            el: "#review",
            data: {
                title: "",
                content: "",
                imgs: [],
            },
            methods: {
            	openGallery: function() {
					plus.nativeUI.previewImage(this.imgs,{'current': 0, 'loop': true})
            	}
            }
        });

        var wb = plus.webview.currentWebview();
        var arr = ["title", "content", "imgs"]; 
        arr.forEach(function(k, i) {
            vm[k] = wb[k];
        });

        if (!wb.isAdmin) {
            $("#permit").hide();
        } else {
            if (wb.permitted) $("#permit").text("驳回");
            $("#permit").click(function() {
                var tag = wb.permitted?"驳回":"通过";
                mui.confirm("确定"+tag+"？", "提示", ["是","否"], function(e) {
                    if (e.index == 0) {
                        _callAjax({
                            cmd: "exec",
                            sql: "update activityEnroll set experiencePermitted = "+(wb.permitted?0:1)+" where id =?",
                            vals: _dump([wb.idx,])
                        }, function(d) {
                            mui.toast(tag+(d.success?"成功":"失败"));
                            if(d.success) {
                                mui.fire(plus.webview.getWebviewById("activityExperiences"), "refresh");
                                mui.back();
                            }
                        });
                    }
                })
            });
        }
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());
