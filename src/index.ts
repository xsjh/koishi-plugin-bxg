import { Context, Schema, h } from 'koishi'
import fs from 'fs';
import path from 'path';
import { img } from '@satorijs/element/jsx-runtime';

export const name = 'bxg'

export const usage = `
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
`

export interface Config {
  delete_msg: boolean;
  jsonPath: string; 
  baoMessage: string; 
  delete_f: string;
  whe_at: boolean;
  txt_a_Path: string;
  txt_v_Path: string;
}

export const Config: Schema<Config> = Schema.object({
  jsonPath: Schema.string().description("敏感词 JSON 文件路径").default(path.join(__dirname, 'SensitiveLexicon.json')),
  baoMessage: Schema.string().description("敏感词提示词：").default("爆"),
  delete_msg: Schema.boolean().description("是否撤回(需要bot有权限)").default(false),
  whe_at: Schema.boolean().description("是否艾特说出敏感词的人").default(false),
  delete_f: Schema.string().description("撤回失败提示词：").default("权限不足撤回失败,请谨言慎行"),
  txt_a_Path: Schema.string().description("txt转换路径(逗号型)").default(path.join(__dirname, 'GFW.txt')),
  txt_v_Path: Schema.string().description("txt转换路径(垂直型)").default(path.join(__dirname, 'COVID-19.txt'))
})


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
    const keywords = ['<img', 'forward', 'json', '<video', '<audio']; 
    if (keywords.some(keyword => session.content.includes(keyword))) {
      return;
    }

    // if (!session.content) return; //空消息忽略
    // await session.send(session.content);
    // console.log('用户输入：',session.content);
    // console.log(session.content, '消息类型：',session.type) 
    
    // 检测消息是否包含敏感词
    const messageContent = session.content;
    const matchedWord = sensitiveWords.find((word) => messageContent.includes(word));
    if (matchedWord) {
    if (config.whe_at){ // 发送提示信息(不@)
      const atUser = `${h('at', { id: session.userId })}`;
      await session.send(`${atUser} ${config.baoMessage}`);
    }else{// 发送提示信息(@)
      await session.send(`${config.baoMessage}`);
    }
    // 如果开了撤回就尝试撤回消息
    if (config.delete_msg === true){
      try {
        await session.bot.deleteMessage(session.channelId, session.messageId);
      } catch (error) {
        await session.send(`${config.delete_f}`)
        console.log('无法撤回的消息：', session.guildId, session.userId)
      }
    }
    }
  });



  //txt垂直词库转json小工具
  ctx.command("bxg.tv", "垂直txt词库转json").action(async ({ session }) => {
    const fs = require('fs');
    // 读取txt文件
    fs.readFile(`${config.txt_v_Path}`, 'utf8', (err, data) => {
      if (err) {
        console.error('读取文件出错:', err);
        return;
      }
     // 按行分割
    const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    // 将每个词项加上双引号并合并成字符串
    const result = lines.map(line => `"${line}"`).join(',');
    // console.log(result);  // 输出结果
    fs.writeFile(`${config.txt_v_Path}_output.txt`, result, 'utf8', (err) => {
      if (err) {
        console.error('写入文件出错:', err);
        return;
      }
      session.send('文件已保存')
      console.log('文件已保存');
    });
    })
  });



  //txt逗号词库转json小工具
  ctx.command("bxg.ta", "逗号txt词库转json").action(async ({ session }) => {
    const fs = require('fs');
    // 读取txt文件
    fs.readFile(`${config.txt_a_Path}`, 'utf8', (err, data) => {
      if (err) {
        console.error('读取文件出错:', err);
        return;
      }
      // 按逗号分割，并去除前后的空格
      const words = data.split(',').map(word => `"${word.trim()}"`);
      // 将处理后的内容合并成一个字符串
      const result = words.join(',');
      // console.log(result);  // 输出结果
      fs.writeFile(`${config.txt_a_Path}_output.txt`, result, 'utf8', (err) => {
        if (err) {
          console.error('写入文件出错:', err);
          return;
        }
        session.send('文件已保存')
        console.log('文件已保存');
    });
    })
  });
}
