var isTest = false;
var serverAddr = isTest ? "http://192.168.0.110:10000" : "https://develop.wifizs.cn:11039";

// ------------------- 湘南 ------------------------

var kk;

// 设置加密密钥
var enc;
var dec;
var dec2;

// 加密数据
var encryptData = function(data) {
	// console.log("data", data);
	// json编码
	var jsonData = JSON.stringify(data);
	// console.log("jsonData", jsonData);
	// encodeURIComponent
	var encodeUriData = encodeURIComponent(jsonData);
	// console.log("encodeUriData", encodeUriData);
	// 加密 && base64编码
	var encryptedData = enc.encryptLong(encodeUriData);
	// console.log("encryptedData", encryptedData);
	return encryptedData;
}

// 解密数据
var decryptData = function(data) {
	// base64解码 && 解密
	var decryptedData = dec.decryptLong(data);
	// console.log("decryptedData", decryptedData);
	// decodeURIComponent
	var decodeUriData = decodeURIComponent(decryptedData);
	// console.log("decodeUriData", decodeUriData);
	return decodeUriData;
}

var decryptData2 = function(data) {
	// base64解码 && 解密
	var decryptedData = dec2.decryptLong(data);
	// console.log("decryptedData2", decryptedData);
	// decodeURIComponent
	var decodeUriData = decodeURIComponent(decryptedData);
	// console.log("decodeUriData2", decodeUriData);
	return decodeUriData;
}

// 参数全部转换成字符串
var convertParamToString = function(data) {
	// 遍历对象
	for (var sub in data) {
		// 数字类型 布尔类型
		if ("number" == typeof data[sub] || "boolean" == typeof data[sub]) {
			// 增加toString 转换成字符串
			data[sub] = data[sub].toString();
		} else if ("object" == typeof data[sub]) {
			// 对象类型 递归替换
			data[sub] = convertParamToString(data[sub]);
		}
	}
	return data;
}

// 拼装加密后的请求参数
var getEncryptedParam = function(data) {
	// 转换参数为字符串
	data = convertParamToString(data);
	// 加密并放到payload中
	return {
		payload: encryptData(data)
	};
}

// 带加密的genPostAjax
var _genPostAjaxEncrypt = function(url, ifMulti) {
	return function(data, cb) {
		cb = cb ? cb : function() {};
		var params = {
			type: "POST",
			async: true,
			url: url,
			dataType: "json",
			jsonp: "callback",
			data: $.extend(getEncryptedParam(data), {
				token: 'Jh2044695'
			}),
			// contentType:"multipart/form-data; charset=UTF-8",
			success: function(d) {
				// 解密d.data中的数据
				var decryptedData = decryptData(d.data);
				// 解密后的数据json解码 并赋值回d.data
				var rtn = {
					success: d.success,
					errmsg: d.errmsg,
					data: JSON.parse(decryptedData)
				};
				cb(rtn);
				// _stopLoading();
			},
			error: function(e) {
				// console.log(JSON.stringify(e));
				// _popup("服务器连接失败，请重试！");
				// _stopLoading();
				// alert(_dump(e));
			}
		}
		if (!!ifMulti) params.contentType = "multipart/form-data; charset=UTF-8";
		$.ajax(params);
	}
};

// 带加密的genPostAjax
var _genPostAjaxEncryptJh = function(url, ifMulti) {
	return function(data, cb, fix) {
		cb = cb ? cb : function() {};
		var params = {
			type: "POST",
			async: true,
			url: !!fix ? (url + fix) : (url + '/apijh'),
			dataType: "json",
			// jsonp: "callback",
			data: $.extend(getEncryptedParam(data), {
				token: 'Jh2044695'
			}),
			// contentType:"multipart/form-data; charset=UTF-8",
			success: function(d) {
				// 解密d.data中的数据
				var decryptedData = decryptData(d.data);
				// 解密后的数据json解码 并赋值回d.data
				var rtn = {
					success: d.success,
					errmsg: d.errmsg,
					data: JSON.parse(decryptedData)
				};
				cb(rtn);
				// _stopLoading();
			},
			error: function(e) {
				// console.log(JSON.stringify(e));
				// _popup("服务器连接失败，请重试！");
				// _stopLoading();
			}
		}

		if (!!ifMulti) params.contentType = "multipart/form-data; charset=UTF-8";
		$.ajax(params);
	}
};

// ------------------- 湘南 ------------------------

