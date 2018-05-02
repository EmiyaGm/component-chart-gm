import XLSX from 'xlsx';

class downloadExl{
    init(json, type) {
        let $this = this;
        let keyMap = []; //获取keys
        let tmpdata;
        for(let i =0;i<json.length;i++){
            tmpdata = json[i];
            keyMap = [];
            for (let k in tmpdata) {
                keyMap.push(k);
            }
        }
        let result_col = [];
        keyMap.map((k, j) => Object.assign({}, {  //运用ES6内容
            v: k,
            position: (j > 25 ? $this.getCharCol(j) : String.fromCharCode(65 + j)) + 1
        })).forEach((v, i) => result_col[v.position] = {
            v: v.v
        });
        json.map((v, i) => keyMap.map((k, j) => Object.assign({}, {  //运用ES6内容
            v: v[k],
            position: (j > 25 ? $this.getCharCol(j) : String.fromCharCode(65 + j)) + (i + 2)
        }))).reduce((prev, next) => prev.concat(next)).forEach((v, i) => result_col[v.position] = {
            v: v.v
        });
        let outputPos = Object.keys(result_col); //设置区域,比如表格从A1到D10
        let tmpWB = {
            SheetNames: ['mySheet'], //保存的表标题
            Sheets: {
                'mySheet': Object.assign({},
                    result_col, //内容
                    {
                        '!ref': outputPos[0] + ':' + outputPos[outputPos.length - 1] //设置填充区域
                    })
            }
        },
        tmpDown = new Blob([$this.s2ab(XLSX.write(tmpWB,
            {bookType: (type == undefined ? 'xlsx':type),bookSST: false, type: 'binary'}//这里的数据是用来定义导出的格式类型
        ))], {
            type: ""
        }); //创建二进制对象写入转换好的字节流
        let href = URL.createObjectURL(tmpDown); //创建对象超链接
        document.getElementById("hf").href = href; //绑定a标签
        document.getElementById("hf").click(); //模拟点击实现下载
        setTimeout(function() { //延时释放
            URL.revokeObjectURL(tmpDown); //用URL.revokeObjectURL()来释放这个object URL
        }, 100);
    }

    s2ab(s) { //字符串转字符流
        let buf = new ArrayBuffer(s.length);
        let view = new Uint8Array(buf);
        for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

// 将指定的自然数转换为26进制表示。映射关系：[0-25] -> [A-Z]。
    getCharCol(n) {
        let temCol = '',
            s = '',
            m = 0;
        while (n > 0) {
            m = n % 26 + 1;
            s = String.fromCharCode(m + 64) + s;
            n = (n - m) / 26
        }
        return s
    }
}

export {downloadExl};