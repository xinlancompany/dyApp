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
            },
            img: "",
            tid: null,
            cmdTxt: "添加",
        },
        watch: {
            tid: function(i) {
                if (!i) {
                    $(".mui-title").text("添加主题");
                    return;
                }
                var self = this;
                self.cmdTxt = "更新";
                $(".mui-title").text("更新主题");
                _callAjax({
                    cmd: "fetch",
                    sql: "select name, img, brief from linkers where id = ?",
                    vals: _dump([self.tid,])
                }, function(d) {
                    if (!d.success || !d.data || !d.data.length) {
                        mui.back();
                        mui.toast("专题信息获取出错");
                        return;
                    }
                    self.title = d.data[0].name;
                    self.img = d.data[0].img;
                    self.content = d.data[0].brief;
                    self.imgStyle.backgroundImage = "url("+d.data[0].img+")";
                });
            }
        },
        methods: {
            uploadImg: function(evt) {
				var self = this;
				plus.nativeUI.showWaiting('上传中...')
				uploadImage("activitySortAdd", evt, function(r) {
					plus.nativeUI.closeWaiting();
					self.img = serverAddr+'/upload/pic/activitySortAdd/'+r.thumb;
                    // _tell("img: ---> "+self.img);
                    self.imgStyle.backgroundImage = "url("+self.img+")";
				});
            },
            newTopic: function() {
                var title = _trim(this.title),
                    content = _trim(this.content);

                if (!title) return mui.toast("请填写标题");
                if (!content) return mui.toast("请填写简介");
                if (!this.img) return mui.toast("请上传头图");
                
                var self = this,
                    sql = "insert into linkers(name, img, brief, refid, orgid) values(?,?,?,?,?)",
                    vals = _dump([title, self.img, content, self.lid, self.orgNo]);
                if (self.tid) {
                    sql = "update linkers set name = ?, img = ?, brief = ? where id = ?";
                    vals = _dump([title, self.img, content, self.tid]);
                }
                _callAjax({
                    cmd: "exec",
                    sql: sql,
                    vals: vals
                }, function(d) {
                    // 返回并刷
                    if (d.success) {
                        mui.toast((self.tid?"修改":"添加")+"成功");
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
    if ("tid" in wb) {
        upload.tid = wb.tid;
    }
};

if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