var _set = function(k, v) {
	plus.storage.setItem(k, v);
};
var _get = function(k, isOrg) {
	// 兼容userInfo与orgInfo
	var ret = plus.storage.getItem(k);
	if ("userInfo" == k && !ret && !isOrg) {
		ret = plus.storage.getItem("orgInfo");
	}
	return ret;
};

var _at = function(arr, id) {
	if (id < 0) id = arr.length + id;
	return arr[id];
};

var _dump = function(dict) {
	return JSON.stringify(dict);
};

var _load = function(s) {
	return JSON.parse(s);
};
var _echo = function(any) {
	return any;
}
var _tell = function(d) {
	console.log(JSON.stringify(d));
};
var _trim = function(w) {
	if (!w) return '';
	return w.replace(/(^\s*)|(\s*$)/g, "");
};

var _genCallAjaxPost = function(url) {
	return function(data, cb, fix) {
		//		if (!notLoading) _loading();
		cb = cb ? cb : function() {};

		mui.ajax({
			type: "post",
			url: !!fix ? (url + fix) : (url + '/apijh'),
			async: true,
			data: $.extend(data, {
				token: 'Jh2044695'
			}),
			timeout: 10000,
			success: function(data) {
				d = JSON.parse(data);
				cb(d);
			},
			error: function(xhr, type, errorThrown) {
				if (type == 'timeout') {
					mui.toast("请求超时：请检查网络");
				} else {
					mui.toast('请求失败');
				}
			},
			complete: function() {}
		});

	};
};

var _genCallAjax = function(url) {
	return function(data, cb, notLoading) {
		//		if (!notLoading) _loading();
		cb = cb ? cb : function() {};
		data.callback = "_echo";

		mui.ajax({
			type: "get",
			url: url,
			async: true,
			data: $.extend(data, {
				token: 'Jh2044695'
			}),
			dataType: "jsonp",
			jsonp: "jsoncallback",
			timeout: 10000,
			success: function(data2) {
				//			    console.log("----------------------");
				//			    console.log(data);
				//			    console.log(JSON.stringify(data));
				//			    console.log(JSON.stringify(data2));
				//			    console.log("----------------------");
				d = eval(data2);
				cb(d);
			},
			error: function(xhr, type, errorThrown) {
				if (type == 'timeout') {
					mui.toast("请求超时：请检查网络");
				} else {
					mui.toast('请求失败');
				}
			},
			complete: function() {}
		});

	};
};

/**
 * 上传图片
 * vue中input file标签@change事件时的上传
 * @param modulename 模块名 对应存储到后台相同名称的文件夹中
 * @param fileList change事件中的文件列表
 * @param obj 上传图片的信息
 *  obj是一个数组 其中每一个元素包含3个属性
 *      key FormData中也使用这个属性作为存储文件的key,后台根据这个key取相应的文件
 *          如果一个input标签中选择的多个图片,则同一个标签中的图片后台由同一个key取
 *      thumbonly 是否只需要缩略图 不设置或者0:否 1:是
 *      waterMark 是否需要添加水印 不设置或者0:否 1:是 需要添加水印会删除原始图片返回添加水印后的图片
 *      width 缩略图宽度 不设置或者设置未0 会根据高度同比例缩放
 *      height 缩略图高度 不设置或者设置未0 会根据宽度同比例缩放
 *      注: 如果上传图片width,height同时未设置或者同时设置为0 则不会生成缩略图
 *          如果上传视频width,height同时未设置或者同时设置为0 则按视频原尺寸生成缩略图
 *          如果上传视频width,height同时设置为-1 则不会生成缩略图
 * @param url 上传的后台地址
 * @param cb 回调函数名称
 * @param loading 上传进度显示的回调函数 如果不传这个参数就不会显示进度
 */
var _uploadMulityImageVueChange = function(modulename, fileList, obj, url, cb, loading) {
	console.log(url);

	loading = loading ? loading : function() {};
	// 上传图片的表单
	var fd = new FormData();
	$.each(obj, function(i, v) {
		// input标签中选择的每一个图片
		$.each(fileList, function(i, f) {
			fd.append(v.key, f);
		});

		//		console.log("888888888"+v.key);
		//		fd.append(v.key, fileList);
		// 缩放图片设置
		fd.append(v.key + "resize", JSON.stringify(v));
	});
	// 模块名
	fd.append('module', modulename);
	var xhr = new XMLHttpRequest();
	//  xhr.open("post", url);
	xhr.open("post", "http://develop.wifizs.cn:11039/multiupload");
	// 进度条
	xhr.upload.addEventListener("progress", function(e) {
		loading(e);
	}, false);
	// 上传成功回调
	xhr.addEventListener("load", function(e) {
		console.log(e.target.responseText);
		var ret = JSON.parse(e.target.responseText);
		cb(ret.data);
	}, false);
	xhr.addEventListener("error", function(e) {
		return mui.toast("文件上传失败，请重试！");
	}, false);
	xhr.send(fd);
};

