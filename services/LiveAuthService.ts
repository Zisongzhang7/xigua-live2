export interface AuthResult {
  success: boolean;
  code: 'SUCCESS' | 'NO_TOKEN' | 'NO_PERMISSION' | 'CONFLICT' | 'UNKNOWN';
  message?: string;
  conflictInfo?: {
    conflictingCourseName: string;
    conflictingLessonName: string;
    conflictingClassId: string;
    conflictingClassName: string;
  };
}

class LiveAuthService {
  private currentToken: string | null = 'valid-token-initial'; // 默认有一个token

  // 模拟检查Token是否存在
  checkToken(): boolean {
    return !!this.currentToken;
  }

  // 模拟登录
  login(studentId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (studentId) {
          this.currentToken = `token-${studentId}`;
          resolve(true);
        } else {
          resolve(false);
        }
      }, 500);
    });
  }

  // 模拟权限检查
  // 返回 true 表示有权限进入
  async checkPermission(sessionId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟逻辑：
        // 如果 token 包含 'vip' (模拟已注册)，则通过
        // 否则失败，触发后续冲突检测流程
        const hasPermission = this.currentToken?.includes('vip');
        resolve(!!hasPermission);
      }, 500);
    });
  }

  // 模拟冲突检测
  async checkConflict(sessionId: string): Promise<AuthResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟：根据当前时间或随机数决定是否有冲突
        // 为了演示效果，我们让它有 50% 概率冲突
        const hasConflict = Math.random() > 0.5;
        
        if (hasConflict) {
            resolve({
                success: false,
                code: 'CONFLICT',
                conflictInfo: {
                    conflictingCourseName: '高中物理必修一',
                    conflictingLessonName: '第三章：牛顿运动定律',
                    conflictingClassId: 'class-001',
                    conflictingClassName: '高一(3)班'
                }
            });
        } else {
            resolve({
                success: false,
                code: 'NO_PERMISSION', // 无冲突，但也无权限（即单纯的未报名）
                message: '当前账号无该场次观看权限'
            });
        }
      }, 600);
    });
  }

  // 模拟注册课程 (可选退课)
  async registerClass(sessionId: string, dropConflict: boolean): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[Mock] Registered for session ${sessionId}, dropConflict: ${dropConflict}`);
        // 注册成功后，给当前 token 加上 vip 标记，以便下次 checkPermission 通过
        if (this.currentToken && !this.currentToken.includes('vip')) {
            this.currentToken += '-vip';
        }
        resolve(true);
      }, 800);
    });
  }
}

export const liveAuthService = new LiveAuthService();
