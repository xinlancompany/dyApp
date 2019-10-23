if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

function plusReady() {
	var vm = new Vue({
		el: '#msgBoardPublish',
		data: {
		    msg: "",
		    userInfo: _load(_get("userInfo", true)),
			meta: [
                "singleLine13115531", // name
                "singleLine56606488", // idno 
                "singleLine52481161", // img
                "singleLine94217231", // orgName
                "singleLine5142264",  // orgNo
                "multipleLine31394692", // msg
                "singleLine74857102", // logtime
			],
		},
		methods: {
		    publishMsg: function() {
		        let msg = _trim(this.msg);
		        if (!msg) return mui.alert("请填写内容");
                mui.confirm("确定发布？", "提示", ["确定", "取消"], (e) => {
                    if(e.index == 0) {
                        let infos = {
                            "singleLine5868191": ""
                        };
                        infos[this.meta[0]] = this.userInfo.name;
                        infos[this.meta[1]] = this.userInfo.idNo;
                        infos[this.meta[2]] = this.userInfo.img;
                        infos[this.meta[3]] = this.userInfo.orgName;
                        infos[this.meta[4]] = this.userInfo.orgNo;
                        infos[this.meta[5]] = msg;
                        infos[this.meta[6]] = _now();
                        _qzAjax({
                            cmd: "exec",
                            sql: "insert into form_data(userId, formId, infos) values (?,?,?)",
                            vals: _dump([823657, 261, _dump([infos])])
                        }, d => {
                            mui.toast("发布"+(d.success?"成功":"失败"));
                            if (d.success) {
                                setTimeout(() => {
                                    mui.back()
                                }, 500);
                            }
                        })
                    }
                });
            }
		},
		created: function() {
		    // alert(_get("userInfo"), true);
		}
	});
	
	$(".publish-msg").click(() => {
	    vm.publishMsg(vm);
	});
}