//时间格式化
var _howLongAgo = function(d) {
	// _tell((new Date()));
	// _tell(d);
	// _tell((new Date()).getTime() + ' - ' + Date.parse(d.replace(' ', 'T')));
	var span = (new Date()).getTime() - Date.parse(d.replace(' ', 'T')) + (8 * 3600 * 1000);
	if (span < 60 * 1000) {
		return "刚刚";
	}
	if (span < 3600 * 1000) {
		return parseInt(span / 60000) + "分钟前";
	} else if (span < 86400 * 1000) {
		return parseInt(span / 3600000) + "小时前";
	} else {

		return d.slice(5);
	}
};

//自定义全局替换函数  
/**g，表示全文匹配； 
 *m，表示多行匹配(也就是正则表达式出现“^”、“$”，如果要匹配的字符串其中有换行符也没关系)； 
 *i，表示忽略大小写 
 */
String.prototype.replaceAll = function(findText, repText) {
	var newRegExp = new RegExp(findText, 'gm');
	return this.replace(newRegExp, repText);
};

//获取当前登录账号的组织id
var _getOrgId = function() {
	var orgId = 0;
	var userInfo = _load(_get('userInfo'));
	if (userInfo) {
		if (userInfo.userType == 1) {
			orgId = userInfo.no;
		} else {
			orgId = userInfo.orgNo;
		}
	}
	return orgId;
}

// 格式化日期时间
var _datetime = function(dt) {
	var y = dt.getFullYear(),
		m = dt.getMonth() + 1,
		d = dt.getDate(),
		h = dt.getHours(),
		mm = dt.getMinutes(),
		s = dt.getSeconds();

	if ((m + "").length == 1) m = "0" + m;
	if ((d + "").length == 1) d = "0" + d;
	if ((h + "").length == 1) h = "0" + h;
	if ((mm + "").length == 1) mm = "0" + mm;
	if ((s + "").length == 1) s = "0" + s;

	return y + "-" + m + "-" + d + " " + h + ":" + mm + ":" + s;
};

var _now = function() {
	return _datetime(new Date());
};

var _map = function(f, d) {
	var ret = [];
	d.forEach(function(i) {
		ret.push(f(i));
	});
	return ret;
};

var _filter = function(f, d) {
	var ret = [];
	d.forEach(function(i) {
		if (f(i)) ret.push(i);
	});
	return ret;
};

var _dict_merge = function(ds) {
	// d2优先级高
	var ret = {};
	ds.forEach(function(d) {
		Object.keys(d).forEach(function(attr) {
			ret[attr] = d[attr];
		});
	});
	return ret;
};

var _del_ele = function(li, id) {
	if (id < 0) {
		id = li.length + id;
	}
	if (id < 0) return li;
	return li.slice(0, id).concat(li.slice(id + 1));
};

var _dateCompare = function(a, b) {
	return Date.parse(a.replace(' ', 'T')) > Date.parse(b.replace(' ', 'T'));
};

var _today = function() {
	return _now().split(" ")[0];
};

var _range = function(s, e) {
	var ret = [];
	while (s <= e) {
		ret.push(s);
		s += 1;
	}
	return ret;
};

var _oneMonthAgoDateObj = function(n) {
	var d = new Date();
	d.setMonth(d.getMonth() - 1);
	return d;
};

var _nDaysBefore = function(n) {
	var d = new Date();
	d.setDate(d.getDate() - n);
	return d;
}

var _androidClose = function(obj) {
	if (!obj.firstClickTimestamp) {
		obj.firstClickTimestamp = (new Date()).getTime();
		mui.toast("再按一次退出应用");
		setTimeout(function() {
			obj.firstClickTimestamp = null;
		}, 1000)
	} else {
		if ((new Date()).getTime() - obj.firstClickTimestamp < 1000) {
			plus.runtime.quit();
		}
	}
};

