
# 台球线下专业计分小程序 - Implementation Plan

## [/] Task 1: 项目基础架构搭建
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 配置 UniApp + Vue3 + Vite 开发环境
  - 创建项目目录结构
  - 配置 pages.json、manifest.json
  - 安装必要依赖（echarts-for-uniapp等）
- **Acceptance Criteria Addressed**: 所有功能的基础支撑
- **Test Requirements**:
  - `programmatic` TR-1.1: 项目能正常启动，H5开发服务器运行在 localhost:5173
  - `programmatic` TR-1.2: npm run dev:h5 和 npm run dev:mp-weixin 命令正常执行
  - `human-judgment` TR-1.3: 目录结构清晰，符合 UniApp 规范
- **Notes**: 确保所有依赖版本兼容

## [/] Task 2: 基础计分模块开发
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 开发首页入口
  - 1V1对局创建页面
  - 基础计分界面（手动加/减分、撤销、重置）
  - 犯规标记功能
  - 本地临时存储（免费用户）/ 云端存储（会员）实现
- **Acceptance Criteria Addressed**: FR-1.1~FR-1.5
- **Test Requirements**:
  - `programmatic` TR-2.1: 能创建1V1对局，输入选手姓名
  - `programmatic` TR-2.2: 比分能手动加减，撤销功能正常
  - `programmatic` TR-2.3: 犯规标记能记录
- **Notes**: 严格遵循手动触发原则

## [ ] Task 3: 台球玩法计分模块（中式八球+九球系列）
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 中式八球玩法（分花色击打、炸清/接清标记、会员自定义加分）
  - 九球系列玩法（4/6/7/8/9球，入口独立，按顺序击打）
  - 大金/小金标记与自定义加分值（会员）
  - 双打模式：2V2团队总分+个人清台记录
  - 专业犯规自动判罚、击球权切换
- **Acceptance Criteria Addressed**: FR-2.1~FR-2.2, AC-17, AC-19
- **Test Requirements**:
  - `programmatic` TR-3.1: 中式八球能正确区分花色，黑8定胜负，双打模式正常
  - `programmatic` TR-3.2: 九球系列按顺序击打，大金/小金标记及自定义加分正常
  - `programmatic` TR-3.3: 专业犯规自动判罚正确
- **Notes**: 会员功能需要权限校验

## [ ] Task 4: 斯诺克与自定义球数玩法开发
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 斯诺克计分（红球+彩球交替，单杆最高统计）
  - 斯诺克犯规自动扣最低罚分（最低4分）
  - 斯诺克双打模式：团队总分+个人单杆最高分
  - 自定义球数玩法（2~15颗球）
  - 规则二选一：按顺序击打/自由击打
  - 炸清/接清定义与自定义加分值
- **Acceptance Criteria Addressed**: FR-2.3~FR-2.4, AC-18
- **Test Requirements**:
  - `programmatic` TR-4.1: 斯诺克自动累加分数，单杆最高统计正确
  - `programmatic` TR-4.2: 斯诺克犯规自动罚分正确（最低4分）
  - `programmatic` TR-4.3: 自定义球数玩法规则配置正确
- **Notes**: 斯诺克为会员专属功能

## [ ] Task 5: 抓迷糊模块开发
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 随机球分配算法（按人数均分，余数随机）
  - 总球数配置（默认15颗，会员可自定义）
  - 淘汰判定逻辑（打进自己球淘汰）
  - 胜利判定逻辑（仅剩自己球获胜）
  - 犯规处理（母球落袋、空杆等罚分或换击球权）
  - 专属球标记展示（不同颜色区分）
- **Acceptance Criteria Addressed**: FR-2.5, AC-1, AC-2, AC-3, AC-4
- **Test Requirements**:
  - `programmatic` TR-5.1: 3~10人参与时球分配均匀
  - `programmatic` TR-5.2: 打进自己球自动标记淘汰
  - `programmatic` TR-5.3: 仅剩自己球时判定胜利
  - `programmatic` TR-5.4: 犯规处理逻辑正确
- **Notes**: 算法需保证随机性和公平性

## [ ] Task 6: 权限与广告模块开发
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 用户状态管理（免费/会员/单次付费）
  - 权限校验前置逻辑
  - 全局路由守卫
  - 单次付费触发逻辑（弹窗提示、激励视频解锁）
  - 开屏广告、横幅广告组件（固定底部）
  - 会员全局去广告
- **Acceptance Criteria Addressed**: FR-6.1~FR-6.7, AC-9, AC-10, AC-12, AC-15, AC-16
- **Test Requirements**:
  - `programmatic` TR-6.1: 非会员无法进入付费页面
  - `programmatic` TR-6.2: 全局路由守卫拦截非法访问
  - `programmatic` TR-6.3: 单次付费弹窗正常触发
  - `human-judgment` TR-6.4: 广告展示不遮挡核心区域
- **Notes**: 需要微信流量主审核通过

## [ ] Task 7: 多人联机模块开发
- **Priority**: P1
- **Depends On**: Task 5, Task 6
- **Description**: 
  - 房间码生成与配对
  - NFC碰一碰触发（仅配对，不传输隐私）
  - WebSocket实时双向同步
  - 时间戳冲突解决机制
  - 临时房间规则：对局结束自动解散，无数据留存
- **Acceptance Criteria Addressed**: FR-3.1~FR-3.5, AC-20
- **Test Requirements**:
  - `programmatic` TR-7.1: 生成6位房间码，成员可通过房间码加入
  - `programmatic` TR-7.2: 多设备操作实时同步（延迟≤100ms）
  - `programmatic` TR-7.3: 时间戳解决冲突正确
  - `programmatic` TR-7.4: 对局结束房间自动解散
