(function() {
    var plusReady = function() {
		pullToRefresh();
    	
        var wb = plus.webview.currentWebview(),
            userInfo = _load(_get("userInfo")),
            isAdmin = "no" in userInfo;
        if ("isAdmin" in wb) {
            isAdmin = wb.isAdmin;
        }
        
        var vm = new Vue({
            el: "#memberManage",
            data: {
                members: [],
                searchWord:"",
            },
            computed: {
            	filterMembers: function() {
            		var sw = _trim(this.searchWord);
            		if (!sw) return this.members;
            		return _filter(function(i) {
            			return i.name.indexOf(sw) >= 0;
            		}, this.members);
            	}
            },
            methods: {
                openMember: function(i) {
                    if (isAdmin) {
                        openWindow("memberActivityRecord.html", "memberActivityRecord", {
                            idx: i.id,
                            name: i.name,
                        });
                    } else {
                        mui.toast("仅书记可查看详细信息");
                    }
                }
            }
        });

        _callAjax({
            cmd: "fetch",
            // sql: "select id, name from user where orgNo = ?",
            /* 百分制与五星制在一起
            sql: "select u.id as id, u.name as name, sum(e.score) as score, e.scoreType as scoreType from user u left join activityEnroll e on e.userId = u.id left join activitys a on e.activityId = a.id where u.orgNo = ? and a.ifValid = 1 group by u.id, e.scoreType",
            vals: _dump([wb.orgNo,])
        }, function(d) {
            if (d.success && d.data && d.data.length) {
                // vm.members = d.data;
                var prev = null;
                d.data.forEach(function(i) {
                    if (!i.score) i.score = 0;
                    if (!i.scoreType) i.scoreType = "百分制";
                    if (!!prev && prev.id != i.id) {
                        vm.members.push(prev);
                        i.tag = i.score+(i.scoreType=="百分制"?"分":"星");
                        prev = i;
                    } else {
                        if (!prev) {
                            prev = i;
                            prev.tag = "";
                        }
                        prev.tag += " "+i.score+(i.scoreType=="百分制"?"分":"星");
                    }
                });
            }
            */

            // 仅百分制
            sql: "select u.id as id, u.name as name, sum(e.score) as score, e.scoreType as scoreType from user u left join activityEnroll e on e.userId = u.id and e.scoreType = '百分制' left join activitys a on e.activityId = a.id where u.orgNo = ? and a.ifValid = 1 group by u.id, e.scoreType order by score desc",
            vals: _dump([wb.orgNo,])
        }, function(d) {
            if (d.success && d.data && d.data.length) {
                d.data.forEach(function(i) {
                    if (!i.score) score = 0;
                    if (!i.scoreType) i.scoreType = "百分制";
                    i.tag = i.score+"分";
                    vm.members.push(i);
                });
            }
        });
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());
