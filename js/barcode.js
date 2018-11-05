var ws = null;
var scan = null,
	domready = false;
// H5 plus事件处理
function plusReady() {
	if(ws || !window.plus || !domready) {
		return;
	}
	
	var barcode = new Vue({
		el: 'barcode',
		data: {
			
		},
		methods: {
			// 从相册中选择二维码图片 
			scanPicture: function() {
				var self = this;
				plus.gallery.pick(function(path) {
					plus.barcode.scan(path, self.onmarked, function(error) {
						plus.nativeUI.alert('无法识别此图片');
					});
				}, function(err) {
					console.log('Failed: ' + err.message);
				});
			},
			// 二维码扫描成功
			onmarked: function(type, result, file) {
				console.log(type)
				switch(type) {
					// 二维码 
					case plus.barcode.QR:
						type = 'QR';
						break;
					// EAN条形码标准版
					case plus.barcode.EAN13:
						type = 'EAN13';
						break;
					// EAN条形码简版
					case plus.barcode.EAN8:
						type = 'EAN8';
						break;
					default:
						type = '其它' + type;
						break;
				}
				result = result.replace(/\n/g, '');
				plus.nativeUI.alert('扫描结果:' + JSON.stringify(result), function() {
					console.log('扫描成功');
					// 重置扫描器
					scan.start({
						conserve: true,
						filename: '_doc/barcode/'
					});
				}, "二维码扫描", "OK");
			}
		},
		created: function() {
		}
	})
	
	// 获取窗口对象
	ws = plus.webview.currentWebview();
	
	// 开始扫描
	ws.addEventListener('show', function() {
		scan = new plus.barcode.Barcode('bcid');
		scan.onmarked = barcode.onmarked;
		scan.start({
			conserve: true,
			filename: '_doc/barcode/'
		});
	}, false);
	
	// 显示页面并关闭等待框
	ws.show('pop-in');
}

// 监听DOMContentLoaded事件
document.addEventListener('DOMContentLoaded', function() {
	domready = true;
	plusReady();
}, false);

if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}