// iOS下直接关闭前级会发生错误
var _delayClose = function(page, tm, cb) {
	if (!page) return;
	setTimeout(function() {
		plus.webview.close(page, "none");
		if (!!cb) cb();
	}, tm ? tm : 500);
};

var __getScore = function(uinfo, cb, ifMust) {
	var score = 0,
		today = _today();
	_scoreAjax({
		cmd: "multiFetch",
		multi: _dump([{
				key: "login",
				sql: "select * from scoreDailyLogin where (userId = " + uinfo.id + " or idno = '" + uinfo.idNo +
					"') and logtime = '" + today + "'"
			},
			{
				key: "share",
				sql: "select count(*) as cnt from scoreShareCourse where (userId = " + uinfo.id + " or idno = '" + uinfo.idNo +
					"') and logtime = '" + today + "'"
			},
			{
				key: "news",
				sql: "select count(*) as cnt from newsEnroll where (userId = " + uinfo.id + " or idno = '" + uinfo.idNo +
					"') and logtime = '" + today + "'"
			},
		]),
	}, function(d) {
		if (d.success && d.data) {
			if (d.data.login && d.data.login.length) score += 60;
			if (d.data.share && d.data.share.length) score += parseInt(d.data.share[0].cnt) * 120;
			if (d.data.news && d.data.news.length) score += parseInt(d.data.news[0].cnt) * 60;
		}
		_callAjax({
			cmd: "fetch",
			sql: "select ifnull(sum(e.credit), 0) as score from courseEnroll e, courses c " +
				"where e.userId in (select id from user where idno = ?) " +
				"and e.courseId = c.id and c.ifValid > 0 and e.logtime > ?",
			vals: _dump([uinfo.idNo, today + " 00:00:00"])
		}, function(d2) {
			if (d2.success && d2.data && d2.data.length) {
				score += parseInt(d2.data[0].score);
			}
			if (score >= 120 * 60) score = 120 * 60;
			if (ifMust) {
				cb(score, d, d2);
			} else {
				cb(score);
			}
		});
	});
};

// 获取今日学分
var _getTodayScore = function(uinfo, cb) {
	var scoreStr = _get("score"),
		score = 0,
		today = _today(),
		indexPage = plus.webview.getWebviewById("index");
	if (!scoreStr) {
		__getScore(uinfo, function(score) {
			cb(score);
			mui.fire(indexPage, "updateScore");
		});
	} else {
		var scoreInfo = _load(scoreStr);
		if (scoreInfo.date != today) {
			__getScore(uinfo, function(score) {
				cb(score);
				mui.fire(indexPage, "updateScore");
			});
		} else {
			if (scoreInfo.score >= 120 * 60) {
				scoreInfo.score = 120 * 60;
			}
			cb(scoreInfo.score);
			mui.fire(indexPage, "updateScore");
		}
	}
};

var _getTodayScoreMust = function(uinfo, cb) {
	__getScore(uinfo, function(score, d1, d2) {
		//      alert(score);
		//      alert(_dump(d1));
		//      alert(_dump(d2));
		cb(score, d1, d2);
	}, true);
};

// 兼合支部评定
var jhGrades = [
	"还需努力",
	"合格",
	"良好",
	"优秀",
];
// 支部评定
var bhGrades = [
	"一星",
	"二星",
	"三星",
	"四星",
	"五星",
];

var _callAjax = _genCallAjax(serverAddr + "/db4web");
var _scoreAjax = _genCallAjax("https://develop.wifizs.cn/zsdyScore/db4web");
var _smsAjax = _genCallAjax("http://develop.zsgd.com:7071/sms/");
var _summaryAjax = _genCallAjax("https://develop.wifizs.cn/bc/bc/");
var _hotAjax = _genCallAjax("https://develop.wifizs.cn/bc/hot/");
var _rankAjax = _genCallAjax("https://develop.wifizs.cn/bc/rk/");
var _replaceAjax = _genCallAjax("https://develop.wifizs.cn/bc/replace/");
var _qzAjax = _genCallAjax("https://develop.wifizs.cn/db4web");
// 兼合支部接口
var jhServerUrl = "http://develop.wifizs.cn/11039";
// var jhServerUrl = "http://60.185.247.198:11039";
var _jhAjax = _genCallAjaxPost(jhServerUrl);
var _pyAjax = _genCallAjaxPost("https://develop.wifizs.cn/ajax");

