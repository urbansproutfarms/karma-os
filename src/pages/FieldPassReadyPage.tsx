import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ClipboardCheck, CheckCircle, XCircle, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CHECKLIST_ITEMS = [
  'I have reviewed the event details and location',
  'I know what time to arrive and who to report to',
  'I have appropriate clothing and footwear for the task',
  'I have any required personal protective equipment (PPE)',
  'I have water and snacks if needed',
  'I have confirmed my transportation to the site',
  'I have emergency contact information saved',
  'I understand the basic safety rules for this type of work',
  'I have notified someone of my volunteer schedule',
  'I have charged my phone for emergencies',
  'I am physically prepared for the expected activity level',
  'I have read any orientation materials provided',
];

const QUIZ_QUESTIONS = [
  { q: "If you feel unsafe, what should you do first?", a: "Tell the site lead immediately", options: ["Keep working quietly", "Tell the site lead immediately", "Leave without telling anyone"] },
  { q: "Who has final authority on task assignments at the site?", a: "The site lead or supervisor", options: ["The most experienced volunteer", "The site lead or supervisor", "Whoever arrives first"] },
  { q: "What should you do if you do not understand a task?", a: "Ask for clarification before starting", options: ["Figure it out yourself", "Ask for clarification before starting", "Skip the task"] },
  { q: "If you need to leave early, you should:", a: "Notify the site lead before leaving", options: ["Just leave quietly", "Notify the site lead before leaving", "Send a text after you leave"] },
  { q: "If you witness an injury, your first step is:", a: "Alert the site lead or call for help", options: ["Provide first aid yourself", "Alert the site lead or call for help", "Continue working"] },
  { q: "Personal protective equipment (PPE) should be:", a: "Worn as directed by the site lead", options: ["Optional based on comfort", "Worn as directed by the site lead", "Only for paid workers"] },
  { q: "If weather conditions become dangerous:", a: "Follow the site lead instructions", options: ["Keep working to finish faster", "Follow the site lead instructions", "Make your own judgment"] },
  { q: "Volunteers should avoid:", a: "Operating equipment without training", options: ["Asking questions", "Operating equipment without training", "Taking breaks"] },
];

const SKILLS_LADDER = [
  {
    level: "Beginner",
    badge: "bg-emerald-500/10 text-emerald-600",
    description: "New to volunteering or this type of work. Comfortable following clear instructions and asking questions. No prior experience required.",
  },
  {
    level: "Intermediate",
    badge: "bg-amber-500/10 text-amber-600",
    description: "Has some experience with similar tasks. Can work with moderate supervision and help orient newer volunteers. Familiar with basic safety practices.",
  },
  {
    level: "Advanced",
    badge: "bg-primary/10 text-primary",
    description: "Experienced and reliable. Can work independently on familiar tasks, assist with coordination, and mentor others. Strong safety awareness.",
  },
];

export default function FieldPassReadyPage() {
  const navigate = useNavigate();
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const checklistProgress = (checkedItems.size / CHECKLIST_ITEMS.length) * 100;

  const handleCheckItem = (index: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
  };

  const handleQuizAnswer = (qIndex: number, answer: string) => {
    if (!quizSubmitted) {
      setQuizAnswers({ ...quizAnswers, [qIndex]: answer });
    }
  };

  const quizScore = QUIZ_QUESTIONS.reduce((score, q, i) => {
    return quizAnswers[i] === q.a ? score + 1 : score;
  }, 0);

  const quizConfidence = quizSubmitted ? (quizScore / QUIZ_QUESTIONS.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ClipboardCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">FieldPassReady</h1>
              <p className="text-sm text-muted-foreground">
                Volunteer readiness and skills verification
              </p>
            </div>
          </div>
        </div>

        {/* Info */}
        <Card className="mb-6 border-border/50">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              FieldPassReady helps volunteers prepare before arriving on site. Complete the checklist, take the quiz, and understand your skill level.
            </p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="checklist" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="checklist">Readiness Checklist</TabsTrigger>
            <TabsTrigger value="quiz">Common-Sense Quiz</TabsTrigger>
            <TabsTrigger value="skills">Skills Ladder</TabsTrigger>
          </TabsList>

          {/* Checklist Tab */}
          <TabsContent value="checklist">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Pre-Arrival Checklist</CardTitle>
                <CardDescription>
                  Review each item before heading to the volunteer site
                </CardDescription>
                <div className="pt-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{checkedItems.size}/{CHECKLIST_ITEMS.length}</span>
                  </div>
                  <Progress value={checklistProgress} className="h-2" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {CHECKLIST_ITEMS.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={`check-${index}`}
                      checked={checkedItems.has(index)}
                      onCheckedChange={() => handleCheckItem(index)}
                    />
                    <label
                      htmlFor={`check-${index}`}
                      className={`text-sm cursor-pointer flex-1 ${
                        checkedItems.has(index) ? 'text-muted-foreground line-through' : ''
                      }`}
                    >
                      {item}
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Quick Common-Sense Quiz</CardTitle>
                <CardDescription>
                  Test your understanding of basic volunteer safety and etiquette
                </CardDescription>
                {quizSubmitted && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Confidence Meter</span>
                      <span className="font-medium">{quizScore}/{QUIZ_QUESTIONS.length} correct</span>
                    </div>
                    <Progress value={quizConfidence} className="h-2" />
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {QUIZ_QUESTIONS.map((question, qIndex) => (
                  <div key={qIndex} className="space-y-2">
                    <p className="font-medium text-sm">
                      {qIndex + 1}. {question.q}
                    </p>
                    <div className="space-y-2 pl-4">
                      {question.options.map((option) => {
                        const isSelected = quizAnswers[qIndex] === option;
                        const isCorrect = option === question.a;
                        const showResult = quizSubmitted && isSelected;

                        return (
                          <button
                            key={option}
                            onClick={() => handleQuizAnswer(qIndex, option)}
                            disabled={quizSubmitted}
                            className={`w-full text-left p-2 rounded-lg text-sm border transition-colors flex items-center gap-2 ${
                              isSelected
                                ? quizSubmitted
                                  ? isCorrect
                                    ? 'border-emerald-500 bg-emerald-500/10'
                                    : 'border-destructive bg-destructive/10'
                                  : 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            } ${quizSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            {showResult && isCorrect && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                            {showResult && !isCorrect && <XCircle className="h-4 w-4 text-destructive" />}
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {!quizSubmitted && (
                  <Button
                    onClick={() => setQuizSubmitted(true)}
                    disabled={Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length}
                    className="w-full"
                  >
                    Submit Quiz
                  </Button>
                )}
                {quizSubmitted && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuizAnswers({});
                      setQuizSubmitted(false);
                    }}
                    className="w-full"
                  >
                    Retake Quiz
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Ladder Tab */}
          <TabsContent value="skills">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Skills Ladder
                </CardTitle>
                <CardDescription>
                  Understand where you fit and how to grow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {SKILLS_LADDER.map((level) => (
                  <div
                    key={level.level}
                    className="p-4 rounded-lg border border-border/50 space-y-2"
                  >
                    <Badge className={level.badge}>{level.level}</Badge>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            Educational readiness tool only. Always follow the site lead's instructions. No guarantees.
          </p>
        </div>
      </div>
    </div>
  );
}