- **Notes**: 需要在微信后台配置socket域名，会员专属功能

## [ ] Task 8: 击球计时模块开发
- **Priority**: P1
- **Depends On**: Task 2, Task 6
- **Description**: 
  - 免费版：隐藏所有计时入口
  - 会员版：开局设置计时开关（开/关）
  - 自定义单杆限时（5s~60s）
  - 切换击球手自动重启计时
  - 震动+语音提醒
- **Acceptance Criteria Addressed**: FR-4.1~FR-4.5, AC-11, AC-12
- **Test Requirements**:
  - `programmatic` TR-8.1: 计时开关正常工作
  - `programmatic` TR-8.2: 自定义时长范围正确
  - `programmatic` TR-8.3: 切换击球手计时器重启
  - `human-judgment` TR-8.4: 免费用户无计时入口
- **Notes**: 会员专属功能

## [ ] Task 9: 赛事图谱模块开发
- **Priority**: P1
- **Depends On**: Task 6
- **Description**: 
  - 免费功能：文字版对阵列表查看、扫码加入赛事
  - 会员专属：赛事创建（赛制、局制、玩法选择）
  - 一键抽签、轮空分配逻辑
  - 可视化图谱组件（echarts-for-uniapp）
  - 单败/双败赛制渲染
  - 比分录入与自动晋级
  - 赛事海报生成
- **Acceptance Criteria Addressed**: FR-5.1~FR-5.8, AC-5, AC-6, AC-7, AC-8
- **Test Requirements**:
  - `programmatic` TR-9.1: 抽签、轮空分配正确
  - `human-judgment` TR-9.2: 图谱渲染流畅，支持手势缩放
  - `programmatic` TR-9.3: 双败赛制逻辑正确（胜者组/败者组）
  - `human-judgment` TR-9.4: 免费用户仅能查看文字版对阵
- **Notes**: 会员专属创建功能

## [ ] Task 10: 数据导出与个人统计模块
- **Priority**: P1
- **Depends On**: Task 2, Task 6
- **Description**: 
  - 会员数据导出（图片/Excel）
  - 操作步骤复盘功能
  - 个人数据统计（胜率、清台率、场均得分、犯规次数）
  - 对战海报生成（1V1/抓迷糊）
- **Acceptance Criteria Addressed**: FR-1.6~FR-1.7, FR-7.1~FR-7.2, AC-14
- **Test Requirements**:
  - `programmatic` TR-10.1: 会员数据导出功能正常
  - `programmatic` TR-10.2: 个人统计数据正确计算
  - `human-judgment` TR-10.3: 对战海报生成清晰可分享
- **Notes**: 会员专属功能

## [ ] Task 11: 离线存储与数据同步
- **Priority**: P1
- **Depends On**: Task 2, Task 6
- **Description**: 
  - 离线基础计分支持
  - 联网后自动校准同步
  - 会员云端数据同步逻辑
  - 对局记录本地/云端存储
- **Acceptance Criteria Addressed**: AC-13, AC-14
- **Test Requirements**:
  - `programmatic` TR-11.1: 无网络时基础计分正常
  - `programmatic` TR-11.2: 联网后数据自动同步
  - `programmatic` TR-11.3: 会员云端存储正常
- **Notes**: 使用本地存储API

## [ ] Task 12: 练习模式预留（后期迭代）
- **Priority**: P2
- **Depends On**: None
- **Description**: 
  - 预留练习模式页面入口
  - 基础框架搭建（不实现具体功能）
- **Acceptance Criteria Addressed**: 预留功能
- **Test Requirements**:
  - `human-judgment` TR-12.1: 入口预留，显示"即将上线"提示
- **Notes**: 后期迭代开发

## [ ] Task 13: 界面优化与测试
- **Priority**: P2
- **Depends On**: 所有前面任务
- **Description**: 
  - UI界面优化
  - 微信小程序端适配
  - 功能测试与bug修复
  - 性能优化
- **Acceptance Criteria Addressed**: NFR-1~NFR-8
- **Test Requirements**:
  - `human-judgment` TR-13.1: 界面简洁易用，符合微信规范
  - `programmatic` TR-13.2: 无闪退、卡顿
  - `human-judgment` TR-13.3: 适配不同屏幕尺寸
- **Notes**: 最后阶段整合测试

---

## 任务优先级说明

| 优先级 | 说明 | 任务 |
|--------|------|------|
| P0 | 核心功能，必须完成 | 项目架构、基础计分、玩法模块、斯诺克自定义球数、抓迷糊、权限广告 |
| P1 | 重要功能，增强体验 | 联机、计时、赛事图谱、数据导出统计、离线同步 |
| P2 | 优化测试，确保质量 | 练习模式预留、界面优化、测试修复 |

## 任务依赖关系图

```
Task 1 (架构)
    ├── Task 2 (基础计分)
    │   ├── Task 3 (中式八球+九球)
    │   │   └── Task 5 (抓迷糊)
    │   │       └── Task 7 (联机)
    │   ├── Task 4 (斯诺克+自定义球数)
    │   ├── Task 8 (击球计时)
    │   └── Task 11 (离线同步)
    ├── Task 6 (权限广告)
    │   ├── Task 7 (联机)
    │   ├── Task 8 (击球计时)
    │   ├── Task 9 (赛事图谱)
    │   └── Task 10 (数据导出)
    └── Task 12 (练习模式预留)
        └── Task 13 (界面优化测试)
```