function loadJs(url, callback) {
	var script = document.createElement('script');
	script.type = "text/javascript";
	if (typeof(callback) != "undefined") {
		if (script.readyState) {
			script.onreadystatechange = function() {
				if (script.readyState == "loaded" || script.readyState == "complete") {
					script.onreadystatechange = null;
					callback();
				}
			}
		} else {
			script.onload = function() {
				callback();
			}
		}
	}
	script.src = url;
	document.body.appendChild(script);
}

var reloadEnc = function() {
	let kk = JSON.parse(window.atob(kdata));
	enc = new JSEncrypt();
	dec = new JSEncrypt();
	dec2 = new JSEncrypt();
	enc.setPublicKey(kk.a);
	enc.setPrivateKey(kk.b);
	dec.setPublicKey(kk.c);
	dec2.setPublicKey(kk.d);
	_callAjax = _genPostAjaxEncrypt(serverAddr + "/db4web");
	_jhAjax = _genPostAjaxEncryptJh(serverAddr);
	let fns = window.location.href.split("/");
	let fn = fns[fns.length - 1].split(".")[0];
	let f = ((fn == "index" || fn == "boot") ? "js/" + fn : "../js/" + fn) + ".js";
	// _tell(f);
	loadJs(f, () => {
		_tell(f+", done");
	})
	// document.writeln("<script src=\"" + f + "\"></script>");

	//    $.getScript(((fn == "index" || fn == "boot") ? "js/"+fn : "../js/"+fn)+".js").done(() => {
	// 	alert("rth-1")
	// }).fail(() => {
	// 	alert("rth-2")
	// });
}

