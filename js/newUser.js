(function() {
    var plusReady = function() {
    		var vm = new Vue({
    			el: "#newUser",
    			data: {
    				id: 0,
    				name: "",
    				sex: "男",
    				idNo: "",
    				phone: "",
    				img: "",
    				imgStyle: {
    					backgroundImage: ""
    				},
    				reason: "党员发展"
    			},
    			watch: {
    				id: function(i) {
    					if (!i) return;
    					var self = this;
    					_callAjax({
    						cmd: "fetch",
    						sql: "select name, sex, idNo, phone, img, reason from user where id = ?",
    						vals: _dump([i,])
    					}, function(d) {
    						if (d.success && d.data) {
    							var inf = d.data[0];
    							["name", "sex", "idNo", "phone", "img", "reason"].forEach(function(d) {
								self[d] = inf[d];
    							});
							self.imgStyle.backgroundImage = "url("+self.img+")";
    						}
    					});
    				}
    			},
    			methods:{
				uploadImg: function(evt) {
					var self = this;
					plus.nativeUI.showWaiting('上传中...')
					uploadImage("users", evt, function(r) {
						plus.nativeUI.closeWaiting();
						self.img = serverAddr+'/upload/pic/users/'+r.thumb;
						self.imgStyle.backgroundImage = "url("+self.img+")";
					});
				},
				changeSex: function() {
					var self = this;
					var buttons = [
						{
                            title: "男"
						},
						{
                            title: "女"
						},
                    ];
					plus.nativeUI.actionSheet({
						title: "性别",
						cancel: "取消",
						buttons: buttons
					}, function(e) {
						if (e.index == 0) return;
						var name = buttons[e.index-1].title;
						self.sex = name;
					});
				},
				newUser: function() {
					var self = this,
						name = _trim(self.name),
						idNo = _trim(self.idNo),
						phone = _trim(self.phone);
						
					if (!name) return mui.toast("请填写姓名");
					if (!idNo || idNo.length != 18) return mui.toast("请正确填写身份证");
					if (!phone || phone.length != 11) return mui.toast("请正确填写手机号码");

//					ifvalid为－1时,为待上级审核
					var sql = "insert into user(name, idNo, sex, phone, img, orgNo, orgName, reason, ifValid) values(?,?,?,?,?,?,?,?,?)",
						vals = _dump([name,idNo,self.sex,phone,self.img, self.userInfo.no,self.userInfo.name,self.reason,-1]);
					if (self.id) {
						sql = "update user set name = ?, idNo = ?, sex = ?, phone = ?, img = ?, reason = ? where id = ?";
						vals = _dump([name,idNo,self.sex,phone,self.img,self.reason,self.id]);
					}
					_callAjax({
						cmd: "exec",
						sql: sql,
						vals: vals
					}, function(d) {
						if (d.success && d.data) {
							mui.toast("添加成功");
							mui.fire(plus.webview.getWebviewById('memberManage'), 'updateUsers');
							setTimeout(function() {
								mui.back();
							}, 1500);
						}
					});
				},
    			},
    			created: function() {
    				this.userInfo = _load(_get("userInfo"));
    			}
    		});

		var wb = plus.webview.currentWebview();
		if ("uid" in wb) vm.id = wb.uid;
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());
