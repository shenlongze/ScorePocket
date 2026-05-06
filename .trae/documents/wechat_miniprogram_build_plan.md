# 微信小程序构建计划

## 项目概述

本项目是一个基于 UniApp 的台球计分小程序项目，项目已配置完整的微信小程序构建能力。

### 现有项目结构

```
ScorePocket/
├── src/                    # 源代码目录
│   ├── pages/              # 页面文件
│   ├── components/         # 组件
│   ├── utils/              # 工具函数
│   ├── static/             # 静态资源
│   ├── App.vue             # 应用入口
│   ├── main.js             # 主入口
│   ├── manifest.json       # 应用配置
│   └── pages.json          # 页面路由配置
├── dist/build/mp-weixin/   # 已有构建产物
├── project.config.json     # 微信开发者工具配置
└── package.json            # 依赖配置
```

### 构建命令

项目已配置以下构建命令：
- `npm run build:mp-weixin` - 生产构建
- `npm run dev:mp-weixin` - 开发模式

## 构建步骤

### 步骤 1：安装依赖

执行 `npm install` 安装项目所需依赖。

### 步骤 2：执行微信小程序构建

运行 `npm run build:mp-weixin` 命令，构建产物将输出到 `dist/build/mp-weixin/` 目录。

### 步骤 3：验证构建结果

检查构建产物是否完整生成，包括：
- `app.js`, `app.json`, `app.wxss`
- `pages/` 目录下的各页面文件
- `components/` 目录下的组件文件
- `project.config.json` 配置文件

### 步骤 4：使用微信开发者工具调试

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择 `dist/build/mp-weixin/` 目录
4. 使用项目配置中的 AppID (`wxe2c6d6f008c014b8`) 进行调试

## 潜在风险与处理

| 风险 | 处理方式 |
|------|----------|
| 依赖安装失败 | 清理 node_modules 并重新安装 |
| 构建失败 | 检查控制台错误信息，修复代码问题 |
| 微信开发者工具无法识别项目 | 确保 project.config.json 配置正确 |

## 预期输出

构建成功后，`dist/build/mp-weixin/` 目录将包含完整的微信小程序代码，可以直接在微信开发者工具中打开和调试。