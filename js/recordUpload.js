(function() {
    var plusReady = function() {
        var wb = plus.webview.currentWebview();
		
		var gentry = null;	//音频目录对象
		var clock = null;	//时钟对象
		var time = 0;	//时钟计时变量
		var recorder = null;	//设备录音对象
		var tape = '';	//录音文件
		// 获取音频目录对象
		plus.io.resolveLocalFileSystemURL('_doc/', function(entry) {
			entry.getDirectory('audio', {
				create: true
			}, function(dir) {
				gentry = dir;
			}, function(e) {
				console.log('Get directory "audio" failed: ' + e.message);
			});
		}, function(e) {
			console.log('Resolve "_doc/" failed: ' + e.message);
		});

        var vm = new Vue({
            el: "#recordUpload",
            data: {
                record: "",
                img1: "",
                img2: "",
                img3: "",
                imgStyle1: {
                    backgroundImage: ""
                },
                imgStyle2: {
                    backgroundImage: ""
                },
                imgStyle3: {
                    backgroundImage: ""
                },
                isTape: false,	//是否录音状态
                tapeTime: "00:00:00",	//录音状态下的时间记录
                tapeComplete: false, 	//录音是否完成
                audioTime: '00:00:00',	//录音时间
                isAudioPlay: false	//是否在播放录音
            },
            methods: {
                uploadImg1: function(evt) {
//                  var self = this;
//                  plus.nativeUI.showWaiting('上传中...')
//                  uploadImage("activitySortAdd", evt, function(r) {
//                      plus.nativeUI.closeWaiting();
//                      self.img1 = serverAddr+'/upload/pic/activitySortAdd/'+r.thumb;
//                      self.imgStyle1.backgroundImage = "url("+self.img1+")";
//                  });

			         plus.gallery.pick( function(path){
				    	openWindow('imageClipper.html', 'imageClipper', {path})
				    }, function ( e ) {
				    	console.log( "取消选择图片" );
				    }, {filter:"image"} );
                },
                uploadImg2: function(evt) {
                    var self = this;
                    plus.nativeUI.showWaiting('上传中...')
                    uploadImage("activitySortAdd", evt, function(r) {
                        plus.nativeUI.closeWaiting();
                        self.img2 = serverAddr+'/upload/pic/activitySortAdd/'+r.thumb;
                        self.imgStyle2.backgroundImage = "url("+self.img2+")";
                    });
                },
                uploadImg3: function(evt) {
                    var self = this;
                    plus.nativeUI.showWaiting('上传中...')
                    uploadImage("activitySortAdd", evt, function(r) {
                        plus.nativeUI.closeWaiting();
                        self.img3 = serverAddr+'/upload/pic/activitySortAdd/'+r.thumb;
                        self.imgStyle3.backgroundImage = "url("+self.img3+")";
                    });
                },
                uploadRecord: function() {
                    var record = _trim(this.record);
                    if (!record) return mui.toast("请填写记录内容");
                    if (!this.img1 && !this.img2 && !this.img3) return mui.toast("请上传至少一张照片");

                    var self = this;
                    _callAjax({
                        cmd: "exec",
                        sql: "update activitys set record = ?, recordImgs = ?, recordTime = ? where id = ?",
                        vals: _dump([record, _dump([self.img1, self.img2, self.img3]), _now(), wb.aid])
                    }, function(d) {
                        if (d.success) {
                            mui.toast("上传成功");
                            mui.fire(plus.webview.getWebviewById("activeDetail"), "refresh", {
                                aid: wb.aid
                            });
                            mui.back();
                        } else {
                            mui.toast("上传失败");
                        }
                    });
                },
                startTape: function() {
                	var self = this;
					recorder = plus.audio.getRecorder();	//获取设备录音对象
					if(recorder == null)  return mui.toast('录音对象未获取');

					recorder.record({	//开始录音
						filename: '_doc/audio/'	//录音存放路径
					}, function(p) {
						plus.io.resolveLocalFileSystemURL(p, function(entry) {
							mui.toast('录音成功');
							self.tapeComplete = true;
						}, function(e) {
							mui.toast('读取录音文件错误：' + e.message);
						});
					}, function(e) {
						mui.toast('录音失败：' + e.message);
					});
					
					self.isTape = true;
					clock = setInterval(function() {	//录音计时
						time++;
						self.tapeTime = timeToStr(time);
					}, 1000);
               },
               	endTape: function() {
                	var self = this;
	               	self.isTape = false;
					self.audioTime = self.tapeTime;
					self.tapeTime = '00:00:00';
					clearInterval(clock);
					clock = null;
					recorder.stop();
					recorder = null;
					time = 0;
					self.updateHistory()
               	},
               	updateHistory: function() {	//获取最新一条的录音文件
               		var self = this; 
	               	if(!gentry || !document.body) return false; //兼容可能提前注入导致DOM未解析完更新的问题
					var reader = gentry.createReader();
					reader.readEntries(function(entries) {
						tape = entries[entries.length - 1].name;	//暂存音频文件名供播放使用
					}, function(e) {
						mui.toast('读取录音列表失败：' + e.message);
					});
               	},
               	startAudio: function() {
               		var self = this;
               		if(this.isAudioPlay) return false;	//检测播放状态 以防误点击
               		this.isAudioPlay = true;
					var player = plus.audio.createPlayer('_doc/audio/'+tape);
					player.play(function() {
               			self.isAudioPlay = false;	//关闭播放状态
					}, function(e) {
						mui.toast('播放音频文件"' + url + '"失败：' + e.message);
					});
              	},
              	audioPicker: function() {
              		var self = this;
              	
                	plus.nativeUI.actionSheet({
	                    title: "音频操作",
	                    cancel: "取消",
	                    buttons: [{title:'播放'},{title:'删除'}]
	                }, function(e) {
						if(e.index == 1) {
							return self.startAudio();
						}
						if(e.index == 2) {
							tape = '';
							self.audioTime = '00:00:00';
							self.tapTime = '00:00:00';
							self.tapeComplete = false;
						}
	                });
              	},
	          	audioRecog: function() {
	          		var self = this;
		          	var options = {engine: 'iFly',};
					plus.speech.startRecognize( options, function ( s ) {
						self.record = self.record + s;
					}, function ( e ) {
						mui.toast( "语音识别失败："+e.message );
					});
				}
            }
        });

        // 获取信息
        _callAjax({
            cmd: "fetch",
            sql: "select record, recordImgs from activitys where id = ?",
            vals: _dump([wb.aid,])
        }, function(d) {
            if (d.success && d.data && d.data.length) {
            	console.log(d.data[0].recordImgs)
                var imgs = _load(d.data[0].recordImgs);
                [1,2,3].forEach(function(i) {
                    vm["img"+i] = imgs[i-1];
                    vm["imgStyle"+i].backgroundImage = "url("+imgs[i-1]+")";
                });
                vm.record = d.data[0].record;
            }
        });
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());
