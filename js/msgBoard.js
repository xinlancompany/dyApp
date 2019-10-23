if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

function plusReady() {
	var msgBoard = new Vue({
		el: '#msgBoard',
		data: {
			bHaveMore: true,
			msgs: [],
			meta: [
                "singleLine13115531", // name
                "singleLine56606488", // idno 
                "singleLine52481161", // img
                "singleLine94217231", // orgName
                "singleLine5142264",  // orgNo
                "multipleLine31394692", // msg
                "singleLine74857102", // logtime
			],
			metaKeys: {
                "singleLine13115531": "name",
                "singleLine56606488": "idno",
                "singleLine52481161": "img",
                "singleLine94217231": "orgName",
                "singleLine5142264":  "orgNo",
                "multipleLine31394692": "msg",
                "singleLine74857102": "logtime",
			},
		},
		methods: {
			getMsgs: function(limit) {
			    if (limit == 0) return;
			    if (!limit) limit = 10;
				if (!this.bHaveMore) return;
				let from = 10e8;
				if (this.msgs.length) from = _at(this.msgs, -1)["id"];
				_qzAjax({
				    cmd: "fetch",
				    sql: "select infos from form_data where formId = 261 and id < "+from+" order by id desc limit " + limit,
				}, d => {
				    if (d && d.success && d.data && d.data.length) {
				        this.bHaveMore = true;
				        d.data.forEach(i => {
				            _tell(i);
				            i = JSON.parse(i["infos"])[0];
				            if (i.singleLine5868191) {
				                limit -= 1;
				                Object.keys(i).forEach(k => {
				                    i[this.metaKeys[k]] = i[k];
				                });
                                i.img = i.img ? i.img : "../img/organization.jpg";
				                this.msgs.push(i);
				            }
				        });
				        if (limit) this.getMsgs(limit);
				    } else {
				        this.bHaveMore = false;
				    }
				});
			}
		},
		created: function() {
		    this.getMsgs();
		}
	});
	
	$(".publish").click(function() {
		openWindow("msgBoardPublish.html", "msgBoardPublish");
	});
	
	$(window).scroll(function() {
		var scrollTop = $(this).scrollTop();
		var scrollHeight = $(document).height();
		var windowHeight = $(this).height();
		if (scrollTop + windowHeight == scrollHeight && msgBoard.bHaveMore) {
			// 底部自动加载
			msgBoard.getMsgs();	
		}
	});

}
