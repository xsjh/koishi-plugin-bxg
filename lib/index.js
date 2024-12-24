var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Config: () => Config,
  apply: () => apply,
  name: () => name,
  usage: () => usage
});
module.exports = __toCommonJS(src_exports);
var import_koishi = require("koishi");
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var name = "bxg";
var usage = `
<h1>爆小鬼</h1>
<h2> 检测敏感词并发出提示 </h2>
爆了！爆了！爆了！ </br>

<h4>Notice</h4>
该插件以读取本地json文件方式实现： </br>

格式：{"words": ["敏感词1","敏感词2"]} </br>

<h5>路径尽量不要放到C盘，若遇到json文件读取失败可能是权限原因</h5>
<h5>p.s:相关敏感词库json请自行下载或整理...</h5>
<h4>Update</h4>
最新版更新了txt格式转换为本插件可读取的json文件小工具，支持：</br>

bxg.tv：转换垂直型txt格式</br>
词1</br>
词2</br>
...</br>

bxg.ta：转换逗号型txt格式：</br>
词1,词2...</br>

注意：输出文件将存放在该txt文件所在的文件夹
`;
var Config = import_koishi.Schema.object({
  jsonPath: import_koishi.Schema.string().description("敏感词 JSON 文件路径").default(import_path.default.join(__dirname, "SensitiveLexicon.json")),
  baoMessage: import_koishi.Schema.string().description("敏感词提示词：").default("爆"),
  delete_msg: import_koishi.Schema.boolean().description("是否撤回(需要bot有权限)").default(false),
  whe_at: import_koishi.Schema.boolean().description("是否艾特说出敏感词的人").default(false),
  delete_f: import_koishi.Schema.string().description("撤回失败提示词：").default("权限不足撤回失败,请谨言慎行"),
  txt_a_Path: import_koishi.Schema.string().description("txt转换路径(逗号型)").default(import_path.default.join(__dirname, "GFW.txt")),
  txt_v_Path: import_koishi.Schema.string().description("txt转换路径(垂直型)").default(import_path.default.join(__dirname, "COVID-19.txt"))
});
function apply(ctx, config) {
  let sensitiveWords = [];
  try {
    const data = import_fs.default.readFileSync(config.jsonPath, "utf-8");
    const parsedData = JSON.parse(data);
    sensitiveWords = parsedData.words || [];
  } catch (error) {
    ctx.logger("sensitive-word-detection").error("加载敏感词 JSON 文件失败:", error);
    return;
  }
  ctx.on("message", async (session) => {
    const keywords = ["<img", "forward", "json", "<video", "<audio"];
    if (keywords.some((keyword) => session.content.includes(keyword))) {
      return;
    }
    const messageContent = session.content;
    const matchedWord = sensitiveWords.find((word) => messageContent.includes(word));
    if (matchedWord) {
      if (config.whe_at) {
        const atUser = `${(0, import_koishi.h)("at", { id: session.userId })}`;
        await session.send(`${atUser} ${config.baoMessage}`);
      } else {
        await session.send(`${config.baoMessage}`);
      }
      if (config.delete_msg === true) {
        try {
          await session.bot.deleteMessage(session.channelId, session.messageId);
        } catch (error) {
          await session.send(`${config.delete_f}`);
          console.log("无法撤回的消息：", session.guildId, session.userId);
        }
      }
    }
  });
  ctx.command("bxg.tv", "垂直txt词库转json").action(async ({ session }) => {
    const fs2 = require("fs");
    fs2.readFile(`${config.txt_v_Path}`, "utf8", (err, data) => {
      if (err) {
        console.error("读取文件出错:", err);
        return;
      }
      const lines = data.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
      const result = lines.map((line) => `"${line}"`).join(",");
      fs2.writeFile(`${config.txt_v_Path}_output.txt`, result, "utf8", (err2) => {
        if (err2) {
          console.error("写入文件出错:", err2);
          return;
        }
        session.send("文件已保存");
        console.log("文件已保存");
      });
    });
  });
  ctx.command("bxg.ta", "逗号txt词库转json").action(async ({ session }) => {
    const fs2 = require("fs");
    fs2.readFile(`${config.txt_a_Path}`, "utf8", (err, data) => {
      if (err) {
        console.error("读取文件出错:", err);
        return;
      }
      const words = data.split(",").map((word) => `"${word.trim()}"`);
      const result = words.join(",");
      fs2.writeFile(`${config.txt_a_Path}_output.txt`, result, "utf8", (err2) => {
        if (err2) {
          console.error("写入文件出错:", err2);
          return;
        }
        session.send("文件已保存");
        console.log("文件已保存");
      });
    });
  });
}
__name(apply, "apply");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Config,
  apply,
  name,
  usage
});
