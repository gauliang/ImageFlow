# ImageFlow
ImageFlow —— 可以根据图片长宽比自动确定跨行或跨列布局的图片流组件，支持响应式页面设计。
ImageFlow 依赖于 jQuery，但其本身并不是 jQuery 插件。

![Preview](https://github.com/kelsengao/ImageFlow/raw/master/example/data/Example%20-%20ImageFlow.jpg)

## Description
```
ImageFlow.create('#srouce'[,options]);
```

## Options

- scope
	- 类型 : string
	- 描述 : 作用域，装载图片流信息的 HTML 元素 ID。

- scale	: 
	- 类型 : string
	- 描述 : 单元格比例, 在没有跨行或跨列时图片的默认显示比例。
	- 示例 : "16:9"

- colspan 
	- 类型 : number
	- 描述 : 横向跨栏宽高比阀值。当图片的宽高比大于该值时图片将占两格横向跨栏显示。
	- 示例 : 1.85

- rowspan 
	- 类型 : number
	- 描述 : 纵向跨行宽高比阀值。当图片的宽高比小于该值时图片将占两格纵向跨行显示。
	- 示例 : 0.7

- gutter
	- 类型 : number
	- 描述 : 各行、列之间的间隔。
	- 示例 : 10

- tpl
	- 类型 : string
	- 描述 : 插入到单元格内的HTML元素模板。
	- 示例 : 
		```
		<a href="{link}"></a>
		<div class="info">
		<h3>{title}</h3>
		<p>{desc}</p>
		<span>作者：{author}</span>
		</div>
		```
	- 说明
		- link 	: 取自作用域下各元素的 data-link 属性。
		- src  	: 取自作用域下各元素的 data-src 属性。
		- title : 取自作用域下各元素的 data-title 属性。
		- desc 	: 取自作用域下各元素的 data-desc 属性。
		- author : 取自作用域下各元素的 data-author 属性。

- screen
	- 类型 : object
	- 描述 : 定义屏幕类型及识别屏幕类型所需要的断点信息。
	- 属性 : 
		- breakpoints : array[number] ,存储断点信息的数组。
		- typeList:	array[string] , 存储屏幕类型标识
	- 示例 : 下面定义了 5 种类型的屏幕
		```javascript
		{
			breakpoints : [768, 960, 1200, 1600],
			typeList : ['xs', 'sm', 'md', 'lg', 'hg']
		}
		```
		
		上例中定义的屏幕类型信息如下：

		- xs : 0 ~ 768px;
		- sm : 768px ~ 960px;
		- md : 960px ~ 1200px;
		- lg : 1200px ~ 1600;
		- hg : 1600px ~ n;

- grid
	- 类型 : object
	- 描述 : 定义在不同类型的屏幕中图片流的最大行和列信息。屏幕类型信息在 screen 配置中定义。
	- 属性 :
		- 字段名 : 在屏幕类型定义中定义的屏幕类型标识。
		- 字段值 : 
			- 类型 : object
			- 属性 
				- row : number ,定义在当前类型屏幕下图片流最大显示的行数。 
				- col : number ,定义在当前类型屏幕下图片流最大显示的列数。 
	- 示例 : 下面定义了在不同类型的屏幕下图片流将显示的最大行数和列数。
	```javascript
	{
		hg : { col : 6, row : 2 },
		lg : { col : 5, row : 2 },
		md : { col : 4, row : 3 },
		sm : { col : 3, row : 4 },
		xs : { col : 2, row : 5 }
	}
	```

## Getting started
```html
<!--head-->
<link rel="stylesheet" href="styles/style.css">
<!--/head-->

<!--body-->
<div id="source">
	<div class="hidden">
		<div class="col" data-link="url" src="data/01.jpg" data-title="title-1" data-desc="描述" data-author="author"></div>
		...
		<div class="col" data-link="url" src="data/0n.jpg" data-title="title-n" data-desc="描述" data-author="author"></div>
	</div>
</div>
<script src="path/image-flow.min.js"></script>
<script>
	var options = {
		scope	: '',
		scale	: "16:9",
		colspan	: 1.85,
		rowspan : 0.7,
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
	ImageFlow.create('#srouce', options);
<script>
<!--/body-->
```
