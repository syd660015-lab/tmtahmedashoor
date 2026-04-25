import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Dialog as UIDialog, DialogContent as UIDialogContent, DialogHeader as UIDialogHeader, DialogTitle as UIDialogTitle, DialogDescription as UIDialogDescription, DialogFooter as UIDialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { calculateTScore, getInterpretation, getPercentile } from '../lib/norms';
import { CheckCircle2, Trophy, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface Result {
  type: string;
  duration: number;
  errors: number;
}

export default function ResultDialog({ result, onDismiss }: { result: Result | null, onDismiss: () => void }) {
  if (!result) return null;

  const tScore = calculateTScore(result.type, result.duration);
  const interpretation = getInterpretation(tScore);
  const percentile = getPercentile(tScore);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, 'test_results'), {
        userId: auth.currentUser.uid,
        type: result.type,
        duration: result.duration,
        errors: result.errors,
        tScore,
        percentile,
        interpretation,
        timestamp: serverTimestamp()
      });
      onDismiss();
    } catch (error) {
      console.error("Error saving result:", error);
    }
  };

  return (
    <UIDialog open={!!result} onOpenChange={() => onDismiss()}>
      <UIDialogContent className="sm:max-w-md bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl font-sans" dir="rtl">
        <div className="bg-[#1a365d] p-8 text-center text-white relative">
          <div className="absolute top-0 right-0 p-4">
             <Trophy className="w-12 h-12 text-white/5" />
          </div>
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-white/10 rounded-3xl mx-auto flex items-center justify-center mb-4 backdrop-blur-sm"
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>
          <UIDialogTitle className="text-2xl font-black mb-1">اكتمل الاختبار!</UIDialogTitle>
          <UIDialogDescription className="text-blue-200">عمل رائع في إنهاء {result.type}.</UIDialogDescription>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-center">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">الزمن المستغرق</div>
              <div className="text-2xl font-black text-stone-900 flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                {result.duration.toFixed(1)} ث
              </div>
            </div>
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-center">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">إجمالي الأخطاء</div>
              <div className="text-2xl font-black text-stone-900 flex items-center justify-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${result.errors > 0 ? 'text-red-400' : 'text-stone-300'}`} />
                {result.errors}
              </div>
            </div>
          </div>

          <div className="bg-[#1a365d] text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-blue-300 mb-1">تفسير الأداء المعياري</div>
                <div className="text-2xl font-black">{interpretation}</div>
                <div className="text-xs text-blue-400 mt-1">الرتبة المئينية: {percentile}%</div>
              </div>
              <div className="text-left">
                <div className="text-4xl font-black text-white">{tScore}</div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-blue-500">T-Score</div>
              </div>
            </div>
          </div>

          <UIDialogFooter className="flex gap-2">
            <Button variant="ghost" onClick={onDismiss} className="flex-1 rounded-xl h-12 text-stone-400">تجاهل النتيجة</Button>
            <Button onClick={handleSave} className="flex-1 rounded-xl h-12 bg-[#3182ce] hover:bg-[#2c5282] text-white font-bold">حفظ النتائج</Button>
          </UIDialogFooter>
        </div>
      </UIDialogContent>
    </UIDialog>
  );
}
