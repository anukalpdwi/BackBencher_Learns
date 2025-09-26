import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import {
  Mic,
  Play,
  Pause,
  RotateCcw,
  Brain,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Award,
  Loader2,
  Lightbulb,
  MessageSquare,
  Video,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isUnauthorizedError } from "@/lib/authUtils";

interface InterviewQuestion {
  question: string;
  tips?: string;
}

interface InterviewSession {
  id: string;
  role: string;
  level: string;
  questions: string[];
  tips: string;
  createdAt: string;
}

const interviewTypes = [
  { value: "software-engineer", label: "Software Engineer" },
  { value: "data-scientist", label: "Data Scientist" },
  { value: "product-manager", label: "Product Manager" },
  { value: "frontend-developer", label: "Frontend Developer" },
  { value: "backend-developer", label: "Backend Developer" },
  { value: "devops-engineer", label: "DevOps Engineer" },
  { value: "designer", label: "UX/UI Designer" },
  { value: "marketing", label: "Marketing Specialist" },
];

const experienceLevels = [
  { value: "entry", label: "Entry Level (0-2 years)" },
  { value: "intermediate", label: "Intermediate (2-5 years)" },
  { value: "senior", label: "Senior (5+ years)" },
  { value: "lead", label: "Lead/Principal" },
];

