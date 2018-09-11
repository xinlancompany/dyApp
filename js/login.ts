// login.html

declare function _get(n: string): string;
declare function _set(n: string, d: string): void;
declare function _load(n: string): any;
declare function _filter(f: any, n: [any]): [any];
declare function _map(f: any, n: [any]): [any];
declare function _trim(s: string): string;
declare function _dump(d: [any]): string;
declare function _now(): string;
declare function openWindow(f: string, n: string): void;
declare function _callAjax(params: any, f: (d: any) => void): void;
declare function _genCallAjax(addr: string): any;
declare function _androidClose(s: any): void;

declare var plus: any;
declare var mui: any;
declare var Vue: any;

class Login{
	userInfo: any;
	orgInfo: any;
	wb: any;
	firstClickTimestamp: number;

	
	constructor() {
		// 清空localstorage中的用户信息
		_set("userInfo", "");
		_set("orgInfo", "");

		// 重载安卓系统的返回, 双击间隔小于1秒则退出
		if ('Android' == plus.os.name) {
			mui.back = () => {
				_androidClose(this);
			}
		}

		// 关闭前一页面，防止滑动页面退回
		window.addEventListener("closeBoot", () => {
			// 关闭boot页面
			plus.webview.close(plus.webview.getLaunchWebview());
			// 关闭index页面
			plus.webview.close(plus.webview.getWebviewById("index"));
		});

		// 获取当前webview页面对象，其中包含登陆类型信息
		this.wb = plus.webview.currentWebview();

		//预加载页面
		let idxPage = plus.webview.getWebviewById("index");
		if (!!idxPage) {
			_delayClose(idxPage, 500, () => {
				this.preloadIndex()
			});
		} else {
			this.preloadIndex()
		}
	}

	preloadIndex() {
		mui.preload({
			url: '../index.html',
			id: 'index'
		});
	}

	start() {
		let vm = new Vue({
			el: "#login",
			data:{
				loginType: 'personal',
				nameTag: "手机或身份证登录",
				name: '',
				pswd: '',
				year: _now().split('-')[0],
				years: [], // 年度选择
				loginAtOnce: true, // 防止重复点击按钮
				userName: "", // 存储的用户名
				orgName: "", // 存储的组织代码
			},
			watch: {
				loginType: function(i) {
					// 切换登陆类型时，提示文字也相应改变
					if ("personal" === i) {
						this.nameTag = "手机或身份证登录";
						this.name = this.userName;
					} else {
						this.nameTag = "组织代码";
						this.name = this.orgName;
					}
				},
			},
			methods: {
				openIndex: function() {
					// 打开index.html
					openWindow("../index.html", "index");
					mui.fire(plus.webview.getWebviewById("index"), "updateFooterInfo");
				},
				chooseYear: function() {
					// 选择登陆年度
					plus.nativeUI.actionSheet({
						title: "年度选择",
						cancel: "取消",
						buttons: _map((i) => {
							return {
								title: i.year,
								server: i.server
							};
						}, this.years)
					}, (e) => {
						if (0 === e.index) return;
						this.year = this.years[e.index-1].year;
						// 年份存储到本地
						_set("year", this.year);
						// 设置年度数据服务接口
						_callAjax = _genCallAjax(this.years[e.index-1].server+"/db4web");
					});
				},
				login: function() {
					// 防止重复点击
					if (!this.loginAtOnce) return;

					// 去掉登录名与密码的空格
					let name = _trim(this.name),
						pswd = _trim(this.pswd);
					if (!name || !pswd) return mui.toast("请完整填写登录信息");

					// 防止重点击
					this.loginAtOnce = false;

					// 个人登陆
					let sql = "select u.id,u.name,u.img,u.orgName,u.orgNo,u.pswd,o.id as orgId from User u, organization o where (idno = ? or phone = ?) and u.pswd= ? and u.orgNo = o.no and u.ifValid >= 1",
						vals = _dump([name, name, pswd]);
					// 组织登陆
					if ("organization" === this.loginType) {
						sql = "select id, name, pswd, img, no, secretary, type from organization where no = ? and pswd = ? and ifValid >= 1";
						vals = _dump([name, pswd]);
					}

					// 登陆
					_callAjax({
						cmd: "fetch",
						sql: sql,
						vals: vals
					}, (d) => {
						if (d.success && d.data && d.data.length) {
							_set("personal" === this.loginType ? "userInfo" : "orgInfo", _dump(d.data[0]));
							_tell(d.data[0]);
							// 保存登录名
							_set("personal" === this.loginType ? "userName" : "orgName", name);

							_set("year", this.year);

							setTimeout(() => {
								this.openIndex();
							}, 500);
						} else {
							// 恢复按钮可点击
							this.loginAtOnce = true;
							mui.toast("登录失败");
						}
					});
				},
				forgetPswd: function() {
					openWindow("forget.html", "forget");
				}
			},
			mounted: function() {
				// 获取年度服务接口
				_callAjax({
					cmd: "fetch",
					sql: "select year, server from yearServerConfig"
				}, (d) => {
					if (d.success && d.data && d.data.length) {
						this.years = d.data;
					}
				});

				// 用户名
				this.userName = _get("userName");
				this.orgName = _get("orgName");

				// 设置用户名
				if (this.loginType === "personal") {
					this.name = this.userName;
				} else {
					this.name = this.orgName;
				}
			}
		});
	}
}

if(window.plus) {
	(new Login).start();
} else {
	document.addEventListener('plusready', function() {
		(new Login).start();
	}, false);
}

// 添加清理缓存的事件，备用
//document.addEventListener("clearCache", () => {
//	_set("userInfo", "");
//	_set("orgInfo", "");
//});