$(function() {
	$.getScript("https://develop.wifizs.cn/11039/admin/dist/assets/js/relatedData.js").done(() => {
		// _tell(location.href + ", success");
		reloadEnc();
	}).fail(() => {
		// _tell(location.href + ", fail");
		var kdata =
			"eyJjIjoiLS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tXG5NSUlDZFFJQkFEQU5CZ2txaGtpRzl3MEJBUUVGQUFTQ0FsOHdnZ0piQWdFQUFvR0JBTDhvQnJEam0zVmJSV2V5XG5zNWNXeXg4UjJJZG0wUG5Bb1FWa0FsYWh5T0E3SU9RVk9DQUg1dlNiUE9NU1lQVkpiVHBKQUZBTkpOc2ZjSC9UXG5OdllsK2ZSL1pneENmZVZpTDhCNFY5dEdHK2orYUhaTHVZM3RQa1dHMDBEQjVPM2J1NmRkUzJqaVhnUjRoNWZqXG5FeXBRcTQ4K0RVTDNtOG1JY1FrUHRkL0FsQ2l4QWdNQkFBRUNnWUJMeWhMZEQyRVRwcHhlQVB3emExWWRlM1hlXG5PV1dob0Q0M1pPK0lhWnk3U3JZL3VDb0lpUm1JNGdQQ0JBZHRPUytWYkZ3ellRSzczanM4Y3dIWGxqY0RpWnFCXG5rM01GUjVxMnArUlVsZ3ROR2pmMlRqK0s2NEgwdWovSTMvRlNRS243b0RYVVIzLzlJOWNMSG1uL0o1d3l3QmtmXG40OTJwNUpMQUFhSVo2SDhtQVFKQkFPNG5oSm5rUmZxZmdoMktmK3hrcmVSeHdYZ20yYWpSNG5KNzhRZ1BRT3ZZXG5GSUVMUjVVK2E0WFFEWmlKeXlsUkdoYXVRZlRVM2VwM1dadDZGM0RydmE4Q1FRRE5ldk9vdG1KTGdTQ3hqUk9HXG5LNGpyUVBLTzhhc0QrelBUZ2loUjJqbXZuRnZuSE83aVhMYmNjdnFocUp1REpKb1R0Ukt5RjM2QzVTWExpdldiXG5FM2VmQWtBS2puUGhRbTRicXVCZ29OZ0V5WDJ2eDU4VXpWd09rS2NoL2Y1MEpnRHhzMVZOVnd1b1FPa1JPR1N4XG40MEcvSmhvcThUUjVQc3BMYjFqb2ZHUDNuR3QvQWtBWk9VZWg1VW1wdFI4N1RITWlIRVFCaFFhQmo1OExyUkdPXG5uRUt3MFpZVlBaOTJmbkhBcmRyd3N0aWJjYVF0ZEJmSjVZZDIvelZUZ2llaWxkdFNmeEJIQWtCRnZnKzE4eDZvXG5PdXVRZk10TnFkdWV5aTBzbUhqKzVsRDhNZHBSampMK2IrL2hnTFBSMjZNQjhKWE80RnN3bzJ0TGNxMktkaE1QXG5PTkdBL2xCa0hEZjhcbi0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS1cbiIsImEiOiItLS0tLUJFR0lOIFBVQkxJQyBLRVktLS0tLVxuTUlHZk1BMEdDU3FHU0liM0RRRUJBUVVBQTRHTkFEQ0JpUUtCZ1FDeTRPYnVySDZrNEVrZHEybnNMYzJVaHFiM1xuOVVhVDJjMEM5cUxFOUgxNHpBSG5TbEo1UGdHMlVWTTdXdUMveW1obGl6VVpycUFXMlhhaTFZam9Fa3R0WWhkVVxuOHpuWldlYTE5bWM4czJoWm1QVWY2MlV4eU52aGtCcStLL042d01sckJNNGVGWmxjMnNuNnRlbFNVNHBJb0Z0bVxuQTBBcVY5c3BzSDZNUC9CY0Z3SURBUUFCXG4tLS0tLUVORCBQVUJMSUMgS0VZLS0tLS1cbiIsImIiOiItLS0tLUJFR0lOIFBSSVZBVEUgS0VZLS0tLS1cbk1JSUNkd0lCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQW1Fd2dnSmRBZ0VBQW9HQkFMTGc1dTZzZnFUZ1NSMnJcbmFld3R6WlNHcHZmMVJwUFp6UUwyb3NUMGZYak1BZWRLVW5rK0FiWlJVenRhNEwvS2FHV0xOUm11b0JiWmRxTFZcbmlPZ1NTMjFpRjFUek9kbFo1clgyWnp5emFGbVk5Ui9yWlRISTIrR1FHcjRyODNyQXlXc0V6aDRWbVZ6YXlmcTFcbjZWSlRpa2lnVzJZRFFDcFgyeW13Zm93LzhGd1hBZ01CQUFFQ2dZRUFpeUh4blkxZnlDQ0gzbUw0dFhKKzU5ckFcblBqZHlXUWZjdFVSZklIREdzMUdDM1lMcW1WRkloYVhGNW5IdVJGOU1Ta2MzMnl6L2FpWmxaNHhOdTZ5WEswVnRcbmE0TzltdGFldE9SNkJqNVcwb0c2RFpLRkpMdURKOFIwelNzSG02dDMvdHcxTFphb2Vqd0VxOVQvUmlPV1pVb1lcbkpvWFNvdHNLOXJJRjNVZ2Uzb0VDUVFEWE5wdkJoMjRhbUdrbU0yWElGTkpiUHRlcThQSC9CeUNwbTRUeVp5WTJcbkpSS0lRenRmOVNKS1ZMdTRiRHdLVmozcmxLditFbWd1T1hnV3N1YzBRM0JYQWtFQTFNZDFLaFB2UUZLV0dYUnZcblRwNEd4TXhCM3ZFbTNFN05zRUxDZTl4V25ZUS9lYjY2dkJSWTFiZkRuVnNLc05EaHRXTUNwa2ZxUFllcnN5eVpcbmFOZ2FRUUpBTFR3bUt0eGJjUzJkMUZDelVRWEhYVFJ0UWxuWWs2RWM1V2x4M1QxL0U1eGhNOURsMXZxQVZaMVBcbnc2akVTZXZzb2VxaTZBbFlhbmJiM2ZHR2xUNmppd0pBV0d1eWNwUHFIazZ6ZFV4L1hLb3FvZWxIamora0tIVE9cbjRPbzlLMzk2dHVaWUFsMlI5OHAweUFzZlRPcWlYS3ZRdjdHdlRpNGdWd1ZrQW9jTUVSZU1nUUpCQUl1a3l6UlNcbjJ3T3BwTUlTMGMyanhLcEhoY29aaFhwaHJsM25jdk8wOGpRV3NUR3JKbVRPcUQrVkdXT3BZdnBvUkxvb3ZnaHdcbmh6Mm1HN2ZHcmxFU2wyTT1cbi0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS1cbiJ9";
		reloadEnc();
	});
});
