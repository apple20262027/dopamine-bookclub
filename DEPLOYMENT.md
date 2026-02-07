# 🚀 部署指南 - 多巴胺读书会

## 方法1：Vercel 直接部署

### 步骤1：访问 Vercel 官网
1. 打开浏览器，访问 [Vercel.com](https://vercel.com/)
2. 使用 GitHub 账号登录

### 步骤2：创建新项目
1. 点击顶部导航栏的 "New Project"
2. 在 "Import Git Repository" 部分，选择 "Import Project"
3. 选择 "From Git Repository"

### 步骤3：连接 GitHub 仓库
1. 如果你还没有 GitHub 仓库：
   - 先去 [GitHub.com](https://github.com/) 创建一个新的仓库
   - 仓库名称建议：`dopamine-bookclub`
   - 仓库类型：Public
   - 不要初始化 README.md

2. 手动上传文件：
   - 在 GitHub 仓库页面，点击 "Add file" → "Upload files"
   - 上传以下文件：
     - `index.html`
     - `style.css`
     - `manifest.json`
     - `service-worker.js`
     - `README.md`
   - 点击 "Commit changes"

3. 返回 Vercel，刷新页面，找到你的仓库并点击 "Import"

### 步骤4：配置部署
1. **Project Name**：保持默认或自定义
2. **Framework Preset**：选择 "Static HTML"
3. **Root Directory**：保持默认（/）
4. **Build Command**：留空
5. **Output Directory**：留空
6. 点击 "Deploy"

### 步骤5：等待部署完成
- Vercel 会自动构建并部署你的网站
- 部署完成后，会显示一个成功页面
- 复制生成的 URL（例如：`dopamine-bookclub.vercel.app`）

## 方法2：GitHub Pages 部署

### 步骤1：创建 GitHub 仓库
1. 在 GitHub 上创建新仓库
2. 上传所有文件

### 步骤2：启用 GitHub Pages
1. 进入仓库设置（Settings）
2. 找到 "GitHub Pages" 部分
3. **Source** 选择 "main branch"
4. 点击 "Save"
5. 等待几分钟，访问生成的 URL

## 📱 PWA 安装指南

当网站部署成功后：

### 在手机上：
1. 使用 Safari（iOS）或 Chrome（Android）访问网站
2. 点击分享按钮
3. 选择 "添加到主屏幕"
4. 确认添加

### 在电脑上：
1. 使用 Chrome 浏览器访问网站
2. 点击地址栏右侧的 "安装" 图标
3. 确认安装

## 🔧 常见问题

### Q1：图片上传失败怎么办？
A：由于是纯前端部署，建议使用外部图片存储服务：
- GitHub Raw URL
- Imgur
- Cloudinary
- 在添加照片时填写完整的图片 URL

### Q2：部署后数据不显示？
A：数据存储在浏览器 LocalStorage 中，不同设备之间不会同步

### Q3：如何更新网站？
A：
1. 修改本地文件
2. 重新上传到 GitHub 仓库
3. Vercel 会自动重新部署

## 🎯 部署完成后

访问你的网站 URL，你应该能看到：
- ✅ 多巴胺主题的现代化界面
- ✅ 完整的功能（成员管理、照片墙、活动报名、书籍推荐）
- ✅ 响应式设计（支持手机和电脑）
- ✅ PWA 安装功能

恭喜你！🎉 多巴胺读书会网站已经成功部署上线！