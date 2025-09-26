import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  BarChart3,
  Loader2,
  Users,
  Calendar,
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  level?: number;
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

interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  nextSession?: string;
  creator: User;
  isActive: boolean;
}

export function SocialFeed() {
  const [newPost, setNewPost] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch feed posts
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/feed"],
  });

  // Fetch study groups
  const { data: studyGroups, isLoading: groupsLoading } = useQuery({
    queryKey: ["/api/study-groups"],
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
        description: "Your learning progress has been shared with the community.",
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
      toast({
        title: "Error",
        description: "Failed to like post.",
        variant: "destructive",
      });
    },
  });

  // Join study group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const response = await apiRequest("POST", `/api/study-groups/${groupId}/join`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-groups"] });
      toast({
        title: "Joined Study Group",
        description: "You've successfully joined the study group!",
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
        description: "Failed to join study group.",
        variant: "destructive",
      });
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

  return (
    <div className="space-y-6">
      {/* Learning Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Learning Feed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Post Creation */}
          <Card className="bg-muted">
            <CardContent className="p-4">
              <Textarea
                placeholder="Share your learning progress..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="border-0 bg-transparent resize-none focus:ring-0 focus:border-0"
                rows={2}
                data-testid="textarea-new-post"
              />
              <div className="flex justify-between items-center mt-2">
                <div className="flex space-x-2 text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:text-primary"
                    data-testid="button-add-image"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:text-primary"
                    data-testid="button-add-chart"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
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
            </CardContent>
          </Card>

          {/* Feed Posts */}
          <div className="space-y-4">
            {postsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : !posts || posts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No posts yet. Be the first to share your learning progress!</p>
              </div>
            ) : (
              (posts as Post[]).map((post) => (
                <div key={post.id} className="border-b border-border pb-4 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={post.user.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-secondary text-white text-xs">
                        {getInitials(post.user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-sm" data-testid={`text-user-${post.id}`}>
                          {post.user.firstName || "Anonymous"} {post.user.lastName || ""}
                        </span>
                        {post.user.level && (
                          <Badge variant="outline" className="text-xs">
                            Level {post.user.level}
                          </Badge>
                        )}
                        <span className="text-muted-foreground text-xs">
                          {formatDistanceToNow(new Date(post.createdAt))} ago
                        </span>
                      </div>
                      <p className="text-sm mb-2" data-testid={`text-content-${post.id}`}>
                        {post.content}
                      </p>
                      <div className="flex items-center space-x-4 text-muted-foreground text-xs">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 hover:text-accent"
                          onClick={() => likePostMutation.mutate(post.id)}
                          data-testid={`button-like-${post.id}`}
                        >
                          <Heart className="mr-1 h-3 w-3" />
                          {post.likeCount}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 hover:text-primary"
                          data-testid={`button-comment-${post.id}`}
                        >
                          <MessageCircle className="mr-1 h-3 w-3" />
                          {post.commentCount}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 hover:text-secondary"
                          data-testid={`button-share-${post.id}`}
                        >
                          <Share2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Study Groups */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Study Groups</CardTitle>
        </CardHeader>
        <CardContent>
          {groupsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !studyGroups || studyGroups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No study groups available. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(studyGroups as StudyGroup[]).map((group) => (
                <Card key={group.id} className="bg-muted">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm" data-testid={`text-group-name-${group.id}`}>
                        {group.name}
                      </h4>
                      <Badge
                        variant={group.isActive ? "default" : "secondary"}
                        className={group.isActive ? "bg-success text-white" : ""}
                      >
                        {group.isActive ? "Live" : "Offline"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      <Users className="inline h-3 w-3 mr-1" />
                      {group.memberCount} members
                      {group.nextSession && (
                        <>
                          {" • "}
                          <Calendar className="inline h-3 w-3 mr-1" />
                          Next: {formatDistanceToNow(new Date(group.nextSession))}
                        </>
                      )}
                    </p>
                    <Button
                      size="sm"
                      className="w-full"
                      variant={group.isActive ? "default" : "outline"}
                      onClick={() => joinGroupMutation.mutate(group.id)}
                      disabled={joinGroupMutation.isPending}
                      data-testid={`button-join-group-${group.id}`}
                    >
                      {joinGroupMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {group.isActive ? "Join Now" : "Schedule"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
