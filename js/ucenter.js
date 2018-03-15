mui.init({
});
// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	var ucenter = new Vue({
		el: '#ucenter',
		data: {
			userInfo:{},
		},
		methods: {
			getInfo: function(){
				var self = this;
				
				var userInfo = _load(_get('userInfo'));
				_tell(userInfo);
				_callAjax({
					cmd:"fetch",
					sql:"select u.id, u.name, u.idNo, u.img, o.name as orgName from User u, organization o where u.orgNo = o.no and u.ifValid = 1 and u.id = ?",
					vals:_dump([userInfo.id])
				}, function(d) {
					if(d.success && d.data){
						self.userInfo = d.data[0];
					}
				})
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
