var CryptoJS = require("crypto-js");



var UID = 10203405609;

CryptoJS.enc.u8array = {
    stringify: function (wordArray) {
        var words = wordArray.words;
        var sigBytes = wordArray.sigBytes;
        var u8 = new Uint8Array(sigBytes);
        for (var i = 0; i < sigBytes; i++) {
            var byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
            u8[i]=byte;
        }
        return u8;
    },

    parse: function (u8arr) {
        var len = u8arr.length;
        var words = [];
        for (var i = 0; i < len; i++) {
            words[i >>> 2] |= (u8arr[i] & 0xff) << (24 - (i % 4) * 8);
        }
        return CryptoJS.lib.WordArray.create(words, len);
    }
};

DataType = {
    base64To16Bytes: function(b64) {
        var binary = atob(b64);
        var length = binary.length;
        var bytes = new Uint8Array(16);
        for (var i = 0, j = 2; j < length; i++, j++) {
            // Ignore the top 2 bytes(0x01, 0x08)
            bytes[i] = binary.charCodeAt(j);
        }
        return bytes;
    },

    hexTo16Bytes: function(hex) {
        var bytes = new Uint8Array(16);
        for (var i = 0, j = 0; i < hex.length; i+=2, j++) {
            var substr = hex.substring(i, i+2);
            bytes[j] = parseInt(substr, 16);
        }
        return bytes;
    },

    binaryToString: function(bytes) {
        var result = '';
        for (var i = 0; i < bytes.length; i++) {
            result += String.fromCharCode(bytes[i]);
        }
        return result;
    },

    binaryToHexString: function(bytes) {
        var result = '';
        for (var i = 0; i < bytes.length; i++) {
            var hex = (bytes[i] & 0xff).toString(16);
            hex = hex.length === 1 ? '0' + hex : hex;
            result += hex;
        }
        return result.toUpperCase();
    }
}
var PayCode = (function(){
    function PayCode(key,uid,clock){
        this.key = key;
        this.uid = uid;
        this.clock = clock?clock:30;
    }

    PayCode.prototype.next = function(){
        var time = parseInt(Date.now() / (1000*this.clock))
        // console.log(time.toString())
        var hash = CryptoJS.HmacSHA1(time.toString(), this.key)
        // console.log(CryptoJS.enc.Base64.stringify(hash))
        var hashArray = CryptoJS.enc.u8array.stringify(hash)
        var offset = parseInt(hashArray[19]&0xf)
        var snum = hashArray.slice(offset,offset+4)
        var result = 0
        // for(var i = snum.length;i >=0 ;i--){
        //     result=result<<8|snum[i];
        //     console.log(snum[i])
        // }
        result = ((snum[0]&0x7f) * Math.pow(2,24))
        result += ((snum[1]&0xff)* Math.pow(2,16))
        result += ((snum[2]&0xff)* Math.pow(2,8))
        result += ((snum[3]<<0)&0xff)
        var result = parseInt(result % Math.pow(10,4))
        // console.log(result)
        return this.generatorOTP(result)
    }
    
    PayCode.prototype.padding = function (data,length){
        // while(data<length){
        //     data *= 10;
        // }
        var result = data.toString()
        while(result.length<length){
            result = "0"+result
        }
        return result;
    }

    PayCode.prototype.generatorOTP = function (result){
        var factor = 5;

        var x = result;
        var y = parseInt(UID / x + factor * x);
        var z = (UID % x);
        // console.log(x+" "+y+" "+z)

        return "28" + this.padding(x,4) + this.padding(y,8) + this.padding(z,4)
    }
    return PayCode
})()
var key = "MBNWWOXPX6667P55LHX37PLI56733357XXL2" +
            "J357XXX37PJG56733UUPPTX37PLB56732GK6ALX37" +
            "PPPX66RP357XXX37PLW56733357XXX37PJ6K3X37P" +
            "JDJVJO7P55FLX37PPPX6667P55FRVC6GQWCXX37PL" +
            "656732Z7PX66QR357XXX37PIT56732OQ";
var uid = 10203405609;
var otp = new PayCode("asdadas",uid,1)
console.log(parseInt(1.6))

// console.log(otp.next())

setInterval(function(){
    console.log(otp.next())
},1000)
// function get8BitBytes(data) {
//     var result = new Uint8Array(8)
//     var shift = [56, 48, 40, 32, 24, 16, 8, 0]
//     var mask = 0xFF;
//     for (var i = 0;i< result.length;i++){
//         //算术左右移只针对Int32 这里使用power代替
//         /*
//             In JavaScript bit shifts (>>, <<) are always performed on signed, 32-bits integers. This leads to range overflow for large numbers.
//             http://stackoverflow.com/questions/8482309/converting-javascript-integer-to-byte-array-and-back
//         */
//         result[i] = ((data / Math.pow(2,shift[i]))&mask)
//     }
//     var final = 0;
//     for (var i = 0;i< result.length;i++){
//         final += result[result.length-1-i]*Math.pow(2,i*8)
//     }
//     console.log((final).toString(2))
//     return final
// }
// console.log((get8BitBytes(4000)).toString(2))
// var date = parseInt(Date.now() / (30*1000))
// var hash = CryptoJS.HmacSHA1(date.toString(), "key");
// var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
// console.log(hashInBase64)