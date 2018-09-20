// 启动页

declare function _get(n: string): string;
declare function _set(n: string, d: string): void;
declare function _load(n: string): any;
declare function openWindow(f: string, n: string): void;
declare function _callAjax(params: any, f: (d: any) => void): void;
declare function _tell(s: any): void;
declare function _delayClose(p: any, tm?: number): void;
declare function openOutlink(p: string): void;

declare var plus: any;
declare var mui: any;
declare var Vue: any;


class Boot {
	userInfo: any;
	orgInfo: any;
	homeImg: string;

	constructor() {
		// 设置桌面应用图标的角标数字
		plus.runtime.setBadgeNumber(0);

		let userStr: string = _get("userInfo");
		let orgStr: string = _get("orgInfo");
		if (userStr) this.userInfo = _load(userStr);
		if (orgStr) this.orgInfo = _load(orgStr);
		this.homeImg = _get("homeImg");
		// 设置默认的启动图
		if (!this.homeImg) this.homeImg = 'img/start.jpg';

		if (!this.userInfo && !this.orgInfo) {
			// 如未登陆则预加载login
			mui.preload({
				url: "views/login.html",
				id: "login"
			});
		} else {
			// 如已登陆则加载index.html
			mui.preload({
				url: "index.html",
				id: "index"
			});
		}
	}

	start() {
		let self = this;
		let vm = new Vue({
			el: ".boot",
			data: {
				link: self.homeImg,
				outLink: "",
				outLinkName: "",
				time: 3,
				timeoutCb: null
			},
			computed: {
				startImg: function() {
					if (this.link.indexOf("data:image") == 0) {
						return "url('"+this.link+"')";
					} else {
						return "url("+this.link+")";
					}
				}
			},
			methods: {
				openAd: function() {
					if (!this.outLink) return;
					clearInterval(this.timeoutCb);
					var indexPage = plus.webview.getWebviewById("index");
					if (indexPage) {
						mui.fire(indexPage, "openOutLink", {
							outLink: this.outLink,
							outLinkName: this.outLinkName,
						});
						openWindow("index.html", "index");
					} else {
						openWindow("index.html", "index", {
							outLink: this.outLink,
							outLinkName: this.outLinkName,
						);
					}
				},
				openIndex: function() {
					// 跳转后均需要注销boot.html页面
					if (self.userInfo || self.orgInfo) {
						// 如登陆则调转至index.html页面
						openWindow("index.html", "index");
					} else {
						// 跳转至登陆页面
						openWindow("views/login.html", "login");
					}
					// 延时关闭本身，防止整个退出，似乎新版本的hbuilder自动关闭boot页面，不需要再手动关闭了
					if ("iOS" === plus.os.name) {
						_delayClose(plus.webview.currentWebview());
					}
					if (this.timeoutCb) {
						// 停止倒计时
						clearInterval(this.timeoutCb);
					}
				}
			},
			mounted: function() {
				this.timeoutCb = setInterval(() => {
					this.time -= 1;
					if (this.time === 0) {
						this.openIndex();
					}
				}, 1000);

				// 获取首页页面
				_callAjax({
					cmd: "multiFetch",
					multi: _dump([
						{
							key: "ad",
							sql: "select name, img, url from ads where type = 'boot' and status = 1 order by id desc limit 1"
						},
						{
							key: "homepage",
							sql: "select homepage from system"
						}
					])
				}, (d) => {
					if (d.success && d.data) {
						if (d.data.ad && d.data.ad.length) {
							_set("homeImg", d.data.ad[0].img);
							this.outLink = d.data.ad[0].url
							this.outLinkName = d.data.ad[0].name
						} else if (d.data.homepage && d.data.homepage.length){
							_set("homeImg", d.data.homeImg[0].homepage);
						}
					}
				});
			}
		});
	}
}


if(window.plus) {
	(new Boot()).start();
} else {
	document.addEventListener('plusready', function() {
		(new Boot()).start();
	}, false);
}