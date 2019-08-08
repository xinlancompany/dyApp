(function() {
	var plusReady = function() {
		var vm = new Vue({
			el: "#forget",
			data: {
				codeTag: "获取验证码",
				sendPhone: "",
				phone: "",
				pswd1: "",
				pswd2: "",
				timeleft: 0,
				code: "",
				serverCode: "",
			},
			watch: {
				timeleft: function(i) {
					this.codeTag = this.timeleft > 0 ? this.timeleft : "获取验证码";
				}
			},
			methods: {
				sendCode: function() {
					var self = this,
						phone = _trim(self.phone);
					if (!phone || phone.length != 11) return mui.toast('请输入正确手机号码');
					if (this.timeleft > 0) return;
					_smsAjax({
						cmd: "sms",
						phone: self.phone
					}, function(d) {
						mui.toast(d.errMsg);
						if (d.success) {
							self.sendPhone = self.phone;
							self.serverCode = d.data.code;
							self.timeleft = 60;
							var tm = setInterval(function() {
								self.timeleft -= 1;
								if (self.timeleft <= 0) clearInterval(tm);
							}, 1000)
						}
					});
				},
				resetPswd: function() {
					var self = this,
						phone = _trim(self.phone),
						pswd1 = _trim(self.pswd1),
						pswd2 = _trim(self.pswd2),
						code = _trim(self.code);

					if (!self.sendPhone) return mui.toast("请获取验证码");
					if (self.phone != phone) return mui.toast("手机号码发生变化，请重新获取验证码");
					if (!pswd1) return mui.toast("请输入新密码");
					if (!pswd2) return mui.toast("请再次输入密码");
					if (pswd1 != pswd2) return mui.toast("两次密码输入不一致");
					if (!code) return mui.toast("请再次验证码");
					if (code != self.serverCode) return mui.toast("验证码不一致");

					_callAjax({
						cmd: "exec",
						sql: "update User set pswd = ? where phone = ?",
						vals: _dump([pswd1, self.sendPhone])
					}, function(d) {
						mui.toast("重置"+(d.success?"成功":"失败"));
						if (d.success) {
							setTimeout(function() {
								mui.back();
							}, 1500);
						}
					});
				}
			}
		});
	};

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());
