/*
  js处理常见ip地址的转换操作
*/

(function(){
    if(!window.OPSIP|| typeof(OPSIP) != 'object'){
        OPSIP = {} ;
    }
    //A，B,C,D 类地址范围
        OPSIP.rangeA = ['0.0.0.0','127.255.255.255',8];
        OPSIP.rangeB = ['128.0.0.0','191.255.255.255',16];
        OPSIP.rangeC = ['192.0.0.0','223.255.255.255',24];
        OPSIP.rangeD = ['224.0.0.0','239.255.255.255',null];
        OPSIP.rangeE = ['240.0.0.0','255.255.255.255',null];

    //检查是否为正确的ip地址，这里检查的比较粗糙
    OPSIP.checkIP = function(ip){
        var patern = /^([0-9]{1,3}\.{1}){3}[0-9]{1,3}$/;
        return patern.test(ip);
    };

    //检查是否为正常的ip范围
    OPSIP.checkRange = function(range){
        var patern = /(([0-9]{1,3}\.{1}){3}[0-9]{1,3})[\-:](([0-9]{1,3}\.{1}){3}[0-9]{1,3})/;
        if(patern.test(range)){
            var start = RegExp.$1,
                end   = RegExp.$3;
            return OPSIP.checkIP(start) && OPSIP.checkIP(end);
        }
    };


    //将ip地址转换成十进制数字
    OPSIP.ip2long = function(ip){
        if(OPSIP.checkIP(ip)){
            s = ip.split('.');
            return s[0]*Math.pow(256,3) + s[1]*Math.pow(256,2) + s[2]*Math.pow(256,1) + s[3];
        }else{
            return 0 ;
        }
    };

    //将十进制转换成二进制数字
    OPSIP.num2bin = function(num){
        var str = '';
        if(/\d+/.test(num)){
            while(num !== 0){
                str = (num%2) + str ;
                num = parseInt(num/2,10);
            }
        }else{
            throw '亲，给个数字行不';
        }
        //凑够8位
        if(str.length < 8)
            while(str.length != 8){
            str = '0' + str ;
        }
        return str ;
    };

    //将二进制转换成十进制
    OPSIP.bin2num = function(bin){
        var i   = bin.length,
            j   = 0,
            str =  bin.split(''),
            num = 0 ;

        while(i !== 0){
            num += str[i-1] * Math.pow(2,j) ;
            i-- ;
            j++ ;
        }
        return num ;
    };

    //将IP转换成二进制数字

    OPSIP.ip2bin = function(ip){
        if (OPSIP.checkIP(ip)) {
            var ips  = ip.split('.'),
                str  = '';
            for (var i = 0; i <= ips.length - 1;  i++) {
                str  += OPSIP.num2bin(ips[i]) ;
            }
            return str;
        }
    };

OPSIP.bin2ip = function(bin){
        var len = bin.length,
            ip  = '' ;
        if(len < 32){
            for (var i = 0; i < 32 - len; i++){
                bin += '0';
            }
        }

        for(var j = 0 ; j < 4 ; j++){
            if(j == 3){
                ip += this.bin2num(bin.slice(j*8,(j+1)*8))
            }else{
                ip += this.bin2num(bin.slice(j*8,(j+1)*8))  + '.'; 
            }
        }

        return ip ;
    };

    //检查ip是否在一段范围之内
    OPSIP.inRange = function(ip,range){
            if (OPSIP.checkIP(ip) && OPSIP.checkRange(range)) {
                var ip2num    = OPSIP.ip2long(ip),
                    r         = range.split(/[\-:]/),
                    start2num = OPSIP.ip2long(r[0]),
                    end2num   = OPSIP.ip2long(r[1]);

                    return (ip2num >= start2num && ip2num <= end2num );
            }else{
                throw  "ip地址格式不对";
            }
    };

    // 求以2为底的对数，用于将范围转换成cidr
    OPSIP.log2 = function(num){
        if(num <= 1){
            return 0 ;
        }else{
            return 1 + arguments.callee(num>>1);
        }
    };

    //将ip或者范围转换成CIDR形式
    OPSIP.ip2cidr = function(ip){
        var ra = OPSIP.rangeA[0] + ':' + OPSIP.rangeA[1],
            rb = OPSIP.rangeB[0] + ':' + OPSIP.rangeB[1],
            rc = OPSIP.rangeC[0] + ':' + OPSIP.rangeC[1],
            rd = OPSIP.rangeD[0] + ':' + OPSIP.rangeD[1],
            re = OPSIP.rangeE[0] + ':' + OPSIP.rangeE[1],
            cidr ;
        if (OPSIP.checkIP(ip)) {
            if(OPSIP.inRange(ip,ra)){
                cidr = 8 ;
            }else if(OPSIP.inRange(ip,rb)){
                cidr = 16 ;
            }else if (OPSIP.inRange(ip,rc)) {
                cidr = 24 ;
            }else{
                cidr = 0 ;
            }

            return cidr ;
        }

        if (OPSIP.checkRange(ip)) {
            var r    = ip.split(/[\-:]/),
                i    =  0 ,
                start = OPSIP.ip2bin(r[0]),
                end   = OPSIP.ip2bin(r[1]);
            while(start.substring(0,i) != end.substring(0,i)){
                i++;
            }    
            if (i > 0 ) {
                cidr = i ;
            }else{
                cidr = 0 ;
            }
            return cidr ;
        }

        return 0 ;
    };

    //alert(OPSIP.ip2cidr('1.1.1.1-1.5.5.5'));
    //将ip范围转换成cidr
    OPSIP.range2cidr = function(range){
        if (OPSIP.checkRange(range)) {
            var r    = range.split(/[\-:]/),
                i    =  0 ,
                start = OPSIP.ip2bin(r[0]),
                end   = OPSIP.ip2bin(r[1]);
            while(start.substring(0,i) != end.substring(0,i)){
                i++;
            }    
            if (i > 0 ) {
                cidr = i ;
            }else{
                cidr = 0 ;
            }
            return cidr ;
        }

        return 0 ;
    };

    //根据常类IP地址给出子网掩码

    OPSIP.ip2mask = function(ip){
        var cidr = OPSIP.ip2cidr(ip),
            mask = '' ;
        switch (cidr){
            case 24:
                mask = '255.255.255.0';
                break ;
            case 16:
                mask = '255.255.0.0';
                break ;
            case 8 :
                mask = '255.0.0.0' ;
                break ;
            default:
                mask = '0.0.0.0';
                break ;
        }
        return mask ;
    };

    //将ip范围转换出子网掩码
    OPSIP.range2mask = function(range){
        var cidr = OPSIP.range2cidr(range),
            mask = '',
            bin = '',
            k = 0,
            i = cidr,
            j = 32 - cidr;
        while (i !== 0) {
            bin = '1' + bin;
            i--;
        }
        while (j !== 0) {
            bin = bin + '0';
            j--;
        }

        while (k < 4) {
            if (k < 3) {
                mask += OPSIP.bin2num(bin.slice(k * 8, (k + 1) * 8)) + '.';
            } else {
                mask += OPSIP.bin2num(bin.slice(k * 8, (k + 1) * 8));
            }
            k++;
        }
       return mask;
    };

    //已知cidr 求网络地址
    OPSIP.cidr2net = function(ipWithCidr){
        var net = '';
        if(/^([0-9]{1,3}\.{1}){3}[0-9]{1,3}\/[0-9]{1,2}/.test(ipWithCidr)){
           var ips = ipWithCidr.split('\/');
            var    ip = this.ip2bin(ips[0]),
                ipStr ='',
                cidr = ips[1];
            for(var i = 0; i < cidr ;i++){
                ipStr += ip.slice(i,i+1)&1 ;
            }
            for(var j = 0; j < 32 - cidr ; j++){
                ipStr += '0';
                }
            return this.bin2ip(ipStr) ;
        }
    };
})();
