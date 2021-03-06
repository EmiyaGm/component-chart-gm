import G2 from "@antv/g2"
import DataSet from "@antv/data-set"
import $ from "jquery"
import tippy from "tippy.js"
import echarts from "echarts"
import "echarts/map/js/china.js"
import {downloadExl} from "./downloadExl";

window.compoent_chart = {
    init(data,theme,callBack){
        let colorArray = ['#2ec7c9','#B0E49D','#f0d702','#63aae1','#bf6ff5','#ae8d70','#333333','#b9c7d4'];
        let charts = data.charts;
        let chartsMap = new Map();
        G2.Global.setTheme(theme);
        for(let i = 0;i<charts.length;i++){
            const ds = new DataSet();
            const dv = ds.createView().source(charts[i].data);

            if(charts[i].tooltip){
                $('#'+charts[i].id).append('<div id="'+charts[i].id+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(charts[i].title ? charts[i].title : '')+'<img src="../dist/images/help.svg" title="'+charts[i].tooltip+'" style="text-align: center;vertical-align: middle;padding-left: 3px;padding-bottom: 2px;" onerror="this.src=\'common/mauna/js/mauna.charts/dist/images/help.svg\'"></div>');
            }else{
                $('#'+charts[i].id).append('<div id="'+charts[i].id+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(charts[i].title ? charts[i].title : '')+'</div>');

            }

            $('#'+charts[i].id).append('<div id="'+charts[i].id+'-chart" class="chart-canvas"></div>');

            if(theme == 'dark'){
                $('#'+charts[i].id).css('background-color','#1F1F1F');
                $('#'+charts[i].id+'-title').css('color','#A6A6A6');
            }else{
                $('#'+charts[i].id).css('background-color','#FFFFFF');
                $('#'+charts[i].id+'-title').css('color','#000000');
            }

            tippy('img' ,{
                arrow: true,

            });

            const chart = new G2.Chart({
                container: charts[i].id+'-chart',
                height:charts[i].height,
                forceFit:true,
                padding: 'auto'
            });

            chart.axis({
                label: {
                    textStyle: {
                        fill: '#999999', // 文本的颜色
                    }
                }
            });
            switch (charts[i].type){
                case 'xbar':
                    dv.transform({
                        type: 'fold',
                        fields: charts[i].fields, // 展开字段集
                        key: charts[i].key, // key字段
                        value: charts[i].value, // value字段
                    });
                    chart.source(dv);
                    chart.interval()
                        .position(charts[i].key+'*'+charts[i].value)
                        .color('name',colorArray)
                        .label(charts[i].value,{
                            offset: 15,
                            textStyle: {
                                fill: '#999999', // 文本的颜色
                                textBaseline: 'top' // 文本基准线，可取 top middle bottom，默认为middle
                            }
                        })
                        .adjust([{
                            type: 'dodge',
                            marginRatio: 1 / 32
                        }]);
                    chart.legend(false);
                    chart.render();
                    break;
                case 'ybar':
                    dv.transform({
                        type: 'fold',
                        fields: charts[i].fields, // 展开字段集
                        key: 'type', // key字段
                        value: 'value', // value字段
                    });
                    chart.source(dv);
                    chart.axis('value', {
                        position: 'left'
                    });
                    chart.axis('label', {
                        label: {
                            offset: 12
                        }
                    });
                    chart.coord().transpose().scale(1, -1);
                    chart.interval()
                        .position('label*value')
                        .color('type',colorArray)
                        .label('value',{
                            textStyle: {
                                fill: '#999999', // 文本的颜色
                                textBaseline: 'middle' // 文本基准线，可取 top middle bottom，默认为middle
                            }
                        })
                        .adjust([{
                            type: 'dodge',
                            marginRatio: 1 / 32
                        }]);
                    chart.legend(false);
                    chart.render();
                    $('#'+charts[i].id+'-chart').after('<div id = "'+charts[i].id+'-slider"></div>');
                    break;
                case 'line':
                    dv.transform({
                        type: 'fold',
                        fields: charts[i].fields, // 展开字段集
                        key: charts[i].key, // key字段
                        value: charts[i].value, // value字段
                    });
                    chart.source(dv);
                    chart.tooltip({
                        crosshairs: {
                            type: 'line'
                        }
                    });
                    chart.line().position(charts[i].key+'*'+charts[i].value).color('name',colorArray);
                    chart.point().position(charts[i].key+'*'+charts[i].value).color('name',colorArray).size(4).shape('circle').style({
                        stroke: '#fff',
                        lineWidth: 1
                    });
                    chart.legend(false);
                    chart.render();
                    break;
                case 'pie':
                    dv.transform({
                        type: 'percent',
                        field: 'count',
                        dimension: 'item',
                        as: 'percent'
                    });
                    chart.source(dv, {
                        percent: {
                            formatter: (val) => {
                                val = '（'+(val * 100).toFixed(2) + '%）';
                                return val;
                            }
                        }
                    });
                    chart.coord('theta', {
                        radius: 0.75
                    });
                    chart.tooltip({
                        showTitle: false,
                        itemTpl: '<li>'+charts[i].value+'<br /><span style="background-color:{color};" class="g2-tooltip-marker"></span> {name}: {count}({value})</li>'
                    });
                    chart.legend({
                        position : 'right'
                    });
                    chart.intervalStack()
                        .position('percent')
                        .color('item',colorArray)
                        .label('percent', {
                            formatter: (val, item) => {
                                return item.point.item + ': ' + item.point.count + val;
                            }
                        })
                        .tooltip('item*percent*count', (item, percent, count) => {
                            percent = (percent * 100).toFixed(2) + '%';
                            return {
                                name: item,
                                value: percent,
                                count: count
                            };
                        })
                        .style({
                            lineWidth: 1,
                            stroke: '#fff'
                        });
                    chart.render();
                    break;
                case 'pie-donut':
                    dv.transform({
                        type: 'percent',
                        field: 'count',
                        dimension: 'item',
                        as: 'percent'
                    });
                    chart.source(dv, {
                        percent: {
                            formatter: (val) => {
                                val = '（'+(val * 100).toFixed(2) + '%）';
                                return val;
                            }
                        }
                    });
                    chart.coord('theta', {
                        radius: 0.75,
                        innerRadius: 0.6
                    });
                    chart.tooltip({
                        showTitle: false,
                        itemTpl: '<li>'+charts[i].value+'<br /><span style="background-color:{color};" class="g2-tooltip-marker"></span> {name}: {count}({value})</li>'
                    });
                    chart.legend({
                        position : 'right'
                    });
                    chart.intervalStack()
                        .position('percent')
                        .color('item',colorArray)
                        .label('percent', {
                            formatter: (val, item) => {
                                return item.point.item + ': ' + item.point.count + val;
                            }
                        })
                        .tooltip('item*percent*count', (item, percent, count) => {
                            percent = (percent * 100).toFixed(2) + '%';
                            return {
                                name: item,
                                value: percent,
                                count: count
                            };
                        })
                        .style({
                            lineWidth: 1,
                            stroke: '#fff'
                        });
                    chart.render();
                    break;
                case 'pie-donut-rose':
                    chart.source(charts[i].data);
                    chart.coord('polar', {
                        innerRadius: 0.2
                    });
                    chart.legend({
                        position : 'right'
                    });
                    chart.axis(false);
                    chart.tooltip({
                        showTitle: false,
                        itemTpl: '<li>'+charts[i].value+'<br /><span style="background-color:{color};" class="g2-tooltip-marker"></span> {name}: {value}</li>'
                    });
                    chart.interval().position('item*count')
                        .color('item', colorArray)
                        .tooltip('item*count', (item, count) => {
                            return {
                                name: item,
                                value: count
                            };
                        })
                        .style({
                            lineWidth: 1,
                            stroke: '#fff'
                        });
                    chart.render();
                    break;
                case 'map':
                    $.getJSON('../dist/geojson/china.json', mapData => {
                        let map = [];
                        let features = mapData.features;
                        for (let i = 0; i < features.length; i++) {
                            let name = features[i].properties.name;
                            map.push({
                                "name": name,
                                "value": 1
                            });
                        }
                        chart.tooltip({
                            showTitle: false
                        });
                        chart.scale({
                            longitude: {
                                sync: true
                            },
                            latitude: {
                                sync: true
                            },
                        });
                        chart.axis(false);
                        let mapDv = new DataSet.View().source(mapData, {
                            type: 'GeoJSON'
                        });
                        mapDv.transform({
                            type: 'map',
                            callback: function(row) {
                                row.code = row.properties.code;
                                return row;
                            }
                        });
                        let bgView = chart.view();
                        bgView.source(mapDv);
                        bgView.tooltip(false);
                        bgView.polygon()
                            .position('longitude*latitude')
                            .style({
                                fill: '#DDDDDD',
                                stroke: '#b1b1b1',
                                lineWidth: 0.5,
                                fillOpacity: 0.85
                            });
                        const userData = [
                            {name: '江苏省',value: 86.8},
                        ];
                        const userDv = ds.createView()
                            .source(userData)
                            .transform({
                                geoDataView: mapDv,
                                field: 'name',
                                type: 'geo.region',
                                as: [ 'longitude', 'latitude' ]
                            })
                            .transform({
                                type: 'map',
                                callback: function(obj) {
                                    obj.trend = (obj.value > 100) ? '男性更多' : '女性更多';
                                    return obj;
                                }
                            });
                        const userView = chart.view();
                        userView.source(userDv, {
                            'trend': {
                                alias: '每100位女性对应的男性数量'
                            }
                        });
                        userView.polygon()
                            .position('longitude*latitude')
                            .color('trend', [ '#F51D27', '#0A61D7' ])
                            .opacity('value')
                            .tooltip('name*trend')
                            .animate({
                                leave: {
                                    animation: 'fadeOut'
                                }
                            });
                        chart.render();
                    });
                    break;
                case 'map-echarts':
                    $('#'+charts[i].id+'-chart').css('width','auto');
                    $('#'+charts[i].id+'-chart').css('height',charts[i].height);
                    let myChart = this.initEchartsMap(charts[i].id,charts[i].data,charts[i].fields,0);
                    if(theme == 'dark'){
                        myChart.setOption({
                            visualMap: {
                                textStyle:{
                                    color:'#A6A6A6'
                                }
                            },
                            graphic:[{
                                style: {
                                    fill: '#A6A6A6',
                                }
                            }]
                        });
                    }else{
                        myChart.setOption({
                            visualMap: {
                                textStyle:{
                                    color:'#333333'
                                }
                            },
                            graphic:[{
                                style: {
                                    fill: '#333',
                                }
                            }]
                        });
                    }
                    break;
                case 'scatter':
                    chart.source(charts[i].data);
                    chart.tooltip({
                        showTitle: false,
                        crosshairs: {
                            type: 'cross'
                        },
                        itemTpl: '<li data-index={index} style="margin-bottom:4px;">'
                        + '<span style="background-color:{color};" class="g2-tooltip-marker"></span>'
                        + '{name}<br/>'
                        + '{value}'
                        + '</li>'
                    });
                    chart.point().position(charts[i].key+'*'+charts[i].value)
                        .color('gender')
                        .size(4)
                        .opacity(0.65)
                        .shape('circle')
                        .tooltip('gender*'+charts[i].key+'*'+charts[i].value, (gender, first, second) => {
                            return {
                                name: gender,
                                value: first + '  ,  ' + second
                            };
                        });
                    chart.render();
                    break;
                case 'table':
                    let color;
                    if(theme == 'default'){
                        color = '#000000';
                    }else{
                        color = '#ffffff';
                    }
                    let table_columns = charts[i].fields;
                    var template = '<table border="1" style="width: 100%;height: 100%;color: '+color+';border-color:'+color+'"><tr>';
                    for (let i = 0; i < table_columns.length; i++) {
                        template = template + '<th>' + table_columns[i] + '</th>';
                    }
                    template = template + '</tr>';
                    for (let j = 0; j < charts[i].data.length; j++) {
                        template = template + '<tr>';
                        for (let k = 0; k < table_columns.length; k++) {
                            template = template + '<td>' + charts[i].data[j][table_columns[k]] + '</td>';
                        }
                        template = template + '</tr>';
                    }
                    template = template + '</table>';
                    $("#"+charts[i].id+'-chart').empty();
                    $("#"+charts[i].id+'-chart').append(template);
                    break;
            }
            chartsMap.set(charts[i].id,chart);
        }
        if(callBack){
            callBack(G2,chartsMap);
        }
        return chartsMap;
    },
    initEchartsMap(containerId,dataArray,nameArray,minNumber,isNodata,title,tooltip) {
        let seriesInfo =new Array();
        let max = 0;
        $('#'+containerId).empty();
        if(title){
            if(tooltip){
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'<img src="images/help.svg" title="'+tooltip+'" style="text-align: center;vertical-align: middle;padding-left: 3px;padding-bottom: 2px;" onerror="this.src=\'common/mauna/js/mauna.charts/dist/images/help.svg\'"></div>');
                tippy('img' ,{
                    arrow: true,

                });
            }else{
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'</div>');
            }
        }
        $('#'+containerId).append('<div id="'+containerId+'-chart" class="chart-canvas" style="height: calc(100% - 30px)"></div>');
        let dataAll = 0;
        if(nameArray !=undefined && nameArray.length>0){
            $.each(nameArray, function(i,o) {
                $.each(dataArray[i],function (i , o) {
                    dataAll = dataAll + o.value;
                    if(max < o.value){
                        max = o.value;
                    }
                });
                let seriesItem = {
                    name: nameArray[i],
                    type: 'map',
                    mapType: 'china',
                    roam: false,
                    label: {
                        normal: {
                            show: false
                        },
                        emphasis: {
                            show: true
                        }
                    },
                    tooltip:{
                        formatter: function (params) {
                            let percent = params.value/dataAll*100;
                            if(dataAll==0){
                                return params.name + '<br />' +params.seriesName+':'+params.value+'('+0.00+'%)';
                            }else {
                                return params.name + '<br />' +params.seriesName+':'+params.value+'('+percent.toFixed(2)+'%)';
                            }
                        }
                    },
                    data: dataArray[i],
                    itemStyle:{
                        emphasis: {
                            areaColor : '#AAE699'
                        }
                    }
                };
                seriesInfo.push(seriesItem);
            });
        }
        let option={
            legend: {
                orient: 'vertical',
                left: 'left',
                top:'bottom',
                data:nameArray,
                textStyle:{
                    color:'#333333'
                },
                show:false
            },
            tooltip: {
                trigger: 'item'
            },
            visualMap: {
                min: minNumber,
                max: parseInt(max/10+1)*10,
                left: 7,
                top: 'bottom',
                text: ['高','低'],           // 文本，默认为数值文本
                calculable: true,
                color : ['#01c4c4','#ffffff']
            },
            graphic: [
                {
                    type: 'text',
                    z: 100,
                    left:'middle',
                    bottom: 20,
                    style: {
                        fill: '#333',
                        text: '全国'+nameArray[0]+" "+dataAll,
                        font: '12px Microsoft YaHei'
                    }
                }
            ],
            series:seriesInfo
        };

        if(isNodata){
            option.graphic.shift();
            option.graphic.push({
                type: 'text',
                z:100,
                left:'center',
                top:'middle',
                style:{
                    text:'暂无数据',
                    font: 'normal 14px 黑体'
                }
            });
            option.series = [];
            option.visualMap.show = false;
        }
        let myChart = echarts.init(document.getElementById(containerId+'-chart'));// 图表初始化的地方，在页面中要有一个地方来显示图表，他的ID是main
        // option = getOptionByArray(json, reportDesign);//得到option图形
        myChart.setOption(option); //显示图形
        window.onresize = myChart.resize;
        return myChart;
    },
    dataTodv(data,type,fields,key,value){
        const ds = new DataSet();
        const dv = ds.createView().source(data);
        switch (type){
            case 'xbar':
                dv.transform({
                    type: 'fold',
                    fields: fields, // 展开字段集
                    key: key, // key字段
                    value: value, // value字段
                });
                break;
            case 'ybar':
                dv.transform({
                    type: 'fold',
                    fields: fields, // 展开字段集
                    key: 'type', // key字段
                    value: 'value', // value字段
                });
                break;
            case 'line':
                dv.transform({
                    type: 'fold',
                    fields: fields, // 展开字段集
                    key: key, // key字段
                    value: value, // value字段
                });
                break;
            case 'pie':
                dv.transform({
                    type: 'percent',
                    field: 'count',
                    dimension: 'item',
                    as: 'percent'
                });
                break;
            case 'pie-donut':
                dv.transform({
                    type: 'percent',
                    field: 'count',
                    dimension: 'item',
                    as: 'percent'
                });
                break;
        }
        return dv;
    },
    initEchartsPie(containerId,legendArray,dataArray,nameArray,isNodata,title,tooltip) {
        let colorArray = ['#2ec7c9','#B0E49D','#f0d702','#63aae1','#bf6ff5','#ae8d70','#333333','#b9c7d4'];
        $('#'+containerId).empty();
        if(title){
            if(tooltip){
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'<img src="images/help.svg" title="'+tooltip+'" style="text-align: center;vertical-align: middle;padding-left: 3px;padding-bottom: 2px;" onerror="this.src=\'common/mauna/js/mauna.charts/dist/images/help.svg\'"></div>');
                tippy('img' ,{
                    arrow: true,

                });
            }else{
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'</div>');
            }
        }
        $('#'+containerId).append('<div id="'+containerId+'-chart" class="chart-canvas" style="height: calc(100% - 30px)"></div>');
        let seriesInfo = new Array();
        if (nameArray != undefined && nameArray.length > 0) {
            let seriesItem = {
                name: nameArray[0],
                type: 'pie',
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: true,
                        formatter: '{b}: {c} ({d}%)',
                        position: 'outside'
                    }
                },
                radius: [0, '65%'],
                animation: false,
                data: dataArray,
                center: ['50%', '55%']
            };
            seriesInfo.push(seriesItem);
        }
        let option = {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            color: colorArray,
            legend: {
                show:false,
                orient: 'horizontal',
                data: legendArray,
                icon: 'circle',
                right: 12,
                top: 12,
                textStyle: {
                    fontFamily: '黑体',
                    fontWeight: 'normal',
                    fontSize: 12,
                    color: '#999'
                }
            },
            grid: {
                containLabel: true
            },
            toolbox: {
                show: false,
                feature: {
                    mark: {show: true},
                    dataView: {show: true, readOnly: false},
                    restore: {show: true},
                    saveAsImage: {show: true}
                }
            },
            graphic:[],
            calculable: true,
            series: seriesInfo
        };

        if (isNodata) {
            option.graphic.push({
                type: 'text',
                z: 100,
                left: 'center',
                top: 'middle',
                style: {
                    text: '暂无数据',
                    font: 'normal 14px 黑体'
                }
            })
        }
        let myChart = echarts.init(document.getElementById(containerId+'-chart'));// 图表初始化的地方，在页面中要有一个地方来显示图表，他的ID是main
        // option = getOptionByArray(json, reportDesign);//得到option图形
        myChart.setOption(option); //显示图形
        window.onresize = myChart.resize;
        return myChart;
    },
    initEchartsPieDonut(containerId,legendArray,dataArray,nameArray,isNodata,title,tooltip) {
        let colorArray = ['#2ec7c9','#B0E49D','#f0d702','#63aae1','#bf6ff5','#ae8d70','#333333','#b9c7d4'];
        let seriesInfo =new Array();
        $('#'+containerId).empty();
        if(title){
            if(tooltip){
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'<img src="images/help.svg" title="'+tooltip+'" style="text-align: center;vertical-align: middle;padding-left: 3px;padding-bottom: 2px;" onerror="this.src=\'common/mauna/js/mauna.charts/dist/images/help.svg\'"></div>');
                tippy('img' ,{
                    arrow: true,

                });
            }else{
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'</div>');
            }
        }
        $('#'+containerId).append('<div id="'+containerId+'-chart" class="chart-canvas" style="height: calc(100% - 30px)"></div>');
        if(nameArray !=undefined && nameArray.length>0){
            let seriesItem={
                name:nameArray[0],
                type:'pie',
                radius: ['45%', '65%'],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        formatter: '{b}: {c} ({d}%)',
                        show:true
                    }
                },
                animation: false,
                data:dataArray,
                center: ['50%', '55%']
            };
            seriesInfo.push(seriesItem);
        }

        let option={
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            color:colorArray,
            legend: {
                show:false,
                orient: 'horizontal',
                data:legendArray,
                icon:'circle',
                right:12,
                top:12,
                textStyle:{
                    fontFamily: '黑体',
                    fontWeight: 'normal',
                    fontSize:12,
                    color:'#999'
                }
            },
            grid: {
                containLabel: true
            },
            toolbox: {
                show : false,
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },
            graphic:[],
            calculable : true,
            series:seriesInfo
        };

        if(isNodata){
            option.graphic.push({
                type: 'text',
                z:100,
                left:'center',
                top:'middle',
                style:{
                    text:'暂无数据',
                    font: 'normal 14px 黑体'
                }
            })
        }
        let myChart = echarts.init(document.getElementById(containerId+'-chart'));// 图表初始化的地方，在页面中要有一个地方来显示图表，他的ID是main
        // option = getOptionByArray(json, reportDesign);//得到option图形
        myChart.setOption(option); //显示图形
        window.onresize = myChart.resize;
        return myChart;
    },
    initEchartsPieDonutRose(containerId,legendArray,dataArray,nameArray,isNodata,title,tooltip) {
        let colorArray = ['#2ec7c9','#B0E49D','#f0d702','#63aae1','#bf6ff5','#ae8d70','#333333','#b9c7d4'];
        let seriesInfo =new Array();
        $('#'+containerId).empty();
        if(title){
            if(tooltip){
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'<img src="images/help.svg" title="'+tooltip+'" style="text-align: center;vertical-align: middle;padding-left: 3px;padding-bottom: 2px;" onerror="this.src=\'common/mauna/js/mauna.charts/dist/images/help.svg\'"></div>');
                tippy('img' ,{
                    arrow: true,

                });
            }else{
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'</div>');
            }
        }
        $('#'+containerId).append('<div id="'+containerId+'-chart" class="chart-canvas" style="height: calc(100% - 30px)"></div>');
        if(nameArray !=undefined && nameArray.length>0){
            let seriesItem={
                name:nameArray[0],
                type:'pie',
                radius: ['55%', '65%'],
                roseType : 'radius',
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        formatter: '{b}: {c} ({d}%)',
                        show:true
                    }
                },
                animation: false,
                data:dataArray,
                center: ['50%', '55%']
            };
            seriesInfo.push(seriesItem);
        }
        let option={
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            color:colorArray,
            legend: {
                show:false,
                orient: 'horizontal',
                data:legendArray,
                icon:'circle',
                right:12,
                top:12,
                textStyle:{
                    fontFamily: '黑体',
                    fontWeight: 'normal',
                    fontSize:12,
                    color:'#999'
                }
            },
            grid: {
                containLabel: true
            },
            toolbox: {
                show : false,
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },
            graphic:[],
            calculable : true,
            series:seriesInfo
        };

        if(isNodata){
            option.graphic.push({
                type: 'text',
                z:100,
                left:'center',
                top:'middle',
                style:{
                    text:'暂无数据',
                    font: 'normal 14px 黑体'
                }
            })
        }
        let myChart = echarts.init(document.getElementById(containerId+'-chart'));// 图表初始化的地方，在页面中要有一个地方来显示图表，他的ID是main
        // option = getOptionByArray(json, reportDesign);//得到option图形
        myChart.setOption(option); //显示图形
        window.onresize = myChart.resize;
        return myChart;
    },
    initEchartsPie5(containerId,legendArray,dataArray,nameArray,isNodata,title,tooltip) {
        let colorArray = ['#2ec7c9','#B0E49D','#f0d702','#63aae1','#bf6ff5','#ae8d70','#333333','#b9c7d4'];
        let seriesInfo =new Array();
        $('#'+containerId).empty();
        if(title){
            if(tooltip){
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'<img src="images/help.svg" title="'+tooltip+'" style="text-align: center;vertical-align: middle;padding-left: 3px;padding-bottom: 2px;" onerror="this.src=\'common/mauna/js/mauna.charts/dist/images/help.svg\'"></div>');
                tippy('img' ,{
                    arrow: true,

                });
            }else{
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'</div>');
            }
        }
        $('#'+containerId).append('<div id="'+containerId+'-chart" class="chart-canvas" style="height: calc(100% - 30px)"></div>');
        /*
         let lightColorArray = new Array();
         for(let i =0;i<colorArray.length;i++){
         lightColorArray[i]= colorArray[i].colorRgb();
         }
         console.log(lightColorArray);
         */
        if(nameArray !=undefined && nameArray.length>0){
            let seriesItem={
                name:nameArray[0],
                type:'pie',
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: true,
                        formatter: '{b}: {d}%',
                        position: 'inside',
                        color: '#000'
                    }
                },
                radius: [0, '65%'],
                animation: false,
                data:dataArray
            };
            seriesInfo.push(seriesItem);
        }
        let option={
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            color:colorArray,
            legend: {
                orient: 'horizontal',
                data:legendArray,
                icon:'circle',
                right:'right',
                top:'top',
                bottom:'1%',
                textStyle:{
                    fontFamily: '黑体',
                    fontWeight: 'normal',
                    fontSize:14,
                    color:'#333333'
                }
            },
            grid: {
                containLabel: true
            },
            toolbox: {
                show : false,
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },
            graphic:[],
            calculable : true,
            series:seriesInfo
        };

        if(isNodata){
            option.graphic.push({
                type: 'text',
                z:100,
                left:'center',
                top:'middle',
                style:{
                    text:'暂无数据',
                    font: 'normal 14px 黑体'
                }
            })
        }

        let myChart = echarts.init(document.getElementById(containerId+'-chart'));// 图表初始化的地方，在页面中要有一个地方来显示图表，他的ID是main
        // option = getOptionByArray(json, reportDesign);//得到option图形
        myChart.setOption(option); //显示图形
        window.onresize = myChart.resize;
        return myChart;
    },
    initEchartsBarX(containerId,legendArray,xArray,dataArray,nameArray,xPosition,xInterval,labelShow,isNodata,title,tooltip) {
        let colorArray = ['#55C7C8','#AAE699','#F4CE65','#718DF5','#65B2EE','#718DF5','#FF9696'];
        let seriesInfo =new Array();
        if(labelShow){

        }else {
            labelShow = false;
        }
        let totalArray = [];
        $('#'+containerId).empty();
        if(title){
            if(tooltip){
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'<img src="images/help.svg" title="'+tooltip+'" style="text-align: center;vertical-align: middle;padding-left: 3px;padding-bottom: 2px;" onerror="this.src=\'common/mauna/js/mauna.charts/dist/images/help.svg\'"></div>');
                tippy('img' ,{
                    arrow: true,

                });
            }else{
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'</div>');
            }
        }
        $('#'+containerId).append('<div id="'+containerId+'-chart" class="chart-canvas" style="height: calc(100% - 30px)"></div>');
        if(nameArray !=undefined && nameArray.length>0){
            $.each(nameArray, function(i,o) {
                let total = 0;
                for(let j=0;j<dataArray[i].length;j++){
                    total = total + dataArray[i][j];
                }
                totalArray.push(total);
                let seriesItem={
                    name:nameArray[i],
                    type:'bar',
                    data:dataArray[i],
                    label: {
                        normal: {
                            show: labelShow,
                            position: 'top',
                            textStyle:{
                                color:'#999999',
                                fontFamily:'Microsoft YaHei'
                            }
                        }
                    },
                    itemStyle:{
                        normal:{
                            color:colorArray[i]
                        }
                    },
                    barWidth : '50%'
                };
                seriesInfo.push(seriesItem);
            });
        }

        if(xPosition==undefined){
            xPosition = 'bottom';
        }

        let option={
            legend: {
                data:legendArray,
                icon:'square',
                left:'1%',
                bottom:'1%',
                textStyle:{
                    fontFamily: '黑体',
                    fontWeight: 'normal',
                    fontSize:14,
                    color:'#333333'
                }
            },
            toolbox: {
                feature: {
                    dataView: {show: true, readOnly: false},
                    magicType: {show: true, type: ['line', 'bar']},
                    restore: {show: true},
                    saveAsImage: {show: true},
                    myTool1: {
                        show: true,
                        title: '导出',
                        icon: 'image://../dist/images/upload.svg',
                        onclick: function (params){
                            var jsono = [];
                            for(var i =0;i<xArray.length;i++){
                                var col = {
                                    'No.' : i+1
                                };
                                col.Date = xArray[i];
                                for(var j =0;j<nameArray.length;j++){
                                    col[nameArray[j]] = dataArray[j][i];
                                }
                                jsono.push(col);
                            }
                            $('#'+containerId).after('<a href="" download="'+title+'_'+xArray[0]+'-'+xArray[xArray.length-1]+'.xlsx" id="hf"></a>');
                            new downloadExl().init(jsono);
                            $('#'+containerId).next().remove();
                        }
                    }
                }
            },
            tooltip:{
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: function (params) {
                    let reuslt = '';
                    for(let i =0;i<params.length;i++){
                        let percent = params[i].value/totalArray[i]*100;
                        reuslt = reuslt + params[i].name + '<br />' +params[i].seriesName+':'+params[i].value+'('+percent.toFixed(2)+'%)<br />';
                    }
                    return reuslt;
                }
            },
            xAxis:[{
                type : 'category',
                data : xArray,
                axisTick : {
                    show : false
                },
                boundaryGap: ['10%', '10%'],
                axisLabel: {
                    interval:xInterval,
                    textStyle:{
                        color:'#999999'
                    },
                    rotate : 45
                },
                position: xPosition,
                axisLine:{
                    lineStyle:{
                        color:'#DAE2E5'
                    }
                }
            }],
            yAxis : [{
                type : 'value',
                axisLine:{
                    show:false,
                    lineStyle:{
                        color:'#DAE2E5'
                    }
                },
                axisTick : {
                    show : false
                },
                splitLine:{
                    lineStyle:{
                        type:'dashed'
                    }
                },
                axisLabel: {
                    textStyle:{
                        color:'#999999'
                    }
                },
                min : 0
            }],
            grid: {
                left: '2%',
                right: '2%',
                bottom:'10%',
                containLabel: true
            },
            graphic:[],
            calculable : true,
            series:seriesInfo
        };

        if(isNodata){
            option.graphic.push({
                type: 'text',
                z:100,
                left:'center',
                top:'middle',
                style:{
                    text:'暂无数据',
                    font: 'normal 14px 黑体'
                }
            });
            option.xAxis[0].show = false;
            option.yAxis[0].show = false;
        }

        let myChart = echarts.init(document.getElementById(containerId+'-chart'));// 图表初始化的地方，在页面中要有一个地方来显示图表，他的ID是main
        // option = getOptionByArray(json, reportDesign);//得到option图形
        myChart.setOption(option); //显示图形
        window.onresize = myChart.resize;
        return myChart;

    },
    initEchartsBarX_nopercent(containerId,legendArray,xArray,dataArray,nameArray,xPosition,xInterval,labelShow,isNodata,title,tooltip) {
        let colorArray = ['#2ec7c9','#B0E49D','#f0d702','#63aae1','#bf6ff5','#ae8d70','#333333','#b9c7d4'];
        let seriesInfo =new Array();
        if(labelShow){

        }else {
            labelShow = false;
        }
        $('#'+containerId).empty();
        if(title){
            if(tooltip){
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'<img src="images/help.svg" title="'+tooltip+'" style="text-align: center;vertical-align: middle;padding-left: 3px;padding-bottom: 2px;" onerror="this.src=\'common/mauna/js/mauna.charts/dist/images/help.svg\'"></div>');
                tippy('img' ,{
                    arrow: true,

                });
            }else{
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'</div>');
            }
        }
        $('#'+containerId).append('<div id="'+containerId+'-chart" class="chart-canvas" style="height: calc(100% - 30px)"></div>');
        if(nameArray !=undefined && nameArray.length>0){
            $.each(nameArray, function(i,o) {
                let seriesItem={
                    name:nameArray[i],
                    type:'bar',
                    data:dataArray[i],
                    label: {
                        normal: {
                            show: labelShow,
                            position: 'top',
                            textStyle:{
                                color:'#000000',
                                fontFamily:'Microsoft YaHei'
                            }
                        }
                    },
                    itemStyle:{
                        normal:{
                            color:colorArray[i]
                        }
                    },
                    barWidth : '50%'
                };
                seriesInfo.push(seriesItem);
            });
        }

        if(xPosition==undefined){
            xPosition = 'bottom';
        }

        let option={
            legend: {
                data:legendArray,
                icon:'square',
                left:'1%',
                bottom:'1%',
                textStyle:{
                    fontFamily: '黑体',
                    fontWeight: 'normal',
                    fontSize:14,
                    color:'#333333'
                }
            },
            tooltip:{
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c}"
            },
            xAxis:[{
                type : 'category',
                data : xArray,
                axisTick : {
                    show : false
                },
                boundaryGap: ['10%', '10%'],
                axisLabel: {
                    interval:xInterval,
                    textStyle:{
                        color:'#999999'
                    }
                },
                position: xPosition,
                axisLine:{
                    lineStyle:{
                        color:'#DAE2E5'
                    }
                }
            }],
            yAxis : [{
                type : 'value',
                axisLine:{
                    show:false,
                    lineStyle:{
                        color:'#DAE2E5'
                    }
                },
                axisTick : {
                    show : false
                },
                splitLine:{
                    lineStyle:{
                        type:'dashed'
                    }
                },
                axisLabel: {
                    textStyle:{
                        color:'#999999'
                    }
                },
                min : 0
            }],
            grid: {
                left: '2%',
                right: '2%',
                bottom:'10%',
                containLabel: true
            },
            toolbox: {
                feature: {
                    dataView: {show: true, readOnly: false},
                    magicType: {show: true, type: ['line', 'bar']},
                    restore: {show: true},
                    saveAsImage: {show: true},
                    myTool1: {
                        show: true,
                        title: '导出',
                        icon: 'image://../dist/images/upload.svg',
                        onclick: function (params){
                            var jsono = [];
                            for(var i =0;i<xArray.length;i++){
                                var col = {
                                    'No.' : i+1
                                };
                                col.Date = xArray[i];
                                for(var j =0;j<nameArray.length;j++){
                                    col[nameArray[j]] = dataArray[j][i];
                                }
                                jsono.push(col);
                            }
                            $('#'+containerId).after('<a href="" download="'+title+'_'+xArray[0]+'-'+xArray[xArray.length-1]+'.xlsx" id="hf"></a>');
                            new downloadExl().init(jsono);
                            $('#'+containerId).next().remove();
                        }
                    }
                }
            },
            graphic:[],
            calculable : true,
            series:seriesInfo
        };

        if(isNodata){
            option.graphic.push({
                type: 'text',
                z:100,
                left:'center',
                top:'middle',
                style:{
                    text:'暂无数据',
                    font: 'normal 14px 黑体'
                }
            });
            option.xAxis[0].show = false;
            option.yAxis[0].show = false;
        }

        let myChart = echarts.init(document.getElementById(containerId+'-chart'));// 图表初始化的地方，在页面中要有一个地方来显示图表，他的ID是main
        // option = getOptionByArray(json, reportDesign);//得到option图形
        myChart.setOption(option); //显示图形
        window.onresize = myChart.resize;
        return myChart;

    },
    initEchartsBarY(containerId,legendArray,yArray,dataArray,nameArray,xPosition,isNodata,barWidth,title,tooltip) {
        if(barWidth==undefined){
            barWidth = 'auto';
        }
        let colorArray = ['#2ec7c9','#B0E49D','#f0d702','#63aae1','#bf6ff5','#ae8d70','#333333','#b9c7d4'];
        let seriesInfo =new Array();
        let totalArray = [];
        $('#'+containerId).empty();
        if(title){
            if(tooltip){
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'<img src="images/help.svg" title="'+tooltip+'" style="text-align: center;vertical-align: middle;padding-left: 3px;padding-bottom: 2px;" onerror="this.src=\'common/mauna/js/mauna.charts/dist/images/help.svg\'"></div>');
                tippy('img' ,{
                    arrow: true,

                });
            }else{
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'</div>');
            }
        }
        $('#'+containerId).append('<div id="'+containerId+'-chart" class="chart-canvas" style="height: calc(100% - 30px)"></div>');
        if(nameArray !=undefined && nameArray.length>0){
            $.each(nameArray, function(i,o) {
                let total = 0;
                for(let j=0;j<dataArray[i].length;j++){
                    total = total + dataArray[i][j];
                }
                totalArray.push(total);
                let seriesItem={
                    name:nameArray[i],
                    type:'bar',
                    data:dataArray[i],
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            textStyle:{
                                color:'#999999',
                                fontFamily:'Microsoft YaHei'
                            }
                        }
                    },
                    barWidth:barWidth,
                    tooltip:{
                        formatter: function (params) {
                            let percent = params.value/total*100;
                            return params.name + '<br />' +params.seriesName+':'+params.value+'('+percent.toFixed(2)+'%)';
                        }
                    },
                    itemStyle:{
                        normal:{
                            color:colorArray[i]
                        }
                    }
                };
                seriesInfo.push(seriesItem);
            });
        }
        if(xPosition==undefined){
            xPosition = 'bottom';
        }

        let option={
            tooltip:{
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: function (params) {
                    let reuslt = '';
                    for(let i =0;i<params.length;i++){
                        let percent = params[i].value/totalArray[i]*100;
                        reuslt = reuslt + params[i].name + '<br />' +params[i].seriesName+':'+params[i].value+'('+percent.toFixed(2)+'%)<br />';
                    }
                    return reuslt;
                }
            },
            legend: {
                data:legendArray,
                icon:'square',
                left:'1%',
                bottom:'1%',
                textStyle:{
                    fontFamily: '黑体',
                    fontWeight: 'normal',
                    fontSize:14,
                    color:'#333333'
                }
            },
            xAxis:[{
                type : 'value',
                position:xPosition,
                nameGap:20,
                axisTick : {
                    show : false
                },
                boundaryGap: ['10%', '10%'],
                splitLine:{
                    lineStyle:{
                        type:'dashed'
                    }
                },
                axisLabel:{
                    textStyle:{
                        color:'#999999'
                    }
                },
                axisLine:{
                    lineStyle:{
                        color:'#DAE2E5'
                    }
                },
                min : 0
            }],
            yAxis : [{
                type : 'category',
                data : yArray ,
                axisTick : {
                    show : false
                },
                axisLabel: {
                    interval:0,
                    textStyle:{
                        color:'#999999'
                    }
                },
                axisLine:{
                    lineStyle:{
                        color:'#DAE2E5'
                    }
                },
                min : 0
            }],
            dataZoom: [
                {
                    type: 'slider',
                    yAxisIndex: [0],
                    start: 100,
                    end: 50,
                    showDataShadow: false,
                    width: 8,
                    handleSize: 8,
                    textStyle:{
                        color:'#999999'
                    },
                    showDetail:false
                }
            ],
            grid: {
                left: 1,
                right: '4%',
                bottom:'10%',
                top:20,
                containLabel: true
            },
            graphic:[],
            calculable : true,
            series:seriesInfo
        };

        if(isNodata){
            option.graphic.push({
                type: 'text',
                z:100,
                left:'center',
                top:'middle',
                style:{
                    text:'暂无数据',
                    font: 'normal 14px 黑体'
                }
            });
            option.xAxis[0].show = false;
            option.yAxis[0].show = false;
        }

        let myChart = echarts.init(document.getElementById(containerId+'-chart'));// 图表初始化的地方，在页面中要有一个地方来显示图表，他的ID是main
        // option = getOptionByArray(json, reportDesign);//得到option图形
        myChart.setOption(option); //显示图形
        window.onresize = myChart.resize;
        return myChart;
    },
    initEchartsBarY_noScroll(containerId,legendArray,yArray,dataArray,nameArray,xPosition,isNodata,barWidth,title,tooltip) {
        if(barWidth==undefined){
            barWidth = 'auto';
        }
        let colorArray = ['#55C7C8','#AAE699','#F4CE65','#718DF5','#65B2EE','#718DF5','#FF9696'];
        let seriesInfo =new Array();
        let totalArray = [];
        $('#'+containerId).empty();
        if(title){
            if(tooltip){
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'<img src="images/help.svg" title="'+tooltip+'" style="text-align: center;vertical-align: middle;padding-left: 3px;padding-bottom: 2px;" onerror="this.src=\'common/mauna/js/mauna.charts/dist/images/help.svg\'"></div>');
                tippy('img' ,{
                    arrow: true,

                });
            }else{
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'</div>');
            }
        }
        $('#'+containerId).append('<div id="'+containerId+'-chart" class="chart-canvas" style="height: calc(100% - 30px)"></div>');
        if(nameArray !=undefined && nameArray.length>0){
            $.each(nameArray, function(i,o) {
                let total = 0;
                for(let j=0;j<dataArray[i].length;j++){
                    total = total + dataArray[i][j];
                }
                totalArray.push(total);
                let seriesItem={
                    name:nameArray[i],
                    type:'bar',
                    data:dataArray[i],
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            textStyle:{
                                color:'#999999',
                                fontFamily:'Microsoft YaHei'
                            }
                        }
                    },
                    barWidth:barWidth,
                    tooltip:{
                        formatter: function (params) {
                            let percent = params.value/total*100;
                            return params.name + '<br />' +params.seriesName+':'+params.value+'('+percent.toFixed(2)+'%)';
                        }
                    },
                    itemStyle:{
                        normal:{
                            color:colorArray[i]
                        }
                    }
                };
                seriesInfo.push(seriesItem);
            });
        }
        if(xPosition==undefined){
            xPosition = 'bottom';
        }

        let option={
            tooltip:{
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: function (params) {
                    let reuslt = '';
                    for(let i =0;i<params.length;i++){
                        let percent = params[i].value/totalArray[i]*100;
                        reuslt = reuslt + params[i].name + '<br />' +params[i].seriesName+':'+params[i].value+'('+percent.toFixed(2)+'%)<br />';
                    }
                    return reuslt;
                }
            },
            legend: {
                data:legendArray,
                icon:'square',
                left:'1%',
                bottom:'1%',
                textStyle:{
                    fontFamily: '黑体',
                    fontWeight: 'normal',
                    fontSize:14,
                    color:'#333333'
                }
            },
            xAxis:[{
                type : 'value',
                position:xPosition,
                nameGap:20,
                axisTick : {
                    show : false
                },
                boundaryGap: ['10%', '10%'],
                splitLine:{
                    lineStyle:{
                        type:'dashed'
                    }
                },
                axisLabel:{
                    textStyle:{
                        color:'#999999'
                    }
                },
                axisLine:{
                    lineStyle:{
                        color:'#DAE2E5'
                    }
                },
                min : 0
            }],
            yAxis : [{
                type : 'category',
                data : yArray ,
                axisTick : {
                    show : false
                },
                axisLabel: {
                    interval:0,
                    textStyle:{
                        color:'#999999'
                    }
                },
                axisLine:{
                    lineStyle:{
                        color:'#DAE2E5'
                    }
                },
                min : 0
            }],
            grid: {
                left: 1,
                right: '4%',
                bottom:'10%',
                top:20,
                containLabel: true
            },
            graphic:[],
            calculable : true,
            series:seriesInfo
        };

        if(isNodata){
            option.graphic.push({
                type: 'text',
                z:100,
                left:'center',
                top:'middle',
                style:{
                    text:'暂无数据',
                    font: 'normal 14px 黑体'
                }
            });
            option.xAxis[0].show = false;
            option.yAxis[0].show = false;
        }

        let myChart = echarts.init(document.getElementById(containerId+'-chart'));// 图表初始化的地方，在页面中要有一个地方来显示图表，他的ID是main
        // option = getOptionByArray(json, reportDesign);//得到option图形
        myChart.setOption(option); //显示图形
        window.onresize = myChart.resize;
        return myChart;
    },
    initEchartsLineForNumber(containerId,legendArray,xArray,dataArray,nameArray,isNodata,title,tooltip){
        let colorArray = ['#55C7C8','#AAE699','#F4CE65','#718DF5','#65B2EE','#718DF5','#FF9696'];
        let seriesInfo =new Array();
        var total = 0;
        for(var i =0;i<dataArray[0].length;i++){
            total = total + dataArray[0][i];
        }
        if(title){
            if(tooltip){
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'<img src="images/help.svg" title="'+tooltip+'" style="text-align: center;vertical-align: middle;padding-left: 3px;padding-bottom: 2px;" onerror="this.src=\'common/mauna/js/mauna.charts/dist/images/help.svg\'"></div>');
                tippy('img' ,{
                    arrow: true,

                });
            }else{
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'</div>');
            }
        }

        $('#'+containerId).append('<div id="'+containerId+'-chart" class="chart-canvas" style="height: calc(100% - 30px)"></div>');

        $("#"+containerId+"-chart").append('<div id="'+containerId+'-number-text" style="height: 50%;position: relative;display:  table;width:  100%;line-height:  30px;text-align:  center;"></div><div id="'+containerId+'-number" style="height: 50%;position: relative"></div>');

        $('#'+containerId+'-number-text').append('<span style="display:table-cell;vertical-align: middle;font-size:38px">'+total+'</span>');
        if(nameArray !=undefined && nameArray.length>0){
            $.each(nameArray, function(i,o) {
                let seriesItem={
                    name:nameArray[i],
                    type:'line',
                    smooth : true,
                    areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: colorArray[0]
                            }, {
                                offset: 1,
                                color: '#ffe'
                            }])
                        }
                    },
                    data:dataArray[i],
                    lineStyle:{
                        normal:{
                            color:colorArray[i]
                        }
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'top'
                        }
                    },
                    itemStyle:{
                        normal:{
                            label : {show: false}
                        },
                        emphasis:{
                            color: colorArray[i],
                            opacity: 0.3
                        }
                    },
                    symbol:'circle',
                    symbolSize:'15',
                    showSymbol:false
                };
                seriesInfo.push(seriesItem);
            });
        }

        let option={
            tooltip:{trigger: 'axis'},
            legend: {
                data:legendArray,
                icon:'square',
                left:'1%',
                bottom:'1%',
                textStyle:{
                    fontFamily: '黑体',
                    fontWeight: 'bold',
                    fontSize:14
                }
            },
            color:colorArray,
            xAxis:[{
                show:false,
                type : 'category',
                data : xArray,
                boundaryGap : false,
                boundaryGap: ['10%', '10%'],
                axisTick : {
                    show : false
                },
                axisLine:{
                    lineStyle:{
                        color:'#DAE2E5'
                    }
                },
                axisLabel:{
                    textStyle:{
                        color:'#999999'
                    }
                }
            }],
            yAxis : [{
                type : 'value',
                show : false,
                axisLine:{
                    show:false,
                    lineStyle:{
                        color:'#DAE2E5'
                    }
                },
                axisTick : {
                    show : false
                },
                splitLine:{
                    lineStyle:{
                        type:'dashed'
                    }
                },
                axisLabel:{
                    textStyle:{
                        color:'#999999'
                    }
                }
            }],
            grid: {
                left: '2%',
                right: '2%',
                bottom:'10%',
                top:'30%',
                containLabel: true
            },
            toolbox: {
                show : false,
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },
            backgroundColor:'#ffffff',
            graphic: [

            ],

            series:seriesInfo
        };
        let myChart = echarts.init(document.getElementById(containerId+'-number'));// 图表初始化的地方，在页面中要有一个地方来显示图表，他的ID是main
        // option = getOptionByArray(json, reportDesign);//得到option图形
        myChart.setOption(option); //显示图形
        window.onresize = myChart.resize;
        return myChart;
    },
    initEchartsLine_markPoint(containerId,legendArray,xArray,dataArray,nameArray,isNodata,title,tooltip){
        let colorArray = ['#55C7C8','#AAE699','#F4CE65','#718DF5','#65B2EE','#718DF5','#FF9696'];
        let seriesInfo =new Array();
        if(title){
            if(tooltip){
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'<img src="images/help.svg" title="'+tooltip+'" style="text-align: center;vertical-align: middle;padding-left: 3px;padding-bottom: 2px;" onerror="this.src=\'common/mauna/js/mauna.charts/dist/images/help.svg\'"></div>');
                tippy('img' ,{
                    arrow: true,

                });
            }else{
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'</div>');
            }
        }
        $('#'+containerId).append('<div id="'+containerId+'-chart" class="chart-canvas" style="height: calc(100% - 30px)"></div>');

        if(nameArray !=undefined && nameArray.length>0){
            $.each(nameArray, function(i,o) {
                let seriesItem={
                    name:nameArray[i],
                    type:'line',
                    smooth : false,
                    data:dataArray[i],
                    markPoint : {
                        data : [
                            {type : 'max', name: '最大值'}
                        ]
                    },
                    lineStyle:{
                        normal:{
                            color:colorArray[i]
                        }
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'top'
                        }
                    },
                    itemStyle:{
                        normal:{
                            label : {show: false}
                        }
                    }
                };
                seriesInfo.push(seriesItem);
            });
        }

        let option={
            tooltip:{trigger: 'axis'},
            legend: {
                data:legendArray,
                icon:'square',
                left:'1%',
                bottom:'1%',
                textStyle:{
                    fontFamily: '黑体',
                    fontWeight: 'bold',
                    fontSize:14
                }
            },
            toolbox: {
                feature: {
                    dataView: {show: true, readOnly: false},
                    magicType: {show: true, type: ['line', 'bar']},
                    restore: {show: true},
                    saveAsImage: {show: true},
                    myTool1: {
                        show: true,
                        title: '导出',
                        icon: 'image://../dist/images/upload.svg',
                        onclick: function (params){
                            var jsono = [];
                            for(var i =0;i<xArray.length;i++){
                                var col = {
                                    'No.' : i+1
                                };
                                col.Date = xArray[i];
                                for(var j =0;j<nameArray.length;j++){
                                    col[nameArray[j]] = dataArray[j][i];
                                }
                                jsono.push(col);
                            }
                            $('#'+containerId).after('<a href="" download="'+title+'_'+xArray[0]+'-'+xArray[xArray.length-1]+'.xlsx" id="hf"></a>');
                            new downloadExl().init(jsono);
                            $('#'+containerId).next().remove();
                        }
                    }
                }
            },
            color:colorArray,
            xAxis:[{
                show:true,
                type : 'category',
                data : xArray,
                boundaryGap : false,
                boundaryGap: ['10%', '10%'],
                axisTick : {
                    show : false
                },
                axisLine:{
                    lineStyle:{
                        color:'#DAE2E5'
                    }
                },
                axisLabel:{
                    textStyle:{
                        color:'#999999'
                    }
                }
            }],
            yAxis : [{
                type : 'value',
                show : true,
                axisLine:{
                    show:false,
                    lineStyle:{
                        color:'#DAE2E5'
                    }
                },
                axisTick : {
                    show : false
                },
                splitLine:{
                    lineStyle:{
                        type:'dashed'
                    }
                },
                axisLabel:{
                    textStyle:{
                        color:'#999999'
                    }
                }
            }],
            grid: {
                left: '2%',
                right: '2%',
                bottom:'10%',
                containLabel: true
            },
            backgroundColor:'#ffffff',
            graphic: [

            ],

            series:seriesInfo
        };
        let myChart = echarts.init(document.getElementById(containerId+'-chart'));// 图表初始化的地方，在页面中要有一个地方来显示图表，他的ID是main
        // option = getOptionByArray(json, reportDesign);//得到option图形
        myChart.setOption(option); //显示图形
        window.onresize = myChart.resize;
        return myChart;
    },
    initEchartsLineArea(containerId,legendArray,xArray,dataArray,nameArray,isNodata,title,tooltip){
        let colorArray = ['#55C7C8','#AAE699','#F4CE65','#718DF5','#65B2EE','#718DF5','#FF9696'];
        let seriesInfo =new Array();
        if(title){
            if(tooltip){
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'<img src="images/help.svg" title="'+tooltip+'" style="text-align: center;vertical-align: middle;padding-left: 3px;padding-bottom: 2px;" onerror="this.src=\'common/mauna/js/mauna.charts/dist/images/help.svg\'"></div>');
                tippy('img' ,{
                    arrow: true,

                });
            }else{
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'</div>');
            }
        }
        $('#'+containerId).append('<div id="'+containerId+'-chart" class="chart-canvas" style="height: calc(100% - 30px)"></div>');

        if(nameArray !=undefined && nameArray.length>0){
            $.each(nameArray, function(i,o) {
                let seriesItem={
                    name:nameArray[i],
                    type:'line',
                    smooth : false,
                    data:dataArray[i],
                    areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: colorArray[0]
                            }, {
                                offset: 1,
                                color: '#ffe'
                            }])
                        }
                    },
                    lineStyle:{
                        normal:{
                            color:colorArray[i]
                        }
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'top'
                        }
                    },
                    itemStyle:{
                        normal:{
                            label : {show: false}
                        }
                    }
                };
                seriesInfo.push(seriesItem);
            });
        }

        let option={
            tooltip:{trigger: 'axis'},
            legend: {
                data:legendArray,
                icon:'square',
                left:'1%',
                bottom:'1%',
                textStyle:{
                    fontFamily: '黑体',
                    fontWeight: 'bold',
                    fontSize:14
                }
            },
            toolbox: {
                feature: {
                    dataView: {show: true, readOnly: false},
                    magicType: {show: true, type: ['line', 'bar']},
                    restore: {show: true},
                    saveAsImage: {show: true},
                    myTool1: {
                        show: true,
                        title: '导出',
                        icon: 'image://../dist/images/upload.svg',
                        onclick: function (params){
                            var jsono = [];
                            for(var i =0;i<xArray.length;i++){
                                var col = {
                                    'No.' : i+1
                                };
                                col.Date = xArray[i];
                                for(var j =0;j<nameArray.length;j++){
                                    col[nameArray[j]] = dataArray[j][i];
                                }
                                jsono.push(col);
                            }
                            $('#'+containerId).after('<a href="" download="'+title+'_'+xArray[0]+'-'+xArray[xArray.length-1]+'.xlsx" id="hf"></a>');
                            new downloadExl().init(jsono);
                            $('#'+containerId).next().remove();
                        }
                    }
                }
            },
            color:colorArray,
            xAxis:[{
                show:true,
                type : 'category',
                data : xArray,
                boundaryGap : false,
                boundaryGap: ['10%', '10%'],
                axisTick : {
                    show : false
                },
                axisLine:{
                    lineStyle:{
                        color:'#DAE2E5'
                    }
                },
                axisLabel:{
                    textStyle:{
                        color:'#999999'
                    }
                }
            }],
            yAxis : [{
                type : 'value',
                show : true,
                axisLine:{
                    show:false,
                    lineStyle:{
                        color:'#DAE2E5'
                    }
                },
                axisTick : {
                    show : false
                },
                splitLine:{
                    lineStyle:{
                        type:'dashed'
                    }
                },
                axisLabel:{
                    textStyle:{
                        color:'#999999'
                    }
                }
            }],
            grid: {
                left: '2%',
                right: '2%',
                bottom:'10%',
                containLabel: true
            },
            backgroundColor:'#ffffff',
            graphic: [

            ],

            series:seriesInfo
        };
        let myChart = echarts.init(document.getElementById(containerId+'-chart'));// 图表初始化的地方，在页面中要有一个地方来显示图表，他的ID是main
        // option = getOptionByArray(json, reportDesign);//得到option图形
        myChart.setOption(option); //显示图形
        window.onresize = myChart.resize;
        return myChart;
    },
    initEchartsBarX_markPoint(containerId,legendArray,xArray,dataArray,nameArray,xPosition,xInterval,labelShow,isNodata,title,tooltip) {
        let colorArray = ['#55C7C8','#AAE699','#F4CE65','#718DF5','#65B2EE','#718DF5','#FF9696'];
        let seriesInfo =new Array();
        if(labelShow){

        }else {
            labelShow = false;
        }
        let totalArray = [];
        $('#'+containerId).empty();
        if(title){
            if(tooltip){
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'<img src="images/help.svg" title="'+tooltip+'" style="text-align: center;vertical-align: middle;padding-left: 3px;padding-bottom: 2px;" onerror="this.src=\'common/mauna/js/mauna.charts/dist/images/help.svg\'"></div>');
                tippy('img' ,{
                    arrow: true,

                });
            }else{
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'</div>');
            }
        }
        $('#'+containerId).append('<div id="'+containerId+'-chart" class="chart-canvas" style="height: calc(100% - 30px)"></div>');
        if(nameArray !=undefined && nameArray.length>0){
            $.each(nameArray, function(i,o) {
                let total = 0;
                for(let j=0;j<dataArray[i].length;j++){
                    total = total + dataArray[i][j];
                }
                totalArray.push(total);
                let seriesItem={
                    name:nameArray[i],
                    type:'bar',
                    data:dataArray[i],
                    markPoint : {
                        data : [
                            {type : 'max', name: '最大值'}
                        ]
                    },
                    label: {
                        normal: {
                            show: labelShow,
                            position: 'top',
                            textStyle:{
                                color:'#999999',
                                fontFamily:'Microsoft YaHei'
                            }
                        }
                    },
                    itemStyle:{
                        normal:{
                            color:colorArray[i]
                        }
                    },
                    barWidth : '50%'
                };
                seriesInfo.push(seriesItem);
            });
        }

        if(xPosition==undefined){
            xPosition = 'bottom';
        }

        let option={
            legend: {
                data:legendArray,
                icon:'square',
                left:'1%',
                bottom:'1%',
                textStyle:{
                    fontFamily: '黑体',
                    fontWeight: 'normal',
                    fontSize:14,
                    color:'#333333'
                }
            },
            toolbox: {
                feature: {
                    dataView: {show: true, readOnly: false},
                    magicType: {show: true, type: ['line', 'bar']},
                    restore: {show: true},
                    saveAsImage: {show: true},
                    myTool1: {
                        show: true,
                        title: '导出',
                        icon: 'image://../dist/images/upload.svg',
                        onclick: function (params){
                            var jsono = [];
                            for(var i =0;i<xArray.length;i++){
                                var col = {
                                    'No.' : i+1
                                };
                                col.Date = xArray[i];
                                for(var j =0;j<nameArray.length;j++){
                                    col[nameArray[j]] = dataArray[j][i];
                                }
                                jsono.push(col);
                            }
                            $('#'+containerId).after('<a href="" download="'+title+'_'+xArray[0]+'-'+xArray[xArray.length-1]+'.xlsx" id="hf"></a>');
                            new downloadExl().init(jsono);
                            $('#'+containerId).next().remove();
                        }
                    }
                }
            },
            tooltip:{
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: function (params) {
                    let reuslt = '';
                    for(let i =0;i<params.length;i++){
                        let percent = params[i].value/totalArray[i]*100;
                        reuslt = reuslt + params[i].name + '<br />' +params[i].seriesName+':'+params[i].value+'('+percent.toFixed(2)+'%)<br />';
                    }
                    return reuslt;
                }
            },
            xAxis:[{
                show:true,
                type : 'category',
                data : xArray,
                boundaryGap : false,
                boundaryGap: ['10%', '10%'],
                axisTick : {
                    show : false
                },
                axisLine:{
                    lineStyle:{
                        color:'#DAE2E5'
                    }
                },
                axisLabel:{
                    textStyle:{
                        color:'#999999'
                    }
                }
            }],
            yAxis : [{
                type : 'value',
                axisLine:{
                    show:false,
                    lineStyle:{
                        color:'#DAE2E5'
                    }
                },
                axisTick : {
                    show : false
                },
                splitLine:{
                    lineStyle:{
                        type:'dashed'
                    }
                },
                axisLabel: {
                    textStyle:{
                        color:'#999999'
                    }
                },
                min : 0
            }],
            grid: {
                left: '2%',
                right: '2%',
                bottom:'10%',
                containLabel: true
            },
            graphic:[],
            calculable : true,
            series:seriesInfo
        };

        if(isNodata){
            option.graphic.push({
                type: 'text',
                z:100,
                left:'center',
                top:'middle',
                style:{
                    text:'暂无数据',
                    font: 'normal 14px 黑体'
                }
            });
            option.xAxis[0].show = false;
            option.yAxis[0].show = false;
        }

        let myChart = echarts.init(document.getElementById(containerId+'-chart'));// 图表初始化的地方，在页面中要有一个地方来显示图表，他的ID是main
        // option = getOptionByArray(json, reportDesign);//得到option图形
        myChart.setOption(option); //显示图形
        window.onresize = myChart.resize;
        return myChart;

    },
    initEchartsMix(containerId,legendArray,xArray,dataArray,nameArray,isNodata,title,tooltip){
        let colorArray = ['#55C7C8','#AAE699','#F4CE65','#718DF5','#65B2EE','#718DF5','#FF9696'];
        let seriesInfo =new Array();
        if(title){
            if(tooltip){
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'<img src="images/help.svg" title="'+tooltip+'" style="text-align: center;vertical-align: middle;padding-left: 3px;padding-bottom: 2px;" onerror="this.src=\'common/mauna/js/mauna.charts/dist/images/help.svg\'"></div>');
                tippy('img' ,{
                    arrow: true,

                });
            }else{
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'</div>');
            }
        }
        $('#'+containerId).append('<div id="'+containerId+'-chart" class="chart-canvas" style="height: calc(100% - 30px)"></div>');
        let option = {
            legend: {
                top: 30,
                data: legendArray
            },
            tooltip: {
                triggerOn: 'none',
                transitionDuration: 0,
                confine: true,
                bordeRadius: 4,
                borderWidth: 1,
                borderColor: '#333',
                backgroundColor: 'rgba(255,255,255,0.9)',
                textStyle: {
                    fontSize: 12,
                    color: '#333'
                },
                position: function (pt) {
                    return [pt[0], 130];
                }
            },
            axisPointer: {
                link: [{
                    xAxisIndex: [0, 1]
                }]
            },
            dataZoom: [{
                type: 'slider',
                xAxisIndex: [0, 1],
                realtime: false,
                handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '120%',
                start: 0,
                end: 100,
                top: 10,
                height: 20
            }, {
                type: 'inside',
                xAxisIndex: [0, 1],
                start: 0,
                end: 100,
                top: 10,
                height: 20
            }],
            xAxis: [{
                type: 'category',
                data: xArray,
                boundaryGap : false,
                axisLine: { lineStyle: { color: '#777' } },
                axisLabel: {
                    formatter: function (value) {
                        return echarts.format.formatTime('MM-dd', value);
                    }
                },
                min: 'dataMin',
                max: 'dataMax',
                axisPointer: {
                    show: true
                }
            }, {
                type: 'category',
                gridIndex: 1,
                data: xArray,
                scale: true,
                boundaryGap : false,
                splitLine: {show: false},
                axisLabel: {show: false},
                axisTick: {show: false},
                axisLine: { lineStyle: { color: '#777' } },
                splitNumber: 20,
                min: 'dataMin',
                max: 'dataMax',
                axisPointer: {
                    type: 'shadow',
                    label: {show: false},
                    triggerTooltip: true,
                    handle: {
                        show: true,
                        margin: 30,
                        color: '#B80C00'
                    }
                }
            }],
            yAxis: [{
                scale: true,
                splitNumber: 2,
                axisLine: { lineStyle: { color: '#777' } },
                splitLine: { show: true },
                axisTick: { show: false },
                axisLabel: {
                    inside: true,
                    formatter: '{value}\n'
                }
            }, {
                scale: true,
                gridIndex: 1,
                splitNumber: 2,
                axisLabel: {show: false},
                axisLine: {show: false},
                axisTick: {show: false},
                splitLine: {show: false}
            }],
            grid: [{
                left: 20,
                right: 20,
                top: 60,
                height: 120,
                bottom: 50
            }, {
                left: 20,
                right: 20,
                height: 40,
                top: 210
            }],
            graphic: [{
                type: 'group',
                left: 'center',
                top: 70,
                width: 300,
                bounding: 'raw',
                children: [{
                    id: nameArray[0],
                    type: 'text',
                    style: {fill: colorArray[1], font: 'bold 12px Sans-serif'},
                    right: 0
                }]
            }],
            series: [{
                name: nameArray[1],
                type: 'bar',
                xAxisIndex: 1,
                yAxisIndex: 1,
                itemStyle: {
                    normal: {
                        color: '#7fbe9e'
                    },
                    emphasis: {
                        color: '#140'
                    }
                },
                data: dataArray[1]
            },{
                name: nameArray[0],
                type: 'line',
                data: dataArray[0],
                smooth: true,
                showSymbol: false,
                lineStyle: {
                    normal: {
                        width: 1
                    }
                }
            }]

        }
        let myChart = echarts.init(document.getElementById(containerId+'-chart'));// 图表初始化的地方，在页面中要有一个地方来显示图表，他的ID是main
        // option = getOptionByArray(json, reportDesign);//得到option图形
        myChart.setOption(option); //显示图形
        window.onresize = myChart.resize;
        return myChart;
    },
    initEchartsLineAndBar(containerId,legendArray,xArray,yArray,dataArray,nameArray,isNodata,title,tooltip){
        let colorArray = ['#55C7C8','#AAE699','#F4CE65','#718DF5','#65B2EE','#718DF5','#FF9696'];
        let seriesInfo =new Array();
        if(title){
            if(tooltip){
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'<img src="images/help.svg" title="'+tooltip+'" style="text-align: center;vertical-align: middle;padding-left: 3px;padding-bottom: 2px;" onerror="this.src=\'common/mauna/js/mauna.charts/dist/images/help.svg\'"></div>');
                tippy('img' ,{
                    arrow: true,

                });
            }else{
                $('#'+containerId).append('<div id="'+containerId+'-title" class="chart-title" style="padding-left: 5px;padding-top: 10px;font-family: \'Microsoft YaHei\';font-size: 14px;">'+(title ? title : '')+'</div>');
            }
        }
        $('#'+containerId).append('<div id="'+containerId+'-chart" class="chart-canvas" style="height: calc(100% - 30px)"></div>');

        if(nameArray !=undefined && nameArray.length>0){
            $.each(nameArray, function(i,o) {
                let seriesItem;
                if(nameArray[i].type == 'line'){
                    seriesItem={
                        name:nameArray[i].name,
                        type:nameArray[i].type,
                        data:dataArray[i],
                    };
                }else{
                    seriesItem={
                        name:nameArray[i].name,
                        type:nameArray[i].type,
                        data:dataArray[i],
                        yAxisIndex: 1,
                    };
                }
                seriesInfo.push(seriesItem);
            });
        }

        let option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                }
            },
            legend: {
                data:legendArray
            },
            xAxis: [
                {
                    type: 'category',
                    data: xArray,
                    axisPointer: {
                        type: 'shadow'
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: yArray[0],
                    axisLabel: {
                        formatter: '{value}'
                    },
                    splitLine:{
                        show:false
                    }
                },
                {
                    type: 'value',
                    name: yArray[1],
                    axisLabel: {
                        formatter: '{value}'
                    },
                    splitLine:{
                        show:false
                    }
                }
            ],
            series: seriesInfo,
            color: colorArray
        }
        let myChart = echarts.init(document.getElementById(containerId+'-chart'));// 图表初始化的地方，在页面中要有一个地方来显示图表，他的ID是main
        // option = getOptionByArray(json, reportDesign);//得到option图形
        myChart.setOption(option); //显示图形
        window.onresize = myChart.resize;
        return myChart;
    }

}