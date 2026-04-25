import { useState } from 'react';
import { signInWithGoogle } from '../lib/firebase';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Brain, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Auth() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7fafc] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200">
        <div className="p-12 flex flex-col justify-center space-y-8 order-2 md:order-1" dir="rtl">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-[#1a365d] tracking-tight">NeuroTrack Pro</h2>
            <p className="text-stone-500 font-medium">نظام التقييم المعرفي والتدريب النفسي العصبي</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 p-2 rounded-xl text-blue-600 border border-blue-100">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-[#2c5282]">دقة إكلينيكية</h4>
                <p className="text-sm text-stone-500">اختبارات TMT المقننة مع دقة في تسجيل النتائج المعيارية.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 p-2 rounded-xl text-blue-600 border border-blue-100">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-[#2c5282]">رؤى معززة بالذكاء الاصطناعي</h4>
                <p className="text-sm text-stone-500">تحليل فوري وتوصيات ذكية مخصصة لرفع كفاءة العمليات الذهنية.</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSignIn} 
            disabled={loading}
            className="w-full h-14 text-lg font-bold bg-[#3182ce] hover:bg-[#2c5282] rounded-2xl shadow-lg transition-all text-white"
          >
            {loading ? "جاري الاتصال..." : "الدخول بواسطة Google"}
          </Button>

          <p className="text-center text-[10px] text-stone-400 font-bold uppercase tracking-widest">
            قم بتسجيل الدخول بأمان لتتبع تقدمك المذهل
          </p>
        </div>

        <div className="bg-[#1a365d] p-12 relative flex flex-col justify-between overflow-hidden order-1 md:order-2">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2c5282] rounded-full blur-3xl opacity-20 -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2c5282] rounded-full blur-3xl opacity-20 -ml-32 -mb-32" />
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <Brain className="w-6 h-6 text-[#1a365d]" />
            </div>
            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              التقييم. <br />
              التدريب. <br />
              التحسين.
            </h1>
          </div>

          <div className="relative z-10 space-y-4">
             <div className="bg-stone-800/50 backdrop-blur-sm p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Performance Validated
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-green-400"
                  />
                </div>
             </div>
             <p className="text-stone-400 text-xs italic leading-relaxed">
               "The Trail Making Test is a primary tool for assessing executive function and mental flexibility."
             </p>

             <div className="pt-8 mt-8 border-t border-white/5">
                <p className="text-[11px] text-stone-300 font-medium leading-relaxed" dir="rtl">
                  تصميم وبرمجة: <br />
                  <span className="text-white font-black">دكتور. أحمد حمدي عاشور الغول</span> <br />
                  <span className="text-[9px] text-stone-400 uppercase tracking-widest">دكتوراه في علم النفس التربوي</span>
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
