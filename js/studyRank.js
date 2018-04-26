(function() {
    var plusReady = function() {
        var vm = new Vue({
            el: "#studyRank",
            data: {
            		monthRanks:[],
            		yearRanks: [],
            		activeTab: "month",
            		ranks: []
            },
			watch: {
				activeTab: function(i) {
					this.ranks = (i == "month") ? this.monthRanks : this.yearRanks;
				}
			},
            methods: {
            	
            },
            created: function() {
            		var self = this;
            		// 月排行
            		_rankAjax({
            			cmd: "month"
            		}, function(d) {
            			if (d.success && d.data && d.data.length) {
            				self.monthRanks = d.data;
            				self.ranks = d.data;
            			}
            		});
            		// 年排行
            		_rankAjax({
            			cmd: "year"
            		}, function(d) {
            			if (d.success && d.data && d.data.length) {
            				self.yearRanks = d.data;
            			}
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
