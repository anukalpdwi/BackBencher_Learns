import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Flame, Star, Upload, Brain, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ProgressSidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const handleFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.txt,.doc,.docx";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        
        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          
          if (response.ok) {
            // Handle successful upload
            console.log("File uploaded successfully");
          }
        } catch (error) {
          console.error("Upload error:", error);
        }
      }
    };
    input.click();
  };

  return (
    <aside className="space-y-6">
      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-success" data-testid="text-xp">
                  {user.xp || 0} XP
                </p>
                <p className="text-muted-foreground text-sm">Total Experience</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-warning rounded-full flex items-center justify-center">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-warning" data-testid="text-streak">
                  {user.streak || 0} Days
                </p>
                <p className="text-muted-foreground text-sm">Learning Streak</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-secondary" data-testid="text-level">
                  Level {user.level || 1}
                </p>
                <p className="text-muted-foreground text-sm">Learning Level</p>
              </div>
            </div>
          </div>

          {/* Progress to next level */}
          <div className="pt-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Level Progress</span>
              <span>{((user.xp || 0) % 1000) || 0}/1000 XP</span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(((user.xp || 0) % 1000) / 10, 100)}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full bg-primary text-primary-foreground hover:opacity-90"
            onClick={handleFileUpload}
            data-testid="button-upload-content"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Content
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            data-testid="button-ai-interview"
          >
            <Brain className="mr-2 h-4 w-4" />
            AI Interview Prep
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            data-testid="button-join-study-group"
          >
            <Users className="mr-2 h-4 w-4" />
            Join Study Group
          </Button>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-success/10 text-success">
                <Trophy className="h-3 w-3 mr-1" />
                First Quiz
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-warning/10 text-warning">
                <Flame className="h-3 w-3 mr-1" />
                7 Day Streak
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Star className="h-3 w-3 mr-1" />
                Level Up
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
