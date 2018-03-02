function plusReady() {
    var upload = new Vue({
        el: "#topicUpload",
        data: {
            lid: 0,
            title: "",
            orgNo: "",
            content: "",
            imgStyle: {
                backgroundImage: ""
            }
        },
        methods: {
            uploadImg: function(evt) {
				var self = this;
				plus.nativeUI.showWaiting('上传中...')
				uploadImage("activitySortAdd", evt, function(r) {
					plus.nativeUI.closeWaiting();
					self.img = serverAddr+'/upload/pic/activitySortAdd/'+r.thumb;
                    _tell("img: ---> "+self.img);
                    self.imgStyle.backgroundImage = "url("+self.img+")";
				});
            },
            newTopic: function() {
                var title = _trim(this.title),
                    content = _trim(this.content);

                if (!title) return mui.toast("请填写标题");
                if (!content) return mui.toast("请填写简介");
                if (!this.img) return mui.toast("请上传头图");
                
                var self = this;
                _callAjax({
                    cmd: "exec",
                    sql: "insert into linkers(name, img, brief, refid, orgid) values(?,?,?,?,?)",
                    vals: _dump([title, self.img, content, self.lid, self.orgNo])
                }, function(d) {
                    // 返回并刷
                    if (d.success) {
                        mui.toast("添加成功");
                        mui.fire(plus.webview.getWebviewById("topicList"), "refresh", {
                            linkerId: self.lid
                        });
                    } else {
                        mui.toast("添加失败");
                    }
                    mui.back();
                });
            }
        },
        created: function() {

        }
    });

    var wb = plus.webview.currentWebview();
    upload.lid = wb.lid;
    upload.orgNo = wb.orgNo;
};

if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

