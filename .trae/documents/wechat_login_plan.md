# 微信小程序登录功能实现计划

## 一、需求分析

### 当前状态
- 用户默认显示为"游客"身份
- 认证模块仅支持本地存储用户信息
- 缺少微信登录集成

### 目标
- 实现微信小程序原生登录
- 用户点击"游客"区域可触发登录
- 登录后显示微信昵称和头像
- 自动保存登录状态

## 二、微信登录流程

```
用户点击登录 → wx.login() 获取code → 后端换取openid → 返回用户信息 → 本地存储 → 更新UI
```

## 三、文件修改清单

| 文件路径 | 修改内容 | 说明 |
|---------|---------|------|
| `src/utils/auth.ts` | 添加微信登录相关函数 | 核心登录逻辑 |
| `src/pages/index/index.vue` | 添加登录入口和状态更新 | 首页用户信息区域 |
| `src/pages/profile/index.vue` | 添加登录入口 | 个人中心页面 |
| `src/App.vue` | 添加自动登录逻辑 | 应用启动时检查登录状态 |

## 四、实现步骤

### 步骤1：扩展认证模块 (auth.ts)

新增函数：
- `wechatLogin()` - 执行微信登录
- `logout()` - 退出登录
- `isLoggedIn()` - 检查是否已登录

### 步骤2：修改首页 (index.vue)

- 点击用户信息区域时，若为游客则触发登录
- 登录成功后更新用户信息显示

### 步骤3：修改个人中心 (profile/index.vue)

- 添加登录按钮/入口
- 登录成功后显示用户信息

### 步骤4：修改 App.vue

- 应用启动时自动尝试登录
- 保持登录状态持久化

## 五、API接口说明

假设后端登录接口：
- **POST** `/api/auth/wechat`
- 请求参数：`{ code: string }`
- 返回数据：
```json
{
  "id": "用户ID",
  "nickname": "微信昵称",
  "avatar": "头像URL",
  "isMember": false,
  "memberExpireTime": 0,
  "token": "JWT Token"
}
```

## 六、状态管理

用户信息存储结构（已定义）：
```typescript
interface UserInfo {
  id: string           // 用户ID
  nickname: string     // 昵称
  avatar: string       // 头像
  isMember: boolean    // 是否会员
  memberExpireTime: number // 会员过期时间
  temporaryUnlocks: string[] // 临时解锁功能
  stats: GameStats     // 游戏统计
}
```

## 七、风险与注意事项

1. **后端依赖**：需要后端配合提供登录接口
2. **网络异常**：登录失败时需要友好提示
3. **用户隐私**：遵循微信小程序隐私协议
4. **兼容性**：确保在微信小程序环境中正常运行

## 八、测试要点

- 首次打开显示游客状态
- 点击游客区域弹出登录确认
- 登录成功后显示微信昵称和头像
- 退出登录后恢复游客状态
- 重新打开App自动恢复登录状态