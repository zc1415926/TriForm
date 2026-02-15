<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $student->name }} - 成绩报告</title>
    <style>
        @page {
            margin: 15mm 15mm 20mm 15mm;
            size: A4;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Microsoft YaHei', 'SimSun', sans-serif;
            font-size: 12px;
            line-height: 1.5;
            color: #333;
            background: white;
        }
        
        .container {
            width: 100%;
            max-width: 180mm;
            margin: 0 auto;
        }
        
        /* 头部区域 */
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 15px;
            position: relative;
        }
        
        .header-title {
            text-align: center;
            margin-bottom: 15px;
        }
        
        .header-title h1 {
            font-size: 24px;
            margin-bottom: 5px;
        }
        
        .header-title .subtitle {
            font-size: 12px;
            opacity: 0.9;
        }
        
        /* 学生信息卡片 */
        .student-card {
            background: rgba(255,255,255,0.95);
            color: #333;
            border-radius: 10px;
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .student-avatar {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #667eea;
            flex-shrink: 0;
        }
        
        .student-avatar-placeholder {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 28px;
            font-weight: bold;
            border: 3px solid white;
            flex-shrink: 0;
        }
        
        .student-details {
            flex: 1;
        }
        
        .student-name {
            font-size: 22px;
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
        }
        
        .student-meta {
            font-size: 13px;
            color: #666;
            line-height: 1.8;
        }
        
        .student-meta span {
            margin-right: 15px;
        }
        
        /* 统计卡片 */
        .stats-section {
            margin-bottom: 15px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 8px;
            border-radius: 8px;
            text-align: center;
        }
        
        .stat-card .number {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 3px;
        }
        
        .stat-card .label {
            font-size: 11px;
            opacity: 0.9;
        }
        
        /* 成绩分布 */
        .grade-section {
            margin-bottom: 15px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 14px;
            color: #333;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 2px solid #667eea;
            font-weight: bold;
        }
        
        .grade-distribution {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
        }
        
        .grade-item {
            padding: 12px 5px;
            border-radius: 8px;
            text-align: center;
        }
        
        .grade-item.g { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); }
        .grade-item.a { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); }
        .grade-item.b { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); }
        .grade-item.c { background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%); }
        .grade-item.o { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); }
        
        .grade-item .grade {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 3px;
        }
        
        .grade-item.g .grade { color: #059669; }
        .grade-item.a .grade { color: #2563eb; }
        .grade-item.b .grade { color: #d97706; }
        .grade-item.c .grade { color: #ea580c; }
        .grade-item.o .grade { color: #dc2626; }
        
        .grade-item .count {
            font-size: 16px;
            font-weight: bold;
            color: #333;
        }
        
        .grade-item .unit {
            font-size: 11px;
            color: #666;
        }
        
        /* 作业列表表格 */
        .submissions-section {
            margin-bottom: 15px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
        }
        
        th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 10px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 11px;
        }
        
        td {
            padding: 8px;
            border-bottom: 1px solid #e0e0e0;
            vertical-align: middle;
        }
        
        tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        /* 截图列 */
        .screenshot-cell {
            width: 80px;
            padding: 5px;
        }
        
        .screenshot-img {
            width: 70px;
            height: 50px;
            object-fit: cover;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        
        .screenshot-placeholder {
            width: 70px;
            height: 50px;
            background: #f3f4f6;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 10px;
            border: 1px solid #ddd;
        }
        
        .score-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 11px;
        }
        
        .score-badge.score-12 { background: #d1fae5; color: #059669; }
        .score-badge.score-10 { background: #dbeafe; color: #2563eb; }
        .score-badge.score-8 { background: #fef3c7; color: #d97706; }
        .score-badge.score-6 { background: #ffedd5; color: #ea580c; }
        .score-badge.score-0 { background: #fee2e2; color: #dc2626; }
        .score-badge.score-null { background: #f3f4f6; color: #9ca3af; }
        
        /* 页脚 */
        .footer {
            text-align: center;
            color: #666;
            font-size: 10px;
            padding-top: 15px;
            border-top: 1px solid #e0e0e0;
            margin-top: 20px;
        }
        
        /* 分页控制 */
        .page-break {
            page-break-after: always;
        }
        
        .avoid-break {
            page-break-inside: avoid;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- 头部区域 -->
        <div class="header">
            <div class="header-title">
                <h1>🏆 学生成绩报告</h1>
                <div class="subtitle">Student Achievement Report</div>
            </div>
            
            <!-- 学生信息卡片：头像 + 信息 -->
            <div class="student-card">
                @if($student->avatar)
                    <img src="{{ public_path('storage/' . $student->avatar) }}" alt="{{ $student->name }}" class="student-avatar">
                @else
                    <div class="student-avatar-placeholder">
                        {{ mb_substr($student->name, 0, 1) }}
                    </div>
                @endif
                
                <div class="student-details">
                    <div class="student-name">{{ $student->name }}</div>
                    <div class="student-meta">
                        <span>📚 {{ $student->grade_text }}</span>
                        <span>🏫 {{ $student->class }}班</span>
                        <span>📅 {{ $student->year }}年入学</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 统计卡片 -->
        <div class="stats-section">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="number">{{ $statistics['completion_rate'] }}%</div>
                    <div class="label">作业完成率</div>
                </div>
                <div class="stat-card">
                    <div class="number">{{ $statistics['average_score'] }}</div>
                    <div class="label">平均分</div>
                </div>
                <div class="stat-card">
                    <div class="number">{{ $statistics['total_score'] }}</div>
                    <div class="label">总分</div>
                </div>
                <div class="stat-card">
                    <div class="number">{{ $statistics['total_submissions'] }}</div>
                    <div class="label">提交数</div>
                </div>
            </div>
        </div>
        
        <!-- 成绩分布 -->
        <div class="grade-section avoid-break">
            <div class="section-title">📊 成绩等级分布</div>
            <div class="grade-distribution">
                <div class="grade-item g">
                    <div class="grade">G</div>
                    <div class="count">{{ $grade_distribution['G'] }}</div>
                    <div class="unit">份</div>
                </div>
                <div class="grade-item a">
                    <div class="grade">A</div>
                    <div class="count">{{ $grade_distribution['A'] }}</div>
                    <div class="unit">份</div>
                </div>
                <div class="grade-item b">
                    <div class="grade">B</div>
                    <div class="count">{{ $grade_distribution['B'] }}</div>
                    <div class="unit">份</div>
                </div>
                <div class="grade-item c">
                    <div class="grade">C</div>
                    <div class="count">{{ $grade_distribution['C'] }}</div>
                    <div class="unit">份</div>
                </div>
                <div class="grade-item o">
                    <div class="grade">O</div>
                    <div class="count">{{ $grade_distribution['O'] }}</div>
                    <div class="unit">份</div>
                </div>
            </div>
        </div>
        
        <!-- 作业列表 -->
        <div class="submissions-section">
            <div class="section-title">📝 作业提交记录</div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 80px;">截图</th>
                        <th>作业名称</th>
                        <th>课时</th>
                        <th>分数</th>
                        <th>提交时间</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($submissions as $submission)
                    <tr class="avoid-break">
                        <td class="screenshot-cell">
                            @if($submission->preview_image_path)
                                <img src="{{ public_path('storage/' . $submission->preview_image_path) }}" alt="截图" class="screenshot-img">
                            @else
                                <div class="screenshot-placeholder">无截图</div>
                            @endif
                        </td>
                        <td>{{ $submission->assignment?->name ?? '未知作业' }}</td>
                        <td>{{ $submission->assignment?->lesson?->name ?? '未知课时' }}</td>
                        <td>
                            @if($submission->score !== null)
                                <span class="score-badge score-{{ $submission->score }}">
                                    {{ $submission->score }}分
                                </span>
                            @else
                                <span class="score-badge score-null">未评分</span>
                            @endif
                        </td>
                        <td>{{ $submission->created_at->format('Y-m-d H:i') }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        
        <!-- 页脚 -->
        <div class="footer">
            <p>报告生成时间：{{ $generated_at }} | 3D 建模课程管理系统</p>
        </div>
    </div>
</body>
</html>