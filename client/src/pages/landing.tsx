import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  TrendingUp,
  Gamepad2,
  Users,
  Mic,
  GraduationCap,
  Trophy,
  Zap,
  Star,
  ChevronRight,
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                AI-Powered Learning That Adapts to{" "}
                <span className="text-yellow-300">You</span>
              </h1>
              <p className="text-xl mb-8 text-purple-100">
                Personalized education with AI integration, adaptive learning engine, 
                and gamified progress tracking. Learn faster, remember longer.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-primary hover:bg-gray-100"
                  data-testid="button-get-started"
                >
                  <a href="/api/login">
                    Start Learning Free
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-primary"
                  data-testid="button-watch-demo"
                >
                  Watch Demo
                </Button>
              </div>
            </div>

            <div className="relative">
              {/* Dashboard Preview */}
              <Card className="bg-white shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-semibold">Welcome back!</h3>
                        <p className="text-gray-500 text-sm">Level 12 • 2,450 XP</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl text-gray-900 font-bold">🔥 7</div>
                      <p className="text-gray-500 text-xs">Day Streak</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">Machine Learning Basics</span>
                        <Badge className="bg-success text-white">85%</Badge>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">React Components</span>
                        <Badge variant="secondary">62%</Badge>
                      </div>
                      <Progress value={62} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="text-primary">Master Any Subject</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Powered by cutting-edge AI technology and proven learning science
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-3">AI-Powered Explanations</h3>
                <p className="text-muted-foreground mb-4">
                  Get personalized explanations in three difficulty levels using advanced GPT-4 integration.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                    "Explain Like I'm 10" mode
                  </li>
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                    Quick revision summaries
                  </li>
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                    College-level deep dives
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-secondary transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-3">Adaptive Learning Engine</h3>
                <p className="text-muted-foreground mb-4">
                  Smart algorithms track your progress and identify knowledge gaps for personalized learning paths.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-secondary rounded-full mr-2" />
                    Performance analytics
                  </li>
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-secondary rounded-full mr-2" />
                    Automated gap detection
                  </li>
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-secondary rounded-full mr-2" />
                    Custom learning roadmaps
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-success transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center mb-4">
                  <Gamepad2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-3">Gamified Progress</h3>
                <p className="text-muted-foreground mb-4">
                  Stay motivated with XP points, learning streaks, achievements, and competitive leaderboards.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-success rounded-full mr-2" />
                    Experience points system
                  </li>
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-success rounded-full mr-2" />
                    Daily learning streaks
                  </li>
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-success rounded-full mr-2" />
                    Achievement badges
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-warning transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-warning rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-3">Social Learning</h3>
                <p className="text-muted-foreground mb-4">
                  Connect with fellow learners, join study groups, and share your progress in our learning community.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-warning rounded-full mr-2" />
                    Study group collaboration
                  </li>
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-warning rounded-full mr-2" />
                    Progress sharing feed
                  </li>
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-warning rounded-full mr-2" />
                    Peer-to-peer messaging
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-3">AI Interview Prep</h3>
                <p className="text-muted-foreground mb-4">
                  Practice with AI avatars for technical interviews, behavioral questions, and industry-specific scenarios.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-accent rounded-full mr-2" />
                    Technical interview simulation
                  </li>
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-accent rounded-full mr-2" />
                    Real-time feedback
                  </li>
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-accent rounded-full mr-2" />
                    Industry-specific scenarios
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-3">Teacher Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  Comprehensive analytics, lesson plan generation, and student progress tracking for educators.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-blue-500 rounded-full mr-2" />
                    Student analytics
                  </li>
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-blue-500 rounded-full mr-2" />
                    Automated lesson plans
                  </li>
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-blue-500 rounded-full mr-2" />
                    Progress monitoring
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10k+</div>
              <div className="text-muted-foreground">Active Learners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">1M+</div>
              <div className="text-muted-foreground">AI Explanations</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-success mb-2">95%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-warning mb-2">24/7</div>
              <div className="text-muted-foreground">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of learners who are already mastering new skills with AI-powered education.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-gray-100"
            data-testid="button-start-free"
          >
            <a href="/api/login">
              Start Your Free Journey
              <ChevronRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">EduAI Hub</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Transforming education with AI-powered personalized learning experiences.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>AI Explanations</li>
                <li>Adaptive Learning</li>
                <li>Gamification</li>
                <li>Study Groups</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Community</li>
                <li>Support</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm">
                  <i className="fab fa-twitter text-xl" />
                </Button>
                <Button variant="ghost" size="sm">
                  <i className="fab fa-discord text-xl" />
                </Button>
                <Button variant="ghost" size="sm">
                  <i className="fab fa-github text-xl" />
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8 mt-8 text-center text-muted-foreground text-sm">
            © 2024 EduAI Hub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
