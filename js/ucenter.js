mui.init({
});
// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	var ucenter = new Vue({
		el: '#ucenter',
		data: {
			userInfo:{},
		},
		computed: {
			userImg: function() {
				var img = "../img/organization.jpg";
				if ("img" in this.userInfo && !!this.userInfo.img) {
					img = this.userInfo.img;
				}
				return {
					"background-image": 'url('+img+')',
				};
			}
		},
		methods: {
			getInfo: function(){
				var self = this;
				
				var userInfo = _load(_get('userInfo'));
				_callAjax({
					cmd:"fetch",
					sql: "select u.id, u.name, u.idNo, u.img, o.name as orgName, orgNo, o.id as orgId from User u, organization o where u.orgNo = o.no and u.ifValid = 1 and u.id = ?",
					vals:_dump([userInfo.id])
				}, function(d) {
					if(d.success && d.data){
						self.userInfo = d.data[0];
					}
				});
			},

			// 更新头像
			uploadImg: function(evt) {
				// alert("rth");
				var self = this;
				plus.nativeUI.showWaiting('上传中...')
				uploadImage("users", evt, function(r) {
					plus.nativeUI.closeWaiting();
					self.userInfo.img = serverAddr+'/upload/pic/users/'+r.thumb;
                    _callAjax({
                    	cmd: "exec",
                    	sql: "update user set img = ? where id = ?",
                    	vals: _dump([self.userInfo.img, self.userInfo.id])
                    }, function(d) {
						if (d.success) {
							_set("userInfo", _dump(self.userInfo));
							mui.fire(plus.webview.getWebviewById('index'), 'updateUserInfo');
						}
                    });
				});
			},

            // 更改密码
            changePswd: function() {
                var self = this;
                var pswd1, pswd2;
                mui.confirm('<input type="password" id="changepswd" />', "输入新密码", ['确定', '取消'], function(e) {
                    var pswd = _trim($("#changepswd").val());
                    if (e.index == 0) {
                        if (pswd == '') {
                            mui.toast("请输入密码");
                            return false;
                        } else {
                            pswd1 = pswd;
                            mui.confirm('<input type="password" id="changepswd" />', "再次输入密码", ['确定', '取消'], function(e) {
                                var pswd = _trim($("#changepswd").val());
                                if (e.index == 0) {
                                    if (pswd == '') {
                                        mui.toast("请输入密码");
                                        return false;
                                    } else {
                                        pswd2 = pswd;
                                        if (pswd1 != pswd2) {
                                            mui.toast("密码不一致，请重填");
                                            return false;
                                        } else {
                                            _callAjax({
                                                cmd: "exec",
                                                sql: "update user set pswd = ? where id = ?",
                                                vals: _dump([pswd1, self.userInfo.id])
                                            }, function(d) {
                                                mui.toast("修改"+(d.success?"成功":"失败"));
                                            });
                                        }
                                    }
                                }
                            }, 'div');
                        }
                    }
                }, 'div');
            }
			
		},
		mounted: function() {
			var self = this;
			
		}
	});

    /*
    window.addEventListener("updateUserInfo", function(evt) {
        ucenter.getInfo();
    });
    */

	ucenter.getInfo();
}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}
