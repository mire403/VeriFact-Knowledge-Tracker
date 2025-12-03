import React, { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeQuery } from './services/geminiService';
import { AnalysisResult, AnalysisStatus, HistoryItem } from './types';
import { SourceCard } from './components/SourceCard';
import { AnalysisChart } from './components/AnalysisChart';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Database, 
  BrainCircuit, 
  ChevronRight,
  Loader2,
  Globe,
  Clock,
  Sparkles,
  BarChart3,
  CheckCircle2,
  ArrowUp, // Changed from ArrowRight to ArrowUp for chat feel
  History,
  Send
} from 'lucide-react';

// 推荐的示例问题
const EXAMPLE_PROMPTS = [
  "詹姆斯·韦伯望远镜最近有什么重大发现？",
  "详细解释量子计算机的工作原理及其当前瓶颈",
  "2024年巴黎奥运会金牌榜前三名是哪些国家？",
  "最新的阿尔茨海默病治疗药物有哪些进展？"
];

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = useCallback(async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = customQuery || query;
    if (!q.trim()) return;

    if (customQuery) setQuery(customQuery);

    setStatus(AnalysisStatus.ANALYZING);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeQuery(q);
      setResult(data);
      setStatus(AnalysisStatus.COMPLETED);
      
      // 添加到历史记录
      setHistory(prev => {
        const newItem: HistoryItem = { ...data, id: Date.now().toString(), query: q };
        // 避免重复连续添加
        if (prev.length > 0 && prev[0].query === q) return prev;
        return [newItem, ...prev].slice(0, 10); // 只保留最近10条
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : '发生了意外错误');
      setStatus(AnalysisStatus.ERROR);
    }
  }, [query]);

  // 当结果更新时，自动滚动到顶部
  useEffect(() => {
    if (result && scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [result]);

  const loadHistoryItem = (item: HistoryItem) => {
    setQuery(item.query);
    setResult(item);
    setStatus(AnalysisStatus.COMPLETED);
    setError(null);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const calculateMetrics = () => {
    if (!result) return { score: 0, level: '未知', color: 'text-slate-400', barColor: 'bg-slate-700' };
    const sourceCount = result.sources.length;
    
    let score = 0;
    if (sourceCount === 0) score = 10;
    else if (sourceCount <= 2) score = 40 + (sourceCount * 10);
    else if (sourceCount <= 5) score = 70 + (sourceCount * 4);
    else score = 95;

    let level = '极低';
    let color = 'text-red-400';
    let barColor = 'bg-red-500';

    if (score >= 80) { level = '极高'; color = 'text-green-400'; barColor = 'bg-green-500'; }
    else if (score >= 60) { level = '中等'; color = 'text-blue-400'; barColor = 'bg-blue-500'; }
    else if (score >= 40) { level = '低'; color = 'text-orange-400'; barColor = 'bg-orange-500'; }

    return { score, level, color, barColor };
  };

  const metrics = calculateMetrics();

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* 装饰背景 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
      </div>

      {/* 左侧侧边栏 */}
      <aside className="w-72 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800 flex flex-col z-20 hidden md:flex shrink-0">
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                VeriFact
              </h1>
              <p className="text-xs text-blue-400 font-medium tracking-wider uppercase">
                AI 真实性追踪
              </p>
            </div>
          </div>
        </div>

        {/* Navigation / History */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
          
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
              <History size={12} /> 最近查询
            </h3>
            <div className="space-y-1">
              {history.length === 0 ? (
                <div className="text-sm text-slate-600 px-2 italic">暂无历史记录</div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadHistoryItem(item)}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-all duration-200 group relative overflow-hidden ${
                      result === item 
                        ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="line-clamp-2 pr-2 relative z-10">{item.query}</div>
                    <div className="text-xs text-slate-600 mt-1.5 flex items-center gap-2 relative z-10">
                       <span className={`w-1.5 h-1.5 rounded-full ${item.sources.length > 0 ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                       {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="bg-slate-800 rounded-lg p-3 flex items-center gap-3">
             <div className="bg-slate-700 p-2 rounded-full">
               <Database size={16} className="text-slate-400" />
             </div>
             <div>
               <div className="text-xs text-slate-400">知识库状态</div>
               <div className="text-xs font-semibold text-green-400 flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                 在线 - Google
               </div>
             </div>
          </div>
        </div>
      </aside>

      {/* 主内容区域 */}
      <main className="flex-1 flex flex-col relative z-10 min-w-0 h-full">
        
        {/* 顶部标题栏 (仅在移动端显示或用于占位) */}
        <div className="h-14 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-6 md:hidden">
            <span className="font-bold text-slate-200">VeriFact</span>
            <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Beta</span>
        </div>

        {/* 滚动内容区 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
          <div className="min-h-full flex flex-col">
            
            <div className="flex-1 p-6 md:p-10 flex flex-col max-w-5xl mx-auto w-full">
                {/* 错误提示 */}
                {error && (
                  <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-red-500/20 p-2 rounded-full">
                      <AlertTriangle size={20} className="text-red-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-400">分析失败</h4>
                      <p className="text-sm opacity-80">{error}</p>
                    </div>
                  </div>
                )}

                {/* 欢迎/空状态 - 垂直居中 */}
                {!result && status !== AnalysisStatus.ANALYZING && !error && (
                  <div className="flex-1 flex flex-col justify-center items-center animate-in fade-in duration-700">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                      <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl mb-8 ring-1 ring-blue-500/20 shadow-2xl shadow-blue-500/10">
                        <BrainCircuit size={48} className="text-blue-400" />
                      </div>
                      <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                        揭示 AI 回答背后的<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">真实知识</span>
                      </h2>
                      <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto">
                        VeriFact 利用 Gemini 的 Grounding 能力，实时追踪知识来源，
                        精准识别大语言模型回答中的潜在幻觉与盲点。
                      </p>
                    </div>

                    <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4">
                      {EXAMPLE_PROMPTS.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnalyze(undefined, prompt)}
                          className="w-full text-left p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/30 transition-all text-sm text-slate-300 hover:text-white flex items-center justify-between group shadow-sm hover:shadow-md"
                        >
                          <span className="line-clamp-1">{prompt}</span>
                          <Send size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 transform -rotate-45 group-hover:rotate-0 duration-300" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 分析结果展示 */}
                {result && (
                  <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8 pb-10">
                    
                    {/* 1. 顶部指标栏 (Dashboard Metrics) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* 可信度卡片 */}
                      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-md">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                              <ShieldCheck size={14} /> 可信度评分
                            </div>
                            <span className={`text-xl font-bold ${metrics.color}`}>{metrics.score}/100</span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                            <div 
                              className={`h-full ${metrics.barColor} transition-all duration-1000 ease-out`} 
                              style={{ width: `${metrics.score}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-slate-500">
                            当前回答的可信度评估为 <span className={`${metrics.color} font-medium`}>{metrics.level}</span>
                          </p>
                      </div>

                      {/* 来源统计 */}
                      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-center">
                          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Globe size={14} /> 引用来源
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">{result.sources.length}</span>
                            <span className="text-sm text-slate-500">个外部链接</span>
                          </div>
                      </div>

                      {/* 用时/元数据 */}
                      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-center">
                          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Clock size={14} /> 生成时间
                          </div>
                          <div className="text-lg font-medium text-slate-200">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 truncate">
                            {result.groundingMetadata?.webSearchQueries?.[0] 
                              ? `检索词: "${result.groundingMetadata.webSearchQueries[0]}"` 
                              : '未进行额外检索'}
                          </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* 2. 主内容 (Main Content) - 左侧 2/3 */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-50"></div>
                          
                          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Sparkles size={18} className="text-blue-400" />
                            AI 回答分析
                          </h3>

                          <div className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed">
                              <p className="whitespace-pre-wrap">{result.text}</p>
                          </div>

                          {result.sources.length === 0 && (
                              <div className="mt-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex gap-3">
                                <AlertTriangle className="text-orange-400 flex-shrink-0" size={20} />
                                <div>
                                  <h4 className="text-orange-400 font-medium text-sm">潜在幻觉警告</h4>
                                  <p className="text-xs text-orange-300/70 mt-1">
                                    未检测到外部引用来源。建议对该回答中的具体事实、数据或日期进行二次核实。
                                  </p>
                                </div>
                              </div>
                          )}
                        </div>
                      </div>

                      {/* 3. 侧边详情 (Sidebar Details) - 右侧 1/3 */}
                      <div className="space-y-6">
                        {/* 知识图谱/分布图 */}
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg">
                          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Database size={14} /> 知识构成
                          </h3>
                          <AnalysisChart 
                            groundedCount={result.sources.length * 20} 
                            unverifiedCount={Math.max(0, 100 - (result.sources.length * 20))} 
                          />
                        </div>

                        {/* 来源列表 */}
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                              <Globe size={14} /> 验证来源 ({result.sources.length})
                            </h3>
                          </div>
                          
                          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                            {result.sources.length > 0 ? (
                              result.sources.map((source, idx) => (
                                <SourceCard key={idx} source={source} index={idx} />
                              ))
                            ) : (
                              <div className="text-center py-8 text-slate-500">
                                <div className="bg-slate-700/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <Globe size={20} className="opacity-50" />
                                </div>
                                <p className="text-sm">未找到相关网络来源</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* 底部搜索栏 - Chat Style */}
        <div className="p-4 md:p-6 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 z-30">
          <div className="max-w-4xl mx-auto">
             <form onSubmit={(e) => handleAnalyze(e)} className="relative group">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="输入问题以追踪事实来源..."
                  className="w-full bg-slate-800 border border-slate-700/50 text-slate-200 placeholder-slate-500 pl-4 pr-14 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-slate-800/80 transition-all shadow-lg shadow-black/20"
                  disabled={status === AnalysisStatus.ANALYZING}
                />
                <div className="absolute right-2 top-2 bottom-2">
                  <button
                    type="submit"
                    disabled={status === AnalysisStatus.ANALYZING || !query.trim()}
                    className="h-full aspect-square bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-lg flex items-center justify-center transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    {status === AnalysisStatus.ANALYZING ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <ArrowUp size={20} strokeWidth={2.5} />
                    )}
                  </button>
                </div>
              </form>
              <div className="text-center mt-3">
                <p className="text-[10px] text-slate-500">
                   VeriFact 可能会产生错误。请始终核对重要信息。由 Gemini Grounding 提供支持。
                </p>
              </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;