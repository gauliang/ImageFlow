/**
 * ImageFlow 瀑布流
 * version : 1.0.0
 */
+function(Core){
	if (!window.jQuery) {
		throw new Error("ImageFlow 依赖 jQuery ！");
	}
	if (window && window.jQuery) {
		Core(window, window.jQuery);
	}
}(function(global,$){

	var version = "1.0.0";
	var imageFlow = function(){
		this.version = version;
	}

	var Core = function(opts){

		this.data = {
			timer: null,
			colWidth	: 0,	// 列宽, 像素单位
			currentRow 	: 0,	// 光标所在行的位置
			rowHeight	: 0,	// 行高, 像素单位
			row			: 0,	// 总列数
			col			: 0,	// 总行数
			scale		: 0,	// 单张普通图片比例
			colpos		: [],	// 存储各行中最后一列的位置
			articles 	: [],	// 存储稿件
			articlesTemp: [],	// 暂存插入失败的稿件
			source 		: null,
			target 		: null
		}

		this.options = {
			scope	: '',
			scale	: "16:9",
			colspan	: 1.85,	// 跨列宽高比
			rowspan : 0.7,	// 跨行宽高比
			gutter	: 10,
			tpl		: '<a href="{link}"></a><div class="info"><h3>{title}</h3><p>{desc}</p><span>作者：{author}</span></div>',
			screen 	: {
				breakpoints : [768, 960, 1200, 1600],
				typeList : ['xs', 'sm', 'md', 'lg', 'hg']
			},
			grid	: {
				hg : { col : 6, row : 2 },
				lg : { col : 5, row : 2 },
				md : { col : 4, row : 3 },
				sm : { col : 3, row : 4 },
				xs : { col : 2, row : 5 }
			}
		}
	}

	Core.prototype.init = function(opts){

		var that = this;

		$.extend(this.options, opts);

		this.data.row = this.options.grid[this.scrrenType()].row;
		this.data.col = this.options.grid[this.scrrenType()].col;

		for(var i = 0; i < this.data.row; i++){
			this.data.colpos.push(0);
		}

		this.data.source 	= $(this.options.scope);
		this.data.colWidth 	= Math.round((this.data.source.width() - (this.data.col - 1)*this.options.gutter) /this.data.col);
		this.data.scale		= parseInt(this.options.scale.split(':')[1])/parseInt(this.options.scale.split(':')[0]);
		this.data.rowHeight	= this.data.colWidth * this.data.scale;
		this.data.target	= $(document.createElement('div'));

		this.data.target.addClass('viewport');
		this.data.target.css({height:this.data.row * this.data.rowHeight + this.options.gutter * (this.data.row - 1)});
		this.data.source.append(this.data.target);

		$.each(this.data.source.find('.col'), function(i,n){
			that.data.articles.push({
				title	: $(n).attr('data-title'), 
				image	: $(n).attr('src'), 
				desc	: $(n).attr('data-desc'), 
				author	: $(n).attr('data-author'), 
				link	: $(n).attr('data-link')
			});
		});
				
		$(window).resize(function(){that.onResize()});

		// 递归所有图片
		that.recursion(this.data.articles);
	}

	// 判断屏幕尺寸
	Core.prototype.scrrenType = function(){
		var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		for(var i = 0; i < this.options.screen.breakpoints.length; i++){
			if(width < this.options.screen.breakpoints[i]){
				return this.options.screen.typeList[i];
			}
		}
		return 'hg';
	}

	// 响应窗口变化
	Core.prototype.onResize = function(){

		var that = this;

		if(this.data.timer){
			clearTimeout(this.data.timer);
			this.data.timer = setTimeout(function() {
				that.flush();
			}, 300);
		}else{
			this.data.timer = setTimeout(function() {
				that.flush();
			}, 300);
		}
	}

	// 刷新布局
	Core.prototype.flush = function(){
		this.data.target.remove();
		this.data.currentRow 	= 0;
		this.data.colpos 		= [];
		this.data.articles 		= new Array();
		this.data.articlesTemp 	= [];
		this.init(this.scope);
	}

	// 插入暂存列表中的稿件
	Core.prototype.insertTempArticle = function(){
		
		var _arr = [];

		// 删除已插入到文档的元素
		if(this.data.articlesTemp.length > 0){

			for(var i = 0; i < this.data.articlesTemp.length; i++){
				if(this.data.articlesTemp[i].iteminfo.flag != 'inserted'){
					_arr.push(this.data.articlesTemp[i]);
				}
			}
			this.data.articlesTemp = _arr;
		}

		// 插入暂存稿件
		if(this.data.articlesTemp.length > 0){
			for(var i = 0; i < this.data.articlesTemp.length; i++){
				this.data.articlesTemp[i].index = i;
				if(this.insertElement(this.data.articlesTemp[i]) >= this.data.col){
					return ;
				}
			}
		}
	}

	// 把数据嵌入模板，尝试插入到文档中。
	Core.prototype.recursion = function (list){

		var that = this;
		
		if(list.length > 0){
			var item = list.shift();

			// 如果失败列表中有高级，则先尝试插入失败列表中的稿件
			that.insertTempArticle();

			var wrap = this.options.tpl.replace(/\{(.+?)\}/g,function(word){
				return item[word.substring(1,word.length-1)];
			})

			var article = {};
			var _img = $(new Image());

			_img.bind('load', function(){

				article.naturalWidth = _img[0].naturalWidth;
				article.naturalHeight = _img[0].naturalHeight;
				article.image = _img;
				article.wrap = wrap;
				article.iteminfo = item;

				if(that.insertElement(article) < that.data.col){
					that.recursion(list);
				}else{
					return ;
				}
			});

			_img.attr({'src':item.image});

		}else{
			return;
		}
	}


	Core.prototype.insertElement = function(article){

		var _row 	= this.data.currentRow;
		var _col 	= this.data.colpos[_row];
		var _scale 	= article.naturalWidth/article.naturalHeight;
		var _colwith = 0;
		var _colheight = 0;

		var element = $(document.createElement('div')).addClass('col').append(article.wrap);
		element.append(article.image)

		if(article.naturalWidth/article.naturalHeight > this.options.colspan){

			// 横向跨列 - 判断横向跨栏空间是否充裕
			if(this.data.col - (_col+2) >= 0){
				var col = this.data.target.append();

				// 根据图片比例及单元格尺寸设置图片位置及大小
				_colwith = this.data.colWidth * 2 + this.options.gutter;
				_colheight = this.data.rowHeight;
				this.imageFix(article.image, _scale, _colwith, _colheight)
				
				// 设置盒子尺寸
				element.css({
					'width'	: _colwith,
					'height': _colheight, 
					'left' 	: this.data.colpos[_row] * this.data.colWidth + this.data.colpos[_row] * this.options.gutter, 
					'top'	: _row * this.data.rowHeight + _row * this.options.gutter
				});

				this.data.target.append(element);
				// console.log(article.iteminfo.title+'跨列成功');
				if(article.iteminfo.flag == 'temp'){
					this.data.articlesTemp[article.index].iteminfo.flag = 'inserted';
				}

				// 列焦点向后移动 2 位
				this.data.colpos[_row] += 2;
				
				// 移动行焦点到最小列所在位置
				this.data.currentRow = this.getMinimumRow();

			}else{
				// 跳过该元素
				if(article.iteminfo.flag != 'temp'){
					article.iteminfo.flag = 'temp';
					article.iteminfo.failed = 0;
					this.data.articlesTemp.push(article);
				}
				if(article.iteminfo.failed>10) this.data.articlesTemp.shift();
				article.iteminfo.failed ++;
				// console.log(article.iteminfo.title+'跨列失败');
			}

		} else if(article.naturalWidth/article.naturalHeight < this.options.rowspan) {

			// 纵向跨行 - 判断纵向跨行空间是否充裕
			if(this.data.row - (_row+2) >= 0 && this.data.colpos[_row] >=  this.data.colpos[_row+1] && this.data.col - (_col+1) >= 0){
				
				// 根据图片比例及单元格尺寸设置图片位置及大小
				_colwith = this.data.colWidth;
				_colheight = this.data.rowHeight * 2 + this.options.gutter;
				this.imageFix(article.image, _scale, _colwith, _colheight)

				// 设置盒子尺寸
				element.css({
					'width'	: _colwith,
					'height': _colheight, 
					'left' 	: this.data.colpos[_row] * this.data.colWidth + this.data.colpos[_row] * this.options.gutter, 
					'top'	: _row * this.data.rowHeight + _row * this.options.gutter
				});

				this.data.target.append(element);
				// console.log(article.iteminfo.title+'跨行成功');
				if(article.iteminfo.flag == 'temp'){
					this.data.articlesTemp[article.index].iteminfo.flag = 'inserted';
				}

				this.data.colpos[_row] ++;	// 列焦点向后移动 1 位
				this.data.colpos[_row+1] ++;	// 列焦点向后移动 1 位

				// 移动行焦点到最小列所在位置
				this.data.currentRow = this.getMinimumRow();
				
			}else{
				// 跳过该元素
				if(article.iteminfo.flag != 'temp'){
					article.iteminfo.flag = 'temp';
					article.iteminfo.failed = 0;
					this.data.articlesTemp.push(article);
					
				}
				if(article.iteminfo.failed>10) this.data.articlesTemp.shift();
				article.iteminfo.failed ++;
				// console.log(article.iteminfo.title+'跨行失败')
			}

		}else{

			// 正常追加 - 判断水平方向能否追加下一个稿件
			if(this.data.col - (_col+1) >= 0) {
				
				// 根据图片比例及单元格尺寸设置图片位置及大小
				_colwith = this.data.colWidth;
				_colheight = this.data.rowHeight;

				this.imageFix(article.image, _scale, _colwith, _colheight)

				// 设置盒子尺寸
				element.css({
					'width'	: _colwith,
					'height': _colheight, 
					'left' 	: this.data.colpos[_row] * this.data.colWidth + this.data.colpos[_row] * this.options.gutter,  
					'top'	: _row * this.data.rowHeight + _row * this.options.gutter
				});

				this.data.target.append(element);
				// console.log(article.iteminfo.title + '正常追加');

				this.data.colpos[_row] ++;	// 列焦点向后移动 1 位

				// 移动行焦点到最小列所在位置
				this.data.currentRow = this.getMinimumRow();

			}else{
				// 正常追加失败
			}

		}

		// 返回执行本次插入后所有行中的最小列
		return this.data.colpos[this.getMinimumRow()];
	}

	Core.prototype.imageFix = function(image, _scale, _colwith, _colheight){
		if( _scale <= _colwith/_colheight){
			image.css({
				'width'	: _colwith,
				'top'	: 0 - (_colwith / _scale-_colheight)/2
			});
		}else{
			image.css({
				'height': _colheight,
				'left' 	: 0 - (_colheight * _scale - _colwith)/2
			});
		}
	}

	// 获取最短行的行号
	Core.prototype.getMinimumRow = function(){

		var lowest 	= 0;
		var arr 	= this.data.colpos;

		for (var i = 1; i < arr.length; i++) {
			if (arr[i] < arr[lowest]) lowest = i;
		}
		return lowest;
	}

	imageFlow.prototype.create = function(scope, opts){
		$.extend((opts || {}),{scope:scope});
		(new Core()).init(opts);
	}
	
	window.ImageFlow = new imageFlow;
});