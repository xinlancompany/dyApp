(function() {
    var plusReady = function() {
    		var vm = new Vue({
    			el: "#newUser",
    			data: {
    				name: "",
    				sex: "男",
    				idno: "",
    				phone: "",
    				img: "",
    				imgStyle: {
    					backgroundImage: ""
    				},
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
						idno = _trim(self.idno),
						phone = _trim(self.phone);
						
					if (!name) return mui.toast("请填写姓名");
					if (!idno || idno.length != 18) return mui.toast("请正确填写身份证");
					if (!phone || phone.length != 11) return mui.toast("请正确填写手机号码");

					_callAjax({
						cmd: "exec",
						sql: "insert into user(name, idNo, sex, phone, img, orgNo, orgName) values(?,?,?,?,?,?,?)",
						vals: _dump([name,idno,self.sex,phone,self.img, self.userInfo.no,self.userInfo.name])
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
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());
