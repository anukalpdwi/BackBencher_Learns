import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import {
  Users,
  Calendar,
  Plus,
  Clock,
  BookOpen,
  MessageCircle,
  Video,
  Loader2,
  Search,
  Filter,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { isUnauthorizedError } from "@/lib/authUtils";

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  level?: number;
}

interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  nextSession?: string;
  creator: User;
  isActive: boolean;
  createdAt: string;
}

export default function StudyGroups() {
  const [searchTerm, setSearchTerm] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
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

  // Fetch study groups
  const { data: studyGroups, isLoading: groupsLoading } = useQuery({
    queryKey: ["/api/study-groups"],
    enabled: isAuthenticated,
  });

  // Create study group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (groupData: { name: string; description?: string }) => {
      const response = await apiRequest("POST", "/api/study-groups", groupData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-groups"] });
      setNewGroupName("");
      setNewGroupDescription("");
      setIsDialogOpen(false);
      toast({
        title: "Study Group Created",
        description: "Your study group has been created successfully!",
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
        description: "Failed to create study group. Please try again.",
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

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a group name.",
        variant: "destructive",
      });
      return;
    }

    createGroupMutation.mutate({
      name: newGroupName,
      description: newGroupDescription.trim() || undefined,
    });
  };

  const filteredGroups = (studyGroups as StudyGroup[])?.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Study Groups</h1>
            <p className="text-muted-foreground">
              Collaborate with peers, share knowledge, and learn together
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-secondary text-white mt-4 sm:mt-0" data-testid="button-create-group">
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Study Group</DialogTitle>
                <DialogDescription>
                  Start a new study group and invite others to join your learning journey.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="group-name">Group Name</Label>
                  <Input
                    id="group-name"
                    placeholder="e.g., React Developers Study Circle"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    data-testid="input-group-name"
                  />
                </div>
                <div>
                  <Label htmlFor="group-description">Description (Optional)</Label>
                  <Textarea
                    id="group-description"
                    placeholder="What will this group focus on?"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    data-testid="textarea-group-description"
                  />
                </div>
                <Button
                  onClick={handleCreateGroup}
                  disabled={createGroupMutation.isPending}
                  className="w-full"
                  data-testid="button-submit-create-group"
                >
                  {createGroupMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Users className="mr-2 h-4 w-4" />
                  )}
                  Create Study Group
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search study groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-groups"
                />
              </div>
              <Button variant="outline" data-testid="button-filter">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Featured Groups */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Featured Groups</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-primary text-white">Live Now</Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-1 h-4 w-4" />
                    24 members
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">JavaScript Fundamentals</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Daily sessions covering ES6+, async programming, and modern JavaScript patterns.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-4 w-4" />
                    Next: Today 7PM
                  </div>
                  <Button size="sm" data-testid="button-join-featured-1">
                    Join Live
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-success/10 to-emerald-100/50 border-success/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className="border-success text-success">Popular</Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-1 h-4 w-4" />
                    18 members
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">Machine Learning Basics</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Introduction to ML algorithms, Python libraries, and practical projects.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-4 w-4" />
                    Next: Tomorrow 6PM
                  </div>
                  <Button size="sm" variant="outline" data-testid="button-join-featured-2">
                    Join Group
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-warning/10 to-yellow-100 border-warning/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className="border-warning text-warning">New</Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-1 h-4 w-4" />
                    5 members
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">System Design Study</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Prepare for technical interviews with system design practice sessions.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-4 w-4" />
                    Next: Saturday 2PM
                  </div>
                  <Button size="sm" variant="outline" data-testid="button-join-featured-3">
                    Join Group
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All Study Groups */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">All Study Groups</h2>
          {groupsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-48">
                  <CardContent className="p-6">
                    <div className="shimmer h-4 w-20 mb-4 rounded" />
                    <div className="shimmer h-6 w-full mb-2 rounded" />
                    <div className="shimmer h-16 w-full mb-4 rounded" />
                    <div className="shimmer h-8 w-24 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !studyGroups || studyGroups.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Study Groups Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to create a study group and start learning with others!
                </p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  data-testid="button-create-first-group"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Group
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <Card key={group.id} className="learning-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge
                        variant={group.isActive ? "default" : "secondary"}
                        className={group.isActive ? "bg-success text-white" : ""}
                      >
                        {group.isActive ? "Live" : "Offline"}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-1 h-4 w-4" />
                        {group.memberCount} members
                      </div>
                    </div>

                    <h3 className="font-semibold text-lg mb-2" data-testid={`text-group-name-${group.id}`}>
                      {group.name}
                    </h3>
                    
                    {group.description && (
                      <p className="text-muted-foreground text-sm mb-4">
                        {group.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-2 mb-4">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={group.creator.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-primary text-white text-xs">
                          {getInitials(group.creator)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        Created by {group.creator.firstName || "Anonymous"}
                      </span>
                    </div>

                    {group.nextSession && (
                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <Clock className="mr-1 h-4 w-4" />
                        Next session: {formatDistanceToNow(new Date(group.nextSession))}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        variant={group.isActive ? "default" : "outline"}
                        onClick={() => joinGroupMutation.mutate(group.id)}
                        disabled={joinGroupMutation.isPending}
                        data-testid={`button-join-group-${group.id}`}
                      >
                        {joinGroupMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : group.isActive ? (
                          <Video className="mr-2 h-4 w-4" />
                        ) : (
                          <Users className="mr-2 h-4 w-4" />
                        )}
                        {group.isActive ? "Join Live" : "Join Group"}
                      </Button>
                      <Button size="sm" variant="ghost" data-testid={`button-message-group-${group.id}`}>
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
