import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import confetti from 'canvas-confetti';

interface Point {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface TMTCanvasProps {
  type: string;
  onComplete: (duration: number, errors: number) => void;
  onCancel: () => void;
}

export default function TMTCanvas({ type, onComplete, onCancel }: TMTCanvasProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  // Live timer effect
  useEffect(() => {
    if (startTime && !isFinished) {
      timerRef.current = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [startTime, isFinished]);

  // Generate sequence based on type
  const sequence = useMemo(() => {
    if (type === 'TMT-A') {
      return Array.from({ length: 25 }, (_, i) => (i + 1).toString());
    } else if (type === 'TMT-B') {
      const nums = Array.from({ length: 13 }, (_, i) => (i + 1).toString());
      const chars = Array.from({ length: 12 }, (_, i) => String.fromCharCode(65 + i)); // A-L
      const res = [];
      for (let i = 0; i < nums.length; i++) {
        res.push(nums[i]);
        if (chars[i]) res.push(chars[i]);
      }
      return res;
    } else if (type === 'Level-1') {
      return Array.from({ length: 10 }, (_, i) => (i + 1).toString());
    } else if (type === 'Level-2') {
      return Array.from({ length: 20 }, (_, i) => (i + 1).toString());
    } else if (type === 'Level-3') {
      return ['1', 'A', '2', 'B', '3', 'C', '4', 'D'];
    } else if (type === 'Level-4') {
      const nums = Array.from({ length: 8 }, (_, i) => (i + 1).toString());
      const chars = Array.from({ length: 8 }, (_, i) => String.fromCharCode(65 + i));
      const res = [];
      for (let i = 0; i < 8; i++) {
        res.push(nums[i]);
        res.push(chars[i]);
      }
      return res;
    } else if (type === 'Level-5') {
      const nums = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
      const chars = Array.from({ length: 12 }, (_, i) => String.fromCharCode(65 + i));
      const res = [];
      for (let i = 0; i < 12; i++) {
        res.push(nums[i]);
        res.push(chars[i]);
      }
      return res;
    } else {
      // Default / Levels 4-5
      return Array.from({ length: 15 }, (_, i) => (i + 1).toString());
    }
  }, [type]);

  const generatePoints = () => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const padding = 60;
    const newPoints: Point[] = [];
    const minDistance = 80;

    sequence.forEach((label) => {
      let x, y, tooClose;
      let attempts = 0;
      do {
        x = padding + Math.random() * (width - padding * 2);
        y = padding + Math.random() * (height - padding * 2);
        tooClose = newPoints.some(p => Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2) < minDistance);
        attempts++;
      } while (tooClose && attempts < 100);

      newPoints.push({ id: label, label, x, y });
    });

    setPoints(newPoints);
    setCurrentIndex(0);
    setStartTime(null);
    setErrors(0);
    setLines([]);
    setElapsedTime(0);
    setIsFinished(false);
  };

  useEffect(() => {
    generatePoints();
    const handleResize = () => generatePoints();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sequence]);

  const handlePointClick = (point: Point, index: number) => {
    if (isFinished) return;

    if (index === currentIndex) {
      if (currentIndex === 0 && !startTime) {
        setStartTime(Date.now());
      }

      if (currentIndex > 0) {
        setLines(prev => [...prev, {
          x1: points[currentIndex - 1].x,
          y1: points[currentIndex - 1].y,
          x2: point.x,
          y2: point.y
        }]);
      }

      if (currentIndex === sequence.length - 1) {
        const endTime = Date.now();
        const duration = (endTime - (startTime || endTime)) / 1000;
        setElapsedTime(duration);
        setIsFinished(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => onComplete(duration, errors), 1500);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    } else if (index > currentIndex) {
      setErrors(prev => prev + 1);
      // Visual feedback for error?
    }
  };

  return (
    <div className="flex flex-col h-screen bg-stone-50 overflow-hidden font-sans" dir="rtl">
      {/* Stats Bar */}
      <div className="p-6 bg-stone-50">
        <div className="grid grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="text-center border-l border-stone-100 last:border-l-0">
            <div className="text-lg font-black text-primary">{elapsedTime.toFixed(1)} ث</div>
            <div className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">الزمن الحالي</div>
          </div>
          <div className="text-center border-l border-stone-100 last:border-l-0">
            <div className="text-lg font-black text-primary">{errors}</div>
            <div className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">الأخطاء</div>
          </div>
          <div className="text-center border-l border-stone-100 last:border-l-0">
            <div className="text-lg font-black text-primary">{currentIndex} / {sequence.length}</div>
            <div className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">التقدم</div>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <div className="h-full bg-white rounded-2xl border-2 border-dashed border-stone-200 shadow-inner relative overflow-hidden" ref={containerRef}>
          <svg className="absolute inset-0 pointer-events-none w-full h-full">
            {lines.map((line, i) => (
              <motion.line
                key={i}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#3182ce"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ))}
          </svg>

          <div className="relative w-full h-full">
            {points.map((point, index) => (
              <motion.button
                key={point.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handlePointClick(point, index)}
                style={{
                  position: 'absolute',
                  left: point.x,
                  top: point.y,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`
                  w-11 h-11 rounded-full flex items-center justify-center font-bold text-base
                  transition-all duration-200 border-2
                  bg-white text-stone-700 border-stone-300 hover:border-blue-400
                `}
              >
                {point.label}
              </motion.button>
            ))}
          </div>

          <AnimatePresence>
            {!startTime && !isFinished && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-stone-900/5 backdrop-blur-[1px] flex items-center justify-center z-20"
              >
                <div className="bg-white p-8 text-center rounded-2xl border border-stone-200 shadow-2xl max-w-xs">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                    <Play className="w-6 h-6 text-blue-600 ml-1" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 mb-2">جاهز للبدء؟</h3>
                  <p className="text-xs text-stone-500 mb-6 leading-relaxed">
                    ابدأ بالنقر على النقطة الأولى <span className="font-bold text-primary">"{sequence[0]}"</span>.
                    سيتم تتبع المسار بدون إشارات استرشادية لضمان دقة التقييم.
                  </p>
                  <Button onClick={() => handlePointClick(points[0], 0)} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-bold">بدء الاختبار</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="h-16 bg-white border-t border-stone-200 px-6 flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onCancel} className="h-10 text-xs px-4 bg-stone-100 text-stone-600 hover:bg-stone-200">إيقاف مؤقت</Button>
          <Button variant="secondary" onClick={generatePoints} className="h-10 text-xs px-4 bg-stone-100 text-stone-600 hover:bg-stone-200">إعادة الاختبار</Button>
        </div>
        <div>
          <Button disabled className="h-10 text-sm px-6 bg-blue-600 text-white opacity-50 font-bold">تحقق من المسار</Button>
        </div>
      </footer>
    </div>
  );
}
