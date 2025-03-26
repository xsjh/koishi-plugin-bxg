import { Context, Logger, Schema, h } from 'koishi'
import fs from 'fs';
import path from 'path';

export const name = 'bxg'

export const usage = `
<h1>爆小鬼</h1>
<h2> 检测敏感词并发出提示 <h2>
<h3>爆了！爆了！爆了！<h3>
<hr>
<h3>Notice</h3>
<h5>1、使用时请务必先确定json路径！</h5>
该插件以读取本地json文件方式实现(敏感词里请不要加*?^%等特殊字符)： </br>
格式：{"words": ["敏感词1","敏感词2"]} </br>

路径尽量不要放到C盘，若遇到json文件读取失败有可能是权限原因</br>

【p.s】:相关敏感词库json请自行下载或整理...[可以在github上找到]</br>
<h5>2、关于命令:bxg.t</h5>
提供txt格式转换为本插件可读取的json文件小工具，支持自动识别：</br></br>
1.垂直型txt格式:</br>
词1</br>
词2</br>
...</br></br>
2.逗号型txt格式:</br>
词1,词2...</br></br>
<h5>转换完毕之后打开json文件再手动添加也是可以的，记得重载插件</h5>
<h5>注意：输出文件将存放在原txt文件所在的文件夹</h5>
<hr>
<h3>Update</h3>
<h5>v1.0.5更新：</h5>
<li>禁言功能：开启后可将发送敏感词的用户禁言（由于无法获取禁言状态，所以因权限原因导致的禁言失败不会返回提示）</li>
<li>替代功能：开启后可将原话中的屏蔽词变为*重新发送，可以设置字数限制，防止消息过长刷屏</li>
<li>白名单功能：添加到白名单的词将不会被检测</li>
<li>日志调试功能：开启后可在日志返回相关信息，详情请在该选项描述中阅读</li>
<li>txt格式转换：更新了自动判断txt文件两种格式，无需分别将txt文件放在两个路径下</li>
<h5>v1.0.6更新：</h5>
<li>新增开关发送敏感提示词功能</li>
<h5>此版本经测试无问题后，将降低更新速度，感谢下载！</h5>
-----------------------------------------------------</br>
`


export interface Config {
  delete_msg: boolean;
  jsonPath: string; 
  baoMessage: string; 
  delete_f: string;
  whe_at: boolean;
  whe_ban: boolean;
  whe_replace: boolean;
  whe_bao: boolean;
  txt_Path: string;
  log_info: boolean;
  key_words: Array<string>;
  ban_time: number;
  replace_num: number;
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    jsonPath: Schema.string().description("敏感词 JSON 文件路径").default(path.join(__dirname, 'SensitiveLexicon.json')),
    whe_bao:Schema.boolean().description("是否发送敏感提示词，例如：爆！").default(true),
    baoMessage: Schema.string().description("敏感词提示词：").default("爆了"),
  }).description('基础设置'),
  Schema.object({
    delete_msg: Schema.boolean().description("是否撤回该敏感消息").default(false),
    whe_at: Schema.boolean().description("是否艾特说出敏感词的人").default(false),
    whe_ban: Schema.boolean().description("是否禁言说出敏感词的人").default(false),
    ban_time: Schema.number().default(60000).description("禁言时长(毫秒)"),
    delete_f: Schema.string().description("因权限不足撤回失败提示词：").default("权限不足撤回失败,请谨言慎行!"),
  }).description('权限管理(前三项需要bot有权限)'),
  Schema.object({
    whe_replace: Schema.boolean().description("是否将敏感词替换为“*”重新发送消息").default(true),
    replace_num: Schema.number().default(20).description("超过一定字数就不发送替换消息，防止刷屏")
  }).description('敏感消息替换'),
  Schema.object({
    key_words: Schema.array(String).role('table').description("添加到此表的词将不会被检测").default(['sb'])
  }).description('白名单'),
  Schema.object({
    txt_Path: Schema.string().description("需要转换的txt路径").default(path.join(__dirname, 'GFW.txt')),
  }).description('txt转换json功能'),
  Schema.object({
    log_info:Schema.boolean().default(false).description(`当遇到机器人莫名其妙触发的时候，可以开启此选项. <br> 然后在日志中会显示用户发送的消息，到上方白名单添加屏蔽即可`).experimental()
  }).description('日志调试'),
])




