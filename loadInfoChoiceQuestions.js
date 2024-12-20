async function loadQuestionsFromFile() {
    try {
        const response = await fetch('./信息检索选择题.txt');
        const text = await response.text();
        
        const chapters = {
            '单选题': [],
            '多选题': []
        };
        let currentQuestion = null;
        
        const lines = text.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            
            if (line === '') continue;
            
            // 检测新题目
            const questionMatch = line.match(/^\d+\./);
            if (questionMatch) {
                // 保存前一个题目（如果存在）
                if (currentQuestion) {
                    const chapterKey = currentQuestion.isMultipleChoice ? '多选题' : '单选题';
                    chapters[chapterKey].push(currentQuestion);
                }
                
                // 检查是否是多选题
                const isMultipleChoice = line.includes('(多选)') || line.includes('（多选）');
                
                // 创建新题目对象
                currentQuestion = {
                    question: line,
                    options: [],
                    answer: '',
                    isMultipleChoice: isMultipleChoice
                };
                continue;
            }
            
            // 检测选项
            const optionMatch = line.match(/^[A-E]\./);
            if (optionMatch) {
                if (currentQuestion) {
                    currentQuestion.options.push(line);
                }
                continue;
            }
            
            // 检测答案
            if (line.startsWith('答案：')) {
                if (currentQuestion) {
                    currentQuestion.answer = line.substring(3).trim();
                }
                continue;
            }
            
            // 处理题目的附加内容
            if (currentQuestion && !line.match(/^[A-E]\./) && !line.startsWith('答案：')) {
                currentQuestion.question += '\n' + line;
            }
        }
        
        // 确保最后一个题目也被添加
        if (currentQuestion) {
            const chapterKey = currentQuestion.isMultipleChoice ? '多选题' : '单选题';
            chapters[chapterKey].push(currentQuestion);
        }

        // 将题目按10题一组重新组织
        const groupedChapters = {};
        
        // 处理单选题
        for (let i = 0; i < chapters['单选题'].length; i += 10) {
            const groupNum = Math.floor(i / 10) + 1;
            groupedChapters[`单选题 ${groupNum*10-9}-${Math.min(groupNum*10, chapters['单选题'].length)}`] = 
                chapters['单选题'].slice(i, i + 10);
        }
        
        // 处理多选题
        for (let i = 0; i < chapters['多选题'].length; i += 10) {
            const groupNum = Math.floor(i / 10) + 1;
            groupedChapters[`多选题 ${groupNum*10-9}-${Math.min(groupNum*10, chapters['多选题'].length)}`] = 
                chapters['多选题'].slice(i, i + 10);
        }

        return groupedChapters;
    } catch (error) {
        console.error('加载题目失败:', error);
        throw error;
    }
} 