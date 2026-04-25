import { useState, useEffect } from 'react';
import { db, auth, logOut } from '../lib/firebase';
import { motion } from 'motion/react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, History, Brain, Award, LogOut, User as UserIcon, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { analyzePerformance } from '../lib/gemini';
import { exportToExcel, exportToPDF } from '../lib/export';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

interface TestResult {
  id: string;
  type: string;
  duration: number;
  errors: number;
  timestamp: any;
  tScore: number;
  percentile: number;
  interpretation: string;
}

export default function Dashboard({ onStartTest }: { onStartTest: (type: string) => void }) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiFeedback, setAiFeedback] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchResults = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'test_results'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestResult));
      setResults(data);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleAIAnalysis = async () => {
    if (results.length < 1) return;
    setAnalyzing(true);
    // Use up to 50 results for a wider historical context
    const history = results.slice(0, 50).map(r => ({ 
      type: r.type, 
      duration: r.duration, 
      errors: r.errors,
      tScore: r.tScore 
    }));
    const analysis = await analyzePerformance(history);
    setAiFeedback(analysis);
    setAnalyzing(false);
  };

  const chartData = [...results].reverse().map(r => ({
    time: format(r.timestamp?.toDate() || new Date(), 'MM/dd'),
    duration: r.duration,
    type: r.type,
    tScore: r.tScore
  }));

  const lastResult = results[0];

  return (
    <div className="flex flex-col h-screen bg-stone-50 overflow-hidden font-sans" dir="rtl">
      {/* Header */}
      <header className="h-16 bg-primary text-white flex items-center justify-between px-6 shadow-md z-20">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-2 rounded-lg">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">NeuroTrack CTMT Pro</h1>
            <p className="text-[10px] opacity-70 uppercase tracking-widest font-black">نظام التقييم المعرفي</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end text-right">
            <span className="text-xs font-bold">{auth.currentUser?.displayName}</span>
            <span className="text-[10px] opacity-60">مستخدم نشط</span>
          </div>
          <Separator orientation="vertical" className="h-6 bg-white/20" />
          <Button variant="ghost" size="icon" onClick={logOut} className="hover:bg-white/10 text-white rounded-full">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-64 bg-white border-l border-stone-200 p-4 flex flex-col gap-2 overflow-y-auto">
          <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 px-2">القائمة الرئيسية</h4>
          <Button variant="ghost" className="justify-start gap-3 bg-blue-50 text-blue-600 border-l-4 border-blue-600 rounded-none h-11">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-bold">لوحة التحكم</span>
          </Button>
          
          <Separator className="my-2" />
          
          <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 px-2">الاختبارات الأساسية</h4>
          <Button 
            variant="ghost" 
            onClick={() => onStartTest('TMT-A')} 
            className="justify-start gap-3 h-11 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors group"
          >
            <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-700 group-hover:bg-emerald-200">A</div>
            <span className="text-sm font-medium">الجزء (أ): التتبع الرقمي</span>
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => onStartTest('TMT-B')} 
            className="justify-start gap-3 h-11 text-amber-700 hover:bg-amber-50 hover:text-amber-800 transition-colors group"
          >
            <div className="w-6 h-6 rounded bg-amber-100 flex items-center justify-center text-[10px] font-black text-amber-700 group-hover:bg-amber-200">B</div>
            <span className="text-sm font-medium">الجزء (ب): التبديل الذهني</span>
          </Button>

          <Separator className="my-2" />
          
          <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 px-2">التدريب التفاعلي</h4>
          {[
            { id: 1, label: 'مستوى ١: مسح بصري (سهل)', desc: '10 نقاط رقمية', color: 'violet' },
            { id: 2, label: 'مستوى ٢: مسح بصري (متقدم)', desc: '20 نقطة رقمية', color: 'violet' },
            { id: 3, label: 'مستوى ٣: مرونة ذهنية (مبتدئ)', desc: '8 نقاط (رقم-حرف)', color: 'indigo' },
            { id: 4, label: 'مستوى ٤: مرونة ذهنية (متوسط)', desc: '16 نقطة (رقم-حرف)', color: 'indigo' },
            { id: 5, label: 'مستوى ٥: مرونة ذهنية (خبير)', desc: '24 نقطة (رقم-حرف)', color: 'indigo' }
          ].map(lvl => (
            <Button 
              key={lvl.id} 
              variant="ghost" 
              onClick={() => onStartTest(`Level-${lvl.id}`)}
              className={`justify-start gap-4 h-14 text-stone-600 hover:bg-${lvl.color}-50 flex flex-col items-start px-2 py-2 transition-all hover:translate-x-[-4px]`}
            >
              <div className="flex items-center gap-3">
                <Award className={`w-4 h-4 text-${lvl.color}-500`} />
                <span className="text-sm font-bold">{lvl.label}</span>
              </div>
              <span className="text-[10px] text-stone-400 pr-7">{lvl.desc}</span>
            </Button>
          ))}
          <div className="mt-auto pt-6 border-t border-stone-100 italic px-2">
            <p className="text-[10px] text-stone-400 font-bold leading-relaxed">
              تصميم وبرمجة: <br />
              <span className="text-stone-900">دكتور. أحمد حمدي عاشور الغول</span> <br />
              دكتوراه في علم النفس التربوي
            </p>
          </div>
        </aside>

        {/* Main Content Dashboard */}
        <main className="flex-1 flex flex-col gap-6 p-6 overflow-y-auto">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <Card className="p-4 flex flex-col items-center justify-center bg-white shadow-sm border-stone-200 border-b-4 border-b-blue-500">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">آخر درجة</span>
                <span className="text-2xl font-black text-blue-600">{lastResult?.tScore || '--'}</span>
             </Card>
             <Card className="p-4 flex flex-col items-center justify-center bg-white shadow-sm border-stone-200 border-b-4 border-b-teal-500">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">متوسط العمليات</span>
                <span className="text-2xl font-black text-teal-600">{lastResult?.duration || '--'} ث</span>
             </Card>
             <Card className="p-4 flex flex-col items-center justify-center bg-white shadow-sm border-stone-200 border-b-4 border-b-amber-500">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">الرتبة المئينية</span>
                <span className="text-2xl font-black text-amber-600">{lastResult?.percentile || '--'}%</span>
             </Card>
             <Card className="p-4 flex flex-col items-center justify-center bg-white shadow-sm border-stone-200 border-b-4 border-b-primary">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">الحالة</span>
                <Badge className={lastResult && lastResult.tScore >= 40 ? 'bg-green-500' : 'bg-red-500'}>
                  {lastResult ? lastResult.interpretation.split('(')[0] : '--'}
                </Badge>
             </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            {/* Chart Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Card className="flex-1 p-6 bg-white shadow-sm border-stone-200 min-h-[300px]">
                <h3 className="text-sm font-bold text-stone-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  مؤشر التقدم الزمني (T-Score)
                </h3>
                <div className="h-[250px] w-full">
                  {results.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} orientation="right" />
                        <Tooltip />
                        <Line type="monotone" dataKey="tScore" stroke="#3182ce" strokeWidth={4} dot={{ r: 4, fill: '#3182ce', strokeWidth: 2, stroke: '#fff' }} name="T-Score" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-stone-300 italic text-sm">لا توجد بيانات كافية للرسم البياني</div>
                  )}
                </div>
              </Card>

              <Card className="p-6 bg-white shadow-sm border-stone-200">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                       <History className="w-4 h-4 text-stone-500" />
                       سجل الاختبارات الأخيرة
                    </h3>
                    <div className="flex gap-2">
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={() => exportToExcel(results, auth.currentUser?.displayName || 'User')}
                         className="h-8 text-[10px] gap-2 font-bold text-green-600 hover:text-green-700 hover:bg-green-50"
                         disabled={results.length === 0}
                       >
                         <FileSpreadsheet className="w-3.5 h-3.5" />
                         تصدير Excel
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={() => exportToPDF(results, auth.currentUser?.displayName || 'User')}
                         className="h-8 text-[10px] gap-2 font-bold text-red-600 hover:text-red-700 hover:bg-red-50"
                         disabled={results.length === 0}
                       >
                         <FileText className="w-3.5 h-3.5" />
                         تصدير PDF
                       </Button>
                    </div>
                 </div>
                 <ScrollArea className="h-48">
                   <div className="space-y-3 pl-4">
                     {results.map((r) => (
                       <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-stone-100 bg-stone-50/50">
                         <div className="flex items-center gap-4">
                           <Badge variant="outline" className="font-black text-[10px] w-12 justify-center">{r.type}</Badge>
                           <div className="flex flex-col">
                             <span className="text-xs font-bold text-stone-900">{r.duration} ثانية</span>
                             <span className="text-[10px] text-stone-400">{format(r.timestamp?.toDate() || new Date(), 'MMM d, h:mm a')}</span>
                           </div>
                         </div>
                         <div className="text-right flex flex-col items-end">
                            <span className="text-sm font-black text-primary">{r.tScore}</span>
                            <span className="text-[10px] text-stone-400 capitalize">{r.interpretation.split('(')[0]}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                 </ScrollArea>
              </Card>
            </div>

            {/* AI and Interpretation Panel */}
            <div className="flex flex-col gap-6">
              <Card className="p-6 bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-950 text-white shadow-xl border-none overflow-hidden relative">
                <Sparkles className="absolute top-2 left-2 w-12 h-12 text-white/5" />
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2 relative z-10">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  تحليل الذكاء الاصطناعي
                </h3>
                {aiFeedback ? (
                  <div className="space-y-6 relative z-10">
                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                      <p className="text-xs text-stone-100 leading-relaxed italic">"{aiFeedback.summary}"</p>
                    </div>

                    <div className="space-y-4">
                      {Object.entries(aiFeedback.domains).map(([key, domain]: [string, any]) => (
                        <div key={key}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] uppercase font-bold text-white/70">
                              {key === 'attention_span' ? 'مدى الانتباه' : 
                               key === 'processing_speed' ? 'سرعة المعالجة' : 'تصحيح الأخطاء'}
                            </span>
                            <span className="text-[10px] font-black">{domain.score}%</span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${domain.score}%` }}
                              className="h-full bg-yellow-400" 
                            />
                          </div>
                          <p className="text-[9px] text-stone-300 mt-1 leading-tight">{domain.feedback}</p>
                        </div>
                      ))}
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="space-y-1">
                      <h4 className="text-[10px] font-bold text-white/50 mb-2">التوصيات العلاجية:</h4>
                      {aiFeedback.recommendations.map((rec: string, i: number) => (
                        <div key={i} className="flex gap-2 items-start text-[11px] text-stone-300">
                          <span className="text-yellow-400">•</span>
                          {rec}
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleAIAnalysis} className="w-full text-[10px] text-white/40 hover:text-white/60 hover:bg-white/5 uppercase tracking-widest font-black">إعادة تحليل البيانات</Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-6 text-center space-y-4 relative z-10">
                    <p className="text-xs text-stone-400">احصل على تحليل شامل لنقاط قوتك ومواضع التطوير.</p>
                    <Button disabled={results.length === 0} onClick={handleAIAnalysis} className="bg-white text-primary hover:bg-stone-100 font-bold w-full transition-all">
                      {analyzing ? 'جاري التحليل...' : 'توليد الرؤى المعرفية'}
                    </Button>
                  </div>
                )}
              </Card>

              <Card className="p-6 bg-white shadow-sm border-stone-200 flex-1">
                <h3 className="text-sm font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2">درجات التفسير (T-Score)</h3>
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500">
                      <th className="p-2 font-medium">الدرجة</th>
                      <th className="p-2 font-medium">التفسير</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr><td className="p-2 font-bold">70+</td><td className="p-2">متفوق (مرتفع جداً)</td></tr>
                    <tr><td className="p-2 font-bold">60-69</td><td className="p-2">فوق المتوسط</td></tr>
                    <tr><td className="p-2 font-bold text-blue-600">40-59</td><td className="p-2 font-bold text-blue-600">متوسط (طبيعي)</td></tr>
                    <tr><td className="p-2 font-bold text-orange-600">30-39</td><td className="p-2 text-orange-600">تحت المتوسط (ضعف)</td></tr>
                    <tr><td className="p-2 font-bold text-red-600">&lt; 30</td><td className="p-2 text-red-600">ضعف شديد (خلل)</td></tr>
                  </tbody>
                </table>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
