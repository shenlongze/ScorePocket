# ScorePocket 前端功能说明文档

## 一、项目概述

**ScorePocket** 是一款基于 UniApp 框架开发的台球计分应用，支持多平台部署（H5、微信小程序）。应用提供多种台球玩法的计分功能，包含战绩统计、赛事管理等核心模块。

### 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | ^3.4.21 | 前端框架 |
| TypeScript | ^5.3.3 | 类型安全 |
| UniApp | 3.0.0-alpha | 跨平台框架 |
| SCSS | ^1.99.0 | 样式预处理 |
| Vite | ^5.2.8 | 构建工具 |

---

## 二、页面结构

### 2.1 页面路由表

| 页面路径 | 导航标题 | 功能描述 |
|---------|---------|---------|
| `pages/index/index` | 台球计分 | 首页，游戏模式选择 |
| `pages/match/list` | 对局记录 | 历史对局列表 |
| `pages/game/onevone/index` | 1V1对战 | 双人对战模式 |
| `pages/game/mode-select/index` | 选择模式 | 游戏模式选择 |
| `pages/game/zambo/index` | 抓迷糊 | 多人混战模式 |
| `pages/game/chinese8/index` | 中式八球 | 国标黑八计分 |
| `pages/game/chinese8/settle` | 比赛结算 | 八球结算页面 |
| `pages/game/nineball/config` | 比赛配置 | 九球配置 |
| `pages/game/nineball/index` | 中式九球 | 九球计分 |
| `pages/game/nineball/records` | 操作记录 | 九球操作记录 |
| `pages/game/snooker/config` | 比赛配置 | 斯诺克配置 |
| `pages/game/snooker/index` | 斯诺克 | 斯诺克计分（会员专属） |
| `pages/tournament/list` | 赛事列表 | 赛事管理列表 |
| `pages/tournament/create` | 创建赛事 | 创建新赛事 |
| `pages/tournament/bracket` | 赛事图谱 | 赛事对阵图 |
| `pages/profile/index` | 个人中心 | 用户信息与设置 |
| `pages/pay/index` | 开通会员 | 会员购买页面 |
| `pages/ad/splash` | - | 启动广告页 |
| `pages/coming-soon/index` | 功能开发中 | 未完成功能占位 |

### 2.2 TabBar 导航

```
┌──────────┬──────────┬──────────┬──────────┐
│   首页   │   记录   │   赛事   │   我的   │
└──────────┴──────────┴──────────┴──────────┘
```

---

## 三、核心功能模块

### 3.1 游戏模式

| 模式 | 图标 | 描述 | 状态 |
|------|------|------|------|
| 中式八球 | 🎱 | 国标黑八规则 | ✅ 可用 |
| 九球 | 9️⃣ | 按序击打规则 | ✅ 可用 |
| 六球 | 🔶 | 快速对决 | ✅ 可用 |
| 斯诺克 | 🔴 | 会员专属 | 🔒 会员 |
| 抓迷糊 | 🤝 | 多人混战 | ✅ 可用 |
| 自定义 | ⚙️ | 自由配置 | ✅ 可用 |

### 3.2 用户系统

**当前状态**：游客模式（微信登录功能已移除）

#### 用户信息结构

```typescript
interface UserInfo {
  id: string;           // 用户ID
  nickname: string;     // 昵称（默认"游客"）
  avatar: string;       // 头像URL
  stats: GameStats;     // 战绩统计
}

interface GameStats {
  zhaQingCount: number;  // 炸清次数
  jieQingCount: number;  // 接清次数
  totalMatches: number;  // 总对局数
  winCount: number;      // 胜场数
}
```

#### 核心方法

| 方法 | 功能 |
|------|------|
| `getUserInfo()` | 获取用户信息（本地存储） |
| `saveUserInfo(user)` | 保存用户信息 |
| `isLoggedIn()` | 判断登录状态（返回 false） |
| `incrementZhaQing()` | 增加炸清计数 |
| `incrementJieQing()` | 增加接清计数 |
| `incrementTotalMatches()` | 增加总对局计数 |
| `incrementWinCount()` | 增加胜场计数 |

### 3.3 数据持久化

| 存储键 | 说明 |
|--------|------|
| `billiards_user_info` | 用户信息 |
| `billiards_match_history` | 对局历史 |
| `billiards_settings` | 设置配置 |
| `billiards_api_host` | API地址 |

### 3.4 API 接口

#### 基础配置

- **默认地址**: `http://192.168.31.240:8080`
- **超时时间**: 10秒
- **内容类型**: `application/json`

#### 接口列表

| 模块 | 方法 | 路径 | 功能 |
|------|------|------|------|
| match | POST | `/api/match` | 创建对局 |
| match | GET | `/api/match` | 获取对局列表 |
| match | GET | `/api/match/{id}` | 获取对局详情 |
| match | PUT | `/api/match/{id}` | 更新对局 |
| match | DELETE | `/api/match/{id}` | 删除对局 |
| player | POST | `/api/player` | 创建球员 |
| player | GET | `/api/player` | 获取球员列表 |
| player | GET | `/api/player/{id}` | 获取球员详情 |
| player | PUT | `/api/player/{id}` | 更新球员 |
| player | DELETE | `/api/player/{id}` | 删除球员 |
| record | POST | `/api/record` | 创建记录 |
| record | GET | `/api/record` | 获取记录列表 |
| record | DELETE | `/api/record/{id}` | 删除记录 |

