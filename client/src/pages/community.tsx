import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Award,
  Users,
  Loader2,
  Trophy,
  Star,
  Flame,
  BookOpen,
  Target,
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  level?: number;
  xp?: number;
  streak?: number;
}

interface Post {
  id: string;
  content: string;
  type: string;
  metadata?: any;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  user: User;
}

interface Achievement {
  id: string;
  type: string;
  title: string;
  description?: string;
  earnedAt: string;
  userId: string;
}

export default function Community() {
  const [newPost, setNewPost] = useState("");
  const [activeTab, setActiveTab] = useState("feed");
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();

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

  // Fetch feed posts
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/feed"],
    enabled: isAuthenticated,
  });

  // Fetch user achievements
  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ["/api/user/achievements"],
    enabled: isAuthenticated,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/posts", {
        content,
        type: "general",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      setNewPost("");
      toast({
        title: "Post Shared",
        description: "Your post has been shared with the community!",
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
        description: "Failed to share post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest("POST", `/api/posts/${postId}/like`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
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
    },
  });

  const getInitials = (user: User) => {
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  const handleSharePost = () => {
    if (!newPost.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content to share.",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate(newPost);
  };

  const leaderboardData = [
    { rank: 1, name: "Sarah Chen", xp: 12450, level: 25, avatar: null },
    { rank: 2, name: "Alex Rodriguez", xp: 11200, level: 22, avatar: null },
    { rank: 3, name: "Jordan Park", xp: 10800, level: 21, avatar: null },
    { rank: 4, name: "Taylor Swift", xp: 9600, level: 19, avatar: null },
    { rank: 5, name: "Morgan Davis", xp: 9200, level: 18, avatar: null },
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
          <h1 className="text-3xl font-bold mb-2">Learning Community</h1>
          <p className="text-muted-foreground">
            Share your progress, celebrate achievements, and connect with fellow learners
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="feed" data-testid="tab-feed">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Feed
                </TabsTrigger>
                <TabsTrigger value="trending" data-testid="tab-trending">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="achievements" data-testid="tab-achievements">
                  <Award className="mr-2 h-4 w-4" />
                  Achievements
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="space-y-6">
                {/* Post Creation */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarImage src={user?.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-primary text-white">
                          {user ? getInitials(user) : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Share your learning journey, ask questions, or celebrate achievements..."
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          className="min-h-20 resize-none"
                          data-testid="textarea-new-post"
                        />
                        <div className="flex justify-between items-center mt-4">
                          <div className="text-sm text-muted-foreground">
                            Share your progress with the community
                          </div>
                          <Button
                            onClick={handleSharePost}
                            disabled={createPostMutation.isPending}
                            data-testid="button-share-post"
                          >
                            {createPostMutation.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Feed Posts */}
                <div className="space-y-6">
                  {postsLoading ? (
                    [...Array(3)].map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="shimmer w-10 h-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <div className="shimmer h-4 w-32 rounded" />
                              <div className="shimmer h-16 w-full rounded" />
                              <div className="shimmer h-4 w-48 rounded" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : !posts || posts.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
                        <p className="text-muted-foreground">
                          Be the first to share your learning progress with the community!
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    (posts as Post[]).map((post) => (
                      <Card key={post.id} className="learning-card">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <Avatar>
                              <AvatarImage src={post.user.profileImageUrl || undefined} />
                              <AvatarFallback className="bg-secondary text-white">
                                {getInitials(post.user)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-semibold" data-testid={`text-user-${post.id}`}>
                                  {post.user.firstName || "Anonymous"} {post.user.lastName || ""}
                                </span>
                                {post.user.level && (
                                  <Badge variant="outline" className="text-xs">
                                    Level {post.user.level}
                                  </Badge>
                                )}
                                <span className="text-muted-foreground text-sm">
                                  {formatDistanceToNow(new Date(post.createdAt))} ago
                                </span>
                              </div>
                              <p className="mb-4" data-testid={`text-content-${post.id}`}>
                                {post.content}
                              </p>
                              <div className="flex items-center space-x-6 text-muted-foreground">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 hover:text-accent"
                                  onClick={() => likePostMutation.mutate(post.id)}
                                  data-testid={`button-like-${post.id}`}
                                >
                                  <Heart className="mr-2 h-4 w-4" />
                                  {post.likeCount} likes
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 hover:text-primary"
                                  data-testid={`button-comment-${post.id}`}
                                >
                                  <MessageCircle className="mr-2 h-4 w-4" />
                                  {post.commentCount} comments
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 hover:text-secondary"
                                  data-testid={`button-share-${post.id}`}
                                >
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Share
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="trending" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Trending Topic</h3>
                          <p className="text-sm text-muted-foreground">Machine Learning</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Join 1,247 learners exploring ML fundamentals this week
                      </p>
                      <Button size="sm" data-testid="button-join-trending">
                        Join Discussion
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-success/10 to-emerald-100/50">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Popular Course</h3>
                          <p className="text-sm text-muted-foreground">React Development</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Most completed course this month with 89% success rate
                      </p>
                      <Button size="sm" variant="outline" data-testid="button-start-course">
                        Start Learning
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Challenges</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Target className="h-8 w-8 text-primary" />
                        <div>
                          <h4 className="font-semibold">Complete 5 Quiz Attempts</h4>
                          <p className="text-sm text-muted-foreground">Earn 100 XP</p>
                        </div>
                      </div>
                      <Badge>3/5 Done</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="h-8 w-8 text-secondary" />
                        <div>
                          <h4 className="font-semibold">Join a Study Group</h4>
                          <p className="text-sm text-muted-foreground">Earn 50 XP</p>
                        </div>
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                {achievementsLoading ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <div className="shimmer h-12 w-12 rounded-lg mb-4" />
                          <div className="shimmer h-6 w-32 rounded mb-2" />
                          <div className="shimmer h-4 w-full rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : !achievements || achievements.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Achievements Yet</h3>
                      <p className="text-muted-foreground">
                        Start learning to unlock your first achievement!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {(achievements as Achievement[]).map((achievement) => (
                      <Card key={achievement.id} className="learning-card">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-warning rounded-lg flex items-center justify-center">
                              <Trophy className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{achievement.title}</h4>
                              {achievement.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {achievement.description}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Earned {formatDistanceToNow(new Date(achievement.earnedAt))} ago
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold" data-testid="text-user-xp">
                      {user?.xp || 0} XP
                    </p>
                    <p className="text-muted-foreground text-sm">Total Experience</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-warning rounded-full flex items-center justify-center">
                    <Flame className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold" data-testid="text-user-streak">
                      {user?.streak || 0} Days
                    </p>
                    <p className="text-muted-foreground text-sm">Learning Streak</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold" data-testid="text-user-level">
                      Level {user?.level || 1}
                    </p>
                    <p className="text-muted-foreground text-sm">Current Level</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboardData.map((learner) => (
                    <div key={learner.rank} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        learner.rank === 1 ? 'bg-warning text-white' :
                        learner.rank === 2 ? 'bg-muted-foreground text-white' :
                        learner.rank === 3 ? 'bg-accent text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {learner.rank}
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={learner.avatar || undefined} />
                        <AvatarFallback className="bg-primary text-white text-xs">
                          {learner.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{learner.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {learner.xp.toLocaleString()} XP • Level {learner.level}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline" data-testid="button-find-study-buddy">
                  <Users className="mr-2 h-4 w-4" />
                  Find Study Buddy
                </Button>
                <Button className="w-full" variant="outline" data-testid="button-join-challenge">
                  <Target className="mr-2 h-4 w-4" />
                  Join Challenge
                </Button>
                <Button className="w-full" variant="outline" data-testid="button-explore-topics">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Explore Topics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
