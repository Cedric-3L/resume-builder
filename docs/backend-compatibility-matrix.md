# Editorial Paper 前端与现有后端兼容性对照

更新日期：2026-06-22

## 结论

新设计可以在不推翻现有后端的前提下实施。

- 登录注册、个人资料、简历管理、模板收藏、编辑器和 PDF 导出可直接复用现有 Supabase 与 Next.js API。
- 会员、订单、发票、导出历史、版本历史和完整管理统计目前缺少数据表或接口。
- 实施前端改版时，应保留现有 API 路径、请求体和 Zustand Store 数据结构，优先完成可直接接入的页面。

状态说明：

- **直接匹配**：只需重做 UI 和布局。
- **部分匹配**：核心能力存在，但设计稿中的部分数据或交互需要补充。
- **暂不匹配**：需要新增数据库结构和 API。
- **纯前端**：无需后端能力。

## 页面与接口对照

| 页面 / 功能 | 匹配状态 | 现有数据或接口 | 差异与建议 |
|---|---|---|---|
| 首页 | 纯前端 | 无强制接口依赖 | 用户数、企业 Logo、成功案例等营销数据目前是展示内容；上线前可继续静态维护，或后续增加 CMS。 |
| 模板库 | 直接匹配 | `src/store/demoData.ts`、`src/store/wordTemplates.ts` | 模板元数据和预览来自前端代码。筛选、搜索和完整 A4 预览均可在前端实现。 |
| 模板收藏 | 直接匹配 | `GET/POST /api/favorites`、`DELETE /api/favorites/[templateKey]`、`favorite_templates` | 现有接口已覆盖收藏列表、收藏和取消收藏。 |
| 编辑器 | 直接匹配 | Zustand `useResumeStore`、`PUT /api/resumes/[resumeId]` | 保留现有 `ResumeSnapshot`、模板和主题字段即可。新版布局只改变表现层。 |
| 简历列表 | 直接匹配 | `GET /api/resumes` | 已支持按更新时间倒序返回简历及快照。设计稿中的模板预览、更新时间和编辑入口可直接绑定。 |
| 新建简历 | 直接匹配 | 本地 Store 创建后，`PUT /api/resumes/[resumeId]` 持久化 | 当前没有单独的 `POST /api/resumes`，但现有 upsert 流程可继续使用。 |
| 简历重命名 | 直接匹配 | `PATCH /api/resumes/[resumeId]` | 可直接绑定设计稿中的重命名操作。 |
| 简历删除 | 直接匹配 | `DELETE /api/resumes/[resumeId]` | 可直接绑定删除确认弹窗。 |
| 密码登录 | 直接匹配 | Supabase `signInWithPassword` | 设计稿可以直接实现。 |
| 短信验证码登录 | 直接匹配 | Supabase `signInWithOtp`、`verifyOtp` | 依赖 Supabase 项目已启用手机认证及短信供应商。 |
| 注册 | 直接匹配 | Supabase `signUp`、`profiles` 自动创建触发器 | 昵称已写入用户 metadata，并由触发器创建 profile。 |
| 忘记密码 | 部分匹配 | Supabase `resetPasswordForEmail` | 邮件发送已存在；还缺少独立的“设置新密码”完成页和 `updateUser({ password })` 流程。 |
| 7 天自动登录 | 部分匹配 | Supabase 客户端会持久化会话 | 当前没有按用户勾选结果切换会话时长的实现。可改成“保持登录”，或补充自定义会话策略。 |
| 个人资料 | 直接匹配 | `profiles` 表、`useAuthStore.updateProfile()` | 已支持昵称、头像 URL、目标职位和个人简介。 |
| 绑定手机 / 注册时间 | 部分匹配 | `profiles.phone`、`profiles.created_at` | 数据库已有字段，但当前 Auth Store 未完整暴露 `created_at`；手机绑定也没有单独验证流程。 |
| 头像上传 | 部分匹配 | `profiles.avatar_url` | 当前可保存头像 URL 或前端生成的数据；若要正式上传文件，应新增 Supabase Storage bucket、上传和删除策略。 |
| PDF 导出 | 直接匹配 | `POST /api/generate-pdf`、`print_resume_jobs`、Puppeteer | 已支持登录校验、一次性打印任务和 A4 PDF 下载。 |
| PDF 导出次数 | 暂不匹配 | 无持久化导出记录 | `print_resume_jobs` 是短期任务，不适合作为统计历史。建议新增 `export_events`。 |
| PDF 导出历史 | 暂不匹配 | 无 | 设计稿中的“已导出 8 次”和最近导出记录需要 `export_events` 表及查询接口。 |
| 简历完成度 | 部分匹配 | 简历 `snapshot` 已存在 | 可先由前端根据必填模块计算，无需新增后端；如需跨端统一可由服务端计算。 |
| 最近动态 | 暂不匹配 | 无活动日志 | 建议新增 `activity_events`，或由简历更新时间与导出记录组合生成。 |
| 会员中心 | 暂不匹配 | 无会员数据结构 | 免费版、专业版、额度和有效期均需要新增订阅模型。 |
| 会员支付 | 暂不匹配 | 无支付接口 | 需要接入支付平台，并实现创建支付、回调验签、订阅状态同步。 |
| 我的订单 | 暂不匹配 | 无 `orders` 表或 API | 目前页面只能做空状态或静态演示。 |
| 退款 | 暂不匹配 | 无 | 需要订单状态机、支付平台退款接口和回调。 |
| 发票 | 暂不匹配 | 无 | 需要发票申请表、状态流转和管理入口。 |
| 使用教程 | 纯前端 | 无强制接口依赖 | 可直接实现为静态内容；后续需要运营编辑时再接 CMS。 |
| 管理员身份 | 直接匹配 | `profiles.role`、`checkIsAdmin()` | 已区分 `user` 和 `admin`，后台入口可按权限显示。 |
| 管理后台基础统计 | 直接匹配 | `GET /api/admin/stats` | 当前已返回注册用户数、简历总数、模板使用排行。 |
| 管理后台趋势图 | 暂不匹配 | 当前接口不返回时间序列 | 需要按日期聚合用户、简历和导出事件。 |
| 付费会员数 | 暂不匹配 | 无订阅模型 | 需要 `subscriptions` 后才能统计。 |
| 最近注册用户 | 暂不匹配 | 当前接口不返回用户列表 | 可通过 service role 查询 `auth.users` 与 `profiles`，但应限制字段并分页。 |
| 订单管理后台 | 暂不匹配 | 无订单模型 | 随支付系统一并补充。 |
| 404、错误页、加载状态 | 纯前端 | 已有 `not-found.tsx`、`error.tsx`、`global-error.tsx` 和部分 `loading.tsx` | 只需统一成 Editorial Paper 风格。 |

