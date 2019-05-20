(function() {
    var plusReady = function() {
        var wb = plus.webview.currentWebview();
        var userInfo = _load(_get("userInfo"));

        var vm = new Vue({
            el: "#recordUpload",
            data: {
                title: "",
                experience: "",
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
                uploadExperience: function() {
                    var experience = _trim(this.experience),
                        title = _trim(this.title);
                    if (!title) return mui.toast("请填写心得标题");
                    if (!experience) return mui.toast("请填写心得内容");
                    if (!this.img1 && !this.img2 && !this.img3) return mui.toast("请上传至少一张照片");

                    var self = this;
                    _callAjax({
                        cmd: "exec",
                        sql: "update activityEnroll set experienceTitle = ?, experience = ?, imgs = ?, experienceTime = ? where userId = ? and activityId = ?",
                        vals: _dump([title, experience, _dump([self.img1, self.img2, self.img3]), _now(), userInfo.id, wb.aid])
                    }, function(d) {
                        if (d.success) {
                            mui.toast("上传成功");
                            setTimeout(function() {
                                mui.back();
                            }, 1000);
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
            sql: "select experienceTitle, experience, imgs, experiencePermitted from activityEnroll where userId = ? and activityId = ?",
            vals: _dump([userInfo.id, wb.aid,])
        }, function(d) {
            if (d.success && d.data && d.data.length) {
            	if (d.data[0].imgs) {
            		var imgs = _load(d.data[0].imgs);
					[1,2,3].forEach(function(i) {
						vm["img"+i] = imgs[i-1];
						vm["imgStyle"+i].backgroundImage = "url("+imgs[i-1]+")";
					});
				}
                vm.experience = d.data[0].experience;
                vm.title = d.data[0].experienceTitle;
            }
        });
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());
