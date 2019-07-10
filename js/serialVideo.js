//预加载页面

// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	let serialVideo = new Vue({
		el: '#serialVideo',
		data: {
            poster: "",
            sub_title: "",
		    currentNum: -1,
		    urls: []
		},
		methods: {
		    play: function(i) {
		        this.currentNum = i.num;
		        this.$nextTick(() => {
                    $("video").get(0).play();
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
		        sql: "select title, content from courses where ifValid = 1 and title like '电视剧_"+this.sub_title+"%'"
		    }, (d) => {
		        if (d.success && d.data) {
		            d.data.forEach((i) => {
		                i.num = parseInt(_at(i.title.split("_"), -1));
		                i.url = $(i.content).find("video").attr("src");
		                if (!i.url) i.url = $(i.content).attr("src");
		                this.urls.push(i);
		            });
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