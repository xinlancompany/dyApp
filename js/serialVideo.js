//预加载页面

// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
    mui.init({
        beforeback: function() {
            $("#content").empty();
            if (!!serialVideo.intervalCb) clearInterval(serialVideo.intervalCb);
        },
    });

	let serialVideo = new Vue({
		el: '#serialVideo',
		data: {
            poster: "",
            sub_title: "",
		    currentNum: -1,
		    urls: [],
		    intervalCb: null,
		    noNeedToUpdate: false,
		    userInfo: _load(_get("userInfo")),
		},
		methods: {
		    play: function(i) {
		        this.currentNum = i.num;
		        this.$nextTick(() => {
                    $("video").get(0).play();
		        });
		    },
		    courseEnroll: function() {
                // 视频结束或者停止时，不记时
                if ($("video").length) {
                    var v = $("video")[0];
                    if (v.ended || v.paused) return;
                }
                let cv = this.urls[this.currentNum];
                if (cv.noNeedToUpdate) return;
                let aScore = 30;
                cv.ecredit += aScore;
                if (cv.ecredit >= 1200) {
                    cv.ecredit = 1200;
                    cv.noNeedToUpdate = true;
                }
                _getTodayScore(this.userInfo, score => {
                    if (score >= 120*60) return;
                    score += aScore;
                    if (score > 120*60) score = 120*60;
                    _callAjax({
                        cmd: "exec",
                        sql: "replace into courseEnroll(credit, courseId, userId) values(?, ?, ?)",
                        vals: _dump([cv.ecredit, cv.id, this.userInfo.id])
                    }, function(d) {
                        if (d.success) {
                            _set("score", _dump({
                                score: score,
                                date: _today()
                            }));
                            mui.toast("增加"+parseFloat(aScore/60.0)+"学分");
                        }
                    });
                });
		    }
		},
		watch: {
		    currentNum: function(n) {
		        let i = this.urls[n];
                $("video").attr("src", i.url);
		    }
		},
		created: function() {
            let wb = plus.webview.currentWebview()
            if ("sub_title" in wb) this.sub_title = wb.sub_title;
            if ("img" in wb) this.poster = wb.img;
            console.log(this.poster);
		    _callAjax({
		        cmd: "fetch",
		        sql: "select c.id, c.title, c.content, ifnull(e.credit, 0) as ecredit from courses c left join courseEnroll e on e.courseId = c.id and e.userId = ? where c.ifValid = 1 and c.title like '电视剧_"+this.sub_title+"%'",
		        vals: _dump([this.userInfo.id,])
		    }, (d) => {
		        if (d.success && d.data) {
		            d.data.forEach((i) => {
		                i.ecredit = parseInt(i.ecredit);
		                i.noNeedToUpdate = i.ecredit >= 20*60;
		                i.num = parseInt(_at(i.title.split("_"), -1));
		                i.url = $(i.content).find("video").attr("src");
		                if (!i.url) i.url = $(i.content).attr("src");
		                this.urls.push(i);
		            });

                    this.intervalCb = setInterval(() => {
                        this.courseEnroll();
                    }, 30000);

                    this.$nextTick(() => {
                        var v = $("video")[0];
                        if (!v) return;
                        v.addEventListener("webkitbeginfullscreen", function() {
                            plus.screen.lockOrientation('landscape');
                        });
                        v.addEventListener('webkitendfullscreen', function() {
                            plus.screen.lockOrientation('portrait');
                        });
                    })
		        }
		        this.urls.sort((a,b) => {
		            return a.num - b.num;
		        });
		        this.currentNum = 0;
		    });
		}
    });
}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}