export function apply(ctx: Context, config: Config) {
   // 预加载 JSON 文件内容
   let sensitiveWords: string[] = [];
   try {
     const data = fs.readFileSync(config.jsonPath, 'utf-8');
     const parsedData = JSON.parse(data);
     sensitiveWords = parsedData.words || [];
   } catch (error) {
     ctx.logger('sensitive-word-detection').error('加载敏感词 JSON 文件失败:', error);
     return;
   }

   // 监听消息事件
   ctx.on('message', async (session) => {

    // 日志排查模式
    if (config.log_info === true){
      ctx.logger('用户发送的消息').info(`${session.userId}：${session.content}`);
    }

    // 不检测白名单词，如果遇到到白名单关键词，直接返回
    const matchedWhiteListWords = config.key_words.filter((key_words) => session.content.includes(key_words));
    if (matchedWhiteListWords.length > 0) {
      if(config.log_info === true){
        ctx.logger('白名单:').info(matchedWhiteListWords);
      }
      return; 
    }

    //不检测图片、图片文件、聊天记录、转发消息、空消息(待更新...)
    const whitewords = ['<', 'forward', 'json','[']; 
      if (session.content.trim() === '' || whitewords.some(whitewords => session.content.includes(whitewords))) {
      return;
    }

    // 开始检测消息是否包含敏感词
    const messageContent = session.content;
    const matchedWord = sensitiveWords.find((word) => messageContent.includes(word));
    if (matchedWord) {
    if (config.whe_at === true && config.whe_bao === true){ // 发送爆(不@)
      const atUser = `${h('at', { id: session.userId })}`;
      await session.send(`${atUser} ${config.baoMessage}`);
    }else if(config.whe_bao === true){// 发送爆(@)
      await session.send(`${config.baoMessage}`);
    }

    // 撤回消息
    if (config.delete_msg === true){
      try {
        await session.bot.deleteMessage(session.channelId, session.messageId);
      } catch (error) {
        await session.send(`${config.delete_f}`)
        if(config.log_info === true){
        ctx.logger('无法撤回的消息(群组+用户)：').error(session.guildId, session.userId)
        }
      }
    }
    
    // 禁言用户
    if (config.whe_ban === true){
      try{
        await session.bot.muteGuildMember(session.guildId, session.userId, config.ban_time);
      }catch (error){
        if(config.log_info === true){
        ctx.logger('禁言失败').error('群组:',session.guildId,'账号:',session.userId)
        }// 因为无法获取禁言状态，一般来说不会返回
      }
    }
    
    // 将敏感词替换为*发送
    if (config.whe_replace === true && messageContent.length < config.replace_num){
      let replacedMessage = messageContent;
      sensitiveWords.forEach((word) => {
      const starReplacement = '*'.repeat(word.length);
      const regex = new RegExp(word, 'g');
      replacedMessage = replacedMessage.replace(regex, starReplacement);
    });
      // 重新发送替换后的消息
      if(config.log_info === true){
        ctx.logger('重新替换的消息').info(replacedMessage)
        ctx.logger('消息长度').info(messageContent.length)
      }
      await session.send(replacedMessage);
    }else{
      ctx.logger('消息超过设定长度，不进行替换').info('群组:',session.guildId,'账号:',session.userId)
    }
   }
  });



  //txt词库转json小工具
  ctx.command("bxg.t", "转换你的txt词库").action(async ({ session }) => {
    const fs = require('fs');
    fs.readFile(`${config.txt_Path}`, 'utf8', (err, data) => {
      if (err) {
        session.send(`读取文件出错：${err}`);
        return;
      }
      const isCommaSeparated = data.includes(',');//检测txt文件的逗号
      // 逗号分隔的词库
      if (isCommaSeparated) {
        const words = data.split(',').map(word => `"${word.trim()}"`);
        const result = words.join(',');
        fs.writeFile(`${config.txt_Path}_output.json`, `{"words": [${result}]}`, 'utf8', (err) => {
          if (err) {
            session.send(`写入文件出错：${err}`);
            return;
          }
          session.send('逗号分隔型词库已转换，并保存至原txt同一目录');
        });
      }else {  // 垂直词库（每行一个词）
        const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        const result = lines.map(line => `"${line}"`).join(',');
        fs.writeFile(`${config.txt_Path}_output.json`, `{"words": [${result}]}`, 'utf8', (err) => {
          if (err) {
            session.send(`写入文件出错：${err}`);
            return;
          }
          session.send('垂直型词库已转换，并保存至原txt同一目录');
        });
      }
    });
  }); 
}
