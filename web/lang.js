/* 创作家 / Creator Studio | 项目发布者：创作家项目发布者 / Creator Studio project publisher | License: LICENSE.txt | Third-party: THIRD_PARTY_NOTICES.txt */
/* UI strings only. User-authored fields are deliberately excluded below. */
(() => {
'use strict';
const pairs = String.raw`
创作家|Creator Studio
创作家 · 本地创作工作台|Creator Studio · Local writing desk
创作家 · 故事由你接着写|Creator Studio · The next page is yours
小说写作室|Fiction writing studio
写作台|Writing desk
产品介绍 ↗|About ↗
使用指引 ↗|Quick tour ↗
故事书架|Story library
开始创作|Start writing
关闭书架|Close library
新建故事的两种方式|Two ways to start a story
新手模式|Guided start
回答六题，一起想故事|Build a story in six questions
开始一个新故事|Start a new story
打开空白页，自由写|Open a blank page
我的故事|My stories
调整顺序|Reorder
完成排序|Done
用 ↑ ↓ 调整位置，顺序会自动保存。|Use ↑ ↓ to reorder. Changes save automatically.
找一个故事|Find a story
搜索故事|Search stories
选择故事|Choose a story
故事保存在这台设备|Stories saved on this device
导入作品|Import
导出正文|Export text
备份全部故事|Back up all stories
模型连接|Model connection
退出本地服务|Stop local service
本地测试版|Local preview
打开书架|Open library
书架|Library
我的故事 /|My stories /
收起两侧面板，专心写作|Hide side panels to focus on writing
专注|Focus
退出专注|Exit focus
显示设置|Display settings
显示|Display
世界设定|World notes
演示模式|Demo mode
先体验写作流程。演示续写使用固定示例，不调用模型、不产生费用。|Try the writing workflow. Demo mode uses fixed text, with no model calls or charges.
连接模型|Connect model
管理连接|Manage connection
章节管理|Chapters
切换章节|Switch chapter
本章标题|Chapter title
继续下一章 ↗|Next chapter ↗
上下文详情|Context details
故事草稿|STORY DRAFT
已保存到本地|Saved locally
正在保存…|Saving…
等待保存…|Waiting to save…
未能保存，请导出备份|Unable to save. Please export a backup.
保存失败，请立即导出备份|Save failed. Please export a backup now.
故事标题|Story title
0 字|0 characters
今天|Today
我写的|Your writing
AI 续写|AI continuation
小说正文|Story text
写点什么。|Write something.
写点什么。 一个人物、一句对白，或一个尚未成形的念头。|Write something. A character, a line of dialogue, or the beginning of an idea.
一个人物、一句对白，或一个尚未成形的念头。|A character, a line of dialogue, or the beginning of an idea.
故事还在继续|The story continues
从正文末尾接着写，随时可以撤销。|Continue from the end. You can undo at any time.
↓ 回到最新|↓ Jump to latest
设置模型连接|Set up model connection
演示续写|Demo continuation
Ctrl + Enter 续写 · Esc 停止|Ctrl + Enter to continue · Esc to stop
撤销|Undo
撤销一次编辑或整次续写|Undo an edit or a complete continuation
重做|Redo
恢复刚刚撤销的正文|Restore the text you just undid
继续写作|Continue writing
创作设置|Story settings
CURRENT STORY / 设定|CURRENT STORY / SETTINGS
故事设定|Story settings
这本故事的人物、记忆与规则。|Characters, memories and rules for this story.
关闭创作设置|Close story settings
故事记忆|Story memory
生成|Generation
始终带入|Always included
人物关系、背景，以及不能忘记的事。|Relationships, background and facts to remember.
写下人物关系、故事背景，以及需要持续记住的前情。|Add relationships, background and events the model should remember.
前章进度摘要|Previous chapter recap
随本章续写发送。新章继承经过你确认的前情。|Included with continuations. New chapters inherit the recap you approve.
我已核对这份摘要|I have reviewed this recap
作者注|Author’s note
当前方向|Current direction
告诉 AI 这一段的情绪、节奏或视角。|Set the mood, pace or viewpoint for this passage.
例如：第三人称，克制叙述，用细节推动悬念。|For example: third person, restrained narration; build suspense through details.
世界设定 ·|World notes ·
条|entries
查看这本故事的设定 →|View this story’s world notes →
添加世界书词条|Add world note
＋ 添加|＋ Add
记下地点、人物或规则。最近正文或前章摘要提到关键词时，AI 会读到这条设定。|Add places, characters or rules. A note is included when its keywords appear in recent text or the previous recap.
这里的生成参数在本设备上共用，切换故事或章节时继续沿用。|Generation settings are shared on this device and remain active across stories and chapters.
续写模式|Writing mode
演示续写 · 不产生费用|Demo · no charges
真实模型 API|Live model API
演示仅用于检查操作。评估小说质量请连接真实模型。|Demo mode previews the controls. Connect a model to evaluate writing quality.
输出上限|Output limit
短段落 · 256 tokens|Short · 256 tokens
适中 · 512 tokens|Medium · 512 tokens
较长 · 1,024 tokens|Longer · 1,024 tokens
长段落 · 2,048 tokens|Long · 2,048 tokens
是生成上限，不是保证的字数。|A maximum, not a guaranteed word count.
创意程度|Creativity
更稳妥|More consistent
更自由|More varied
带入最近正文|Include recent text
最近 4,000 字符|Last 4,000 characters
最近 12,000 字符|Last 12,000 characters
最近 24,000 字符|Last 24,000 characters
最近 48,000 字符|Last 48,000 characters
这不是模型 token 数；长篇请把重要前情补进故事记忆。|These are characters, not tokens. Add important earlier events to story memory.
模型上下文容量（tokens）|Model context window (tokens)
0 = 自动识别。其他模型请按服务商规格填写；未知时暂按 8,192 预警。容量包含输入与输出，不等于保证记住所有细节。|0 = automatic. For other models, use the provider’s specification. Unknown models use an 8,192-token warning threshold. Input and output share the window; recall is not guaranteed.
生成时自动跟随正文|Auto-scroll during generation
手动向上阅读会暂停跟随，可点「回到最新」。|Scrolling up pauses auto-scroll. Use “Jump to latest” to resume.
查看本次发送的上下文|Preview the context to be sent
设定属于这本故事，切换故事会一起切换。|These settings belong to this story and switch with it.
关闭侧栏|Close sidebar
上一步|Back
下一步|Next
跳过指引|Skip tour
创作家产品介绍|About Creator Studio
关闭产品介绍|Close introduction
返回写作台 ×|Back to writing ×
进入写作台 →|Enter writing desk →
读得舒服，写得顺手|Make yourself comfortable
关闭|Close
菜单和正文分开调整，选择会自动记住。|Adjust menus and story text separately. Your choices are remembered.
菜单与按钮字号|Menu and button size
16 px · 标准大字|16 px · Standard
18 px · 更大|18 px · Larger
正文字号|Story text size
16 px · 紧凑|16 px · Compact
18 px · 标准|18 px · Standard
20 px · 舒适|20 px · Comfortable
22 px · 大字|22 px · Large
24 px · 更大|24 px · Larger
专注模式会收起两侧面板。|Focus mode hides both side panels.
完成|Done
连接你的写作模型|Connect your writing model
填写服务商的 API 信息。你可以选择在自己的 Windows 电脑上记住密钥。|Enter your provider’s API details. You can choose to remember the key on your own Windows PC.
选服务商，再填模型名称和自己的 API Key。这里列出兼容入口，不代表每个模型都已实测。|Choose a provider, then enter the model name and your API key. Listed endpoints are compatible options; individual models have not all been tested.
服务商|Provider
DeepSeek 官方|DeepSeek
Anthropic · Claude|Anthropic · Claude
Google · Gemini|Google · Gemini
阿里云百炼 · 千问|Alibaba Cloud Model Studio · Qwen
硅基流动|SiliconFlow
自定义 · OpenAI Chat 兼容|Custom · OpenAI Chat compatible
接口地址（Base URL）|Base URL
DeepSeek 官方接口；模型名称与 Key 请按你的账号填写。|Official DeepSeek endpoint. Enter the model name and key for your account.
OpenAI Chat Completions 文本接口；推理模型的参数会自动调整。|OpenAI Chat Completions text endpoint. Request parameters are adjusted for reasoning models.
Claude 的 OpenAI 兼容入口；不发送创意程度参数。|Claude's OpenAI-compatible endpoint. The creativity parameter is omitted.
Gemini 的 OpenAI 兼容入口；填 Google AI Studio 的 API Key。|Gemini's OpenAI-compatible endpoint. Enter a Google AI Studio API key.
百炼北京旧域名仍可使用。其他地域或业务空间专属域名，请按控制台替换地址，并使用同地域的 Key。|The legacy Beijing endpoint still works. For other regions or a dedicated workspace endpoint, replace the URL as shown in your console and use a key from the same region.
Grok 的 Chat Completions 文本接口；模型名称按 xAI 控制台填写。|Grok's Chat Completions text endpoint. Enter a model name from your xAI console.
硅基流动的兼容入口；模型名称按控制台填写。|SiliconFlow's compatible endpoint. Enter a model name from your console.
OpenRouter 的兼容入口；模型名称按其目录填写。|OpenRouter's compatible endpoint. Enter a model name from its directory.
填写服务商的 HTTPS OpenAI Chat Completions 基础地址（不含 /chat/completions）。|Enter the provider's HTTPS OpenAI Chat Completions base URL (without /chat/completions).
模型名称|Model name
只在你的电脑上填写|Enter only on your own device
记住此电脑上的密钥|Remember key on this computer
正在检查本地加密保存功能…|Checking encrypted local storage…
忘记已保存密钥|Forget saved key
正文上下文经本地服务发送到你选择的模型商。DeepSeek 预设关闭思考；其他服务商使用其默认行为。|Story context passes through the local service to your chosen provider. The DeepSeek preset disables thinking; other providers use their defaults.
正文上下文经本地服务发送到你选择的模型商。DeepSeek 预设关闭思考；其余模型按接口能力处理参数。|Story context passes through the local service to your chosen provider. The DeepSeek preset disables thinking; other model parameters follow endpoint capabilities.
「测试连接」只读取模型列表；有些兼容接口不提供列表，仍可填写模型名称后点「试写验证」。试写会使用账户额度，不写入故事。|Test connection only fetches the model list. If a compatible endpoint has no list, enter a model name and use Test generation. Testing uses your API credit and does not change your story.
「测试连接」只读取模型列表；「试写验证」会请求一个短句，上限 64 tokens，使用账户额度，不会写入你的故事。|“Test connection” fetches the model list. “Test generation” requests up to 64 tokens, uses your API credit and does not change your story.
模型实际返回|Model response
测试连接|Test connection
试写验证|Test generation
保存并启用|Save and enable
本次上下文|Request context
六个小问题，把想法变成故事|Six questions to shape your story
第 1 题，共 6 题|Question 1 of 6
关闭新手模式|Close guided start
怎么答|How to answer
选一个，也可以自己写|Pick one or write your own
你的回答|Your answer
选好后还可以改|You can edit your choice
没想好？|Need an idea?
给我一个例子|Give me an example
换个例子|Another example
回答会保存在这个浏览器里，可以退出后再继续。|Answers are saved in this browser. You can leave and return later.
看看你的故事设定|Review your story settings
故事名称|Story title
故事记忆 · 人物、背景与目标|Story memory · characters, background and goals
作者注 · 文风与写作要求|Author’s note · style and writing direction
文风已整理成具体要求。创建后会随每次续写发送，也会保留到下一章；你可以随时修改。|Your style becomes specific writing instructions, sent with every continuation and carried into the next chapter. Edit them at any time.
世界设定 · 提到关键词时使用|World notes · included when keywords appear
可以直接创建，也可以让模型再完善一次。AI 完善使用你的模型账户额度，结果需要你检查。|Create now, or ask the model to refine the setup. Refinement uses your API credit; review the result.
按回答重新整理|Rebuild from answers
让 AI 帮我完善|Refine with AI
停止整理|Stop refinement
上一题|Previous
下一题|Next question
修改回答|Edit answers
创建故事并填入|Create story with these settings
继续本章，还是整理后开新章？|Keep writing or start a new chapter?
关闭上下文提示|Close context warning
新建章节前会先让你核对摘要。继续本章时，较早正文依靠故事记忆和摘要补足；原文始终保留。|Review the recap before starting a chapter. If you continue, memory and recaps help cover earlier text. Your original text is kept.
返回编辑|Back to editing
继续本章|Continue this chapter
总结并新建章节|Recap and start a chapter
把故事接到下一章|Continue into the next chapter
关闭章节整理|Close chapter setup
先连接模型|Connect a model first
AI 总结本章进度|Generate a chapter recap
停止总结|Stop summarizing
前情摘要 · 也可以自己填写|Recap · you can also write it yourself
已经发生的事件、人物现在的状态、未解伏笔，以及最后一幕停在哪里。|Events so far, current character states, unresolved threads and where the last scene ends.
下一章标题|Next chapter title
我已核对摘要，确认用于下一章|I have reviewed and approved this recap
新章保留故事记忆、作者注和世界书，并带入这份摘要。旧章全文及各章编辑历史会保留，可随时切换查看。|The new chapter keeps memory, author’s note and world notes, and includes this recap. Earlier chapters and their edit history remain available.
留在本章|Stay in this chapter
确认摘要并创建下一章|Approve recap and create chapter
退出创作家？|Exit Creator Studio?
保存当前故事并停止本地服务。下次双击启动器即可继续。只关闭网页时，服务仍会在后台运行。|Save the current story and stop the local service. Launch it again to continue. Closing only the web page leaves the service running.
继续使用|Keep writing
保存并退出|Save and exit
管理故事|Manage story
关闭故事管理|Close story manager
改名字不会改变正文、章节或设定。|Renaming does not change text, chapters or settings.
删除故事…|Delete story…
取消|Cancel
保存名称|Save title
确定删除这个故事？|Delete this story?
确认后会直接删除正文、章节和设定，应用内无法撤销。需要保留副本请先取消并备份。|This permanently deletes the story, chapters and settings. It cannot be undone. Cancel and make a backup first if you need a copy.
确认删除|Delete permanently
管理|Manage
上移|Move up
下移|Move down
词条名称|Entry name
关键词（逗号分隔）|Keywords (comma-separated)
触发关键词|Trigger keywords
设定内容|Note contents
启用词条|Enable entry
删除|Delete
已触发|Included
没有找到这个故事|No matching stories
真实 API|Live API
待填密钥|API key needed
固定示例续写 · 不调用模型|Fixed demo text · no model call
续写会发送正文上下文，并使用模型账户额度|Continuations send story context and use your API credit
刷新后密钥已清空，请重新连接模型。|Please connect a model or restore your saved key.
正在演示续写（固定示例）…|Showing demo continuation…
正在续写…|Writing…
停止续写|Stop writing
停止处理|Stop
正在整理创作资料…|Preparing story settings…
创作资料处理结束。|Story setup finished.
已停止，收到的内容已保留。|Stopped. Received text has been kept.
本次续写已完成，可一键撤销。|Continuation complete. You can undo it.
已到输出上限，正文已保留，可继续写作。|Output limit reached. Text is saved; you can continue.
已到正文上限，收到的内容已保留。|Text limit reached. Received content is kept.
模型没有返回正文，请检查模型或调整设置。|The model returned no story text. Check the model or settings.
模型只返回了与原文重复的内容，未追加正文，可以再试一次。|The model only repeated existing text. Nothing was appended; you can try again.
已略去重复的开头。|Repeated opening text was skipped.
续写停止后可以撤销|Stop generation before undoing
还没有可撤销的正文操作|Nothing to undo yet
还没有可重做的正文操作|Nothing to redo yet
存储不可用，请及时导出|Storage unavailable. Please export a backup.
正在请求模型生成测试短句…|Requesting a short test response…
已收到模型正文。点击「保存并启用」，再到正文页续写。|Response received. Select “Save and enable”, then return to writing.
正在读取模型列表…|Fetching model list…
未命名的新故事|Untitled story
未命名章节|Untitled chapter
新词条|New entry
没想好怎么写？|Need a place to start?
点「新手模式」，回答六个小问题，就能整理出人物、世界和文风。|Use “Guided start”. Six questions help shape characters, world and style.
想好了，直接写|Ready? Start writing
点「开始一个新故事」，打开一张空白页。以前的故事还在书架上。|Choose “Start a new story” for a blank page. Your other stories stay in the library.
在这里写正文|Write your story here
写下第一句，也可以修改已有文字。薄荷绿是你写的，浅色是 AI 写的。|Write a first line or edit existing text. Mint is your writing; light text is AI writing.
写下主角是谁、之前发生了什么。每次续写，AI 都会先读这些内容。|Note who the characters are and what happened earlier. This is included with every continuation.
想写得紧张一点，还是温柔一点？把文风、视角和要求写在这里。|More suspense or a softer tone? Set style, viewpoint and direction here.
点「添加」，写下地点、人物或规则，再填一个关键词，比如「月亮村」。最近正文或前章摘要提到它时，AI 会读这条设定。|Choose “Add” for a place, character or rule, then add a keyword such as “Moon Village”. Recent text or the recap triggers matching notes.
让 AI 接着写|Let AI continue
连接模型后，点「继续写作」。写得不满意可以撤销；演示模式只显示示例。|Connect a model, then choose “Continue writing”. Undo if you dislike it. Demo mode uses fixed text.
准备写下一章|Ready for the next chapter
先整理本章发生的事，检查后再开新章。人物和世界设定会保留。|Summarize this chapter and review the recap before moving on. Characters and world notes stay with you.
给故事留一份备份|Keep a backup
故事保存在这个浏览器里。点「备份全部故事」下载一份，换电脑时可以导入。|Stories are stored in this browser. Download “Back up all stories” and import it on another device.
创作家首页|Creator Studio home
页面导航|Page navigation
故事可能性|Possibilities
功能|Features
怎么开始|Getting started
常见问题|FAQ
开始创作 ↗|Start writing ↗
故事的下一页，|The next page
听你的。|is yours.
想住进另一个世界，改写某个结局，或把一个念头写成一本书？从一句话开始，你来决定故事往哪里走。|Live in another world, rewrite an ending, or turn an idea into a book. Begin with one sentence and decide where the story goes.
创作家是一张可以不断接着写的故事桌。自己写、请 AI 续写、修改重来，都在同一篇故事里。|Creator Studio gives your story room to grow. Write, ask AI to continue, edit and try again, all in the same manuscript.
进入写作台|Enter writing desk
可先用演示模式熟悉操作；真实续写需要你自己的模型 API。|Explore with the demo. Real generation requires your own model API.
原创示例故事《候潮室》书封插画|Original cover illustration for the example story The Tide Room
候潮室|The Tide Room
没有末班船的夜晚|The night the last boat never came
创作家 · 故事示例|Creator Studio · sample story
由你续页|Your next page
01 / 选择一个开头|01 / PICK A BEGINNING
故事不是交出去的，是和你一起往前走的。|Your story grows with you.
02 / 把下一页写出来 ↗|02 / WRITE THE NEXT PAGE ↗
你想怎样进入故事？|How will you enter the story?
同一个夜晚，五种继续的方式。点开看看你的那一种；这是一段演示文案，真正的走向由你写下的内容和模型续写决定。|One night. Five ways forward. Explore these sample scenes; your writing and your chosen model shape the real story.
故事体验方式|Ways to experience a story
01 / 沉浸|01 / IMMERSE
我想生活在另一个世界|I want to live in another world
02 / 掌控|02 / REWRITE
我不想被作者安排|I want a say in what happens
03 / 共鸣|03 / CONNECT
我希望有人回应我的想象|I want my imagination to find a voice
04 / 探索|04 / EXPLORE
我有想法，但不一定会写|I have ideas, but need a way in
05 / 成书|05 / FINISH
我想更快完成小说|I want to finish my novel sooner
先走进去，听见潮声。|Step inside. Hear the tide.
把人物、地点和规则交给故事记忆与世界设定。写一句你想做的事，再点「继续写作」，看看故事如何回应。|Add characters, places and rules to memory and world notes. Write what you want to do, then continue and see how the story responds.
“末班船刚离岸，候船室里却有人喊出了你的名字。”|“The last boat had left, yet someone in the waiting room called your name.”
你会用到|YOUR TOOLS
故事记忆 · 世界设定 · 继续写作|Story memory · World notes · Continue writing
想象很自由，|Let imagination roam.
工具要跟得上。|Keep your tools close.
从随手写一段到认真管理长篇，重要的东西放在你找得到的地方。|From a stray paragraph to a full manuscript, keep what matters within reach.
创作家写作台示意：左侧故事书架，中间正文和继续写作按钮，右侧故事记忆、世界设定和生成设置|Writing desk illustration: library on the left, manuscript in the center, memory, world notes and generation settings on the right
✒ 创作家|✒ Creator Studio
写作台 / 故事设定|Writing desk / Story settings
新手模式 ↗|Guided start ↗
另一本草稿|Another draft
故事草稿 / 01|STORY DRAFT / 01
末班船已经离岸，候船室里却有人喊出了她的名字。|The last boat had left, yet someone in the waiting room called her name.
她转身，看见墙上那张泛黄的船票，目的地是三年前消失的岛。|She turned toward a faded ticket on the wall. Its destination was an island that had vanished three years earlier.
门外的海忽然安静了下来。她决定留在这里，等下一艘船。|Outside, the sea fell silent. She decided to stay and wait for the next boat.
撤销 重做|Undo  Redo
✦ 继续写作|✦ Continue writing
这本故事的设定|This story’s settings
生成参数|Generation settings
界面结构示意 · 故事内容为介绍页示例，非你的私人作品|Interface illustration · sample story, not your private writing
不会写？先回答六个问题|Six questions to get you started
新手模式把你的回答整理成故事记忆、作者注与世界设定；创建前可以逐项修改。|Guided start turns your answers into memory, an author’s note and world notes. Review everything before creating your story.
接着写，也能改着写|Continue, edit, try again
正文可直接编辑。续写后不喜欢，可以撤销；需要恢复，还能重做。|Edit the manuscript directly. Undo a continuation you dislike, or redo to bring it back.
让故事有自己的规则|Give your story its own rules
人物关系放进故事记忆；地点与规则写进世界设定；作者注决定当前写法。|Keep relationships in memory, places and rules in world notes, and writing direction in the author’s note.
从这一章走向下一章|Carry the story forward
查看上下文用量，核对可编辑前情摘要，再继承设定和参数开新章。|Check context usage, edit and approve a recap, then start a chapter with your existing settings.
把文字真正拿走|Keep your words with you
故事保存在当前设备；可导出正文，也可备份全部故事。连接自己的模型后才会真实调用 API。|Stories stay on this device. Export text or back up everything. Live API calls begin only after you connect a model.
从一句话开始，不用先会写小说。|Start with one sentence.
选一个入口|Choose a starting point
点「新手模式」跟着六道题走，或直接点「开始一个新故事」打开空白页。|Follow six questions in Guided start, or open a blank page with Start a new story.
给它一些线索|Give it something to follow
写人物、场景或一段对白。想明确关系和规则，就在右侧写下记忆与世界设定。|Write a character, a scene or a line of dialogue. Add memory and world notes to clarify relationships and rules.
决定下一页|Decide what comes next
点「继续写作」看后续；删改、撤销、重做都由你决定。写长了就整理摘要，继续下一章。|Continue writing, then edit, undo or redo. As the story grows, create a recap and move to the next chapter.
说清楚，才安心写。|Know what you’re working with.
试用方式|Trying it out
演示模式使用固定示例续写，不调用模型；测试真实文风与质量，请连接自己的模型 API。|Demo mode uses fixed sample text with no model calls. Connect your own API to test real style and writing quality.
资料与费用|Data and costs
本地版故事存在这台设备的浏览器中；真实续写经本地服务发送给你选择的模型商，模型商可能按用量计费。|Local stories are stored in this browser. Live requests pass through the local service to your chosen provider, which may charge for usage.
长篇记忆|Long stories
上下文有容量限制。创作家会提示用量，支持你编辑摘要并决定是否开新章；仍需自己检查关键设定。|Context has limits. Check usage, edit recaps and decide when to start a chapter. Review important details yourself.
故事分支|Alternate paths
可以修改正文、撤销或重做；目前没有并行保存多条剧情线的分支树。想留住某个版本，请先备份。|Edit, undo or redo. There is no branching tree for parallel timelines yet. Back up any version you want to keep.
你可能想知道|Good to know
没写过小说，也能开始吗？|Can I start if I’ve never written fiction?
可以。新手模式会按六个问题帮你搭起人物、世界和文风；回答完成后仍可修改，不需要一次想完。|Yes. Guided start helps you shape characters, world and style in six questions. You can change the answers later.
能改写喜欢的剧情吗？|Can I take a story in another direction?
可以写下你自己的设定和走向，让故事从你提供的正文继续。请使用你有权使用的文本，并把喜欢的版本及时备份；目前没有独立分支树。|Write your own settings and direction, then continue from your text. Use material you have the right to use and back up favorite versions. There is no separate branching tree yet.
电脑关机后，故事还在吗？|Will my stories survive a restart?
在同一台设备、同一个浏览器和同一本地地址打开时，已有故事通常仍在。清除浏览器数据可能丢失，请定期使用「备份全部故事」。|They normally remain when you use the same device, browser and local address. Clearing browser data can erase them, so back up regularly.
为什么演示续写和真正的 AI 不一样？|Why is the demo different from real AI?
演示模式返回固定文本，只用于熟悉界面，不代表模型能力。要体验真实的互动与文风，请连接自己的 DeepSeek 或兼容 API，并留意模型商的调用费用。|The demo uses fixed text to explain the interface. For real responses and style, connect DeepSeek or a compatible API and check the provider’s charges.
写下第一句。|Write the first line.
剩下的，一起往下走。|See where it takes you.
你可以从一个场景、一种关系，或者一个没想好的结局开始。|Begin with a scene, a relationship, or an ending you haven’t figured out yet.
打开创作家|Open Creator Studio
✒ 创作家 / 小说写作室|✒ Creator Studio / Fiction writing studio
本地测试版 · 2026|Local preview · 2026
返回介绍 ×|Back to introduction ×
创作家写作台|Creator Studio writing desk
不喜欢结局，就从这里改。|Change the ending from here.
直接改正文中的决定，再从新版本往下续写。不满意可以撤销或重做；如果想保存旧版本，先备份。|Edit a decision in the manuscript and continue from your new version. Undo or redo as needed; back up to keep the old version.
“她把船票撕成两半。这个夜晚，没有人必须按原来的剧本登船。”|“She tore the ticket in half. Tonight, no one had to board the boat just because the script said so.”
编辑正文 · 撤销 / 重做 · 备份故事|Edit text · Undo / Redo · Backups
让角色认真回答你的想象。|Give your characters a voice.
把人物关系写进故事记忆，在作者注里说明这段对话的语气。模型会参考你提供的设定续写，你仍然可以修改它的回答。|Put relationships in memory and the tone of the conversation in your author’s note. The model uses those details; you can always edit its response.
“你真的会等我吗？”她问。那人把灯挪近了些：“这次我不走。”|“Will you really wait?” she asked. He brought the lamp closer. “This time, I’m staying.”
故事记忆 · 作者注 · 真实模型续写|Memory · Author’s note · Live generation
一个念头，也够开场。|An idea is enough to begin.
不知道人物和世界怎么搭？新手模式用六个简单问题帮你整理初稿；从回答到设定，都可以自己改。|Not sure how to build characters or a world? Guided start helps with six simple questions. Edit both the answers and the resulting setup.
“岛上的人每年都会忘记同一个名字。直到今晚，名字被你叫了出来。”|“Every year, the island forgot the same name. Until tonight, when you spoke it aloud.”
六题新手模式 · 可编辑设定 · 文风提示|Guided start · Editable settings · Style direction
把故事稳稳写到下一章。|Bring the story into its next chapter.
管理章节和前情摘要，检查故事记忆、世界设定与上下文用量。决定开新章时，先核对摘要，再继承设定继续写。|Manage chapters and recaps, and review memory, world notes and context usage. Approve the recap before continuing with your inherited settings.
“这一章结束于潮水退去。下一章，她终于看见了岛的轮廓。”|“This chapter ended as the tide went out. In the next, she finally saw the island’s outline.”
上下文提示 · 可编辑前情 · 继续下一章 · 导出|Context warnings · Editable recaps · Chapters · Export
你想写哪种故事？|What kind of story would you like to write?
选一种喜欢的，也可以在下面写自己的想法|Choose a genre, or describe your own idea below
例如：一只小狐狸，出发去寻找丢失的月亮。|For example: a little fox sets out to find the missing moon.
都市奇幻|Urban fantasy
悬疑推理|Mystery
现实生活|Everyday life
冒险成长|Adventure and growth
浪漫爱情|Romance
童话故事|Fairy tale
都市奇幻，普通人的生活出现一件不寻常的事。|Urban fantasy: something unusual disrupts an ordinary life.
主角是谁？|Who is your main character?
写下名字、身份和性格特质，比如勇敢、细心或好奇|Give them a name, a role and traits such as bravery, care or curiosity
例如：陈照，修理店店主，细心、热情，喜欢琢磨新点子。|For example: Chen, a repair shop owner who is thoughtful, warm and full of ideas.
陈照，修理店店主，细心又热情|Chen, a thoughtful and warm repair shop owner
林夏，实习生，开朗、认真|Lin, a cheerful and diligent intern
周野，旅人，安静又好奇|Zhou, a quiet and curious traveler
陈照，修理店店主，细心、热情，喜欢琢磨新点子。|Chen, a thoughtful and warm repair shop owner who loves new ideas.
主角最想做到什么？|What does your character want most?
给主角一个具体愿望，故事就有了方向。|A specific goal gives the story direction.
例如：在月底之前保住家里的小店。|For example: save the family shop before the end of the month.
保住家里的小店|Save the family shop
找回失踪的重要的人|Find a missing loved one
证明一次被误解的选择|Vindicate a misunderstood decision
重新修复一段关系|Repair a relationship
在月底之前保住家里的小店。|Save the family shop before the end of the month.
主角将要面临的困难是什么？|What challenge will your character face?
想一想：有什么事，让主角很难实现愿望|What makes their goal hard to reach?
例如：唯一肯帮忙的人，要求主角隐瞒一个真相。|For example: the only person willing to help wants them to hide the truth.
帮忙的人提出了难以接受的条件|Help comes with a difficult condition
越接近真相，越可能伤害朋友|Getting closer to the truth could hurt a friend
时间不够，必须放弃一样重要的东西|Time is running out; something precious must be sacrificed
唯一肯帮忙的人要求主角隐瞒一个真相，主角必须在眼前的生计和承诺之间作选择。|The only person willing to help asks them to hide the truth. They must choose between their livelihood and a promise.
故事发生在哪里，有什么特别的规则？|Where is the story set, and what are its rules?
现实故事也可以写：今天的某座城市，遵循现实规律。|A realistic setting works too: a present-day city with everyday rules.
例如：青禾街，修好的旧物会重现原主人的一段记忆，但只能看一次。|For example: on Green Street, repaired objects reveal a former owner’s memory, but only once.
青禾街：修好的旧物会重现一次记忆|Green Street: repaired objects reveal a memory once
当代小城：一切遵循现实规律|A present-day town: ordinary rules apply
远航列车：每站只能带走一样东西|A long-distance train: take only one thing from each stop
青禾街，修好的旧物会重现原主人的一段记忆，但只能看一次。|On Green Street, repaired objects reveal a former owner’s memory, but only once.
你希望是什么文风？|What writing style would you like?
选一种，看一小段示例；也可以自己写要求|Pick a style to see a sample, or write your own direction
例如：网络小说 补充要求：第一人称，对话多一点，不要夸张的比喻。|For example: web fiction. First person, more dialogue, no elaborate metaphors.
网络小说|Web fiction
言情散文|Lyrical romance
文言文|Classical Chinese
朴素写实|Plain realism
轻松幽默|Light humor
童话叙述|Fairy-tale narration
直白好读，推进快，有悬念|Readable, fast-moving and suspenseful
细腻抒情，用细节写情绪|Lyrical, with feeling in the details
简练典雅，叙事清楚|Concise, elegant classical Chinese
少修饰，像生活里发生的事|Understated and true to life
轻快自然，笑点来自反差|Light and natural, with situational humor
简单温暖，有想象力|Simple, warm and imaginative
先选一种，看看文风|Choose a style to see a sample
将按你填写的要求写作。你可以补充用词、句子长短、节奏和视角。|Add details about vocabulary, sentence length, pace and viewpoint.
同一个“发现旧钥匙”的场景，换一种写法，感觉就不同。|The same scene, finding an old key, feels different in each style.
信箱里只有一把旧钥匙。阿宁刚拿起来，楼上的灯就亮了。那间屋子，已经空了十年。|An old key was all the mailbox held. As An picked it up, a light came on upstairs. That room had been empty for ten years.
信箱里躺着一把旧钥匙。阿宁捂了片刻，金属仍是凉的。她忽然记起，那人出门时，总要回头问一句：钥匙带了吗？|An old key lay in the mailbox. An held it for a moment; the metal stayed cold. She remembered how he used to turn at the door and ask: have you got your key?
阿宁启函匣，得旧钥一枚，锈迹斑然。方取之，楼上灯忽明。彼室无人居，已十年矣。|阿宁启函匣，得旧钥一枚，锈迹斑然。方取之，楼上灯忽明。彼室无人居，已十年矣。 (Classical Chinese sample)
阿宁从信箱里取出一把旧钥匙，指尖沾了点锈。她拿纸擦了擦，放进外套口袋，又照常上楼做饭。|An took an old key from the mailbox. Rust marked her fingers. She wiped it with a tissue, put it in her coat pocket and went upstairs to make dinner.
信箱里多了一把旧钥匙。阿宁看了半天，决定先不高兴。上个月收到一张免费券，她为此花了三百块。|There was an old key in the mailbox. An decided not to get excited yet. Last month, a free voucher had cost her three hundred.
阿宁在信箱里发现一把小小的旧钥匙。她把它放在掌心，轻轻问：“你是哪扇门的钥匙呀？”她决定带它去找一找。|An found a little old key in the mailbox. She held it gently. “Which door do you belong to?” she asked. She decided to help it find out.
已填入，可在下方修改。|Added. You can edit it below.
例子已填入，可以改成你的想法。|Example added. Make it your own.
整理我的故事|Build my story setup
最后一步 · 核对后开始写|Final step · review, then write
名称|Name
触发关键词（填写正文会出现的人名、地名等）|Keywords (names or places that appear in the story)
先选一个答案、写几句话，或点「给我一个例子」。|Choose an answer, write a few words, or select “Give me an example”.
已按回答整理，可以直接修改。还没有调用模型。|Built from your answers. Edit anything; no model has been called.
按你的回答直接整理 · 未调用模型|Built from your answers · no model call
先连接模型，再回来点击新手模式；回答已保存。|Connect a model, then return to Guided start. Your answers are saved.
回答过长，或模型容量过小；请缩短回答或核实容量。|The answers are too long or the context window too small. Shorten them or check the model capacity.
AI 正在整理，完成后仍需你确认…|AI is refining your setup. Review it when ready…
AI 已整理。请检查人物和世界设定，文风要求已保留。|Refinement ready. Check characters and world notes; your style instructions are kept.
整理完成，尚未创建故事。|Setup ready. The story has not been created yet.
已停止，原草案和回答仍保留。|Stopped. Your draft and answers are kept.
故事已建立，右侧设定已填入。写下第一句，或点击继续写作。|Story created with your settings. Write a first line or choose Continue writing.
前序章节已修改，请从前往后重新核对摘要。|Earlier chapters changed. Review the recaps in order.
预估模型上下文占用|Estimated context usage
已切换章节，从本章末尾继续写。|Chapter changed. Continue from its ending.
请切换到最后一章，再整理并创建下一章。|Switch to the last chapter before creating another.
已停止，没有切换章节；已发生的请求可能计费。|Stopped without changing chapters. Requests already sent may be charged.
本章内容已变化，请关闭窗口并重新整理摘要。|This chapter has changed. Close this window and prepare a new recap.
请先核对摘要，并勾选确认。|Review the recap and check the approval box first.
新章已准备好，将承接前情摘要开始写作。|New chapter ready. It will continue from your recap.
下一章已建立。旧章仍可从章节菜单打开；摘要会随下一次续写发送。|Chapter created. Earlier chapters remain in the menu; the recap is sent with your next continuation.
容量填 0 使用自动识别，或填写 2,048–2,097,152。|Enter 0 for automatic detection, or a value from 2,048 to 2,097,152.
勾选后用当前 Windows 账户加密保存，下次自动读取。只保存最近一次启用的密钥，不放进故事备份。|Encrypt the key with your Windows account and restore it next time. Only the most recently enabled key is saved; story backups never include it.
此环境暂不支持加密记住密钥；关闭页面后需重新输入。Windows 本地版可使用此功能。|Encrypted key storage is unavailable here. Re-enter the key after closing the page. This feature is available in the Windows local version.
已忘记保存的密钥，需要使用时重新输入。|Saved key removed. Enter it again when needed.
请先停止生成，再退出。|Stop generation before exiting.
故事未能保存，请先备份再退出。|The story could not be saved. Back it up before exiting.
本地服务已退出|Local service stopped
故事已保存，可以关闭网页。下次双击启动器就能继续使用。|Story saved. You can close this page. Launch the app again to continue.
关闭提示|Dismiss
本地服务已退出。下次请双击启动器打开。|Local service stopped. Use the launcher next time.
书架顺序已保存。|Library order saved.
故事名称已修改。|Story renamed.
故事已删除。|Story deleted.
改名或删除|Rename or delete
删除这个世界书词条？|Delete this world note?
本地版最多 50 个故事，请先备份。|The local app supports up to 50 stories. Please back up first.
最多 30 个词条。|Up to 30 world notes are supported.
浏览器未能保存，请先导出备份，不要关闭页面。|The browser could not save. Export a backup before closing this page.
手动编辑|Manual edit
未命名故事|Untitled story
最近一次正文操作|Last text change
未命名词条|Untitled entry
添加人物、地点或物品，让设定在需要时出现。|Add characters, places or objects so their details appear when needed.
当前设定超出发送容量，请先调整。|These settings exceed the request capacity. Please shorten them first.
请先导出备份，解决保存问题后再生成。|Export a backup and resolve the save issue before generating.
正在连接模型…|Connecting to model…
已收到的文字已保留。|Received text has been kept.
演示结果 · 未请求模型|Demo result · no model call
本次未完成 · 结果见上方|Incomplete · see details above
备份已导出，包含书架顺序、全部章节与设定。|Backup exported, including library order, all chapters and settings.
已撤销最近一次正文操作，可以点「重做」恢复。|Last text change undone. Use Redo to restore it.
已恢复正文及文字来源颜色。|Text and authorship colors restored.
已导出全部章节 TXT；完整设定和颜色请用「备份全部故事」。|All chapters exported as TXT. Use Back up all stories to include settings and authorship colors.
导入文件请小于 20 MB。|Import a file smaller than 20 MB.
导入后会超过 50 篇，请拆分备份。|This would exceed 50 stories. Split the backup first.
接口地址需要使用 HTTPS。|The API address must use HTTPS.
正在保存连接设置…|Saving connection settings…
连接设置未能保存到浏览器，请先备份作品并检查浏览器存储。|Could not save connection settings. Back up your work and check browser storage.
密钥已加密保存，下次打开会自动读取。|Key saved with encryption. It will be restored next time.
已启用，本次关闭页面后需重新输入密钥。|Connection enabled. Re-enter the key after closing this page.
停止验证|Stop test
正在读取模型列表，这一步不生成正文…|Fetching models. This step does not generate text…
接口可访问，但模型列表为空；请用「试写验证」检查生成。|The API is reachable but returned no models. Try Test generation.
检查已停止。|Check stopped.
试写已停止；已产生的模型用量可能仍会计费。|Test stopped. Usage already incurred may still be charged.
当前浏览器无法启用本地存储。建议使用普通 Chrome / Edge 窗口。|Local storage is unavailable. Try a regular Chrome or Edge window.
接口返回内容过大。|The API response is too large.
无法连接创作家本地服务。请重新双击启动器，并从 http://127.0.0.1:4317 打开页面。|Cannot reach the local service. Run the launcher again, then open http://127.0.0.1:4317.
真实 API 需要先双击 start-windows.bat 启动本地服务。|Live API calls require the local service. Run start-windows.bat on Windows or start-mac.command on macOS.
本地服务未就绪，请重新启动。|The local service is not ready. Restart it.
当前页面没有连接到创作家本地服务，请使用启动器打开。|This page is not connected to the local service. Open it with the launcher.
本地操作失败，请重试。|Local operation failed. Please try again.
接口没有返回可识别的模型列表，请使用试写验证。|No recognized model list was returned. Try Test generation.
接口没有返回可识别的流式正文。|The API did not return a recognized text stream.
模型返回了无法解析的数据，已收到的正文仍保留。|The model returned unreadable data. Received text is kept.
模型返回错误，请检查模型名称和账户额度。|Model error. Check its name and your API balance.
模型服务商停止了本次输出。|The provider stopped this response.
连接提前结束，已收到的正文已保留。|Connection ended early. Received text is kept.
模型未返回有效正文，不能算作生成成功。请检查模型与生成设置。|No valid story text was returned. Check the model and generation settings.
试写验证已停止。|Generation test stopped.
故事名称请填写 1–100 个字符。|Use 1–100 characters for the story title.
故事已不在书架。|This story is no longer in the library.
未能保存书架，操作已取消。请先备份作品。|Could not save the library. Change canceled; back up your work first.
整理结果未完成，未覆盖当前草案。请重试或使用直接整理。|The result was incomplete. Your draft is unchanged; retry or rebuild from your answers.
最多 50 个故事，请先备份。|Up to 50 stories are supported. Back up first.
`.trim();
const normalize=s=>s.trim().replace(/\s+/g,' ');
const dictionary=Object.fromEntries(pairs.split('\n').map(line=>{const i=line.indexOf('|');return [normalize(line.slice(0,i)),line.slice(i+1)];}));
const key='creator-studio.locale.v1';
let locale;try{locale=localStorage.getItem(key);}catch{}
if(!['zh','en'].includes(locale))locale=/^zh\b/i.test(navigator.language)?'zh':'en';
const originals=new WeakMap();
const skip='script,style,textarea,pre,[contenteditable],[data-user-content],#colorLayer,#breadcrumbTitle,#inspectorStoryTitle,#chapterSelect,.story-item strong,#storyDeleteName,.lore-card summary>span,#probeText,#models,#contextText';
function english(s){
 const exact=dictionary[normalize(s)];if(exact!==undefined)return exact;
 const replaced=s.replace(/^第 (\d+) 题，共 6 题$/, 'Question $1 of 6')
 .replace(/^界面指引 · /,'Quick tour · ')
 .replace(/^已读取 (\d+) 个模型。点击「试写验证」检查实际生成。$/,'Found $1 models. Use Test generation to check a real response.')
 .replace(/^已添加 (\d+) 个故事，原有故事仍保留。$/,'Added $1 stories. Existing stories are kept.')
 .replace(/^带入 ([\d,]+) 个正文字符，触发 (\d+) 个词条。$/,'Includes $1 story characters and $2 matching world notes.')
 .replace(/^([\d,]+) 字(?= · |$)/,'$1 characters')
 .replace(/^世界书词条 (\d+)$/,'World note $1')
 .replace(/^本次正文 ([\d,]+) \/ 本章 ([\d,]+) 字符/,'Sent $1 / chapter $2 characters')
 .replace(/ · 较早 ([\d,]+) 字符未带入/,' · $1 earlier characters omitted')
 .replace(/^预估 ([\d,]+) \/ ([\d,]+) tokens（含输出预留）$/,'Estimated $1 / $2 tokens (including output)')
 .replace(/^撤销：/,'Undo: ').replace(/ · 待连接$/,' · disconnected')
 .replace(/^导入失败：/,'Import failed: ')
 .replace(/^模型返回请求 ID：/,'Model request ID: ')
 .replace(/^模型列表检查失败（/,'Model list request failed (').replace(/^接口请求失败（/,'API request failed (')
 .replace(/^(管理|上移|下移)《(.*)》$/,(_,action,title)=>(dictionary[action]||action)+' “'+title+'”')
 .replace(/^(.*) · 原创示例$/,(_,style)=>(dictionary[style]||style)+' · original sample')
 .replace(/^正在总结第 (\d+) \/ (\d+) 段… 可随时停止$/,'Summarizing part $1 / $2… You can stop at any time')
 .replace(/^已完成 (\d+) 次请求。请核对人物状态、关键事件和伏笔，再创建下一章。$/,'Completed $1 requests. Review character states, key events and unresolved threads before creating the chapter.')
 .replace(/^读取本章完整正文（([\d,]+) 字符）与前章摘要，分 (\d+) 次请求逐段总结。每次输出上限 1,536 tokens，会使用模型账户额度。$/,'Summarizes this chapter ($1 characters) and its prior recap in $2 requests, up to 1,536 output tokens each. Uses your API credit.');
 if(replaced!==s)return replaced;
 const sentences=s.split(/(?<=[。！？])\s*/).filter(Boolean);if(sentences.length>1)return sentences.map(english).join(' ');
 return s;
}
function t(s){return locale==='en'?english(String(s)):String(s);}
function updateValue(node,slot,get,set){
 const current=get();if(!current)return;
 let record=originals.get(node);if(!record){record={};originals.set(node,record);}
 let entry=record[slot];if(!entry||current!==entry.output)entry=record[slot]={original:current,output:current};
 const trimmed=entry.original.trim(),translated=t(trimmed);
 const output=entry.original.replace(trimmed,()=>translated);entry.output=output;
 if(current!==output)set(output);
}
function visit(node){
 if(node.nodeType===3){if(!node.parentElement?.closest(skip))updateValue(node,'text',()=>node.nodeValue,v=>node.nodeValue=v);return;}
 if(node.nodeType!==1&&node.nodeType!==9)return;
 if(node.nodeType===1){
  if(node.matches('[data-language-toggle]')){node.textContent=locale==='zh'?'English':'中文';node.setAttribute('aria-label',locale==='zh'?'Switch to English':'切换为中文');return;}
  if(node.matches('script,style'))return;
  for(const attr of ['aria-label','title','placeholder','alt'])if(node.hasAttribute(attr))updateValue(node,attr,()=>node.getAttribute(attr),v=>node.setAttribute(attr,v));
  if(node.matches(skip))return;
 }
 for(const child of node.childNodes)visit(child);
}
const observer=new MutationObserver(records=>{observer.disconnect();for(const r of records){if(r.type==='childList')for(const node of r.addedNodes)visit(node);else visit(r.target);}observe();});
function observe(){observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','placeholder','alt']});}
function share(){
 const data={type:'creator-locale',locale};
 if(window.parent!==window&&['creator-about','creator-demo'].includes(window.name))window.parent.postMessage(data,'*');
 for(const f of document.querySelectorAll('iframe[name="creator-about"],iframe[name="creator-demo"]'))f.contentWindow?.postMessage(data,'*');
}
function set(next){if(!['zh','en'].includes(next)||next===locale)return;locale=next;try{localStorage.setItem(key,next);}catch{}apply();share();window.dispatchEvent(new CustomEvent('creator-locale-change',{detail:{locale}}));}
function apply(){observer.disconnect();document.documentElement.lang=locale==='zh'?'zh-CN':'en';visit(document);observe();}
window.CreatorLocale={get:()=>locale,t,set,refresh:apply};
document.addEventListener('click',e=>{if(e.target.closest?.('[data-language-toggle]'))set(locale==='zh'?'en':'zh');});
window.addEventListener('storage',e=>{if(e.key===key)set(e.newValue);});
window.addEventListener('message',e=>{const parentOK=e.source===window.parent&&window.parent!==window&&['creator-about','creator-demo'].includes(window.name);const childOK=[...document.querySelectorAll('iframe[name="creator-about"],iframe[name="creator-demo"]')].some(f=>f.contentWindow===e.source);if(e.data?.type==='creator-locale'&&(parentOK||childOK))set(e.data.locale);});
document.addEventListener('load',e=>{if(e.target.matches?.('iframe[name="creator-about"],iframe[name="creator-demo"]'))share();},true);
apply();share();
})();