export default function InterviewPrep() {
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("intermediate");
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [tips, setTips] = useState("");
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Generate interview questions mutation
  const generateQuestionsMutation = useMutation({
    mutationFn: async ({ role, level }: { role: string; level: string }) => {
      const response = await apiRequest("POST", "/api/ai/interview", {
        role,
        level,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setQuestions(data.questions);
      setTips(data.tips);
      setSessionStarted(true);
      setCurrentQuestion(0);
      toast({
        title: "Interview Session Ready",
        description: "AI has generated personalized interview questions for you.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate interview questions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStartSession = () => {
    if (!selectedRole) {
      toast({
        title: "Error",
        description: "Please select a role for the interview preparation.",
        variant: "destructive",
      });
      return;
    }

    generateQuestionsMutation.mutate({
      role: selectedRole,
      level: selectedLevel,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setIsRecording(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setIsRecording(false);
    }
  };

  const handleRestartSession = () => {
    setSessionStarted(false);
    setCurrentQuestion(0);
    setIsRecording(false);
    setQuestions([]);
    setTips("");
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({
        title: "Recording Started",
        description: "Practice your answer. Click again to stop recording.",
      });
    } else {
      toast({
        title: "Recording Stopped",
        description: "Great! Move to the next question when ready.",
      });
    }
  };

  const mockInterviewHistory = [
    {
      date: "2024-01-15",
      role: "Software Engineer",
      level: "Intermediate",
      score: 85,
      duration: "45 min",
      questions: 8,
    },
    {
      date: "2024-01-10",
      role: "Frontend Developer",
      level: "Senior",
      score: 78,
      duration: "40 min",
      questions: 7,
    },
    {
      date: "2024-01-08",
      role: "Data Scientist",
      level: "Entry",
      score: 92,
      duration: "35 min",
      questions: 6,
    },
  ];

  const interviewTips = [
    {
      title: "Technical Questions",
      content: "Break down complex problems step by step. Explain your thought process clearly.",
      icon: <Brain className="h-5 w-5" />,
    },
    {
      title: "Behavioral Questions",
      content: "Use the STAR method: Situation, Task, Action, Result for structured answers.",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Communication",
      content: "Speak clearly, maintain eye contact, and ask clarifying questions when needed.",
      icon: <Video className="h-5 w-5" />,
    },
    {
      title: "Problem Solving",
      content: "Think out loud, consider multiple approaches, and discuss trade-offs.",
      icon: <Lightbulb className="h-5 w-5" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Interview Preparation</h1>
          <p className="text-muted-foreground">
            Practice with AI-powered mock interviews tailored to your target role
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Interview Area */}
          <div className="lg:col-span-2 space-y-6">
            {!sessionStarted ? (
              /* Setup Screen */
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mic className="h-6 w-6 text-primary" />
                    <span>Start Interview Practice</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="role-select">Select Target Role</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger id="role-select" data-testid="select-role">
                        <SelectValue placeholder="Choose your target role" />
                      </SelectTrigger>
                      <SelectContent>
                        {interviewTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="level-select">Experience Level</Label>
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger id="level-select" data-testid="select-level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2 text-warning" />
                      What to Expect
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 5-8 tailored interview questions</li>
                      <li>• Mix of technical and behavioral questions</li>
                      <li>• Real-time recording practice</li>
                      <li>• AI-generated tips and feedback</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleStartSession}
                    disabled={generateQuestionsMutation.isPending}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white"
                    data-testid="button-start-interview"
                  >
                    {generateQuestionsMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-4 w-4" />
                    )}
                    Start AI Interview Practice
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* Interview Session */
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-6 w-6 text-primary" />
                      <span>Interview Session</span>
                    </CardTitle>
                    <Badge variant="outline">
                      Question {currentQuestion + 1} of {questions.length}
                    </Badge>
                  </div>
                  <Progress value={((currentQuestion + 1) / questions.length) * 100} className="mt-2" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border-l-4 border-l-primary">
                    <h3 className="font-semibold mb-2 text-lg">
                      {questions[currentQuestion]}
                    </h3>
                  </div>

                  {/* Recording Controls */}
                  <div className="flex items-center justify-center space-x-4 py-8">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestion === 0}
                      data-testid="button-previous-question"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </Button>

                    <Button
                      size="lg"
                      onClick={toggleRecording}
                      className={`w-20 h-20 rounded-full ${
                        isRecording
                          ? "bg-destructive hover:bg-destructive/90"
                          : "bg-primary hover:bg-primary/90"
                      }`}
                      data-testid="button-toggle-recording"
                    >
                      {isRecording ? (
                        <Pause className="h-8 w-8 text-white" />
                      ) : (
                        <Mic className="h-8 w-8 text-white" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleNextQuestion}
                      disabled={currentQuestion === questions.length - 1}
                      data-testid="button-next-question"
                    >
                      <Play className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-muted-foreground">
                      {isRecording ? (
                        <span className="flex items-center justify-center text-destructive">
                          <div className="w-2 h-2 bg-destructive rounded-full mr-2 animate-pulse" />
                          Recording in progress...
                        </span>
                      ) : (
                        "Click the microphone to start recording your answer"
                      )}
                    </p>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={handleRestartSession}
                      data-testid="button-restart-session"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restart Session
                    </Button>

                    {currentQuestion === questions.length - 1 && (
                      <Button
                        className="bg-success text-white"
                        data-testid="button-finish-session"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Finish Session
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips Section */}
            {sessionStarted && tips && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-warning" />
                    <span>AI Tips for This Role</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{tips}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Interview Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interview Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {interviewTips.map((tip, index) => (
                  <div key={index} className="border-l-4 border-l-primary pl-4">
                    <h4 className="font-semibold flex items-center space-x-2 mb-1">
                      {tip.icon}
                      <span>{tip.title}</span>
                    </h4>
                    <p className="text-sm text-muted-foreground">{tip.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Practice History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Practice History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockInterviewHistory.map((session, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{session.role}</span>
                        <Badge
                          variant={session.score >= 85 ? "default" : session.score >= 70 ? "secondary" : "outline"}
                          className={session.score >= 85 ? "bg-success text-white" : ""}
                        >
                          {session.score}%
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>{session.level} • {session.questions} questions</p>
                        <p>{session.duration} • {session.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-sm">Average Score</span>
                  </div>
                  <span className="font-semibold">85%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm">Sessions Completed</span>
                  </div>
                  <span className="font-semibold">12</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Total Practice Time</span>
                  </div>
                  <span className="font-semibold">8.5 hrs</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-warning" />
                    <span className="text-sm">Best Performance</span>
                  </div>
                  <span className="font-semibold">92%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
