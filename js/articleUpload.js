function plusReady() {
    var upload = new Vue({
        el: "#articleUpload",
        data: {
            lid: 0,
            title: "",
            reporter: "",
            content: "",
            articleDate: "",
            img: "",
            imgStyle: {
                backgroundImage: ""
            }
        },
        methods: {
            uploadImg: function(evt) {
				var self = this;
				plus.nativeUI.showWaiting('上传中...')
				uploadImage("articleRulesAdd", evt, function(r) {
					plus.nativeUI.closeWaiting();
					self.img = serverAddr+'/upload/pic/articleRulesAdd/'+r.thumb;
                    _tell("img: ---> "+self.img);
                    self.imgStyle.backgroundImage = "url("+self.img+")";
				});
            },
            newArticle: function() {
                var title = _trim(this.title),
                    reporter = _trim(this.reporter),
                    content = _trim(this.content);
                this.articleDate = $("#ruleDate").text();

                if (!title) return mui.toast("请填写标题");
                if (!reporter) return mui.toast("请填写来源");
                if (!content) return mui.toast("请填写内容");
                if (!this.img) return mui.toast("请上传头图");
                if (!this.articleDate) return mui.toast("请选择日期");
                
                var self = this;
                _callAjax({
                    cmd: "exec",
                    sql: "insert into articles(title, content, img, reporter, newsdate, linkerId) values(?,?,?,?,?,?)",
                    vals: _dump([title, content, self.img, reporter, self.articleDate, self.lid])
                }, function(d) {
                    // 返回并刷
                    if (d.success) {
                        mui.toast("添加成功");
                        mui.fire(plus.webview.getWebviewById("newsList"), "refresh", {
                            linkerId: self.lid
                        });
                    } else {
                        mui.toast("添加失败");
                    }
                    mui.back();
                });
            },
            changeDate() {
            	plus.nativeUI.pickDate( function(e){
					var d = e.date;
					console.log( "选择的日期："+d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate() );
				},function(e){
					console.log( "未选择日期："+e.message );
				});
            }
        },
        created: function() {

        }
    });

    var wb = plus.webview.currentWebview();
    upload.lid = wb.lid;
    if ("title" in wb) {
        $(".mui-title").text(wb.title);
    }
    $("#ruleDate").text(_now().split(" ")[0]);
};

if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

