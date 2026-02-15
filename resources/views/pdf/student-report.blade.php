<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $student->name }} - 成绩报告</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'SimSun', 'Microsoft YaHei', sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            opacity: 0.5;
        }
        
        .header-content {
            position: relative;
            z-index: 1;
        }
        
        .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
            font-weight: bold;
        }
        
        .header .subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .student-info {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 30px 40px;
            border-bottom: 3px solid #667eea;
        }
        
        .student-info h2 {
            font-size: 28px;
            color: #333;
            margin-bottom: 15px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-top: 20px;
        }
        
        .info-item {
            background: white;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .info-item .label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .info-item .value {
            font-size: 18px;
            font-weight: bold;
            color: #333;
        }
        
        .stats-section {
            padding: 40px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .stat-card .number {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stat-card .label {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .section-title {
            font-size: 20px;
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .grade-distribution {
            display: flex;
            gap: 15px;
            margin-bottom: 40px;
            flex-wrap: wrap;
        }
        
        .grade-item {
            flex: 1;
            min-width: 100px;
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            transition: all 0.3s;
        }
        
        .grade-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        
        .grade-item.g { border-color: #10b981; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); }
        .grade-item.a { border-color: #3b82f6; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); }
        .grade-item.b { border-color: #f59e0b; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); }
        .grade-item.c { border-color: #f97316; background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%); }
        .grade-item.o { border-color: #ef4444; background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); }
        
        .grade-item .grade {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .grade-item.g .grade { color: #059669; }
        .grade-item.a .grade { color: #2563eb; }
        .grade-item.b .grade { color: #d97706; }
        .grade-item.c .grade { color: #ea580c; }
        .grade-item.o .grade { color: #dc2626; }
        
        .grade-item .count {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }
        
        .grade-item .unit {
            font-size: 14px;
            color: #666;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        
        td {
            padding: 15px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        tr:hover {
            background: #f8f9fa;
        }
        
        .score-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
        }
        
        .score-badge.score-12 { background: #d1fae5; color: #059669; }
        .score-badge.score-10 { background: #dbeafe; color: #2563eb; }
        .score-badge.score-8 { background: #fef3c7; color: #d97706; }
        .score-badge.score-6 { background: #ffedd5; color: #ea580c; }
        .score-badge.score-0 { background: #fee2e2; color: #dc2626; }
        .score-badge.score-null { background: #f3f4f6; color: #9ca3af; }
        
        .footer {
            background: #f8f9fa;
            padding: 20px 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #e0e0e0;
        }
        
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- 头部 -->
        <div class="header">
            <div class="header-content">
                <h1>🏆 学生成绩报告</h1>
                <p class="subtitle">Student Achievement Report</p>
            </div>
        </div>
        
        <!-- 学生信息 -->
        <div class="student-info">
            <h2>{{ $student->name }}</h2>
            <div class="info-grid">
                <div class="info-item">
                    <div class="label">年级</div>
                    <div class="value">{{ $student->grade_text }}</div>
                </div>
                <div class="info-item">
                    <div class="label">班级</div>
                    <div class="value">{{ $student->class }}班</div>
                </div>
                <div class="info-item">
                    <div class="label">入学年份</div>
                    <div class="value">{{ $student->year }}年</div>
                </div>
            </div>
        </div>
        
        <!-- 统计数据 -->
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
            
            <!-- 成绩分布 -->
            <h3 class="section-title">📊 成绩等级分布</h3>
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
            
            <!-- 作业列表 -->
            <h3 class="section-title">📝 作业提交记录</h3>
            <table>
                <thead>
                    <tr>
                        <th>作业名称</th>
                        <th>课时</th>
                        <th>文件名</th>
                        <th>分数</th>
                        <th>提交时间</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($submissions as $submission)
                    <tr>
                        <td>{{ $submission->assignment?->name ?? '未知作业' }}</td>
                        <td>{{ $submission->assignment?->lesson?->name ?? '未知课时' }}</td>
                        <td>{{ $submission->file_name }}</td>
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