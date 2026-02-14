/**
 * 测试数据
 */

export const testUsers = {
    admin: {
        email: 'zc1415926@126.com',
        password: 'zaq12wsx',
        name: '管理员',
    },
    teacher: {
        email: 'zc1415926@126.com',
        password: 'zaq12wsx',
        name: '管理员',
    },
};

export const testStudents = {
    newStudent: {
        name: '测试学生',
        grade: '5',
        class: '3',
        year: '2026',
    },
    editStudent: {
        name: '编辑测试学生',
        grade: '4',
        class: '2',
        year: '2025',
    },
};

export const testLessons = {
    newLesson: {
        title: '测试课程标题',
        content: '<p>这是测试课程的内容</p>',
        year: '2026',
    },
    editLesson: {
        title: '编辑后的课程标题',
        content: '<p>编辑后的课程内容</p>',
        year: '2025',
    },
};

export const testAssignments = {
    newAssignment: {
        title: '测试作业',
        description: '这是一个测试作业',
        lesson_id: '',
        upload_type_ids: [],
    },
};

export const testUploadTypes = {
    newUploadType: {
        name: '测试上传类型',
        extensions: ['jpg', 'png'],
    },
};