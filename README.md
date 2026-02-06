# 多巴胺读书会PWA - 前后端分离方案

## 项目概述

这是一个多巴胺读书会PWA应用，目前所有功能都在前端实现，数据存储在localStorage中。现在需要将成员管理功能分离为前端和后端。

## 技术栈

### 前端
- HTML5 + CSS3 + JavaScript (原生)
- PWA支持

### 后端
- Node.js + Express
- SQLite3 (简单的数据持久化)
- RESTful API

## 目录结构

```
book-club-pwa/
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── manifest.json
│   ├── service-worker.js
│   └── assets/
└── backend/
    ├── server.js
    ├── package.json
    ├── routes/
    │   └── members.js
    └── db/
        └── database.js
```

## 实现步骤

### 1. 创建后端项目

```bash
mkdir backend
cd backend
npm init -y
npm install express sqlite3 cors
```

### 2. 设计数据库

```javascript
// backend/db/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'bookclub.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('数据库连接失败:', err.message);
    } else {
        console.log('成功连接到SQLite数据库');
        createTables();
    }
});

function createTables() {
    // 创建成员表
    db.run(`CREATE TABLE IF NOT EXISTS members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        wechat TEXT NOT NULL UNIQUE,
        attendances INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('创建成员表失败:', err.message);
        }
    });
}

module.exports = db;
```

### 3. 实现API路由

```javascript
// backend/routes/members.js
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// 获取所有成员
router.get('/', (req, res) => {
    db.all('SELECT * FROM members ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 获取单个成员
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM members WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ message: '成员不存在' });
            return;
        }
        res.json(row);
    });
});

// 添加成员
router.post('/', (req, res) => {
    const { name, phone, wechat } = req.body;
    db.run(
        'INSERT INTO members (name, phone, wechat) VALUES (?, ?, ?)',
        [name, phone, wechat],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({
                id: this.lastID,
                name,
                phone,
                wechat,
                attendances: 0
            });
        }
    );
});

// 更新成员
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, phone, wechat, attendances } = req.body;
    db.run(
        'UPDATE members SET name = ?, phone = ?, wechat = ?, attendances = ? WHERE id = ?',
        [name, phone, wechat, attendances, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ message: '成员不存在' });
                return;
            }
            res.json({ id, name, phone, wechat, attendances });
        }
    );
});

// 删除成员
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM members WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ message: '成员不存在' });
            return;
        }
        res.json({ message: '成员已删除' });
    });
});

// 成员打卡
router.post('/:id/check-in', (req, res) => {
    const { id } = req.params;
    db.run(
        'UPDATE members SET attendances = attendances + 1 WHERE id = ?',
        [id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ message: '成员不存在' });
                return;
            }
            // 获取更新后的成员信息
            db.get('SELECT * FROM members WHERE id = ?', [id], (err, row) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json(row);
            });
        }
    );
});

module.exports = router;
```

### 4. 创建后端服务器

```javascript
// backend/server.js
const express = require('express');
const cors = require('cors');
const membersRouter = require('./routes/members');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/members', membersRouter);

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Book Club API is running' });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
```

### 5. 修改前端代码

1. 创建API服务模块
2. 修改成员管理功能，使用API调用
3. 保留其他功能的localStorage存储

```javascript
// 在index.html中添加API服务
const API_BASE_URL = 'http://localhost:3000/api';

// API服务
const apiService = {
    // 成员相关API
    members: {
        getAll: async () => {
            const response = await fetch(`${API_BASE_URL}/members`);
            if (!response.ok) {
                throw new Error('获取成员失败');
            }
            return response.json();
        },
        getById: async (id) => {
            const response = await fetch(`${API_BASE_URL}/members/${id}`);
            if (!response.ok) {
                throw new Error('获取成员失败');
            }
            return response.json();
        },
        create: async (member) => {
            const response = await fetch(`${API_BASE_URL}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(member)
            });
            if (!response.ok) {
                throw new Error('创建成员失败');
            }
            return response.json();
        },
        update: async (id, member) => {
            const response = await fetch(`${API_BASE_URL}/members/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(member)
            });
            if (!response.ok) {
                throw new Error('更新成员失败');
            }
            return response.json();
        },
        delete: async (id) => {
            const response = await fetch(`${API_BASE_URL}/members/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('删除成员失败');
            }
            return response.json();
        },
        checkIn: async (id) => {
            const response = await fetch(`${API_BASE_URL}/members/${id}/check-in`, {
                method: 'POST'
            });
            if (!response.ok) {
                throw new Error('打卡失败');
            }
            return response.json();
        }
    }
};
```

### 6. 修改成员管理功能

```javascript
// 初始化数据 - 从API获取成员
async function initMembersData() {
    try {
        const members = await apiService.members.getAll();
        appData.members = members;
        renderMembers();
        renderHome();
    } catch (error) {
        console.error('初始化成员数据失败:', error);
        // 如果API调用失败，回退到localStorage
        const savedMembers = localStorage.getItem('bookClubMembers');
        if (savedMembers) {
            appData.members = JSON.parse(savedMembers);
        }
    }
}

// 添加成员 - 使用API
async function addMember(name, phone, wechat) {
    try {
        const newMember = await apiService.members.create({ name, phone, wechat });
        appData.members.push(newMember);
        renderMembers();
        renderHome();
        console.log('成员已添加:', newMember);
    } catch (error) {
        console.error('添加成员失败:', error);
        alert('添加成员失败，请重试');
    }
}

// 修改其他成员管理函数，使用API调用...
```

## 运行方式

### 1. 启动后端服务

```bash
cd backend
npm start
```

### 2. 运行前端应用

使用HTTP服务器运行前端应用，例如：

```bash
cd frontend
python -m http.server 8000
```

然后在浏览器中访问 `http://localhost:8000`

## 功能说明

### 成员管理 (后端实现)
- 获取所有成员
- 获取单个成员
- 添加成员
- 更新成员信息
- 删除成员
- 成员打卡

### 其他功能 (前端实现)
- 活动发布和报名
- 书籍推荐
- 照片墙
- PWA支持

## 后续扩展

1. 将其他功能也迁移到后端
2. 添加用户认证和授权
3. 实现文件上传功能（照片墙）
4. 添加WebSocket支持，实现实时通知
5. 部署到云服务器

## 注意事项

1. 确保后端服务在启动前端应用前运行
2. 开发环境下需要开启CORS支持
3. 生产环境下建议使用HTTPS
4. 定期备份数据库
