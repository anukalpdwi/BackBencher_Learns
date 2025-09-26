import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Brain,
  Zap,
  GraduationCap,
  Play,
  BookOpen,
  HelpCircle,
  CreditCard,
  Loader2,
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

type DifficultyLevel = "beginner" | "intermediate" | "advanced";

interface Topic {
  id: string;
  title: string;
  description?: string;
  difficulty: string;
  content?: string;
  progress: number;
  aiGenerated: boolean;
  createdAt: string;
}

export function LearningContent() {
  const [newTopic, setNewTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>("beginner");
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user topics
  const { data: topics, isLoading: topicsLoading } = useQuery<Topic[]>({
    queryKey: ["/api/topics"],
  });

  // Generate AI explanation mutation
  const explainMutation = useMutation({
    mutationFn: async ({ topic, difficulty }: { topic: string; difficulty: DifficultyLevel }) => {
      const response = await apiRequest("POST", "/api/ai/explain", {
        topic,
        difficulty,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data.explanation);
      toast({
        title: "Explanation Generated",
        description: "AI has generated a personalized explanation for your topic.",
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
        description: "Failed to generate explanation. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create topic mutation
  const createTopicMutation = useMutation({
    mutationFn: async (topicData: {
      title: string;
      description?: string;
      difficulty: string;
      content?: string;
      aiGenerated: boolean;
    }) => {
      const response = await apiRequest("POST", "/api/topics", topicData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      setNewTopic("");
      setGeneratedContent("");
      toast({
        title: "Topic Created",
        description: "Your learning topic has been saved successfully.",
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
        description: "Failed to create topic. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate quiz mutation
  const generateQuizMutation = useMutation({
    mutationFn: async ({ topic, topicId }: { topic: string; topicId: string }) => {
      const response = await apiRequest("POST", "/api/ai/quiz", {
        topic,
        topicId,
        questionCount: 5,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Quiz Generated",
        description: "A new quiz has been created for this topic.",
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
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate flashcards mutation
  const generateFlashcardsMutation = useMutation({
    mutationFn: async ({ topic, topicId }: { topic: string; topicId: string }) => {
      const response = await apiRequest("POST", "/api/ai/flashcards", {
        topic,
        topicId,
        cardCount: 10,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Flashcards Generated",
        description: "New flashcards have been created for this topic.",
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
        description: "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateExplanation = () => {
    if (!newTopic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic to learn about.",
        variant: "destructive",
      });
      return;
    }

    explainMutation.mutate({
      topic: newTopic,
      difficulty: selectedDifficulty,
    });
  };

  const handleSaveTopic = () => {
    if (!newTopic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic title.",
        variant: "destructive",
      });
      return;
    }

    createTopicMutation.mutate({
      title: newTopic,
      difficulty: selectedDifficulty,
      content: generatedContent,
      aiGenerated: !!generatedContent,
    });
  };

  const difficultyOptions = [
    {
      value: "beginner" as const,
      label: "Like I'm 10",
      description: "Simple explanations",
      icon: <Brain className="h-5 w-5" />,
      color: "bg-green-100 border-green-200 text-green-800 hover:bg-green-200",
    },
    {
      value: "intermediate" as const,
      label: "Quick Revision",
      description: "Key points only",
      icon: <Zap className="h-5 w-5" />,
      color: "bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200",
    },
    {
      value: "advanced" as const,
      label: "College Level",
      description: "In-depth analysis",
      icon: <GraduationCap className="h-5 w-5" />,
      color: "bg-purple-100 border-purple-200 text-purple-800 hover:bg-purple-200",
    },
  ];

  return (
    <div className="space-y-8">
      {/* AI-Powered Learning Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">AI-Powered Learning</CardTitle>
            <Button
              className="bg-gradient-to-r from-primary to-secondary text-white"
              data-testid="button-new-topic"
            >
              <Brain className="mr-2 h-4 w-4" />
              New Topic
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Topic Input */}
          <div className="space-y-3">
            <Label htmlFor="topic-input">What would you like to learn today?</Label>
            <div className="flex gap-3">
              <Input
                id="topic-input"
                placeholder="e.g., Machine Learning, React Hooks, Quantum Physics..."
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="flex-1"
                data-testid="input-topic"
              />
              <Button
                onClick={handleGenerateExplanation}
                disabled={explainMutation.isPending}
                data-testid="button-generate"
              >
                {explainMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Generate
              </Button>
            </div>
          </div>

          {/* Difficulty Modes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {difficultyOptions.map((option) => (
              <Button
                key={option.value}
                variant="outline"
                className={`p-4 h-auto flex-col space-y-2 ${
                  selectedDifficulty === option.value
                    ? "ring-2 ring-primary border-primary"
                    : ""
                } ${option.color}`}
                onClick={() => setSelectedDifficulty(option.value)}
                data-testid={`button-difficulty-${option.value}`}
              >
                {option.icon}
                <div className="text-center">
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs opacity-75">{option.description}</div>
                </div>
              </Button>
            ))}
          </div>

          {/* AI Generated Content */}
          {generatedContent && (
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">{newTopic}</h4>
                    <div className="text-muted-foreground mb-3 whitespace-pre-wrap">
                      {generatedContent}
                    </div>
                    <div className="flex gap-2 mb-4">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        AI Generated
                      </Badge>
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        {difficultyOptions.find((opt) => opt.value === selectedDifficulty)?.label}
                      </Badge>
                    </div>
                    <Button
                      onClick={handleSaveTopic}
                      disabled={createTopicMutation.isPending}
                      data-testid="button-save-topic"
                    >
                      {createTopicMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <BookOpen className="mr-2 h-4 w-4" />
                      )}
                      Save Topic
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Continue Learning Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Continue Learning</CardTitle>
        </CardHeader>
        <CardContent>
          {topicsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !topics || topics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No learning topics yet. Create your first topic above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topics.map((topic) => (
                <Card
                  key={topic.id}
                  className="bg-gradient-to-r from-primary/5 to-secondary/5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold" data-testid={`text-topic-title-${topic.id}`}>
                            {topic.title}
                          </h4>
                          <p className="text-muted-foreground text-sm">
                            {topic.difficulty} • {Math.round((Date.now() - new Date(topic.createdAt).getTime()) / (1000 * 60))} min ago
                          </p>
                        </div>
                      </div>
                      <Button size="sm" data-testid={`button-continue-${topic.id}`}>
                        <Play className="mr-2 h-4 w-4" />
                        Continue
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{topic.progress}%</span>
                      </div>
                      <Progress value={topic.progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Practice & Assessment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Practice & Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-warning/10 to-yellow-100 border-warning/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-warning rounded-lg flex items-center justify-center">
                    <HelpCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">AI-Generated Quiz</h4>
                    <p className="text-muted-foreground text-sm">Test your knowledge</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Generate adaptive questions tailored to your learning level.
                </p>
                <Button
                  className="w-full bg-warning text-white hover:bg-warning/90"
                  onClick={() => {
                    if (topics && topics.length > 0) {
                      generateQuizMutation.mutate({ topic: topics[0].title, topicId: topics[0].id });
                    } else {
                      toast({
                        title: "Error",
                        description: "Please create a topic first.",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={generateQuizMutation.isPending}
                  data-testid="button-generate-quiz"
                >
                  {generateQuizMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Generate Quiz
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-red-100 border-accent/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Flashcards</h4>
                    <p className="text-muted-foreground text-sm">Spaced repetition</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  AI-generated flashcards for optimal memory retention.
                </p>
                <Button
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => {
                    if (topics && topics.length > 0) {
                      generateFlashcardsMutation.mutate({ topic: topics[0].title, topicId: topics[0].id });
                    } else {
                      toast({
                        title: "Error",
                        description: "Please create a topic first.",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={generateFlashcardsMutation.isPending}
                  data-testid="button-generate-flashcards"
                >
                  {generateFlashcardsMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Create Flashcards
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}