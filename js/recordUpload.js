(function() {
    var plusReady = function() {
        var wb = plus.webview.currentWebview();

        var vm = new Vue({
            el: "#recordUpload",
            data: {
                record: "",
                img1: "",
                img2: "",
                img3: "",
                imgStyle1: {
                    backgroundImage: ""
                },
                imgStyle2: {
                    backgroundImage: ""
                },
                imgStyle3: {
                    backgroundImage: ""
                },
            },
            methods: {
                uploadImg1: function(evt) {
                    var self = this;
                    plus.nativeUI.showWaiting('上传中...')
                    uploadImage("activitySortAdd", evt, function(r) {
                        plus.nativeUI.closeWaiting();
                        self.img1 = serverAddr+'/upload/pic/activitySortAdd/'+r.thumb;
                        self.imgStyle1.backgroundImage = "url("+self.img1+")";
                    });
                },
                uploadImg2: function(evt) {
                    var self = this;
                    plus.nativeUI.showWaiting('上传中...')
                    uploadImage("activitySortAdd", evt, function(r) {
                        plus.nativeUI.closeWaiting();
                        self.img2 = serverAddr+'/upload/pic/activitySortAdd/'+r.thumb;
                        self.imgStyle2.backgroundImage = "url("+self.img2+")";
                    });
                },
                uploadImg3: function(evt) {
                    var self = this;
                    plus.nativeUI.showWaiting('上传中...')
                    uploadImage("activitySortAdd", evt, function(r) {
                        plus.nativeUI.closeWaiting();
                        self.img3 = serverAddr+'/upload/pic/activitySortAdd/'+r.thumb;
                        self.imgStyle3.backgroundImage = "url("+self.img3+")";
                    });
                },
                uploadRecord: function() {
                    var record = _trim(this.record);
                    if (!record) return mui.toast("请填写记录内容");
                    if (!this.img1 && !this.img2 && !this.img3) return mui.toast("请上传至少一张照片");

                    var self = this;
                    _callAjax({
                        cmd: "exec",
                        sql: "update activitys set record = ?, recordImgs = ?, recordTime = ? where id = ?",
                        vals: _dump([record, _dump([self.img1, self.img2, self.img3]), _now(), wb.aid])
                    }, function(d) {
                        if (d.success) {
                            mui.toast("上传成功");
                            mui.fire(plus.webview.getWebviewById("activeDetail"), "refresh", {
                                aid: wb.aid
                            });
                            mui.back();
                        } else {
                            mui.toast("上传失败");
                        }
                    });
                }
            }
        });

        // 获取信息
        _callAjax({
            cmd: "fetch",
            sql: "select record, recordImgs from activitys where id = ?",
            vals: _dump([wb.aid,])
        }, function(d) {
            if (d.success && d.data && d.data.length) {
                var imgs = _load(d.data[0].recordImgs);
                [1,2,3].forEach(function(i) {
                    vm["img"+i] = imgs[i-1];
                    vm["imgStyle"+i].backgroundImage = "url("+imgs[i-1]+")";
                });
                vm.record = d.data[0].record;
            }
        });
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());