## 现有后端资产

### Supabase 数据表

| 数据表 | 用途 |
|---|---|
| `profiles` | 用户昵称、邮箱、手机、头像、目标职位、简介和角色 |
| `resumes` | 用户简历名称、完整 JSON 快照和更新时间 |
| `favorite_templates` | 用户收藏的模板 |
| `print_resume_jobs` | 短期、一次性 PDF 打印任务 |

数据库定义：

- `supabase-schema.sql`
- `supabase-migration.sql`
- `supabase-rls-migration.sql`

### 已有 API

| 方法 | 路径 | 用途 |
|---|---|---|
| `GET` | `/api/resumes` | 获取当前用户简历列表 |
| `GET` | `/api/resumes/[resumeId]` | 获取单份简历 |
| `PUT` | `/api/resumes/[resumeId]` | 创建或保存简历 |
| `PATCH` | `/api/resumes/[resumeId]` | 重命名简历 |
| `DELETE` | `/api/resumes/[resumeId]` | 删除简历 |
| `GET` | `/api/favorites` | 获取收藏模板 |
| `POST` | `/api/favorites` | 收藏模板 |
| `DELETE` | `/api/favorites/[templateKey]` | 取消收藏 |
| `POST` | `/api/generate-pdf` | 生成并下载 PDF |
| `GET` | `/api/print-resume/[jobId]` | 消费一次性打印任务 |
| `GET` | `/api/admin/stats` | 获取基础管理统计 |

## 建议新增的数据模型

以下不是第一阶段 UI 改版的前置条件。

### `plans`

- `id`
- `name`
- `price`
- `billing_period`
- `resume_limit`
- `monthly_export_limit`
- `features`
- `is_active`

### `subscriptions`

- `id`
- `user_id`
- `plan_id`
- `status`
- `starts_at`
- `expires_at`
- `auto_renew`
- `provider`
- `provider_subscription_id`

### `orders`

- `id`
- `user_id`
- `order_number`
- `plan_id`
- `amount`
- `currency`
- `status`
- `provider`
- `provider_transaction_id`
- `paid_at`
- `created_at`

### `invoice_requests`

- `id`
- `user_id`
- `order_id`
- `title`
- `tax_number`
- `email`
- `status`
- `created_at`

### `export_events`

- `id`
- `user_id`
- `resume_id`
- `format`
- `status`
- `created_at`

### `resume_versions`

- `id`
- `resume_id`
- `user_id`
- `snapshot`
- `created_at`

### `activity_events`

- `id`
- `user_id`
- `event_type`
- `entity_type`
- `entity_id`
- `metadata`
- `created_at`

## 推荐实施顺序

### 第一阶段：只换前端，不改后端

1. 全局导航、字体、颜色和布局系统。
2. 首页和模板库。
3. 编辑器与完整 A4 预览。
4. 登录、注册和验证码登录。
5. 工作台简历列表、个人资料和收藏。
6. PDF 导出页。
7. 404、错误和加载状态。

第一阶段完成后，现有核心业务功能仍然可用。

### 第二阶段：小规模后端补充

1. PDF 导出事件与历史记录。
2. 最近动态。
3. 注册时间、手机绑定和正式头像上传。
4. 管理后台时间趋势与最近用户。
5. 简历版本历史。

### 第三阶段：商业化能力

1. 套餐和订阅。
2. 支付与订单。
3. 额度控制。
4. 退款和发票。
5. 商业数据管理后台。

## 实施约束

- 不修改现有 API 路径，除非确有版本升级需要。
- 保留 `ResumeSnapshot` 作为简历编辑与持久化的核心契约。
- 保留 Supabase Auth 和现有 RLS 权限边界。
- 新增商业表时同样启用 RLS；支付回调只使用服务端密钥。
- 新 UI 中暂不存在的后端能力应显示真实空状态，不使用虚假的动态数据。