---

## 四、页面功能详解

### 4.1 首页 (`pages/index/index`)

**功能模块**：
- 头部区域：Logo + 用户信息入口
- 游戏模式选择（6种玩法）
- 快捷操作区：创建赛事、查看记录

**交互流程**：
```
用户进入首页 → 选择游戏模式 → 进入对应游戏页面
                            → 点击快捷操作 → 跳转到对应功能
```

### 4.2 个人中心 (`pages/profile/index`)

**功能模块**：
- 用户信息展示（头像、昵称）
- 战绩统计卡片（炸清、接清、胜场、总对局）
- 功能菜单（设置、帮助与反馈、关于我们）

**设计特点**：
- 深色主题设计（`#1a1a2e` 背景）
- 响应式布局适配多端

### 4.3 游戏页面

**通用功能**：
- 计分板显示
- 击球记录
- 比赛结算

**特色功能**：
- 中式八球：支持国标规则，自动判断胜负
- 九球：按序击打，支持犯规记录
- 斯诺克：复杂计分系统（会员专属）

### 4.4 赛事管理

**功能流程**：
```
创建赛事 → 设置参赛选手 → 生成对阵图 → 记录比分 → 决赛结算
```

---

## 五、全局样式

### 5.1 主题色彩

| 颜色 | 值 | 用途 |
|------|------|------|
| 主背景 | `#1a1a2e` | 页面背景 |
| TabBar背景 | `#16213e` | 底部导航 |
| 主色调 | `#4a9eff` | 选中状态、强调色 |
| 文字颜色 | `#8f8f94` | TabBar未选中 |
| 导航栏 | `#1a1a2e` | 顶部导航背景 |

### 5.2 设计规范

- **图标风格**：Emoji 图标（轻量化）
- **圆角设计**：卡片圆角 15rpx
- **间距规范**：统一使用 rpx 单位适配

---

## 六、构建与部署

### 6.1 构建命令

```bash
# H5 开发
npm run dev:h5

# H5 构建
npm run build:h5

# 微信小程序开发
npm run dev:mp-weixin

# 微信小程序构建
npm run build:mp-weixin

# App 开发
npm run dev:app

# App 构建
npm run build:app
```

### 6.2 输出目录

| 平台 | 输出路径 |
|------|---------|
| H5 | `dist/build/h5/` |
| 微信小程序 | `dist/build/mp-weixin/` |
| App | `dist/build/app/` |

---

## 七、开发状态

### 7.1 已完成功能

- ✅ 中式八球计分
- ✅ 九球计分
- ✅ 六球计分
- ✅ 抓迷糊模式
- ✅ 自定义模式
- ✅ 对局记录
- ✅ 战绩统计
- ✅ 赛事管理
- ✅ 个人中心

### 7.2 待开发功能

- 🔄 斯诺克完整计分（会员专属）
- 🔄 在线对战
- 🔄 社交分享
- 🔄 数据同步

### 7.3 注意事项

- 当前用户系统为游客模式，无真实登录
- 斯诺克功能标注为会员专属，需配合后端支付系统
- API 接口需后端服务支持（默认地址 `192.168.31.240:8080`）

---

## 八、项目文件结构

```
src/
├── components/           # 公共组件
│   ├── GameTimer.vue    # 游戏计时器
│   └── ScoreBoard.vue   # 计分板组件
├── data/                # 数据模型
│   └── types.ts         # TypeScript类型定义
├── pages/               # 页面目录
│   ├── index/           # 首页
│   ├── match/           # 对局记录
│   ├── game/            # 游戏页面
│   │   ├── chinese8/    # 中式八球
│   │   ├── nineball/    # 九球
│   │   ├── snooker/     # 斯诺克
│   │   ├── onevone/     # 1V1对战
│   │   ├── zambo/       # 抓迷糊
│   │   └── mode-select/ # 模式选择
│   ├── tournament/      # 赛事管理
│   ├── profile/         # 个人中心
│   ├── pay/             # 支付页面
│   ├── ad/              # 广告页面
│   └── coming-soon/     # 开发中页面
├── static/              # 静态资源
│   └── icons/           # TabBar图标
├── utils/               # 工具函数
│   ├── api.ts           # API封装
│   ├── auth.ts          # 用户认证
│   ├── gameLogic.ts     # 游戏逻辑
│   ├── socket.ts        # WebSocket
│   ├── storage.ts       # 本地存储
│   └── tournamentLogic.ts # 赛事逻辑
├── App.vue              # 应用入口
├── main.js              # 主入口
├── manifest.json        # 应用配置
├── pages.json           # 页面配置
└── uni.scss             # 全局样式
```

---

**文档版本**: v1.0  
**生成时间**: 2026-05-19  
**项目路径**: `/Users/shenzhen/work/work22/ScorePocket`