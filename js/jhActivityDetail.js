mui.init({
});
// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
    var wb = plus.webview.currentWebview();

	var vm = new Vue({
		el: '#jhActiveDetail',
		data: {
		    idx: -1,
		    jhOrgNo: "",
		    jhActId: "",
		    detail: null,
		    imgs: [],
		    enrolls: [],
		    canOperate: 0,
		},
		computed: {
		    enrollNames: function() {
		        return _map(i => {
		            return i.name;
		        }, this.enrolls).join("，");
		    }
		},
		methods: {
			openGallery: function() {
				var arr = [];
				var self = this;
				this.imgs.forEach(function(img,i) {
					arr.push(img.img);
					if(self.imgs.length == i + 1) return plus.nativeUI.previewImage(arr,{'current': 0, 'loop': true})
				})
			},
			editActivity: function() {
			    openWindow("jhActivityUpload.html", "jhActivityUpload", {
			        jhOrgNo: this.jhOrgNo,
			        info: {
			            detail: this.detail,
			            participants: this.enrolls,
			            records: this.imgs
			        }
			    });
			},
            delActivity: function() {
               var self = this;
               mui.confirm("确定删除？", "提示", ["确定", "取消"], function(e) {
                   if (e.index == 0) {
                       // 确定删除
                       _jhAjax({
                           cmd: "delJHActByActId",
                           jhActID: self.detail.id
                       }, d => {
                           if (d.success) {
                               mui.toast("删除成功");
                               mui.fire(plus.webview.getWebviewById("jhActivityList"), "delActivity", {
                                   idx: self.idx
                               });
                               setTimeout(() => {
                                   mui.back();
                               }, 500);
                           } else {
                               mui.toast(d.errmsg);
                           }
                       });
                   }
               });
            },
            getInfo: function() {
                _jhAjax({
                    cmd: "getJHActInfo",
                    jhActId: this.jhActId,
                }, d => {
                    _tell(d);
                    if (d.success && d.data) {
                        this.detail = d.data.activity;
                        if (d.data.enrolls) {
                            this.enrolls = d.data.enrolls;
                        } else {
                            this.enrolls = [];
                        }
                        this.imgs = [];
                        if (d.data.actImgs.actImg) {
                            this.imgs.push({
                                img: d.data.actImgs.actImg,
                                txt: d.data.actImgs.actTxt
                            });
                        }
                        if (d.data.actImgs.otherImgs) {
                            let oims = _load(d.data.actImgs.otherImgs);
                            oims.forEach(i => {
                                this.imgs.push(i);
                            });
                        }
                    }
                });
            }
		},
		mounted: function() {
		    let wb = plus.webview.currentWebview();
		    // 用于回调事件删除活动用
		    this.idx = wb.idx;
		    this.jhOrgNo = wb.jhOrgNo;
		    this.jhActId = wb.jhActId;
		    this.canOperate = wb.canOperate;
		    this.getInfo();
		}
    });

    // 新建成功
    window.addEventListener("updateInfo", function(event) {
        vm.getInfo();
    });

}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}
