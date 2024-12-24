import { Context, Schema } from 'koishi';
export declare const name = "bxg";
export declare const usage = "\n<h1>\u7206\u5C0F\u9B3C</h1>\n<h2> \u68C0\u6D4B\u654F\u611F\u8BCD\u5E76\u53D1\u51FA\u63D0\u793A </h2>\n\u7206\u4E86\uFF01\u7206\u4E86\uFF01\u7206\u4E86\uFF01 </br>\n\n<h4>Notice</h4>\n\u8BE5\u63D2\u4EF6\u4EE5\u8BFB\u53D6\u672C\u5730json\u6587\u4EF6\u65B9\u5F0F\u5B9E\u73B0\uFF1A </br>\n\n\u683C\u5F0F\uFF1A{\"words\": [\"\u654F\u611F\u8BCD1\",\"\u654F\u611F\u8BCD2\"]} </br>\n\n<h5>\u8DEF\u5F84\u5C3D\u91CF\u4E0D\u8981\u653E\u5230C\u76D8\uFF0C\u82E5\u9047\u5230json\u6587\u4EF6\u8BFB\u53D6\u5931\u8D25\u53EF\u80FD\u662F\u6743\u9650\u539F\u56E0</h5>\n<h5>p.s:\u76F8\u5173\u654F\u611F\u8BCD\u5E93json\u8BF7\u81EA\u884C\u4E0B\u8F7D\u6216\u6574\u7406...</h5>\n<h4>Update</h4>\n\u6700\u65B0\u7248\u66F4\u65B0\u4E86txt\u683C\u5F0F\u8F6C\u6362\u4E3A\u672C\u63D2\u4EF6\u53EF\u8BFB\u53D6\u7684json\u6587\u4EF6\u5C0F\u5DE5\u5177\uFF0C\u652F\u6301\uFF1A</br>\n\nbxg.tv\uFF1A\u8F6C\u6362\u5782\u76F4\u578Btxt\u683C\u5F0F</br>\n\u8BCD1</br>\n\u8BCD2</br>\n...</br>\n\nbxg.ta\uFF1A\u8F6C\u6362\u9017\u53F7\u578Btxt\u683C\u5F0F\uFF1A</br>\n\u8BCD1,\u8BCD2...</br>\n\n\u6CE8\u610F\uFF1A\u8F93\u51FA\u6587\u4EF6\u5C06\u5B58\u653E\u5728\u8BE5txt\u6587\u4EF6\u6240\u5728\u7684\u6587\u4EF6\u5939\n";
export interface Config {
    delete_msg: boolean;
    jsonPath: string;
    baoMessage: string;
    delete_f: string;
    whe_at: boolean;
    txt_a_Path: string;
    txt_v_Path: string;
}
export declare const Config: Schema<Config>;
export declare function apply(ctx: Context, config: Config): void;
