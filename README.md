# 图表组件封装 G2+echarts4

- 使用 gulp 作为任务编排工具
- 使用 es2015 语法
- 使用 bower 管理前端库
- 使用 webpack 打包

## Demo

[G2+echarts map](https://emiyagm.github.io/component-chart-gm/example/index.html)

[echarts bar pie map](https://emiyagm.github.io/component-chart-gm/example/index_echarts.html) 

## 初始化

```
npm install
bower install
```

## 编译

```shell
npm run build
```

编译后的组件代码在 dist 中。

## 开发

### js

单独编译src/js下的文件：

```shell
npm run scripts
```

### css 和静态文件

单独编译src/css下的文件：

```shell
npm run styles
```
scss文件也可以一起编译

单独编译src/images下的文件：

```shell
npm run images
```

### 第三方组件

开发时使用 `bower_components/*/dist/` 下的第三方组件，可以在 `bower.json` 文件中修改组件版本

### 调用方式

引入的资源
```html
    <script src="https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js"></script>
    <script src="../dist/js/component-chart.js"></script>
```

请预先设置好绘制图表的div的宽和高

###G2图表绘制调用

```javascript

var chartsMap = new Map();
    chartsMap = compoent_chart.init(chartsdata,'default',function (G2) {
        //console.log(G2);
    });
```

参数说明：

```javascript
//第一个参数代表需要构建的图表信息
var chartsdata = {
        charts : [
            {
                id : 'c1', //绘制区域div id
                data : data, //数据源 // G2 对数据源格式的要求，仅仅是 JSON 数组，数组的每个元素是一个标准 JSON 对象。
                height : 300, //绘制区域div 高度
                type : 'xbar', //绘制图表种类
                fields : [ 'Jan.','Feb.','Mar.','Apr.','May.','Jun.','Jul.','Aug.' ], //类目轴
                key : '月份', //x轴含义
                value : '月均降雨量',  //y轴含义
                title: '123456',  //图表标题（可不填）
                tooltip: '11111111111' //图表标题提示信息（可不填）
            },
            {
                id : 'c2',
                data : data,
                height : 300,
                type : 'line',
                fields : [ 'Jan.','Feb.','Mar.','Apr.','May.','Jun.','Jul.','Aug.' ],
                key : '月份',
                value : '月均降雨量'
            },
            {
                id : 'c3',
                data : data2,
                height : 300,
                type : 'pie',
                value : '车辆数量',
                title : '在线统计',
                tooltip : '在线、离线车辆的数量和占比'
            },
            {
                id : 'c4',
                data : data2,
                height : 300,
                type : 'pie-donut',
                value : '数量'
            },
            {
                id : 'c5',
                data : data2,
                height : 300,
                type : 'pie-donut-rose',
                value : '数量'
            },
            {
                id : 'c7',
                data : data3,
                height : 300,
                type : 'ybar',
                fields : [ '报警数量'],
                title: '123456',
                tooltip: '11111111111'
            },
            {
                id : 'c8',
                data : data4,
                width: 600,
                height : 300,
                type : 'map-echarts',
                title: '车辆分布',
                fields : [ '报警数量']
            },
            {
                id: 'c9',
                data : data5,
                width: 600,
                height : 300,
                type: 'scatter',
                key: 'height',
                value: 'weight'
            },
            {
                id : 'c10',
                data : data,
                height : 300,
                type : 'table',
                fields : [ 'name' ,'Jan.','Feb.','Mar.','Apr.','May.','Jun.','Jul.','Aug.' ]
            }
        ]
    };

//第二个参数代表图表的主题，分为亮色default主题和dark暗示主题
//注意，切换主题需要将原图表清空重画

chartsMap.forEach(function (item, key, mapObj) {
        item.clear();
        $('#'+key).empty();
    });

    chartsMap = compoent_chart.init(chartsdata,'dark',function (G2, chartsMap) {
        //console.log(G2);
        chartsMap.forEach(function (item, key, mapObj) {
            //$('#'+key+'-title').empty();
        })
    });
    
//最后一个参数代表回调函数

```
[G2官方文档](https://antv.alipay.com/zh-cn/g2/3.x/api/index.html)

###Echarts4图表绘制调用

```javascript
compoent_chart.initEchartsPie(containerId,legendArray,dataArray,nameArray,isNodata,title,tooltip) //饼图
compoent_chart.initEchartsPieDonut(containerId,legendArray,dataArray,nameArray,isNodata,title,tooltip); //环状饼图
compoent_chart.initEchartsPieDonutRose(containerId,legendArray,dataArray,nameArray,isNodata,title,tooltip); //玫瑰饼图
compoent_chart.initEchartsBarX(containerId,legendArray,xArray,dataArray,nameArray,xPosition,xInterval,labelShow,isNodata,title,tooltip); //横向柱图
compoent_chart.initEchartsBarX_nopercent(containerId,legendArray,xArray,dataArray,nameArray,xPosition,xInterval,labelShow,isNodata,title,tooltip); //无百分比数据显示的横向柱图
compoent_chart.initEchartsBarY(containerId,legendArray,yArray,dataArray,nameArray,xPosition,isNodata,barWidth,title,tooltip);  //纵向柱图（带右侧滚动条 )
compoent_chart.initEchartsBarY_noScroll(containerId,legendArray,yArray,dataArray,nameArray,xPosition,isNodata,barWidth,title,tooltip); //纵向柱图（不带右侧滚动条)
compoent_chart.initEchartsMap(containerId,dataArray,nameArray,minNumber,isNodata,title,tooltip); //地图
compoent_chart.initEchartsLineForNumber(containerId,legendArray,xArray,dataArray,nameArray,isNodata,title,tooltip);  //数值线图，上方数值，下方无提示线图
compoent_chart.initEchartsBarX_markPoint(containerId,legendArray,xArray,dataArray,nameArray,xPosition,xInterval,labelShow,isNodata,title,tooltip);  //带最大值提示横向柱图
compoent_chart.initEchartsLine_markPoint(containerId,legendArray,xArray,dataArray,nameArray,isNodata,title,tooltip);  //带最大值提示线图
compoent_chart.initEchartsMix(containerId,legendArray,xArray,dataArray,nameArray,isNodata,title,tooltip);  //折柱混合图
compoent_chart.initEchartsLineArea(containerId,legendArray,xArray,dataArray,nameArray,isNodata,title,tooltip);  //区域线图
compoent_chart.initEchartsLineAndBar(containerId,legendArray,xArray,yArray,dataArray,nameArray,isNodata,title,tooltip);  //折柱分离混合图
```
参数说明：

| 参数名 | 类型 | 说明 |
|:---|:---|:---|
| containerId | String | 绘制区域ID |
| legendArray | Array | 图例数据 |
| dataArray | Array | 数据源 |
| nameArray | Array | 数据分组 |
| isNodata | Boolean | 是否有数据，如果为false，图表会显示暂无数据 |
| xArray | Array | x轴刻度数据 |
| yArray | Array | y周刻度数据 |
| xPosition | String | x轴名称位置 |
| xInterval | Number | x轴刻度间隔 |
| labelShow | Boolean | 是否显示图上数据提示 |
| barWidth | Number | 柱状图柱快宽度 |
| title | String | 图表名称 |
| tooltip | String | 图表提示信息 |


注意：
echarts地图数据的构建必须将每个省都填入数据，无数据就填0

```javascript
const mapData = [[{name: '北京',value: 0 },
        {name: '天津',value: 0 },
        {name: '上海',value: 0 },
        {name: '重庆',value: 0 },
        {name: '河北',value: 0 },
        {name: '河南',value: 0 },
        {name: '云南',value: 0 },
        {name: '辽宁',value: 0 },
        {name: '黑龙江',value: 0 },
        {name: '湖南',value: 0 },
        {name: '安徽',value: 0 },
        {name: '山东',value: 0 },
        {name: '新疆',value: 0 },
        {name: '江苏',value: 0 },
        {name: '浙江',value: 0 },
        {name: '江西',value: 0 },
        {name: '湖北',value: 0 },
        {name: '广西',value: 0 },
        {name: '甘肃',value: 0 },
        {name: '山西',value: 0 },
        {name: '内蒙古',value: 0 },
        {name: '陕西',value: 0 },
        {name: '吉林',value: 0 },
        {name: '福建',value: 0 },
        {name: '贵州',value: 0 },
        {name: '广东',value: 0 },
        {name: '青海',value: 0 },
        {name: '西藏',value: 0 },
        {name: '四川',value: 0 },
        {name: '宁夏',value: 0 },
        {name: '海南',value: 0 },
        {name: '台湾',value: 0 },
        {name: '香港',value: 0 },
        {name: '澳门',value: 0 },
        {name: '南海诸岛',value: 0 }]];
```

注意：
每个echarts图表接口调用均有返回值，如果需要后续动态修改图表中的信息，比如数据的更新或者样式的更新，请使用返回值的setOption方法，详情请见[echarts](http://echarts.baidu.com/option.html)官方文档。
