import React, { useState } from 'react';
import { Clock, Star, Trophy, Wifi, WifiOff, Search } from 'lucide-react';

// Mock Data Types
interface StudentData {
    id: string;
    name: string;
    studentId: string;
    avatar: string;
    isOnline: boolean;
    duration: string;
    score: number;
    isStarred: boolean;
}

interface TeamData {
    id: string;
    name: string;
    score: number;
    rank: number;
    students: StudentData[];
}

// Mock Data Generator
const TEAM_NAMES = ['勇敢追梦队', '希望之星队', '学海拾贝队', '勇者无畏队'];
const NAMES = ['彤彤', '邱柏雅', '邱庭瑞', '梁书荣', '潘咿蒙', '孙苏瓘', '小麦', '钟倾语', '李文杰', '宣宣'];

const generateMockTeams = (): TeamData[] => {
    return TEAM_NAMES.map((teamName, idx) => {
        const students = Array.from({ length: 8 + Math.floor(Math.random() * 5) }).map((_, i) => ({
            id: `s-${idx}-${i}`,
            name: NAMES[Math.floor(Math.random() * NAMES.length)] + (Math.random() > 0.8 ? ' (副)' : ''),
            studentId: `2024${Math.floor(1000 + Math.random() * 9000)}`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${idx}-${i}`,
            isOnline: Math.random() > 0.1,
            duration: `${Math.floor(10 + Math.random() * 40)}m ${Math.floor(Math.random() * 60)}s`,
            score: Math.floor(100 + Math.random() * 900),
            isStarred: Math.random() > 0.7
        })).sort((a, b) => b.score - a.score);

        return {
            id: `t-${idx}`,
            name: teamName,
            score: students.reduce((acc, curr) => acc + curr.score, 0),
            rank: idx + 1,
            students
        };
    }).sort((a, b) => b.score - a.score).map((t, i) => ({ ...t, rank: i + 1 }));
};

const INITIAL_TEAMS = generateMockTeams();

const StudentDataList: React.FC = () => {
    const [teams, setTeams] = useState<TeamData[]>(INITIAL_TEAMS);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleStar = (teamId: string, studentId: string) => {
        setTeams(prev => prev.map(team => {
            if (team.id !== teamId) return team;
            return {
                ...team,
                students: team.students.map(s => s.id === studentId ? { ...s, isStarred: !s.isStarred } : s)
            };
        }));
    };

    const filteredTeams = teams.map(team => ({
        ...team,
        students: team.students.filter(s => 
            s.name.includes(searchTerm) || s.studentId.includes(searchTerm)
        )
    })).filter(t => t.students.length > 0);

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-3 border-b border-gray-100 flex-shrink-0">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="搜索学号或姓名..."
                        className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search size={12} className="absolute left-2.5 top-2 text-gray-400" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-3">
                {filteredTeams.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                        <Search size={24} className="mb-2 opacity-20" />
                        <span className="text-xs">未找到相关学生</span>
                    </div>
                ) : (
                    filteredTeams.map(team => (
                        <div key={team.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    {/* Team Header */}
                    <div className="px-3 py-2 bg-gray-50/50 flex justify-between items-center border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-red-500">排名:{team.rank}</span>
                            <span className="text-sm font-bold text-gray-900">{team.name}</span>
                        </div>
                        <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-0.5 rounded">{team.score}分</span>
                    </div>
                    
                    {/* Student List */}
                    <div className="divide-y divide-gray-50">
                        {team.students.map((student) => (
                            <div key={student.id} className="flex items-center justify-between p-2 hover:bg-blue-50/30 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={student.avatar} className="w-8 h-8 rounded-full bg-gray-100 border border-white shadow-sm" alt={student.name} />
                                        {!student.isOnline && (
                                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-gray-100">
                                                 <WifiOff size={8} className="text-red-500" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-bold text-gray-800">{student.name}</span>
                                            {!student.isOnline && <span className="text-[9px] text-red-400 font-bold border border-red-100 px-1 rounded bg-red-50">离线</span>}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-mono">{student.studentId}</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                        <Clock size={10} />
                                        {student.duration}
                                    </div>
                                    <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded text-[10px] font-black min-w-[40px] justify-center">
                                        <Trophy size={10} />
                                        {student.score}
                                    </div>
                                    <button 
                                        onClick={() => toggleStar(team.id, student.id)}
                                        className={`p-1 rounded hover:bg-gray-100 transition-colors ${student.isStarred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                    >
                                        <Star size={14} fill={student.isStarred ? "currentColor" : "none"} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))
            )}
        </div>
        </div>
    );
};

export default StudentDataList;